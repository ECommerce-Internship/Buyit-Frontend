import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import toast from 'react-hot-toast';
import { useStores } from '../../hooks/useStores';
import { useCoupons, useDeactivateCoupon } from '../../hooks/useCoupons';
import { formatCurrency } from '../../lib/format';
import type { CouponResponse } from '../../types/coupon';
import { CouponFormModal } from '../admin/CouponFormModal';
import { SellerTabs } from '../../components/seller/SellerTabs';
import { StorePicker } from '../../components/seller/StorePicker';
import { StoreLockedBanner } from '../../components/seller/StoreLockedBanner';

export function SellerCouponsPage() {
    const { data: stores = [], isLoading: storesLoading } = useStores();
    const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);

    useEffect(() => {
        if (selectedStoreId !== null || stores.length === 0) return;
        const firstApproved = stores.find((s) => s.status === 'Approved');
        setSelectedStoreId((firstApproved ?? stores[0]).id);
    }, [stores, selectedStoreId]);

    const selectedStore = stores.find((s) => s.id === selectedStoreId) ?? null;
    const isApproved = selectedStore?.status === 'Approved';

    const [editing, setEditing] = useState<CouponResponse | 'new' | null>(null);

    const { data: coupons = [], isLoading, isError } = useCoupons(
        selectedStoreId !== null ? { storeId: selectedStoreId } : {},
    );

    const deactivate = useDeactivateCoupon({
        onSuccess: () => toast.success('Coupon deactivated.'),
        onError: (m) => toast.error(m),
    });

    function onDeactivate(c: CouponResponse) {
        if (!isApproved) return;
        if (window.confirm(`Deactivate "${c.code}"? It will stop applying to new carts.`)) deactivate.mutate(c.id);
    }

    const approvedStores = stores.filter((s) => s.status === 'Approved');

    return (
        <main style={{ minHeight: '100vh', background: '#0a0a12', color: '#fff', padding: '40px 24px' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                <h1 style={{ fontFamily: 'Outfit', fontSize: 30, fontWeight: 700, margin: '0 0 6px' }}>Coupons</h1>
                <p style={{ margin: '0 0 24px', color: 'rgba(255,255,255,0.6)' }}>Manage discount codes for the stores you own.</p>
                <SellerTabs />
                {storesLoading ? (
                    <div style={card}>Loading your stores…</div>
                ) : stores.length === 0 ? (
                    <div style={card}>You don't have any stores yet. Open one from the Dashboard tab.</div>
                ) : (
                    <>
                        <StorePicker stores={stores} selectedId={selectedStoreId} onChange={setSelectedStoreId} />
                        {selectedStore && selectedStore.status !== 'Approved' && <StoreLockedBanner status={selectedStore.status} />}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
                            <button onClick={() => setEditing('new')} disabled={!isApproved}
                                title={isApproved ? undefined : 'Available once this store is approved'}
                                style={{ ...primaryBtn, opacity: isApproved ? 1 : 0.45, cursor: isApproved ? 'pointer' : 'not-allowed' }}>
                                + Add Coupon
                            </button>
                        </div>
                        {isLoading ? (
                            <div style={card}>Loading coupons…</div>
                        ) : isError ? (
                            <div style={{ ...card, color: '#ff8fa3' }}>Couldn't load coupons. Refresh the page.</div>
                        ) : coupons.length === 0 ? (
                            <div style={card}>No coupons in this store yet.</div>
                        ) : (
                            <div style={{ overflowX: 'auto', ...card, padding: 0 }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', color: 'rgba(255,255,255,0.6)' }}>
                                            <th style={th}>Code</th><th style={th}>Discount</th><th style={th}>Expires</th>
                                            <th style={th}>Usage</th><th style={th}>Status</th><th style={{ ...th, textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {coupons.map((c) => (
                                            <tr key={c.id} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                                <td style={{ ...td, fontWeight: 600 }}>{c.code}</td>
                                                <td style={td}>{c.discountType === 0 ? `${c.discountValue}%` : formatCurrency(c.discountValue)}</td>
                                                <td style={{ ...td, color: 'rgba(255,255,255,0.6)' }}>{new Date(c.expiryDate).toLocaleDateString()}</td>
                                                <td style={td}>{c.usageCount}{c.usageLimit !== null ? ` / ${c.usageLimit}` : ''}</td>
                                                <td style={td}><span style={{ color: c.isActive ? '#8be0a4' : 'rgba(255,255,255,0.4)' }}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                                                <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                                                    <button style={smallBtn} disabled={!isApproved}
                                                        title={isApproved ? undefined : 'Available once this store is approved'}
                                                        onClick={() => isApproved && setEditing(c)}>Edit</button>
                                                    {c.isActive && (
                                                        <button style={{ ...smallBtn, color: '#ff8fa3', marginLeft: 8 }}
                                                            disabled={!isApproved || (deactivate.isPending && deactivate.variables === c.id)}
                                                            title={isApproved ? undefined : 'Available once this store is approved'}
                                                            onClick={() => onDeactivate(c)}>Deactivate</button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>
            {editing !== null && (
                <CouponFormModal coupon={editing === 'new' ? null : editing} isAdmin={false} stores={approvedStores} onClose={() => setEditing(null)} />
            )}
        </main>
    );
}

const card: CSSProperties = { padding: 20, borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', marginBottom: 18 };
const th: CSSProperties = { padding: '12px 14px', fontWeight: 600, fontSize: 12.5, textTransform: 'uppercase', letterSpacing: 0.4 };
const td: CSSProperties = { padding: '10px 14px', verticalAlign: 'middle' };
const primaryBtn: CSSProperties = { padding: '11px 18px', fontFamily: 'inherit', fontSize: 14.5, fontWeight: 600, color: '#fff', border: 'none', borderRadius: 12, background: 'linear-gradient(120deg,#8b5cf6,#6366f1)' };
const smallBtn: CSSProperties = { padding: '6px 12px', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 9, cursor: 'pointer' };