import { useState } from 'react';
import type { CSSProperties } from 'react';
import toast from 'react-hot-toast';
import { useCoupons, useDeactivateCoupon } from '../../hooks/useCoupons';
import { AdminTabs } from '../../components/admin/AdminTabs';
import { CouponFormModal } from './CouponFormModal';
import { formatCurrency } from '../../lib/format';
import type { CouponResponse } from '../../types/coupon';

export function AdminCouponsPage() {
    const { data: coupons = [], isLoading, isError } = useCoupons(); // no filter -> Admin sees everything
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState<CouponResponse | null>(null);
    const [confirm, setConfirm] = useState<CouponResponse | null>(null);

    const deactivate = useDeactivateCoupon({
        onSuccess: () => { toast.success('Coupon deactivated.'); setConfirm(null); },
        onError: (m) => { toast.error(m); setConfirm(null); },
    });

    return (
        <main className="admin-shell" style={page_}>
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 6 }}>
                    <div>
                        <h1 style={h1}>Coupons</h1>
                        <p style={subtitle}>Platform-wide coupons, plus every store&apos;s coupons for oversight.</p>
                    </div>
                    <button style={primaryBtn} onClick={() => setCreating(true)}>+ Add platform-wide coupon</button>
                </div>
                <AdminTabs />
                {isLoading ? (
                    <div style={panel}>Loading coupons…</div>
                ) : isError ? (
                    <div style={{ ...panel, color: '#ff8fa3' }}>Couldn&apos;t load coupons. Refresh the page.</div>
                ) : coupons.length === 0 ? (
                    <div style={panel}>No coupons yet. Click &quot;+ Add platform-wide coupon&quot; to create the first one.</div>
                ) : (
                    <div style={{ overflowX: 'auto', ...panel, padding: 0 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                            <thead>
                                <tr style={{ textAlign: 'left', color: 'rgba(255,255,255,0.6)' }}>
                                    <th style={th}>Code</th><th style={th}>Scope</th><th style={th}>Discount</th>
                                    <th style={th}>Expires</th><th style={th}>Usage</th><th style={th}>Status</th>
                                    <th style={{ ...th, textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coupons.map((c) => (
                                    <tr key={c.id} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                        <td style={{ ...td, fontWeight: 600 }}>{c.code}</td>
                                        <td style={{ ...td, color: 'rgba(255,255,255,0.6)' }}>{c.storeId === null ? 'Platform-wide' : c.storeName}</td>
                                        <td style={td}>{c.discountType === 0 ? `${c.discountValue}%` : formatCurrency(c.discountValue)}</td>
                                        <td style={{ ...td, color: 'rgba(255,255,255,0.6)' }}>{new Date(c.expiryDate).toLocaleDateString()}</td>
                                        <td style={td}>{c.usageCount}{c.usageLimit !== null ? ` / ${c.usageLimit}` : ''}</td>
                                        <td style={td}><span style={{ color: c.isActive ? '#8be0a4' : 'rgba(255,255,255,0.4)' }}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                                        <td style={{ ...td, textAlign: 'right' }}>
                                            <button style={smallBtn} onClick={() => setEditing(c)}>Edit</button>{' '}
                                            {c.isActive && (
                                                <button style={{ ...smallBtn, color: '#ff9db0', borderColor: 'rgba(224,85,106,0.5)' }} onClick={() => setConfirm(c)}>Deactivate</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {creating && <CouponFormModal coupon={null} isAdmin stores={[]} onClose={() => setCreating(false)} />}
            {editing && <CouponFormModal coupon={editing} isAdmin stores={[]} onClose={() => setEditing(null)} />}
            {confirm && (
                <div onClick={() => setConfirm(null)} style={overlay}>
                    <div onClick={(e) => e.stopPropagation()} style={confirmCard}>
                        <h2 style={{ fontFamily: 'Outfit', fontSize: 20, fontWeight: 700, margin: '0 0 10px' }}>Deactivate &quot;{confirm.code}&quot;?</h2>
                        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, margin: '0 0 20px' }}>
                            It stops applying to new carts immediately. The coupon record is kept, not deleted.
                        </p>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button onClick={() => setConfirm(null)} disabled={deactivate.isPending} style={ghostBtn}>Cancel</button>
                            <button onClick={() => deactivate.mutate(confirm.id)} disabled={deactivate.isPending} style={dangerBtn}>
                                {deactivate.isPending ? 'Deactivating…' : 'Deactivate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

const page_: CSSProperties = { minHeight: '100vh', color: '#fff', padding: '40px 24px', position: 'relative' };
const h1: CSSProperties = { fontFamily: 'Outfit', fontSize: 30, fontWeight: 700, margin: '0 0 6px' };
const subtitle: CSSProperties = { margin: '0 0 24px', color: 'rgba(255,255,255,0.6)' };
const panel: CSSProperties = { padding: 18, borderRadius: 16, background: 'linear-gradient(180deg, rgba(255,255,255,0.075), rgba(255,255,255,0.035))', border: '1px solid rgba(255,255,255,0.11)', boxShadow: '0 18px 40px -24px rgba(5,3,20,0.9), inset 0 1px 0 rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)', marginBottom: 18 };
const th: CSSProperties = { padding: '12px 14px', fontWeight: 600, fontSize: 12.5, textTransform: 'uppercase', letterSpacing: 0.4 };
const td: CSSProperties = { padding: '10px 14px', verticalAlign: 'middle' };
const smallBtn: CSSProperties = { padding: '6px 12px', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 9, cursor: 'pointer' };
const primaryBtn: CSSProperties = { padding: '10px 16px', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: '#fff', border: 'none', borderRadius: 11, cursor: 'pointer', background: 'linear-gradient(120deg,#8b5cf6,#6366f1)' };
const overlay: CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8vh 16px', zIndex: 1000 };
const confirmCard: CSSProperties = { width: '100%', maxWidth: 420, background: '#14141f', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, padding: 24 };
const ghostBtn: CSSProperties = { padding: '9px 16px', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 10, cursor: 'pointer' };
const dangerBtn: CSSProperties = { padding: '9px 16px', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: '#fff', background: '#e0556a', border: '1px solid #e0556a', borderRadius: 10, cursor: 'pointer' };