// src/pages/SellerDashboardPage.tsx
import { useMemo, useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LogOut, UserCog } from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area,
    XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useStores } from '../hooks/useStores';
import { SellerTabs } from '../components/seller/SellerTabs';
import { useCreateStore } from '../hooks/useCreateStore';
import {
    useSellerDashboardSummary, useSellerRevenue, useSellerTopProducts, useSellerOrdersByStatus,
} from '../hooks/useSellerDashboard';
import { formatCurrency } from '../lib/format';
import type { StoreStatus } from '../types/store';

// Colour each status so the badge reads at a glance. Pending = amber, Approved = green,
// Suspended/Rejected = red. (A Record maps every StoreStatus to a {bg,fg} colour pair.)
const STATUS_COLORS: Record<StoreStatus, { bg: string; fg: string }> = {
    Pending:   { bg: 'rgba(255,178,77,0.14)',  fg: '#ffb24d' },
    Approved:  { bg: 'rgba(110,231,160,0.14)', fg: '#6ee7a0' },
    Suspended: { bg: 'rgba(255,93,122,0.14)',  fg: '#ff5d7a' },
    Rejected:  { bg: 'rgba(255,93,122,0.14)',  fg: '#ff5d7a' },
};

// Order status color mapping for the "Orders by status" donut (unlisted statuses fall back to gray).
const ORDER_STATUS_COLORS: Record<string, string> = {
    Delivered: '#6ee7a0',
    Shipped: '#6d8cff',
    Confirmed: '#a78bfa',
    Pending: '#ffb24d',
    Cancelled: '#ff5d7a',
};
// r chosen so the circle's circumference is ~100 — lets dasharray/percent line up 1:1.
const DONUT_RADIUS = 15.9155;
function buildDonutSegments(data: { status: string; count: number }[]) {
    const total = data.reduce((sum, d) => sum + d.count, 0) || 1;
    let cumulative = 0;
    return data.map((d) => {
        const percent = (d.count / total) * 100;
        const dashoffset = 25 - cumulative;
        cumulative += percent;
        return { ...d, percent, dashoffset, color: ORDER_STATUS_COLORS[d.status] ?? '#9ca3af' };
    });
}

// Maps {period, value} points onto a 380x130 viewBox for the revenue area chart.
// Selectable windows for the revenue trend — same backend range tokens as the Admin dashboard.
const RANGES = [
    { key: '1d', label: '1D' },
    { key: '15d', label: '15D' },
    { key: '30d', label: '30D' },
    { key: '3m', label: '3M' },
    { key: '6m', label: '6M' },
    { key: '1y', label: '1Y' },
];
// Shortens a bucket label for the axis: "2026-07-07 14:00"->"14:00", "2026-07-07"->"07-07",
// leaving month ("2026-07") and ISO-week ("2026-W27") labels as-is.
function shortTick(label: string): string {
    if (label.includes(' ')) return label.split(' ')[1];
    const m = /^\d{4}-(\d{2})-(\d{2})$/.exec(label);
    return m ? `${m[1]}-${m[2]}` : label;
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: string }) {
    return (
        <div style={kpiCard}>
            <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, color: accent ?? '#fff' }}>{value}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{label}</div>
        </div>
    );
}

function StatusBadge({ status }: { status: StoreStatus }) {
    const c = STATUS_COLORS[status];
    return (
        <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, color: c.fg, background: c.bg }}>
            {status}
        </span>
    );
}

