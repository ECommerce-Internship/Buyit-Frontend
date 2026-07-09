import { useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import toast from 'react-hot-toast';
import { useCreateCoupon, useUpdateCoupon } from '../../hooks/useCoupons';
import type { CouponResponse, CouponDiscountType } from '../../types/coupon';
import type { Store } from '../../types/store';

interface Props {
    coupon: CouponResponse | null; // null = create
    isAdmin: boolean;              // Admin creates GLOBAL coupons (no store picker); Seller must choose a store
    stores: Store[];               // Seller's approved stores (ignored when isAdmin)
    onClose: () => void;
}

export function CouponFormModal({ coupon, isAdmin, stores, onClose }: Props) {
    const isEdit = coupon !== null;

    const [code, setCode] = useState(coupon?.code ?? '');
    const [discountType, setDiscountType] = useState<CouponDiscountType>(coupon?.discountType ?? 0);
    const [discountValue, setDiscountValue] = useState(coupon ? String(coupon.discountValue) : '');
    const [expiryDate, setExpiryDate] = useState(coupon ? coupon.expiryDate.slice(0, 10) : '');
    const [usageLimit, setUsageLimit] = useState(coupon?.usageLimit != null ? String(coupon.usageLimit) : '');
    const [isActive, setIsActive] = useState(coupon?.isActive ?? true);
    const [storeId, setStoreId] = useState<number>(0); // create-only, seller-only

    const create = useCreateCoupon({
        onSuccess: () => { toast.success('Coupon created.'); onClose(); },
        onError: (m) => toast.error(m),
    });
    const update = useUpdateCoupon({
        onSuccess: () => { toast.success('Coupon updated.'); onClose(); },
        onError: (m) => toast.error(m),
    });
    const saving = create.isPending || update.isPending;

    function onSubmit(e: FormEvent) {
        e.preventDefault();
        const valueNum = Number(discountValue);
        if (!code.trim()) return toast.error('Code is required.');
        if (!Number.isFinite(valueNum) || valueNum <= 0) return toast.error('Discount value must be greater than 0.');
        if (discountType === 0 && valueNum > 100) return toast.error('A percentage discount cannot exceed 100.');
        if (!expiryDate) return toast.error('Expiry date is required.');
        if (new Date(expiryDate) <= new Date()) return toast.error('Expiry date must be in the future.');

        const limitNum = usageLimit.trim() ? Number(usageLimit) : null;
        if (limitNum !== null && (!Number.isFinite(limitNum) || limitNum < 1)) {
            return toast.error('Usage limit must be at least 1 (or left blank for unlimited).');
        }

        const expiryIso = new Date(expiryDate).toISOString();

        if (isEdit) {
            update.mutate({
                id: coupon!.id,
                body: { code: code.trim(), discountType, discountValue: valueNum, expiryDate: expiryIso, isActive, usageLimit: limitNum },
            });
        } else {
            if (!isAdmin && !storeId) return toast.error('Please choose a store.');
            create.mutate({
                code: code.trim(),
                discountType,
                discountValue: valueNum,
                expiryDate: expiryIso,
                usageLimit: limitNum,
                storeId: isAdmin ? null : storeId,
            });
        }
    }

    return (
        <div onClick={onClose} style={overlay}>
            <div onClick={(e) => e.stopPropagation()} style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2 style={{ fontFamily: 'Outfit', fontSize: 22, fontWeight: 700, margin: 0 }}>
                        {isEdit ? 'Edit coupon' : isAdmin ? 'Add platform-wide coupon' : 'Add coupon'}
                    </h2>
                    <button onClick={onClose} style={iconBtn} aria-label="Close">✕</button>
                </div>
                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <Field label="Code">
                        <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} style={input} />
                    </Field>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <Field label="Discount type" style={{ flex: 1 }}>
                            <select value={discountType} onChange={(e) => setDiscountType(Number(e.target.value) as CouponDiscountType)} style={input}>
                                <option value={0}>Percentage</option>
                                <option value={1}>Fixed amount</option>
                            </select>
                        </Field>
                        <Field label={discountType === 0 ? 'Discount (%)' : 'Discount ($)'} style={{ flex: 1 }}>
                            <input value={discountValue} onChange={(e) => setDiscountValue(e.target.value)}
                                inputMode="decimal" placeholder={discountType === 0 ? '10' : '5.00'} style={input} />
                        </Field>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <Field label="Expiry date" style={{ flex: 1 }}>
                            <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} style={input} />
                        </Field>
                        <Field label="Usage limit (optional)" style={{ flex: 1 }}>
                            <input value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)}
                                inputMode="numeric" placeholder="Unlimited" style={input} />
                        </Field>
                    </div>
                    {!isEdit && !isAdmin && (
                        <Field label="Store">
                            <select value={storeId} onChange={(e) => setStoreId(Number(e.target.value))} style={input}>
                                <option value={0} disabled>Choose a store…</option>
                                {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </Field>
                    )}
                    {isEdit && (
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'rgba(255,255,255,0.8)' }}>
                            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                            Active
                        </label>
                    )}
                    {coupon && coupon.usageCount > 0 && (
                        <p style={{ margin: 0, fontSize: 12.5, color: 'rgba(255,255,255,0.45)' }}>
                            Redeemed {coupon.usageCount} time{coupon.usageCount === 1 ? '' : 's'} so far.
                        </p>
                    )}
                    <button type="submit" disabled={saving}
                        style={{ marginTop: 4, padding: 12, fontFamily: 'inherit', fontSize: 15, fontWeight: 600, color: '#fff', border: 'none', borderRadius: 12, cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.8 : 1, background: 'linear-gradient(120deg,#8b5cf6,#6366f1)' }}>
                        {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create coupon'}
                    </button>
                </form>
            </div>
        </div>
    );
}

function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: CSSProperties }) {
    return (
        <div style={style}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'rgba(255,255,255,0.72)' }}>{label}</label>
            {children}
        </div>
    );
}

const overlay: CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '6vh 16px', zIndex: 1000, overflowY: 'auto' };
const card: CSSProperties = { width: '100%', maxWidth: 480, background: '#14141f', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, padding: 24 };
const input: CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '11px 13px', fontSize: 14.5, fontFamily: 'inherit', color: '#fff', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 12, outline: 'none' };
const iconBtn: CSSProperties = { background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 18, cursor: 'pointer' };