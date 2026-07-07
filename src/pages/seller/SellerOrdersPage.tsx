// src/pages/seller/SellerOrdersPage.tsx
import { useState } from 'react';
import type { CSSProperties } from 'react';
import toast from 'react-hot-toast';
import { useStores } from '../../hooks/useStores';
import { useSellerStoreOrders, useUpdateMyStoreOrderStatus } from '../../hooks/useSellerOrders';
import { Pagination } from '../../components/products/Pagination';
import { SellerTabs } from '../../components/seller/SellerTabs';
import { formatCurrency } from '../../lib/format';
import { statusColor } from '../../lib/orderStatus';

const PAGE_SIZE = 10;

// Mirrors OrderService.ValidProgressions exactly — the buttons offered here must match what
// the backend actually accepts, or every click would just come back as a 400.
const VALID_TRANSITIONS: Record<string, string[]> = {
    Pending: ['Confirmed', 'Cancelled'],
    Confirmed: ['Shipped', 'Cancelled'],
    Shipped: ['Delivered'],
    Delivered: [],
    Cancelled: [],
};

export function SellerOrdersPage() {
    const { data: stores = [], isLoading: storesLoading } = useStores();
    const hasApprovedStore = stores.some((s) => s.status === 'Approved');

    const [page, setPage] = useState(1);
    const { data, isLoading, isError } = useSellerStoreOrders(page, PAGE_SIZE);

    const updateStatus = useUpdateMyStoreOrderStatus({
        onSuccess: () => toast.success('Order status updated.'),
        onError: (m) => toast.error(m),
    });

    function onTransition(storeOrderId: number, newStatus: string) {
        if (newStatus === 'Cancelled') {
            const ok = window.confirm('Cancel this order? This will restock the items and cannot be undone.');
            if (!ok) return;
        }
        updateStatus.mutate({ storeOrderId, body: { status: newStatus } });
    }

    const items = data?.items ?? [];

    return (
        <main style={{ minHeight: '100vh', background: '#0a0a12', color: '#fff', padding: '40px 24px' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                <h1 style={{ fontFamily: 'Outfit', fontSize: 30, fontWeight: 700, margin: '0 0 6px' }}>Orders</h1>
                <p style={{ margin: '0 0 24px', color: 'rgba(255,255,255,0.6)' }}>
                    Fulfil orders placed with your store(s).
                </p>
                <SellerTabs />

                {storesLoading ? (
                    <div style={card}>Loading your stores…</div>
                ) : stores.length === 0 ? (
                    <div style={card}>You don't have any stores yet. Open one from the Dashboard tab.</div>
                ) : !hasApprovedStore ? (
                    <div style={{ ...card, borderColor: 'rgba(255,178,77,0.3)', background: 'rgba(255,178,77,0.08)' }}>
                        <strong style={{ color: '#ffcd8a' }}>You don't have an approved store yet.</strong>
                        <p style={{ margin: '8px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
                            Orders will start appearing here once an admin approves at least one of your stores —
                            unapproved stores can't receive orders.
                        </p>
                    </div>
                ) : isLoading ? (
                    <div style={card}>Loading orders…</div>
                ) : isError ? (
                    <div style={{ ...card, color: '#ff8fa3' }}>Couldn't load orders. Refresh the page.</div>
                ) : items.length === 0 ? (
                    <div style={card}>No orders yet.</div>
                ) : (
                    <>
                        <div style={{ overflowX: 'auto', ...card, padding: 0 }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', color: 'rgba(255,255,255,0.6)' }}>
                                        <th style={th}>Order #</th>
                                        <th style={th}>Date</th>
                                        <th style={th}>Store</th>
                                        <th style={th}>Status</th>
                                        <th style={th}>Subtotal</th>
                                        <th style={th}>Commission</th>
                                        <th style={th}>Net</th>
                                        <th style={{ ...th, textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((so) => {
                                        const nextStatuses = VALID_TRANSITIONS[so.status] ?? [];
                                        const c = statusColor(so.status);
                                        return (
                                            <tr key={so.storeOrderId} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                                <td style={{ ...td, fontWeight: 600 }}>#{so.orderId}</td>
                                                <td style={{ ...td, color: 'rgba(255,255,255,0.6)' }}>
                                                    {new Date(so.orderDate).toLocaleDateString()}
                                                </td>
                                                <td style={td}>{so.storeName}</td>
                                                <td style={td}>
                                                    <span style={{
                                                        display: 'inline-block', padding: '3px 10px', borderRadius: 999,
                                                        fontSize: 12.5, fontWeight: 600, color: c, background: `${c}22`, border: `1px solid ${c}55`,
                                                    }}>
                                                        {so.status}
                                                    </span>
                                                </td>
                                                <td style={td}>{formatCurrency(so.subTotal)}</td>
                                                <td style={{ ...td, color: 'rgba(255,255,255,0.6)' }}>{formatCurrency(so.commissionAmount)}</td>
                                                <td style={{ ...td, fontWeight: 600 }}>{formatCurrency(so.sellerNetAmount)}</td>
                                                <td style={{ ...td, textAlign: 'right' }}>
                                                    {nextStatuses.length === 0 ? (
                                                        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>No actions</span>
                                                    ) : (
                                                        <div style={{ display: 'inline-flex', gap: 8 }}>
                                                            {nextStatuses.map((next) => (
                                                                <button
                                                                    key={next}
                                                                    style={next === 'Cancelled' ? cancelBtn : smallBtn}
                                                                    disabled={updateStatus.isPending}
                                                                    onClick={() => onTransition(so.storeOrderId, next)}
                                                                >
                                                                    {next === 'Cancelled' ? 'Cancel' : `Mark ${next}`}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {data && (
                            <Pagination page={data.page} totalPages={data.totalPages}
                                hasPrevious={data.hasPrevious} hasNext={data.hasNext} onPageChange={setPage} />
                        )}
                    </>
                )}
            </div>
        </main>
    );
}

const card: CSSProperties = { padding: 20, borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', marginBottom: 18 };
const th: CSSProperties = { padding: '12px 14px', fontWeight: 600, fontSize: 12.5, textTransform: 'uppercase', letterSpacing: 0.4 };
const td: CSSProperties = { padding: '10px 14px', verticalAlign: 'middle' };
const smallBtn: CSSProperties = { padding: '6px 12px', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 9, cursor: 'pointer' };
const cancelBtn: CSSProperties = { ...smallBtn, color: '#ff8fa3', borderColor: 'rgba(255,143,163,0.35)' };