const card: CSSProperties = { padding: 20, borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' };
const inputStyle: CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '11px 13px', fontSize: 14.5, fontFamily: 'inherit', color: '#fff', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 12, outline: 'none' };
const kpiGrid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 18 };
const kpiCard: CSSProperties = { padding: 18, borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' };
const th: CSSProperties = { padding: '12px 14px', fontWeight: 600, fontSize: 12.5, textTransform: 'uppercase', letterSpacing: 0.4 };
const td: CSSProperties = { padding: '10px 14px', verticalAlign: 'middle' };
const rangeBar: CSSProperties = {
    display: 'inline-flex', gap: 2, padding: 3, borderRadius: 10,
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
};
const rangeBtn: CSSProperties = {
    padding: '5px 11px', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600,
    color: 'rgba(255,255,255,0.6)', background: 'transparent', border: 'none',
    borderRadius: 7, cursor: 'pointer', transition: 'color 0.15s, background 0.15s',
};
const rangeBtnActive: CSSProperties = {
    color: '#fff',
    background: 'linear-gradient(180deg, rgba(139,92,246,0.5), rgba(99,102,241,0.28))',
    boxShadow: '0 6px 16px -10px rgba(124,92,246,0.9)',
};

export function SellerDashboardPage() {
    const { user, logout } = useAuth();
    const queryClient = useQueryClient();
    // Real "list my stores" via GET /api/v1/Stores/mine (survives a page refresh).
    const { data: stores = [], isLoading, isError } = useStores();

    // TB-129: store performance metrics, scoped to the seller's own store(s) server-side.
    const summary = useSellerDashboardSummary();
    const summaryData = summary.data;
    const [range, setRange] = useState('30d');
    const revenue = useSellerRevenue(range);
    const revenueData = revenue.data ?? [];
    const top = useSellerTopProducts();
    const byStatus = useSellerOrdersByStatus();
    const donutSegments = useMemo(() => buildDonutSegments(byStatus.data ?? []), [byStatus.data]);

    const [storeName, setStoreName] = useState('');
    const [storeDescription, setStoreDescription] = useState('');
    const [loggingOut, setLoggingOut] = useState(false);

    // Guard against a double-click firing two /logout calls.
    async function onLogout() {
        if (loggingOut) return;
        setLoggingOut(true);
        try {
            await logout();
        } finally {
            setLoggingOut(false);
        }
    }

    const createStore = useCreateStore({
        onSuccess: (store) => {
            // Re-fetch the authoritative list from the backend so the new store appears.
            queryClient.invalidateQueries({ queryKey: ['my-stores'] });
            setStoreName('');
            setStoreDescription('');
            toast.success(`Store "${store.name}" created — it's now Pending review.`);
        },
        onError: (message) => toast.error(message),
    });

    // Selling actions stay locked until the seller has at least one APPROVED store. We fail
    // closed: while the list is still loading we keep the gate shut rather than flash it open.
    const sellingLocked = useMemo(
        () => isLoading || !stores.some((s) => s.status === 'Approved'),
        [isLoading, stores],
    );

    function onSubmit(e: FormEvent) {
        e.preventDefault();
        if (!storeName.trim()) {
            toast.error('Please enter a store name.');
            return;
        }
        createStore.mutate({
            storeName: storeName.trim(),
            ...(storeDescription.trim() ? { storeDescription: storeDescription.trim() } : {}),
        });
    }

    return (
        <main style={{ minHeight: '100vh', background: '#0a0a12', color: '#fff', padding: '40px 24px' }}>
            <div style={{ maxWidth: 880, margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                    <div>
                        <h1 style={{ fontFamily: 'Outfit', fontSize: 30, fontWeight: 700, margin: '0 0 6px' }}>Seller dashboard</h1>
                        <p style={{ margin: '0 0 28px', color: 'rgba(255,255,255,0.6)' }}>
                            Welcome{user ? `, ${user.firstName}` : ''}. Manage your stores below.
                        </p>
                    </div>
                    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Link to="/account" title="My account"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', fontFamily: 'inherit', fontSize: 14.5, fontWeight: 600, color: 'rgba(255,255,255,0.82)', textDecoration: 'none', borderRadius: 11, border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.04)' }}>
                            <UserCog size={15} aria-hidden />
                            My account
                        </Link>
                        <button type="button" onClick={onLogout} disabled={loggingOut} title="Log out"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', fontFamily: 'inherit', fontSize: 14.5, fontWeight: 600, color: '#ff8fa3', cursor: loggingOut ? 'wait' : 'pointer', opacity: loggingOut ? 0.6 : 1, borderRadius: 11, border: '1px solid rgba(255,93,122,0.28)', background: 'rgba(255,93,122,0.08)' }}>
                            <LogOut size={15} aria-hidden />
                            {loggingOut ? 'Logging out…' : 'Log out'}
                        </button>
                    </div>
                </div>
                <SellerTabs />

                {/* Store performance metrics — scoped to the seller's own store(s) (TB-129) */}
                <section style={{ marginBottom: 28 }}>
                    <h2 style={{ fontFamily: 'Outfit', fontSize: 20, fontWeight: 700, margin: '0 0 12px' }}>
                        Store performance
                    </h2>
                    {summary.isLoading ? (
                        <div style={{ ...card, marginBottom: 18 }}>Loading metrics…</div>
                    ) : summary.isError || !summaryData ? (
                        <div style={{ ...card, marginBottom: 18, color: '#ff8fa3' }}>Couldn't load metrics.</div>
                    ) : (
                        <div style={kpiGrid}>
                            <Kpi label="Revenue" value={formatCurrency(summaryData.totalRevenue)} />
                            <Kpi label="Orders" value={String(summaryData.totalOrders)} />
                            <Kpi label="Low stock items" value={String(summaryData.lowStockCount)} accent="#ff8fa3" />
                            <Kpi label="Today's orders" value={String(summaryData.todaysNewOrders)} />
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 16, marginBottom: 18 }}>
                        <div style={{ ...card, background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                            <h3 style={{ fontFamily: 'Outfit', fontSize: 16, fontWeight: 700, margin: 0 }}>
                                Revenue trend
                            </h3>
                            <div style={rangeBar} role="group" aria-label="Revenue period">
                                {RANGES.map((r) => {
                                    const active = r.key === range;
                                    return (
                                        <button
                                            key={r.key}
                                            type="button"
                                            onClick={() => setRange(r.key)}
                                            aria-pressed={active}
                                            style={{ ...rangeBtn, ...(active ? rangeBtnActive : null) }}
                                        >
                                            {r.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        {revenue.isLoading ? (
                            <p style={{ color: 'rgba(255,255,255,0.55)', margin: 0 }}>Loading…</p>
                        ) : revenueData.length === 0 ? (
                            <p style={{ color: 'rgba(255,255,255,0.55)', margin: 0 }}>No revenue data yet.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={240}>
                                <AreaChart data={revenueData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="sellerRevFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.45} />
                                            <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="sellerRevStroke" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#a78bfa" />
                                            <stop offset="100%" stopColor="#f472b6" />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                                    <XAxis
                                        dataKey="period" stroke="rgba(255,255,255,0.5)" fontSize={12}
                                        tickLine={false} axisLine={false}
                                        tickFormatter={shortTick} minTickGap={28} interval="preserveStartEnd"
                                    />
                                    <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ background: '#14141f', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#fff' }}
                                        formatter={(v) => [formatCurrency(Number(v)), 'Revenue']}
                                    />
                                    <Area
                                        type="monotone" dataKey="value"
                                        stroke="url(#sellerRevStroke)" strokeWidth={2.5}
                                        fill="url(#sellerRevFill)" dot={false}
                                        activeDot={{ r: 4, fill: '#f472b6', stroke: '#14141f', strokeWidth: 2 }}
                                        isAnimationActive animationDuration={700} animationEasing="ease-out"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    <div style={card}>
                        <h3 style={{ fontFamily: 'Outfit', fontSize: 16, fontWeight: 700, margin: '0 0 12px' }}>
                            Orders by status
                        </h3>
                        {byStatus.isLoading ? (
                            <p style={{ color: 'rgba(255,255,255,0.55)', margin: 0 }}>Loading…</p>
                        ) : (byStatus.data ?? []).length === 0 ? (
                            <p style={{ color: 'rgba(255,255,255,0.55)', margin: 0 }}>No orders yet.</p>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                                <svg width="132" height="132" viewBox="0 0 42 42">
                                    <circle cx="21" cy="21" r={DONUT_RADIUS} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
                                    {donutSegments.map((seg) => (
                                        <circle
                                            key={seg.status} cx="21" cy="21" r={DONUT_RADIUS} fill="none"
                                            stroke={seg.color} strokeWidth="5"
                                            strokeDasharray={`${seg.percent} ${100 - seg.percent}`}
                                            strokeDashoffset={seg.dashoffset}
                                            transform="rotate(-90 21 21)"
                                        >
                                            <title>{`${seg.status}: ${seg.count}`}</title>
                                        </circle>
                                    ))}
                                </svg>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: 13.5 }}>
                                    {donutSegments.map((seg) => (
                                        <span key={seg.status} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.75)' }}>
                                            <span style={{ width: 10, height: 10, borderRadius: 3, background: seg.color }} />
                                            {seg.status} — {seg.count} ({seg.percent.toFixed(0)}%)
                                        </span>
                                    ))}
                                </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div style={{ ...card, marginBottom: 0, padding: 0 }}>
                        <h3 style={{ fontFamily: 'Outfit', fontSize: 16, fontWeight: 700, margin: 0, padding: '18px 20px 0' }}>
                            Top products
                        </h3>
                        {top.isLoading ? (
                            <p style={{ color: 'rgba(255,255,255,0.55)', margin: 0, padding: '12px 20px 18px' }}>Loading…</p>
                        ) : (top.data ?? []).length === 0 ? (
                            <p style={{ color: 'rgba(255,255,255,0.55)', margin: 0, padding: '12px 20px 18px' }}>No sales yet.</p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, marginTop: 12 }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', color: 'rgba(255,255,255,0.6)' }}>
                                        <th style={th}>#</th>
                                        <th style={th}>Product</th>
                                        <th style={th}>Units sold</th>
                                        <th style={th}>Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(top.data ?? []).slice(0, 10).map((p, idx) => (
                                        <tr key={p.productId} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                            <td style={{ ...td, color: 'rgba(255,255,255,0.5)' }}>{idx + 1}</td>
                                            <td style={{ ...td, fontWeight: 600 }}>{p.productName}</td>
                                            <td style={td}>{p.unitsSold}</td>
                                            <td style={td}>{formatCurrency(p.revenue)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>

                {/* Pending-store gate: required message + disabled selling actions */}
                {sellingLocked && (
                    <div style={{ ...card, borderColor: 'rgba(255,178,77,0.3)', background: 'rgba(255,178,77,0.08)', marginBottom: 24 }}>
                        <strong style={{ color: '#ffcd8a' }}>Your store is pending approval by the platform admin.</strong>
                        <p style={{ margin: '8px 0 14px', fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
                            You can set up your store now, but selling actions unlock once an admin approves it.
                        </p>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            {['Add product', 'Manage inventory', 'Fulfill orders'].map((label) => (
                                <button key={label} disabled title="Available once your store is approved"
                                    style={{ padding: '9px 14px', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600, color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 11, cursor: 'not-allowed' }}>
                                    {label} (locked)
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* My stores */}
                <h2 style={{ fontFamily: 'Outfit', fontSize: 20, fontWeight: 700, margin: '0 0 12px' }}>My stores</h2>
                <p style={{ margin: '0 0 14px', fontSize: 13.5, color: 'rgba(255,255,255,0.5)' }}>
                    This account owns <strong>{isLoading ? '…' : stores.length}</strong> store(s).
                </p>

                {isLoading ? (
                    <div style={{ ...card, marginBottom: 28, color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>
                        Loading your stores…
                    </div>
                ) : isError ? (
                    <div style={{ ...card, marginBottom: 28, color: '#ff8fa3', fontSize: 14 }}>
                        Couldn’t load your stores. Please refresh the page.
                    </div>
                ) : stores.length === 0 ? (
                    <div style={{ ...card, marginBottom: 28, color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>
                        You don’t have any stores yet. Open one below.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                        {stores.map((s) => (
                            <div key={s.id} style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{s.name}</div>
                                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>/{s.slug}</div>
                                </div>
                                <StatusBadge status={s.status} />
                            </div>
                        ))}
                    </div>
                )}

                {/* Create another store */}
                <h2 style={{ fontFamily: 'Outfit', fontSize: 20, fontWeight: 700, margin: '0 0 12px' }}>Open a new store</h2>
                <form onSubmit={onSubmit} style={{ ...card, display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 460 }}>
                    <div>
                        <label htmlFor="sd-name" style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'rgba(255,255,255,0.72)' }}>Store name</label>
                        <input id="sd-name" value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="e.g. Nova Tech" style={inputStyle} />
                    </div>
                    <div>
                        <label htmlFor="sd-desc" style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'rgba(255,255,255,0.72)' }}>Description <span style={{ color: 'rgba(255,255,255,0.4)' }}>(optional)</span></label>
                        <textarea id="sd-desc" value={storeDescription} onChange={(e) => setStoreDescription(e.target.value)} rows={2} placeholder="What does this store sell?" style={{ ...inputStyle, resize: 'vertical', minHeight: 60 }} />
                    </div>
                    <button type="submit" disabled={createStore.isPending}
                        style={{ padding: 12, fontFamily: 'inherit', fontSize: 15, fontWeight: 600, color: '#fff', border: 'none', borderRadius: 12, cursor: createStore.isPending ? 'wait' : 'pointer', background: 'linear-gradient(120deg,#8b5cf6,#6366f1)', opacity: createStore.isPending ? 0.8 : 1 }}>
                        {createStore.isPending ? 'Creating…' : 'Create store'}
                    </button>
                    <p style={{ margin: 0, fontSize: 12.5, color: 'rgba(255,255,255,0.45)' }}>New stores start as <strong style={{ color: '#ffcd8a' }}>Pending</strong> until an admin approves them.</p>
                </form>
            </div>
        </main>
    );
}
