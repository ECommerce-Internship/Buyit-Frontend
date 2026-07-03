// src/pages/admin/AdminStoresPage.tsx
import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import toast from 'react-hot-toast';
import {
    useAdminStores,
    usePendingStores,
    useApproveStore,
    useRejectStore,
    useSuspendStore,
} from '../../hooks/useAdminStores';
import { AdminTabs } from '../../components/admin/AdminTabs';
import type { Store, StoreStatus } from '../../types/store';
import { Skeleton } from '../../components/ui/Skeleton';

type Action = 'approve' | 'reject' | 'suspend';

// The four statuses the filter offers — MUST match the StoreStatus names exactly.
const STATUSES: StoreStatus[] = ['Pending', 'Approved', 'Suspended', 'Rejected'];

// One colour per store status, used by the badge. All hex so the `${c}22`/`${c}55` alpha-suffix
// stays a valid 8-digit-hex colour.
function storeStatusColor(status: StoreStatus): string {
    switch (status) {
        case 'Approved': return '#34d399';   // green
        case 'Pending': return '#fbbf24';    // amber
        case 'Suspended': return '#ff8fa3';  // red/pink
        default: return '#9ca3af';           // Rejected / anything else: grey
    }
}

// Human text for the confirm dialog, per action.
const ACTION_COPY: Record<Action, { title: string; body: (name: string) => string; danger: boolean }> = {
    approve: { title: 'Approve store?', body: (n) => `“${n}” will go live and its products become publicly browsable.`, danger: false },
    reject: { title: 'Reject store?', body: (n) => `“${n}” will be marked Rejected and stays hidden from public browsing.`, danger: true },
    suspend: { title: 'Suspend store?', body: (n) => `“${n}” will be turned off and its products disappear from public browsing.`, danger: true },
};

