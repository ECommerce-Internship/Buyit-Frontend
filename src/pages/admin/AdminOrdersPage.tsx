// src/pages/admin/AdminOrdersPage.tsx
import { useState } from 'react';
import type { CSSProperties } from 'react';
import { useAdminOrders } from '../../hooks/useAdminData';
import { Pagination } from '../../components/products/Pagination';
import { AdminTabs } from '../../components/admin/AdminTabs';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatCurrency } from '../../lib/format';
import { ORDER_STATUSES, statusColor } from '../../lib/orderStatus';
import { OrderManageModal } from './OrderManageModal';

const PAGE_SIZE = 10;

export function AdminOrdersPage() {
    const [status, setStatus] = useState('');      // '' = All
    const [page, setPage] = useState(1);
    const [manageId, setManageId] = useState<number | null>(null); // which order's modal is open

    const { data, isLoading, isError } = useAdminOrders({
        status: status || undefined,  // omit empty string so the ?status= param is dropped (= All)
        page,
        pageSize: PAGE_SIZE,
    });

    const items = data?.items ?? [];

    return (
        <main className="admin-shell" style={page_}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                <h1 style={h1}>Orders</h1>
                <p style={subtitle}>Every order on the platform. Filter by status and update fulfilment.</p>

                <AdminTabs />

                {/* FILTER */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 18 }}>
                    <label style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.6)' }}>Status</label>
                    <select
                        value={status}
                        onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                        style={{ ...input, width: 'auto', minWidth: 160 }}
                    >
                        <option value="">All</option>
                        {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                {/* TABLE */}
                {isLoading ? (
                    <div style={{ overflowX: 'auto', ...panel, padding: 0 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                            <thead>
                                <tr style={{ textAlign: 'left', color: 'rgba(255,255,255,0.6)' }}>
                                    <th style={th}>Order #</th>
                                    <th style={th}>Date</th>
                                    <th style={th}>Status</th>
                                    <th style={th}>Items</th>
                                    <th style={th}>Payment</th>
                                    <th style={th}>Total</th>
                                    <th style={{ ...th, textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                        <td style={td}><Skeleton className="h-4 w-14" style={darkTone} /></td>
                                        <td style={td}><Skeleton className="h-4 w-20" style={darkTone} /></td>
                                        <td style={td}><Skeleton className="h-5 w-16 rounded-full" style={darkTone} /></td>
                                        <td style={td}><Skeleton className="h-4 w-8" style={darkTone} /></td>
                                        <td style={td}><Skeleton className="h-4 w-16" style={darkTone} /></td>
                                        <td style={td}><Skeleton className="h-4 w-14" style={darkTone} /></td>
                                        <td style={{ ...td, textAlign: 'right' }}><Skeleton className="ml-auto h-8 w-20 rounded-lg" style={darkTone} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : isError ? (
                    <div style={{ ...panel, color: '#ff8fa3' }}>Couldn’t load orders. Refresh the page.</div>
                ) : items.length === 0 ? (
                    <div style={panel}>No orders found.</div>
                ) : (
                    <div style={{ overflowX: 'auto', ...panel, padding: 0 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                            <thead>
                                <tr style={{ textAlign: 'left', color: 'rgba(255,255,255,0.6)' }}>
                                    <th style={th}>Order #</th>
                                    <th style={th}>Date</th>
                                    <th style={th}>Status</th>
                                    <th style={th}>Items</th>
                                    <th style={th}>Payment</th>
                                    <th style={th}>Total</th>
                                    <th style={{ ...th, textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((o) => (
                                    <tr key={o.orderId} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                        <td style={{ ...td, fontWeight: 600 }}>#{o.orderId}</td>
                                        <td style={{ ...td, color: 'rgba(255,255,255,0.6)' }}>
                                            {new Date(o.orderDate).toLocaleDateString()}
                                        </td>
                                        <td style={td}><StatusBadge status={o.status} /></td>
                                        <td style={td}>{o.itemCount}</td>
                                        <td style={{ ...td, color: 'rgba(255,255,255,0.6)' }}>{o.paymentStatus ?? '—'}</td>
                                        <td style={td}>{formatCurrency(o.totalAmount)}</td>
                                        <td style={{ ...td, textAlign: 'right' }}>
                                            <button style={smallBtn} onClick={() => setManageId(o.orderId)}>Manage</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {data && (
                    <Pagination
                        page={data.page}
                        totalPages={data.totalPages}
                        hasPrevious={data.hasPrevious}
                        hasNext={data.hasNext}
                        onPageChange={setPage}
                    />
                )}
            </div>

            {/* MANAGE MODAL — only rendered when an order id is selected */}
            {manageId !== null && (
                <OrderManageModal orderId={manageId} onClose={() => setManageId(null)} />
            )}
        </main>
    );
}

function StatusBadge({ status }: { status: string }) {
    const c = statusColor(status);
    return (
        <span style={{
            display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 12.5, fontWeight: 600,
            color: c, background: `${c}22`, border: `1px solid ${c}55`,
        }}>
            {status}
        </span>
    );
}

// ---- shared inline styles (matches AdminProductsPage from TB-65) ----
const page_: CSSProperties = { minHeight: '100vh', color: '#fff', padding: '40px 24px', position: 'relative' };
const h1: CSSProperties = { fontFamily: 'Outfit', fontSize: 30, fontWeight: 700, margin: '0 0 6px' };
const subtitle: CSSProperties = { margin: '0 0 24px', color: 'rgba(255,255,255,0.6)' };
const panel: CSSProperties = {
    padding: 18, borderRadius: 16,
    background: 'linear-gradient(180deg, rgba(255,255,255,0.075), rgba(255,255,255,0.035))',
    border: '1px solid rgba(255,255,255,0.11)',
    boxShadow: '0 18px 40px -24px rgba(5,3,20,0.9), inset 0 1px 0 rgba(255,255,255,0.07)',
    backdropFilter: 'blur(8px)',
    marginBottom: 18,
};
const th: CSSProperties = { padding: '12px 14px', fontWeight: 600, fontSize: 12.5, textTransform: 'uppercase', letterSpacing: 0.4 };
const td: CSSProperties = { padding: '10px 14px', verticalAlign: 'middle' };
const darkTone: CSSProperties = { backgroundColor: 'rgba(255,255,255,0.08)' };
const smallBtn: CSSProperties = {
    padding: '6px 12px', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#fff',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 9, cursor: 'pointer',
};
const input: CSSProperties = {
    boxSizing: 'border-box', padding: '10px 12px', fontSize: 14.5, fontFamily: 'inherit', color: '#fff',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 11, outline: 'none',
};