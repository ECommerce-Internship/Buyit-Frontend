// src/pages/seller/SellerInventoryPage.tsx
import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import toast from 'react-hot-toast';
import { useStores } from '../../hooks/useStores';
import { useSellerInventory, useSellerUpdateStock, useUpdateThreshold } from '../../hooks/useSellerData';
import { SellerTabs } from '../../components/seller/SellerTabs';
import { StorePicker } from '../../components/seller/StorePicker';
import { StoreLockedBanner } from '../../components/seller/StoreLockedBanner';

export function SellerInventoryPage() {
    const { data: stores = [], isLoading: storesLoading } = useStores();
    const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);

    useEffect(() => {
        if (selectedStoreId !== null || stores.length === 0) return;
        const firstApproved = stores.find((s) => s.status === 'Approved');
        setSelectedStoreId((firstApproved ?? stores[0]).id);
    }, [stores, selectedStoreId]);

    const selectedStore = stores.find((s) => s.id === selectedStoreId) ?? null;
    const isApproved = selectedStore?.status === 'Approved';

    const { data: items = [], isLoading, isError } = useSellerInventory(selectedStoreId);
    const [search, setSearch] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingField, setEditingField] = useState<'stock' | 'threshold' | null>(null);
    const [draft, setDraft] = useState('');

    const updateStock = useSellerUpdateStock({
        onSuccess: () => { toast.success('Stock updated.'); setEditingId(null); setEditingField(null); },
        onError: (m) => toast.error(m),
    });
    const updateThreshold = useUpdateThreshold({
        onSuccess: () => { toast.success('Threshold updated.'); setEditingId(null); setEditingField(null); },
        onError: (m) => toast.error(m),
    });

    function startEdit(productId: number, field: 'stock' | 'threshold', current: number) {
        if (!isApproved) return;
        setEditingId(productId);
        setEditingField(field);
        setDraft(String(current));
    }

    function confirmEdit(productId: number) {
        const n = Number(draft);
        if (!Number.isInteger(n) || n < 0) return toast.error('Must be a whole number ≥ 0.');
        if (editingField === 'stock') updateStock.mutate({ productId, newQuantity: n });
        else updateThreshold.mutate({ productId, newThreshold: n });
    }

    const q = search.trim().toLowerCase();
    const filtered = q
        ? items.filter((i) => i.productName.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q))
        : items;

    return (
        <main style={{ minHeight: '100vh', background: '#0a0a12', color: '#fff', padding: '40px 24px' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                <h1 style={{ fontFamily: 'Outfit', fontSize: 30, fontWeight: 700, margin: '0 0 6px' }}>Inventory</h1>
                <p style={{ margin: '0 0 24px', color: 'rgba(255,255,255,0.6)' }}>
                    Stock and low-stock thresholds for your products.
                </p>
                <SellerTabs />

                {storesLoading ? (
                    <div style={card}>Loading your stores…</div>
                ) : stores.length === 0 ? (
                    <div style={card}>You don't have any stores yet. Open one from the Dashboard tab.</div>
                ) : (
                    <>
                        <StorePicker stores={stores} selectedId={selectedStoreId} onChange={setSelectedStoreId} />

                        {selectedStore && selectedStore.status !== 'Approved' && (
                            <StoreLockedBanner status={selectedStore.status} />
                        )}

                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or SKU…"
                            style={{ ...inputStyle, width: '100%', marginBottom: 18 }}
                        />

                        {isLoading ? (
                            <div style={card}>Loading inventory…</div>
                        ) : isError ? (
                            <div style={{ ...card, color: '#ff8fa3' }}>Couldn't load inventory. Refresh the page.</div>
                        ) : filtered.length === 0 ? (
                            <div style={card}>No inventory rows found.</div>
                        ) : (
                            <div style={{ overflowX: 'auto', ...card, padding: 0 }}>
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
                                            const editingStock = editingId === i.productId && editingField === 'stock';
                                            const editingThreshold = editingId === i.productId && editingField === 'threshold';
                                            return (
                                                <tr key={i.productId} style={{
                                                    borderTop: '1px solid rgba(255,255,255,0.08)',
                                                    background: i.isLowStock ? 'rgba(255,77,109,0.10)' : 'transparent',
                                                }}>
                                                    <td style={{ ...td, fontWeight: 600 }}>{i.productName}</td>
                                                    <td style={{ ...td, color: 'rgba(255,255,255,0.6)' }}>{i.sku}</td>
                                                    <td style={td}>
                                                        {editingStock ? (
                                                            <EditCell draft={draft} setDraft={setDraft}
                                                                onConfirm={() => confirmEdit(i.productId)}
                                                                onCancel={() => { setEditingId(null); setEditingField(null); }}
                                                                pending={updateStock.isPending} />
                                                        ) : (
                                                            <ViewCell value={i.quantity} disabled={!isApproved}
                                                                onEdit={() => startEdit(i.productId, 'stock', i.quantity)} />
                                                        )}
                                                    </td>
                                                    <td style={td}>
                                                        {editingThreshold ? (
                                                            <EditCell draft={draft} setDraft={setDraft}
                                                                onConfirm={() => confirmEdit(i.productId)}
                                                                onCancel={() => { setEditingId(null); setEditingField(null); }}
                                                                pending={updateThreshold.isPending} />
                                                        ) : (
                                                            <ViewCell value={i.lowStockThreshold} disabled={!isApproved}
                                                                onEdit={() => startEdit(i.productId, 'threshold', i.lowStockThreshold)} />
                                                        )}
                                                    </td>
                                                    <td style={td}>
                                                        {i.isLowStock ? <span style={lowBadge}>⚠ Low stock</span> : <span style={okBadge}>In stock</span>}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}

function ViewCell({ value, disabled, onEdit }: { value: number; disabled: boolean; onEdit: () => void }) {
    return (
        <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
            {value}
            {!disabled && <button style={pencil} onClick={onEdit} aria-label="Edit">✏️</button>}
        </span>
    );
}

function EditCell({ draft, setDraft, onConfirm, onCancel, pending }: {
    draft: string; setDraft: (v: string) => void; onConfirm: () => void; onCancel: () => void; pending: boolean;
}) {
    return (
        <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
            <input value={draft} onChange={(e) => setDraft(e.target.value)} inputMode="numeric" autoFocus
                style={{ ...inputStyle, width: 90, padding: '6px 8px' }} />
            <button style={iconOk} disabled={pending} onClick={onConfirm} aria-label="Confirm">✓</button>
            <button style={iconCancel} onClick={onCancel} aria-label="Cancel">✕</button>
        </span>
    );
}

const card: CSSProperties = { padding: 20, borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', marginBottom: 18 };
const th: CSSProperties = { padding: '12px 14px', fontWeight: 600, fontSize: 12.5, textTransform: 'uppercase', letterSpacing: 0.4 };
const td: CSSProperties = { padding: '10px 14px', verticalAlign: 'middle' };
const inputStyle: CSSProperties = { boxSizing: 'border-box', padding: '10px 12px', fontSize: 14.5, fontFamily: 'inherit', color: '#fff', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 11, outline: 'none' };
const pencil: CSSProperties = { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, padding: 2 };
const iconOk: CSSProperties = { background: 'rgba(139,224,164,0.15)', border: '1px solid rgba(139,224,164,0.5)', color: '#8be0a4', borderRadius: 8, cursor: 'pointer', padding: '4px 8px', fontWeight: 700 };
const iconCancel: CSSProperties = { background: 'rgba(255,143,163,0.12)', border: '1px solid rgba(255,143,163,0.45)', color: '#ff8fa3', borderRadius: 8, cursor: 'pointer', padding: '4px 8px', fontWeight: 700 };
const lowBadge: CSSProperties = { display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 12.5, fontWeight: 600, color: '#ff8fa3', background: 'rgba(255,143,163,0.13)', border: '1px solid rgba(255,143,163,0.5)' };
const okBadge: CSSProperties = { display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 12.5, fontWeight: 600, color: '#8be0a4', background: 'rgba(139,224,164,0.12)', border: '1px solid rgba(139,224,164,0.45)' };