export function AdminStoresPage() {
    const pending = usePendingStores();
    const all = useAdminStores();

    const [filter, setFilter] = useState<StoreStatus | ''>('');                    // '' = All
    const [confirm, setConfirm] = useState<{ store: Store; action: Action } | null>(null);

    const close = () => setConfirm(null);
    const approve = useApproveStore({ onSuccess: () => { toast.success('Store approved.'); close(); }, onError: (m) => { toast.error(m); close(); } });
    const reject = useRejectStore({ onSuccess: () => { toast.success('Store rejected.'); close(); }, onError: (m) => { toast.error(m); close(); } });
    const suspend = useSuspendStore({ onSuccess: () => { toast.success('Store suspended.'); close(); }, onError: (m) => { toast.error(m); close(); } });

    // Pick the mutation that matches the action currently awaiting confirmation.
    const runner = confirm?.action === 'approve' ? approve : confirm?.action === 'reject' ? reject : suspend;
    const busy = approve.isPending || reject.isPending || suspend.isPending;

    const pendingStores = pending.data ?? [];
    const allStores = (all.data ?? []).filter((s) => (filter ? s.status === filter : true));

    // Open the confirm dialog for a given store + action.
    const ask = (store: Store, action: Action) => setConfirm({ store, action });

    // Esc closes the confirm dialog (unless a mutation is mid-flight).
    useEffect(() => {
        if (!confirm) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !busy) close();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [confirm, busy]);

    return (
        <main className="admin-shell" style={page_}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                <h1 style={h1}>Stores</h1>
                <p style={subtitle}>Approve new shops, reject bad applications, and suspend or re-approve live stores.</p>

                <AdminTabs />

                {/* ===== PENDING QUEUE ===== */}
                <h2 style={h2}>Pending approval</h2>
                {pending.isLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 26 }}>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} style={{ ...panel, marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                                <div style={{ flex: 1 }}>
                                    <Skeleton className="h-4 w-40" style={darkTone} />
                                    <Skeleton className="mt-2 h-3 w-56" style={darkTone} />
                                    <Skeleton className="mt-3 h-3 w-72" style={darkTone} />
                                </div>
                                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                    <Skeleton className="h-8 w-20 rounded-lg" style={darkTone} />
                                    <Skeleton className="h-8 w-20 rounded-lg" style={darkTone} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : pending.isError ? (
                    <div style={{ ...panel, color: '#ff8fa3' }}>Couldn’t load the pending queue. Refresh the page.</div>
                ) : pendingStores.length === 0 ? (
                    <div style={panel}>No stores are waiting for approval. 🎉</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 26 }}>
                        {pendingStores.map((s) => (
                            <div key={s.id} style={{ ...panel, marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 16 }}>{s.name}</div>
                                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>
                                        Owner: {s.ownerName ?? '—'} · Created {new Date(s.createdAt).toLocaleDateString()}
                                    </div>
                                    <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.7)', margin: '8px 0 0', maxWidth: 640 }}>
                                        {s.description || <span style={{ color: 'rgba(255,255,255,0.35)' }}>No description provided.</span>}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                    <button style={approveBtn} onClick={() => ask(s, 'approve')}>Approve</button>
                                    <button style={dangerBtn} onClick={() => ask(s, 'reject')}>Reject</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ===== ALL STORES ===== */}
                <h2 style={h2}>All stores</h2>

                {/* FILTER */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 18 }}>
                    <label style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.6)' }}>Status</label>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as StoreStatus | '')}
                        style={{ ...input, width: 'auto', minWidth: 160 }}
                    >
                        <option value="">All</option>
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                {all.isLoading ? (
                    <div style={{ overflowX: 'auto', ...panel, padding: 0 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                            <thead>
                                <tr style={{ textAlign: 'left', color: 'rgba(255,255,255,0.6)' }}>
                                    <th style={th}>Name</th>
                                    <th style={th}>Owner</th>
                                    <th style={th}>Slug</th>
                                    <th style={th}>Status</th>
                                    <th style={th}>Created</th>
                                    <th style={{ ...th, textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                        <td style={td}><Skeleton className="h-4 w-28" style={darkTone} /></td>
                                        <td style={td}><Skeleton className="h-4 w-24" style={darkTone} /></td>
                                        <td style={td}><Skeleton className="h-4 w-20" style={darkTone} /></td>
                                        <td style={td}><Skeleton className="h-5 w-16 rounded-full" style={darkTone} /></td>
                                        <td style={td}><Skeleton className="h-4 w-16" style={darkTone} /></td>
                                        <td style={{ ...td, textAlign: 'right' }}><Skeleton className="ml-auto h-8 w-20 rounded-lg" style={darkTone} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : all.isError ? (
                    <div style={{ ...panel, color: '#ff8fa3' }}>Couldn’t load stores. Refresh the page.</div>
                ) : allStores.length === 0 ? (
                    <div style={panel}>No stores match this filter.</div>
                ) : (
                    <div style={{ overflowX: 'auto', ...panel, padding: 0 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                            <thead>
                                <tr style={{ textAlign: 'left', color: 'rgba(255,255,255,0.6)' }}>
                                    <th style={th}>Name</th>
                                    <th style={th}>Owner</th>
                                    <th style={th}>Slug</th>
                                    <th style={th}>Status</th>
                                    <th style={th}>Created</th>
                                    <th style={{ ...th, textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allStores.map((s) => (
                                    <tr key={s.id} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                        <td style={{ ...td, fontWeight: 600 }}>{s.name}</td>
                                        <td style={{ ...td, color: 'rgba(255,255,255,0.7)' }}>{s.ownerName ?? '—'}</td>
                                        <td style={{ ...td, fontFamily: 'monospace', fontSize: 12.5, color: 'rgba(255,255,255,0.6)' }}>{s.slug}</td>
                                        <td style={td}><StatusBadge status={s.status} /></td>
                                        <td style={{ ...td, color: 'rgba(255,255,255,0.6)' }}>{new Date(s.createdAt).toLocaleDateString()}</td>
                                        <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                                            <RowActions store={s} ask={ask} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ===== CONFIRM DIALOG ===== */}
            {confirm && (
                <div onClick={close} style={overlay}>
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={confirmCard}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="store-confirm-title"
                    >
                        <h2 id="store-confirm-title" style={{ fontFamily: 'Outfit', fontSize: 20, fontWeight: 700, margin: '0 0 10px' }}>
                            {ACTION_COPY[confirm.action].title}
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, margin: '0 0 20px' }}>
                            {ACTION_COPY[confirm.action].body(confirm.store.name)}
                        </p>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button onClick={close} disabled={busy} style={ghostBtn}>Cancel</button>
                            <button
                                autoFocus
                                onClick={() => runner.mutate(confirm.store.id)}
                                disabled={busy}
                                style={ACTION_COPY[confirm.action].danger ? dangerBtn : approveBtn}
                            >
                                {busy ? 'Working…' : ACTION_COPY[confirm.action].title.replace('?', '')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

// The action buttons for one row, chosen by the store's current status.
function RowActions({ store, ask }: { store: Store; ask: (s: Store, a: Action) => void }) {
    switch (store.status) {
        case 'Pending':
            return (
                <>
                    <button style={smallBtn} onClick={() => ask(store, 'approve')}>Approve</button>{' '}
                    <button style={smallDanger} onClick={() => ask(store, 'reject')}>Reject</button>
                </>
            );
        case 'Approved':
            return <button style={smallDanger} onClick={() => ask(store, 'suspend')}>Suspend</button>;
        case 'Suspended':
            return <button style={smallBtn} onClick={() => ask(store, 'approve')}>Re-approve</button>;
        case 'Rejected':
            return <button style={smallBtn} onClick={() => ask(store, 'approve')}>Approve</button>;
        default:
            return <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>—</span>;
    }
}

// A coloured pill showing the store status.
function StatusBadge({ status }: { status: StoreStatus }) {
    const c = storeStatusColor(status);
    return (
        <span style={{
            display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 12.5, fontWeight: 600,
            color: c, background: `${c}22`, border: `1px solid ${c}55`,
        }}>
            {status}
        </span>
    );
}

// ---- inline styles (copied from AdminPaymentsPage so all admin tabs look identical) ----
const page_: CSSProperties = { minHeight: '100vh', color: '#fff', padding: '40px 24px', position: 'relative' };
const h1: CSSProperties = { fontFamily: 'Outfit', fontSize: 30, fontWeight: 700, margin: '0 0 6px' };
const h2: CSSProperties = { fontFamily: 'Outfit', fontSize: 19, fontWeight: 700, margin: '8px 0 14px' };
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
const input: CSSProperties = {
    boxSizing: 'border-box', padding: '10px 12px', fontSize: 14.5, fontFamily: 'inherit', color: '#fff',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 11, outline: 'none',
};
const smallBtn: CSSProperties = {
    padding: '6px 12px', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#fff',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 9, cursor: 'pointer',
};
const smallDanger: CSSProperties = { ...smallBtn, color: '#ff9db0', borderColor: 'rgba(224,85,106,0.5)' };
const approveBtn: CSSProperties = {
    padding: '9px 16px', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: '#fff', border: 'none',
    borderRadius: 10, cursor: 'pointer', background: 'linear-gradient(120deg,#10b981,#059669)',
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
