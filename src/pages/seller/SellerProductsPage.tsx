// src/pages/seller/SellerProductsPage.tsx
import { useState, useEffect, useRef } from 'react';
import type { CSSProperties, ChangeEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useStores } from '../../hooks/useStores';
import { useSellerProducts } from '../../hooks/useSellerData';
import { useDebounce } from '../../hooks/useDebounce';
import { useDeleteProduct, useImportProductsForStore } from '../../hooks/useProductMutations';
import { Pagination } from '../../components/products/Pagination';
import { formatCurrency, stockLevel, STOCK_LABEL } from '../../lib/format';
import type { ProductResponse, ImportResult } from '../../types/product';
import { ProductFormModal } from '../admin/ProductFormModal';
import { ImportResultModal } from '../admin/ImportResultModal';
import { SellerTabs } from '../../components/seller/SellerTabs';
import { StorePicker } from '../../components/seller/StorePicker';
import { StoreLockedBanner } from '../../components/seller/StoreLockedBanner';

const PAGE_SIZE = 10;
type SortField = 'name' | 'price';

export function SellerProductsPage() {
    const { data: stores = [], isLoading: storesLoading } = useStores();
    const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);

    // Default to the first store once the list loads — prefer an Approved one, so a seller who
    // owns both an approved store and a fresh pending one lands somewhere immediately useful.
    useEffect(() => {
        if (selectedStoreId !== null || stores.length === 0) return;
        const firstApproved = stores.find((s) => s.status === 'Approved');
        setSelectedStoreId((firstApproved ?? stores[0]).id);
    }, [stores, selectedStoreId]);

    const selectedStore = stores.find((s) => s.id === selectedStoreId) ?? null;
    const isApproved = selectedStore?.status === 'Approved';

    const [searchInput, setSearchInput] = useState('');
    const search = useDebounce(searchInput, 350);
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState<SortField>('name');
    const [sortDescending, setSortDescending] = useState(false);
    const [editing, setEditing] = useState<ProductResponse | 'new' | null>(null);

    // Excel import: a hidden <input type="file"> we click programmatically, plus the result popup.
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [importResultOpen, setImportResultOpen] = useState(false);

    const queryClient = useQueryClient();
    function refreshList() {
        queryClient.invalidateQueries({ queryKey: ['seller-products'] });
    }

    const { data, isLoading, isError } = useSellerProducts(selectedStoreId, {
        search: search || undefined,
        sortBy,
        sortDescending,
        page,
        pageSize: PAGE_SIZE,
    });

    // ProductFormModal already handles create/edit/delete's own success toast and calls onClose()
    // itself either way (saved or cancelled) — we can't tell which from here, so refreshing the
    // list on every close is the simplest correct behavior (a wasted refetch on cancel is harmless).
    const del = useDeleteProduct({
        onSuccess: () => { toast.success('Product deleted.'); refreshList(); },
        onError: (m) => toast.error(m),
    });

    // A 200 means the import RAN — not that anything was added. Open the result modal and pick a
    // toast that matches the real outcome, then refresh the list so new products appear.
    function announceImport(result: ImportResult) {
        setImportResult(result);
        setImportResultOpen(true);
        if (result.addedCount === 0) {
            toast.error(`No products imported — ${result.failedCount} row(s) failed.`);
        } else if (result.failedCount > 0) {
            toast(`Imported ${result.addedCount} product(s), ${result.failedCount} failed.`);
        } else {
            toast.success(`Imported ${result.addedCount} product(s).`);
        }
        refreshList();
    }

    const importMut = useImportProductsForStore({
        onSuccess: announceImport,
        onError: (m) => toast.error(m),
    });

    function onPickFile(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = ''; // reset so picking the SAME file again still fires onChange
        if (!file) return;
        // Guarded by the disabled button too, but never import without an approved, selected store.
        if (selectedStoreId === null || !isApproved) return;
        if (!file.name.toLowerCase().endsWith('.xlsx')) {
            toast.error('Please choose an .xlsx file.');
            return;
        }
        importMut.mutate({ storeId: selectedStoreId, file });
    }

    function toggleSort(field: SortField) {
        if (sortBy === field) setSortDescending((d) => !d);
        else { setSortBy(field); setSortDescending(false); }
        setPage(1);
    }

    function onDelete(p: ProductResponse) {
        if (!isApproved) return;
        if (window.confirm(`Delete "${p.name}"? This cannot be undone.`)) del.mutate(p.id);
    }

    const items = data?.items ?? [];
    // A new product can only ever be assigned to an Approved store (Pending/Suspended stores
    // can't have anything added until approved), so the create dropdown only offers those.
    const approvedStores = stores.filter((s) => s.status === 'Approved');

    return (
        <main style={{ minHeight: '100vh', background: '#0a0a12', color: '#fff', padding: '40px 24px' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                <h1 style={{ fontFamily: 'Outfit', fontSize: 30, fontWeight: 700, margin: '0 0 6px' }}>Products</h1>
                <p style={{ margin: '0 0 24px', color: 'rgba(255,255,255,0.6)' }}>
                    Manage products for the stores you own.
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

                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 18 }}>
                            <input
                                value={searchInput}
                                onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
                                placeholder="Search your products…"
                                style={{ ...inputStyle, flex: 1, minWidth: 220 }}
                            />
                            <button
                                onClick={() => setEditing('new')}
                                disabled={!isApproved}
                                title={isApproved ? undefined : 'Available once this store is approved'}
                                style={{ ...primaryBtn, opacity: isApproved ? 1 : 0.45, cursor: isApproved ? 'pointer' : 'not-allowed' }}
                            >
                                + Add Product
                            </button>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={!isApproved || importMut.isPending}
                                title={isApproved ? 'Bulk-import products into this store from an .xlsx file' : 'Available once this store is approved'}
                                style={{ ...secondaryBtn, opacity: isApproved ? 1 : 0.45, cursor: !isApproved ? 'not-allowed' : importMut.isPending ? 'wait' : 'pointer' }}
                            >
                                {importMut.isPending ? 'Importing…' : 'Import Excel'}
                            </button>
                            {/* Hidden picker. accept= filters the OS dialog to .xlsx files. */}
                            <input ref={fileInputRef} type="file" accept=".xlsx" onChange={onPickFile} style={{ display: 'none' }} />
                        </div>

                        {isLoading ? (
                            <div style={card}>Loading products…</div>
                        ) : isError ? (
                            <div style={{ ...card, color: '#ff8fa3' }}>Couldn't load products. Refresh the page.</div>
                        ) : items.length === 0 ? (
                            <div style={card}>No products in this store yet.</div>
                        ) : (
                            <div style={{ overflowX: 'auto', ...card, padding: 0 }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', color: 'rgba(255,255,255,0.6)' }}>
                                            <th style={th}>Image</th>
                                            <th style={{ ...th, cursor: 'pointer' }} onClick={() => toggleSort('name')}>
                                                Name {sortBy === 'name' ? (sortDescending ? '▼' : '▲') : ''}
                                            </th>
                                            <th style={th}>SKU</th>
                                            <th style={{ ...th, cursor: 'pointer' }} onClick={() => toggleSort('price')}>
                                                Price {sortBy === 'price' ? (sortDescending ? '▼' : '▲') : ''}
                                            </th>
                                            <th style={th}>Stock</th>
                                            <th style={{ ...th, textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((p) => (
                                            <tr key={p.id} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                                <td style={td}>
                                                    {p.imageUrl ? (
                                                        <img src={p.imageUrl} alt={p.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8 }} />
                                                    ) : (
                                                        <div style={{ width: 44, height: 44, borderRadius: 8, background: 'rgba(255,255,255,0.08)' }} />
                                                    )}
                                                </td>
                                                <td style={{ ...td, fontWeight: 600 }}>{p.name}</td>
                                                <td style={{ ...td, color: 'rgba(255,255,255,0.6)' }}>{p.sku}</td>
                                                <td style={td}>{formatCurrency(p.price)}</td>
                                                <td style={td}>
                                                    <span style={{ color: stockColor(p.quantityInStock) }}>
                                                        {p.quantityInStock} · {STOCK_LABEL[stockLevel(p.quantityInStock)]}
                                                    </span>
                                                </td>
                                                <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                                                    <button style={smallBtn} disabled={!isApproved}
                                                        title={isApproved ? undefined : 'Available once this store is approved'}
                                                        onClick={() => isApproved && setEditing(p)}>
                                                        Edit
                                                    </button>
                                                    <button style={{ ...smallBtn, color: '#ff8fa3', marginLeft: 8 }}
                                                        disabled={!isApproved || (del.isPending && del.variables === p.id)}
                                                        title={isApproved ? undefined : 'Available once this store is approved'}
                                                        onClick={() => onDelete(p)}>
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {data && (
                            <Pagination page={data.page} totalPages={data.totalPages}
                                hasPrevious={data.hasPrevious} hasNext={data.hasNext} onPageChange={setPage} />
                        )}
                    </>
                )}
            </div>

            {editing !== null && (
                <ProductFormModal
                    product={editing === 'new' ? null : editing}
                    stores={approvedStores}
                    onClose={() => { setEditing(null); refreshList(); }}
                />
            )}

            {importResultOpen && (
                <ImportResultModal result={importResult} onClose={() => setImportResultOpen(false)} />
            )}
        </main>
    );
}

const card: CSSProperties = { padding: 20, borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', marginBottom: 18 };
const th: CSSProperties = { padding: '12px 14px', fontWeight: 600, fontSize: 12.5, textTransform: 'uppercase', letterSpacing: 0.4 };
const td: CSSProperties = { padding: '10px 14px', verticalAlign: 'middle' };
const inputStyle: CSSProperties = { boxSizing: 'border-box', padding: '11px 13px', fontSize: 14.5, fontFamily: 'inherit', color: '#fff', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 12, outline: 'none' };
const primaryBtn: CSSProperties = { padding: '11px 18px', fontFamily: 'inherit', fontSize: 14.5, fontWeight: 600, color: '#fff', border: 'none', borderRadius: 12, background: 'linear-gradient(120deg,#8b5cf6,#6366f1)' };
const secondaryBtn: CSSProperties = { padding: '11px 18px', fontFamily: 'inherit', fontSize: 14.5, fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 12 };
const smallBtn: CSSProperties = { padding: '6px 12px', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 9, cursor: 'pointer' };
function stockColor(q: number): string {
    const lvl = stockLevel(q);
    return lvl === 'out' ? '#ff8fa3' : lvl === 'low' ? '#ffcd8a' : '#8be0a4';
}