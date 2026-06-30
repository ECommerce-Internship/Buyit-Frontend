// src/pages/admin/OrderManageModal.tsx
import type { CSSProperties } from 'react';
import toast from 'react-hot-toast';
import { useAdminOrder, useUpdateStoreOrderStatus } from '../../hooks/useAdminData';
import { ORDER_STATUSES, statusColor } from '../../lib/orderStatus';
import { formatCurrency } from '../../lib/format';

interface Props {
    orderId: number;
    onClose: () => void;
}

export function OrderManageModal({ orderId, onClose }: Props) {
    const { data: order, isLoading, isError } = useAdminOrder(orderId);

    const update = useUpdateStoreOrderStatus({
        onSuccess: () => toast.success('Status updated.'),
        onError: (m) => toast.error(m),
    });

    function onChangeStatus(storeOrderId: number, newStatus: string) {
        update.mutate({ storeOrderId, body: { status: newStatus } });
    }

    return (
        <div onClick={onClose} style={overlay}>
            <div onClick={(e) => e.stopPropagation()} style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2 style={{ fontFamily: 'Outfit', fontSize: 22, fontWeight: 700, margin: 0 }}>
                        Order #{orderId}
                    </h2>
                    <button onClick={onClose} style={iconBtn} aria-label="Close">✕</button>
                </div>

                {isLoading ? (
                    <p style={{ color: 'rgba(255,255,255,0.6)' }}>Loading…</p>
                ) : isError || !order ? (
                    <p style={{ color: '#ff8fa3' }}>Couldn’t load this order.</p>
                ) : (
                    <>
                        <p style={{ margin: '0 0 14px', color: 'rgba(255,255,255,0.6)', fontSize: 13.5 }}>
                            Placed {new Date(order.orderDate).toLocaleString()} · Total {formatCurrency(order.totalAmount)}
                        </p>

                        {/* §5.3: status is per STORE-ORDER. One row per store slice. */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {order.storeOrders.map((so) => (
                                <div key={so.storeOrderId} style={row}>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{so.storeName}</div>
                                        <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.5)' }}>
                                            Store-order #{so.storeOrderId} · {formatCurrency(so.subTotal)}
                                        </div>
                                    </div>
                                    <select
                                        value={so.status}
                                        disabled={update.isPending}
                                        onChange={(e) => onChangeStatus(so.storeOrderId, e.target.value)}
                                        style={{ ...select, color: statusColor(so.status) }}
                                    >
                                        {ORDER_STATUSES.map((s) => <option key={s} value={s} style={{ color: '#000' }}>{s}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

const overlay: CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '8vh 16px', zIndex: 1000, overflowY: 'auto',
};
const card: CSSProperties = {
    width: '100%', maxWidth: 520, background: '#14141f', color: '#fff',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, padding: 24,
};
const row: CSSProperties = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14,
    padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
};
const select: CSSProperties = {
    padding: '8px 10px', fontSize: 14, fontFamily: 'inherit', background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.16)', borderRadius: 10, outline: 'none', fontWeight: 600,
};
const iconBtn: CSSProperties = {
    background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 18, cursor: 'pointer',
};
