// src/pages/admin/AdminInventoryPage.tsx
import { useState } from 'react';
import type { CSSProperties } from 'react';
import toast from 'react-hot-toast';
import { useInventory, useUpdateStock } from '../../hooks/useAdminData';
import { AdminTabs } from '../../components/admin/AdminTabs';

export function AdminInventoryPage() {
    const { data: items = [], isLoading, isError } = useInventory();
    const [search, setSearch] = useState('');

    // Inline-edit state: which product is being edited, and the draft value in its input.
    const [editingId, setEditingId] = useState<number | null>(null);
    const [draft, setDraft] = useState('');

    const updateStock = useUpdateStock({
        onSuccess: () => { toast.success('Stock updated.'); setEditingId(null); },
        onError: (m) => toast.error(m),
    });

    function startEdit(productId: number, current: number) {
        setEditingId(productId);
        setDraft(String(current));
    }
    function confirmEdit(productId: number) {
        const n = Number(draft);
        if (!Number.isInteger(n) || n < 0) return toast.error('Stock must be a whole number ≥ 0.');
        updateStock.mutate({ productId, newQuantity: n });
    }

    // Client-side filter (the full list is already in memory, §5.7).
    const q = search.trim().toLowerCase();
    const filtered = q
        ? items.filter((i) => i.productName.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q))
        : items;

    return (
        <main style={page_}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                <h1 style={h1}>Inventory</h1>
                <p style={subtitle}>Stock levels across the catalogue. Low-stock rows are flagged in red.</p>

                <AdminTabs />

                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or SKU…"
                    style={{ ...input, width: '100%', marginBottom: 18 }}
                />

                {isLoading ? (
                    <div style={panel}>Loading inventory…</div>
                ) : isError ? (
                    <div style={{ ...panel, color: '#ff8fa3' }}>Couldn’t load inventory. Refresh the page.</div>
                ) : filtered.length === 0 ? (
                    <div style={panel}>No inventory rows found.</div>
                ) : (
                    <div style={{ overflowX: 'auto', ...panel, padding: 0 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                            <thead>
                                <tr style={{ textAlign: 'left', color: 'rgba(255,255,255,0.6)' }}>
                                    <th style={th}>Product</th>
                                    <th style={th}>SKU</th>
                                    <th style={th}>Current stock</th>
                                    <th style={th}>Threshold</th>
                                    <th style={th}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((i) => {
                                    const isEditing = editingId === i.productId;
                                    return (
                                        <tr key={i.productId} style={{
                                            borderTop: '1px solid rgba(255,255,255,0.08)',
                                            // §5.6: trust the backend's isLowStock for the red highlight.
                                            background: i.isLowStock ? 'rgba(255,77,109,0.10)' : 'transparent',
                                        }}>
                                            <td style={{ ...td, fontWeight: 600 }}>{i.productName}</td>
                                            <td style={{ ...td, color: 'rgba(255,255,255,0.6)' }}>{i.sku}</td>
                                            <td style={td}>
                                                {isEditing ? (
                                                    <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                                                        <input
                                                            value={draft}
                                                            onChange={(e) => setDraft(e.target.value)}
                                                            inputMode="numeric"
                                                            autoFocus
                                                            style={{ ...input, width: 90, padding: '6px 8px' }}
                                                        />
                                                        <button style={iconOk} disabled={updateStock.isPending}
                                                            onClick={() => confirmEdit(i.productId)} aria-label="Confirm">✓</button>
                                                        <button style={iconCancel}
                                                            onClick={() => setEditingId(null)} aria-label="Cancel">✕</button>
                                                    </span>
                                                ) : (
                                                    <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                                                        {i.quantity}
                                                        <button style={pencil} onClick={() => startEdit(i.productId, i.quantity)}
                                                            aria-label="Edit stock">✏️</button>
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ ...td, color: 'rgba(255,255,255,0.6)' }}>{i.lowStockThreshold}</td>
                                            <td style={td}>
                                                {i.isLowStock ? (
                                                    <span style={lowBadge}>⚠ Low stock</span>
                                                ) : (
                                                    <span style={okBadge}>In stock</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    );
}

// ---- inline styles ----
const page_: CSSProperties = { minHeight: '100vh', background: '#0a0a12', color: '#fff', padding: '40px 24px' };
const h1: CSSProperties = { fontFamily: 'Outfit', fontSize: 30, fontWeight: 700, margin: '0 0 6px' };
const subtitle: CSSProperties = { margin: '0 0 24px', color: 'rgba(255,255,255,0.6)' };
const panel: CSSProperties = {
    padding: 18, borderRadius: 16, background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)', marginBottom: 18,
};
const th: CSSProperties = { padding: '12px 14px', fontWeight: 600, fontSize: 12.5, textTransform: 'uppercase', letterSpacing: 0.4 };
const td: CSSProperties = { padding: '10px 14px', verticalAlign: 'middle' };
const input: CSSProperties = {
    boxSizing: 'border-box', padding: '10px 12px', fontSize: 14.5, fontFamily: 'inherit', color: '#fff',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 11, outline: 'none',
};
const pencil: CSSProperties = { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, padding: 2 };
const iconOk: CSSProperties = {
    background: 'rgba(139,224,164,0.15)', border: '1px solid rgba(139,224,164,0.5)', color: '#8be0a4',
    borderRadius: 8, cursor: 'pointer', padding: '4px 8px', fontWeight: 700,
};
const iconCancel: CSSProperties = {
    background: 'rgba(255,143,163,0.12)', border: '1px solid rgba(255,143,163,0.45)', color: '#ff8fa3',
    borderRadius: 8, cursor: 'pointer', padding: '4px 8px', fontWeight: 700,
};
const lowBadge: CSSProperties = {
    display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 12.5, fontWeight: 600,
    color: '#ff8fa3', background: 'rgba(255,143,163,0.13)', border: '1px solid rgba(255,143,163,0.5)',
};
const okBadge: CSSProperties = {
    display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 12.5, fontWeight: 600,
    color: '#8be0a4', background: 'rgba(139,224,164,0.12)', border: '1px solid rgba(139,224,164,0.45)',
};
