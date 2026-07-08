// src/pages/admin/AdminPaymentsPage.tsx
import { useState } from 'react';
import type { CSSProperties } from 'react';
import toast from 'react-hot-toast';
import { useAdminPayments, useRefundPayment } from '../../hooks/usePayments';
import { Pagination } from '../../components/products/Pagination';
import { AdminTabs } from '../../components/admin/AdminTabs';
import { formatCurrency } from '../../lib/format';
import type { PaymentRow } from '../../types/payment';
import { Skeleton } from '../../components/ui/Skeleton';

const PAGE_SIZE = 10;

// The statuses the backend can filter by — MUST match the PaymentStatus enum names exactly,
// or the backend silently ignores the filter.
const PAYMENT_STATUSES = ['Paid', 'Failed', 'Refunded', 'Pending'];

// One colour per payment status, used by the badge below. All hex so the `${c}22`/`${c}55`
// alpha-suffix in StatusBadge stays a valid 8-digit-hex colour (an rgba() default would not).
function paymentStatusColor(status: string): string {
    switch (status) {
        case 'Paid': return '#34d399';       // green
        case 'Refunded': return '#fbbf24';   // amber
        case 'Failed': return '#ff8fa3';     // red/pink
        default: return '#9ca3af';           // Pending / anything else: grey
    }
}

export function AdminPaymentsPage() {
    const [status, setStatus] = useState('');                 // '' = All
    const [page, setPage] = useState(1);                      // current page (1-based)
    const [confirm, setConfirm] = useState<PaymentRow | null>(null); // payment awaiting refund-confirm

    const { data, isLoading, isError } = useAdminPayments({
        status: status || undefined,  // '' becomes undefined → ?status= is dropped → All
        page,
        pageSize: PAGE_SIZE,
    });

    const refund = useRefundPayment({
        onSuccess: () => { toast.success('Payment refunded.'); setConfirm(null); },
        onError: (m) => { toast.error(m); setConfirm(null); },
    });

    const items = data?.items ?? [];

    return (
        <main className="admin-shell" style={page_}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                <h1 style={h1}>Payments &amp; Refunds</h1>
                <p style={subtitle}>Every payment on the platform. Filter by status and refund paid orders.</p>

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
                        {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                {/* TABLE */}
                {isLoading ? (
                    <div style={{ overflowX: 'auto', ...panel, padding: 0 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                            <thead>
                                <tr style={{ textAlign: 'left', color: 'rgba(255,255,255,0.6)' }}>
                                    <th style={th}>Transaction</th>
                                    <th style={th}>Order #</th>
                                    <th style={th}>Customer</th>
                                    <th style={th}>Method</th>
                                    <th style={th}>Amount</th>
                                    <th style={th}>Status</th>
                                    <th style={th}>Date</th>
                                    <th style={{ ...th, textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                        <td style={td}><Skeleton className="h-4 w-20" style={darkTone} /></td>
                                        <td style={td}><Skeleton className="h-4 w-12" style={darkTone} /></td>
                                        <td style={td}><Skeleton className="h-4 w-24" style={darkTone} /></td>
                                        <td style={td}><Skeleton className="h-4 w-16" style={darkTone} /></td>
                                        <td style={td}><Skeleton className="h-4 w-14" style={darkTone} /></td>
                                        <td style={td}><Skeleton className="h-5 w-16 rounded-full" style={darkTone} /></td>
                                        <td style={td}><Skeleton className="h-4 w-16" style={darkTone} /></td>
                                        <td style={{ ...td, textAlign: 'right' }}><Skeleton className="ml-auto h-8 w-16 rounded-lg" style={darkTone} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : isError ? (
                    <div style={{ ...panel, color: '#ff8fa3' }}>Couldn’t load payments. Refresh the page.</div>
                ) : items.length === 0 ? (
                    <div style={panel}>No payments found.</div>
                ) : (
                    <div style={{ overflowX: 'auto', ...panel, padding: 0 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                            <thead>
                                <tr style={{ textAlign: 'left', color: 'rgba(255,255,255,0.6)' }}>
                                    <th style={th}>Transaction</th>
                                    <th style={th}>Order #</th>
                                    <th style={th}>Customer</th>
                                    <th style={th}>Method</th>
                                    <th style={th}>Amount</th>
                                    <th style={th}>Status</th>
                                    <th style={th}>Date</th>
                                    <th style={{ ...th, textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((p) => (
                                    <tr key={p.paymentId} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                        <td style={{ ...td, fontFamily: 'monospace', fontSize: 12.5 }}>
                                            {p.transactionId ? p.transactionId.slice(0, 12) + '…' : '—'}
                                        </td>
                                        <td style={{ ...td, fontWeight: 600 }}>#{p.orderId}</td>
                                        <td style={td}>{p.customerName ?? '—'}</td>
                                        <td style={{ ...td, color: 'rgba(255,255,255,0.6)' }}>{p.method}</td>
                                        <td style={td}>{formatCurrency(p.amount)}</td>
                                        <td style={td}><StatusBadge status={p.status} /></td>
                                        <td style={{ ...td, color: 'rgba(255,255,255,0.6)' }}>
                                            {p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '—'}
                                        </td>
                                        <td style={{ ...td, textAlign: 'right' }}>
                                            {p.status === 'Paid' ? (
                                                <button style={smallBtn} onClick={() => setConfirm(p)}>Refund</button>
                                            ) : (
                                                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>—</span>
                                            )}
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

            {/* REFUND CONFIRM DIALOG — only rendered when a payment is awaiting confirmation */}
            {confirm && (
                <div onClick={() => setConfirm(null)} style={overlay}>
                    <div onClick={(e) => e.stopPropagation()} style={confirmCard}>
                        <h2 style={{ fontFamily: 'Outfit', fontSize: 20, fontWeight: 700, margin: '0 0 10px' }}>
                            Refund payment?
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, margin: '0 0 20px' }}>
                            This refunds {formatCurrency(confirm.amount)} for order #{confirm.orderId} and
                            cancels the order. This cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button onClick={() => setConfirm(null)} disabled={refund.isPending} style={ghostBtn}>
                                Cancel
                            </button>
                            <button
                                onClick={() => refund.mutate(confirm.paymentId)}
                                disabled={refund.isPending}
                                style={dangerBtn}
                            >
                                {refund.isPending ? 'Refunding…' : 'Confirm refund'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

// A coloured pill showing the payment status.
function StatusBadge({ status }: { status: string }) {
    const c = paymentStatusColor(status);
    return (
        <span style={{
            display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 12.5, fontWeight: 600,
            color: c, background: `${c}22`, border: `1px solid ${c}55`,
        }}>
            {status}
        </span>
    );
}

// ---- inline styles (copied from AdminOrdersPage so all admin tabs look identical) ----
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
const overlay: CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8vh 16px', zIndex: 1000,
};
const confirmCard: CSSProperties = {
    width: '100%', maxWidth: 420, background: '#14141f', color: '#fff',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, padding: 24,
};
const ghostBtn: CSSProperties = {
    padding: '9px 16px', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: '#fff',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 10, cursor: 'pointer',
};
const dangerBtn: CSSProperties = {
    padding: '9px 16px', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: '#fff',
    background: '#e0556a', border: '1px solid #e0556a', borderRadius: 10, cursor: 'pointer',
};
