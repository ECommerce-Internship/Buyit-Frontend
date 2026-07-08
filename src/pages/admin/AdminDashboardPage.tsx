// src/pages/admin/AdminDashboardPage.tsx
import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import {
    ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import {
    useDashboardSummary, useRevenue, useTopProducts, useOrdersByStatus,
} from '../../hooks/useAdminData';
import { AdminTabs } from '../../components/admin/AdminTabs';
import { CountUp } from '../../components/ui/CountUp';
import { Reveal } from '../../components/ui/Reveal';
import { formatCurrency } from '../../lib/format';

// A dollar figure that counts up from 0 → n (matches formatCurrency: no decimals when whole).
const money = (n: number) => (
    <CountUp to={n} prefix="$" comma decimals={Number.isInteger(n) ? 0 : 2} />
);

// Orders-by-status → hue. Colour follows the entity (the status), never its rank, so the
// donut never repaints when counts change. Palette validated for the dark surface
// (dataviz skill): worst adjacent CVD ΔE 15.7, and every slice also carries a text label.
const STATUS_COLORS: Record<string, string> = {
    Delivered: '#199e70',   // green
    Shipped: '#3987e5',   // blue
    Pending: '#d95926',   // orange
    Confirmed: '#9085e9',   // violet
    Cancelled: '#e66767',   // red
};
const STATUS_FALLBACK = '#8a8f98';
const statusColor = (status: string) => STATUS_COLORS[status] ?? STATUS_FALLBACK;

// Selectable windows for the revenue trend. Keys are the backend range tokens.
const RANGES = [
    { key: '1d', label: '1D' },
    { key: '15d', label: '15D' },
    { key: '30d', label: '30D' },
    { key: '3m', label: '3M' },
    { key: '6m', label: '6M' },
    { key: '1y', label: '1Y' },
];

// Shorten a bucket label for the axis: "2026-07-07 14:00"->"14:00", "2026-07-07"->"07-07",
// leaving month ("2026-07") and ISO-week ("2026-W27") labels as-is.
function shortTick(label: string): string {
    if (label.includes(' ')) return label.split(' ')[1];
    const m = /^\d{4}-(\d{2})-(\d{2})$/.exec(label);
    return m ? `${m[1]}-${m[2]}` : label;
}

export function AdminDashboardPage() {
    const [range, setRange] = useState('30d');
    const summary = useDashboardSummary();
    const revenue = useRevenue(range);
    const top = useTopProducts();
    const byStatus = useOrdersByStatus();

    const s = summary.data;

    const revenueData = revenue.data ?? [];

    // Donut: total across all statuses (for % labels), biggest slice first.
    const statusData = [...(byStatus.data ?? [])].sort((a, b) => b.count - a.count);
    const statusTotal = statusData.reduce((sum, r) => sum + r.count, 0);

    return (
        <main className="admin-shell" style={page_}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                <h1 style={h1}>Dashboard</h1>
                <p style={subtitle}>Platform health at a glance.</p>

                <AdminTabs />

                {/* HERO ROW — rolling 30-day headline metrics */}
                {summary.isLoading ? (
                    <div style={panel}>Loading metrics…</div>
                ) : summary.isError || !s ? (
                    <div style={{ ...panel, color: '#ff8fa3' }}>Couldn’t load metrics.</div>
                ) : (
                    <div style={heroGrid}>
                        <Reveal delay={0}>
                            <Hero label="Revenue (30d)" value={money(s.revenue30d)}>
                                <Delta pct={s.revenueGrowthPct} />
                            </Hero>
                        </Reveal>
                        <Reveal delay={90}>
                            <Hero label="Orders (30d)" value={<CountUp to={s.orders30d} comma />}>
                                <Delta pct={s.ordersGrowthPct} />
                            </Hero>
                        </Reveal>
                        <Reveal delay={180}>
                            <Hero label="Avg. rating" value={s.avgRating != null ? <CountUp to={s.avgRating} decimals={1} /> : '—'}>
                                {s.avgRating != null ? <Stars rating={s.avgRating} /> : null}
                            </Hero>
                        </Reveal>
                    </div>
                )}

                {/* REVENUE AREA + ORDERS-BY-STATUS DONUT */}
                <div style={chartRow}>
                    {/* REVENUE TREND */}
                    <section style={{ ...panel, flex: '2 1 380px', marginBottom: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                            <h2 style={{ ...h2, margin: 0 }}>Revenue trend</h2>
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
                        {revenue.isLoading ? <Muted>Loading…</Muted>
                            : revenueData.length === 0 ? <Muted>No revenue data yet.</Muted>
                                : (
                                    <ResponsiveContainer width="100%" height={280}>
                                        <AreaChart data={revenueData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.45} />
                                                    <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="revStroke" x1="0" y1="0" x2="1" y2="0">
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
                                                contentStyle={tooltipStyle}
                                                formatter={(v) => [formatCurrency(Number(v)), 'Revenue']}
                                            />
                                            <Area
                                                type="monotone" dataKey="value"
                                                stroke="url(#revStroke)" strokeWidth={2.5}
                                                fill="url(#revFill)" dot={false}
                                                activeDot={{ r: 4, fill: '#f472b6', stroke: '#14141f', strokeWidth: 2 }}
                                                isAnimationActive animationDuration={700} animationEasing="ease-out"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                    </section>

                    {/* ORDERS BY STATUS — donut + legend */}
                    <section style={{ ...panel, flex: '1 1 260px', marginBottom: 0 }}>
                        <h2 style={h2}>Orders by status</h2>
                        {byStatus.isLoading ? <Muted>Loading…</Muted>
                            : statusData.length === 0 ? <Muted>No orders yet.</Muted>
                                : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                        <div style={{ width: 150, height: 180, flex: '0 0 auto' }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={statusData} dataKey="count" nameKey="status"
                                                        cx="50%" cy="50%" innerRadius={48} outerRadius={70}
                                                        paddingAngle={2} stroke="#14141f" strokeWidth={2}
                                                    >
                                                        {statusData.map((r) => (
                                                            <Cell key={r.status} fill={statusColor(r.status)} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [String(v), String(n)]} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <ul style={legend}>
                                            {statusData.map((r) => (
                                                <li key={r.status} style={legendItem}>
                                                    <span style={{ ...swatch, background: statusColor(r.status) }} />
                                                    <span style={{ flex: 1 }}>{r.status}</span>
                                                    <span style={{ color: 'rgba(255,255,255,0.6)', fontVariantNumeric: 'tabular-nums' }}>
                                                        {statusTotal ? Math.round((r.count / statusTotal) * 100) : 0}%
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                    </section>
                </div>

                {/* KPI CARDS (detailed platform totals) */}
                {!summary.isLoading && !summary.isError && s && (
                    <div style={kpiGrid}>
                        <Reveal delay={0}><Kpi label="Total revenue" value={money(s.totalRevenue)} /></Reveal>
                        <Reveal delay={70}><Kpi label="Total orders" value={<CountUp to={s.totalOrders} comma />} /></Reveal>
                        <Reveal delay={140}><Kpi label="Total customers" value={<CountUp to={s.totalCustomers} comma />} /></Reveal>
                        <Reveal delay={210}><Kpi label="Low stock items" value={<CountUp to={s.lowStockCount} />} accent="#ff8fa3" /></Reveal>
                        <Reveal delay={280}><Kpi label="Today’s orders" value={<CountUp to={s.todaysNewOrders} />} /></Reveal>
                        <Reveal delay={350}>
                            <Kpi label="Total commission"
                                value={s.totalCommission != null ? money(s.totalCommission) : '—'}
                                accent="#8be0a4" />
                        </Reveal>
                    </div>
                )}

                {/* TOP PRODUCTS TABLE */}
                <section style={{ ...panel, padding: 0 }}>
                    <h2 style={{ ...h2, padding: '18px 18px 0' }}>Top products</h2>
                    {top.isLoading ? <div style={{ padding: 18 }}><Muted>Loading…</Muted></div>
                        : (top.data ?? []).length === 0 ? <div style={{ padding: 18 }}><Muted>No sales yet.</Muted></div>
                            : (
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
                </section>
            </div>
        </main>
    );
}

// One hero (30-day headline) card.
function Hero({ label, value, children }: { label: string; value: ReactNode; children?: ReactNode }) {
    return (
        <div className="admin-lift" style={heroCard}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{label}</div>
            <div className="admin-gradient-num" style={{ fontSize: 34, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.1, margin: '6px 0 4px' }}>
                {value}
            </div>
            <div style={{ minHeight: 20 }}>{children}</div>
        </div>
    );
}

// A ↑/↓ percentage delta vs. the prior 30-day window. Null growth (no baseline) shows nothing.
function Delta({ pct }: { pct: number | null }) {
    if (pct == null) return null;
    const up = pct >= 0;
    return (
        <span style={{ color: up ? '#0ca30c' : '#e66767', fontSize: 13, fontWeight: 600 }}>
            {up ? '↑' : '↓'} {Math.abs(pct)}%
        </span>
    );
}

// Five-star row for the average rating.
function Stars({ rating }: { rating: number }) {
    const full = Math.round(rating);
    return (
        <span style={{ color: '#fab219', letterSpacing: 2, fontSize: 15 }} aria-label={`${rating} out of 5`}>
            {'★'.repeat(full)}<span style={{ color: 'rgba(255,255,255,0.25)' }}>{'★'.repeat(Math.max(0, 5 - full))}</span>
        </span>
    );
}

// One KPI card.
function Kpi({ label, value, accent }: { label: string; value: ReactNode; accent?: string }) {
    return (
        <div className="admin-lift" style={kpiCard}>
            <div
                className={accent ? undefined : 'admin-gradient-num'}
                style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.5, color: accent }}
            >
                {value}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{label}</div>
        </div>
    );
}
function Muted({ children }: { children: ReactNode }) {
    return <p style={{ color: 'rgba(255,255,255,0.55)', margin: 0 }}>{children}</p>;
}

// ---- inline styles ----
const page_: CSSProperties = { minHeight: '100vh', color: '#fff', padding: '40px 24px', position: 'relative' };
const h1: CSSProperties = { fontFamily: 'Outfit', fontSize: 30, fontWeight: 700, margin: '0 0 6px' };
const h2: CSSProperties = { fontFamily: 'Outfit', fontSize: 18, fontWeight: 700, margin: '0 0 12px' };
const subtitle: CSSProperties = { margin: '0 0 24px', color: 'rgba(255,255,255,0.6)' };
const tooltipStyle: CSSProperties = { background: '#14141f', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#fff' };
const panel: CSSProperties = {
    padding: 18, borderRadius: 16,
    background: 'linear-gradient(180deg, rgba(255,255,255,0.075), rgba(255,255,255,0.035))',
    border: '1px solid rgba(255,255,255,0.11)',
    boxShadow: '0 18px 40px -24px rgba(5,3,20,0.9), inset 0 1px 0 rgba(255,255,255,0.07)',
    backdropFilter: 'blur(8px)',
    marginBottom: 18,
};
const heroGrid: CSSProperties = {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 18,
};
const heroCard: CSSProperties = {
    padding: 20, borderRadius: 16,
    background: 'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04))',
    border: '1px solid rgba(255,255,255,0.12)',
    boxShadow: '0 16px 34px -22px rgba(5,3,20,0.9), inset 0 1px 0 rgba(255,255,255,0.09)',
};
const chartRow: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 18, marginBottom: 18 };
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
const legend: CSSProperties = { listStyle: 'none', margin: 0, padding: 0, flex: '1 1 130px', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13.5 };
const legendItem: CSSProperties = { display: 'flex', alignItems: 'center', gap: 8 };
const swatch: CSSProperties = { width: 11, height: 11, borderRadius: 3, flex: '0 0 auto' };
const kpiGrid: CSSProperties = {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, marginBottom: 18,
};
const kpiCard: CSSProperties = {
    padding: 18, borderRadius: 16,
    background: 'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04))',
    border: '1px solid rgba(255,255,255,0.12)',
    boxShadow: '0 16px 34px -22px rgba(5,3,20,0.9), inset 0 1px 0 rgba(255,255,255,0.09)',
};
const th: CSSProperties = { padding: '12px 14px', fontWeight: 600, fontSize: 12.5, textTransform: 'uppercase', letterSpacing: 0.4 };
const td: CSSProperties = { padding: '10px 14px', verticalAlign: 'middle' };
