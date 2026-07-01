// src/pages/admin/AdminDashboardPage.tsx
import type { CSSProperties, ReactNode } from 'react';
import {
    ResponsiveContainer, LineChart, Line, BarChart, Bar,
    XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import {
    useDashboardSummary, useRevenue, useTopProducts, useOrdersByStatus,
} from '../../hooks/useAdminData';
import { AdminTabs } from '../../components/admin/AdminTabs';
import { formatCurrency } from '../../lib/format';

export function AdminDashboardPage() {
    const summary = useDashboardSummary();
    const revenue = useRevenue('month');       // §5.9: monthly buckets like "2026-06"
    const top = useTopProducts();
    const byStatus = useOrdersByStatus();

    const s = summary.data;

    // §5.9: the ticket wants "revenue over 6 months" — show the last 6 points if more come back.
    const revenueData = (revenue.data ?? []).slice(-6);

    return (
        <main className="admin-shell" style={page_}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                <h1 style={h1}>Dashboard</h1>
                <p style={subtitle}>Platform health at a glance.</p>

                <AdminTabs />

                {/* KPI CARDS */}
                {summary.isLoading ? (
                    <div style={panel}>Loading metrics…</div>
                ) : summary.isError || !s ? (
                    <div style={{ ...panel, color: '#ff8fa3' }}>Couldn’t load metrics.</div>
                ) : (
                    <div style={kpiGrid}>
                        <Kpi label="Total revenue" value={formatCurrency(s.totalRevenue)} />
                        <Kpi label="Total orders" value={String(s.totalOrders)} />
                        <Kpi label="Total customers" value={String(s.totalCustomers)} />
                        <Kpi label="Low stock items" value={String(s.lowStockCount)} accent="#ff8fa3" />
                        <Kpi label="Today’s orders" value={String(s.todaysNewOrders)} />
                        <Kpi label="Total commission"
                            value={s.totalCommission != null ? formatCurrency(s.totalCommission) : '—'}
                            accent="#8be0a4" />
                    </div>
                )}

                {/* REVENUE LINE CHART */}
                <section style={panel}>
                    <h2 style={h2}>Revenue (last 6 months)</h2>
                    {revenue.isLoading ? <Muted>Loading…</Muted>
                        : revenueData.length === 0 ? <Muted>No revenue data yet.</Muted>
                        : (
                            <ResponsiveContainer width="100%" height={280}>
                                <LineChart data={revenueData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                                    <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                                    <XAxis dataKey="period" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                                    <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{ background: '#14141f', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#fff' }}
                                        formatter={(v) => formatCurrency(Number(v))}
                                    />
                                    <Line type="monotone" dataKey="value" stroke="#a78bfa" strokeWidth={2} dot={{ r: 3 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                </section>

                {/* ORDERS BY STATUS BAR CHART */}
                <section style={panel}>
                    <h2 style={h2}>Orders by status</h2>
                    {byStatus.isLoading ? <Muted>Loading…</Muted>
                        : (byStatus.data ?? []).length === 0 ? <Muted>No orders yet.</Muted>
                        : (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={byStatus.data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                                    <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                                    <XAxis dataKey="status" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                                    <YAxis allowDecimals={false} stroke="rgba(255,255,255,0.5)" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{ background: '#14141f', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#fff' }}
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    />
                                    <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                </section>

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

// One KPI card.
function Kpi({ label, value, accent }: { label: string; value: string; accent?: string }) {
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
const panel: CSSProperties = {
    padding: 18, borderRadius: 16,
    background: 'linear-gradient(180deg, rgba(255,255,255,0.075), rgba(255,255,255,0.035))',
    border: '1px solid rgba(255,255,255,0.11)',
    boxShadow: '0 18px 40px -24px rgba(5,3,20,0.9), inset 0 1px 0 rgba(255,255,255,0.07)',
    backdropFilter: 'blur(8px)',
    marginBottom: 18,
};
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
