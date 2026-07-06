// src/pages/SellerDashboardPage.tsx
import { useMemo, useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LogOut, UserCog } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStores } from '../hooks/useStores';
import { SellerTabs } from '../components/seller/SellerTabs';
import { useCreateStore } from '../hooks/useCreateStore';
import type { StoreStatus } from '../types/store';

// Colour each status so the badge reads at a glance. Pending = amber, Approved = green,
// Suspended/Rejected = red. (A Record maps every StoreStatus to a {bg,fg} colour pair.)
const STATUS_COLORS: Record<StoreStatus, { bg: string; fg: string }> = {
    Pending:   { bg: 'rgba(255,178,77,0.14)',  fg: '#ffb24d' },
    Approved:  { bg: 'rgba(110,231,160,0.14)', fg: '#6ee7a0' },
    Suspended: { bg: 'rgba(255,93,122,0.14)',  fg: '#ff5d7a' },
    Rejected:  { bg: 'rgba(255,93,122,0.14)',  fg: '#ff5d7a' },
};

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

export function SellerDashboardPage() {
    const { user, logout } = useAuth();
    const queryClient = useQueryClient();

    // Real "list my stores" via GET /api/v1/Stores/mine (survives a page refresh).
    const { data: stores = [], isLoading, isError } = useStores();

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
