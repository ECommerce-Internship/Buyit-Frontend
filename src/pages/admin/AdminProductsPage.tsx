// src/pages/admin/AdminProductsPage.tsx
import { useState, useRef } from 'react';
import type { CSSProperties } from 'react';
import toast from 'react-hot-toast';
import { useProducts } from '../../hooks/useProducts';
import { useAdminStores } from '../../hooks/useAdminStores';
import { useDebounce } from '../../hooks/useDebounce';
import { useDeleteProduct, useImportProducts, useImportFromSftp } from '../../hooks/useProductMutations';
import { Pagination } from '../../components/products/Pagination';
import { formatCurrency, stockLevel, STOCK_LABEL } from '../../lib/format';
import type { ProductResponse, ImportResult } from '../../types/product';
import { ProductFormModal } from './ProductFormModal';
import { ImportResultModal } from './ImportResultModal';
import { AdminTabs } from '../../components/admin/AdminTabs';
import { Skeleton } from '../../components/ui/Skeleton';

const PAGE_SIZE = 10;

// The two columns the BACKEND can sort by (see §5.5). 'createdAt' exists too but we don't show it.
type SortField = 'name' | 'price';

export function AdminProductsPage() {
    // --- table state ---
    const [searchInput, setSearchInput] = useState('');     // what the user is typing
    const search = useDebounce(searchInput, 350);           // settled value (350 ms after a pause)
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState<SortField>('name');
    const [sortDescending, setSortDescending] = useState(false);

    // --- modal state ---
    // null = closed. 'new' = create. a ProductResponse = edit THAT product.
    const [editing, setEditing] = useState<ProductResponse | 'new' | null>(null);
    const [importResultOpen, setImportResultOpen] = useState(false);

    // --- data ---
    const { data, isLoading, isError } = useProducts({
        search: search || undefined,   // omit empty string so axios drops the param
        sortBy,
        sortDescending,
        page,
        pageSize: PAGE_SIZE,
    });
    const { data: stores = [] } = useAdminStores();

    const del = useDeleteProduct({
        onSuccess: () => toast.success('Product deleted.'),
        onError: (m) => toast.error(m),
    });

    // Excel import: a hidden <input type="file"> we click programmatically.
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);

    // A 200 means the import RAN — not that anything was added. Open the result modal and pick a
    // toast that matches the real outcome: error if nothing was added, neutral if partial, green
    // only on a clean run. `sourceSuffix` is '' for Excel and ' from SFTP' for the SFTP trigger.
    function announceImport(result: ImportResult, sourceSuffix: string) {
        setImportResult(result);
        setImportResultOpen(true);
        if (result.addedCount === 0) {
            toast.error(`No products imported${sourceSuffix} — ${result.failedCount} row(s) failed.`);
        } else if (result.failedCount > 0) {
            toast(`Imported ${result.addedCount} product(s)${sourceSuffix}, ${result.failedCount} failed.`);
        } else {
            toast.success(`Imported ${result.addedCount} product(s)${sourceSuffix}.`);
        }
    }

    const importMut = useImportProducts({
        onSuccess: (result) => announceImport(result, ''),
        onError: (m) => toast.error(m),
    });

    // SFTP import: no file picker — the backend pulls the configured file itself.
    // On success we reuse the SAME result popup the Excel import uses.
    const sftpMut = useImportFromSftp({
        onSuccess: (result) => announceImport(result, ' from SFTP'),
        onError: (m) => toast.error(m),
    });

    function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = ''; // reset so picking the SAME file again still fires onChange
        if (!file) return;
        if (!file.name.toLowerCase().endsWith('.xlsx')) {
            toast.error('Please choose an .xlsx file.');
            return;
        }
        importMut.mutate(file);
    }

    function onDelete(p: ProductResponse) {
        // Native confirm dialog (simple + accessible). Returns true only if the admin clicks OK.
        const ok = window.confirm(`Delete "${p.name}"? This cannot be undone.`);
        if (ok) del.mutate(p.id);
    }

    // Clicking a sortable header: same column -> flip direction; new column -> that column, asc.
    function toggleSort(field: SortField) {
        if (sortBy === field) {
            setSortDescending((d) => !d);
        } else {
            setSortBy(field);
            setSortDescending(false);
        }
        setPage(1); // re-sorting should bring you back to page 1
    }

    const items = data?.items ?? [];

    return (
        <main className="admin-shell" style={{ minHeight: '100vh', color: '#fff', padding: '40px 24px', position: 'relative' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                <h1 style={{ fontFamily: 'Outfit', fontSize: 30, fontWeight: 700, margin: '0 0 6px' }}>
                    Products
                </h1>
                <p style={{ margin: '0 0 24px', color: 'rgba(255,255,255,0.6)' }}>
                    Manage the catalogue: create, edit, delete, upload images, and bulk-import.
                </p>

                <AdminTabs />

                {/* TOOLBAR */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 18 }}>
                    <input
                        value={searchInput}
                        onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
                        placeholder="Search products…"
                        style={{
                            flex: 1, minWidth: 220, boxSizing: 'border-box', padding: '11px 13px',
                            fontSize: 14.5, fontFamily: 'inherit', color: '#fff',
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.14)',
                            borderRadius: 12, outline: 'none',
                        }}
                    />
                    <button onClick={() => setEditing('new')}
                        style={{
                            padding: '11px 18px', fontFamily: 'inherit', fontSize: 14.5, fontWeight: 600,
                            color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer',
                            background: 'linear-gradient(120deg,#8b5cf6,#6366f1)',
                        }}>
                        + Add Product
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} disabled={importMut.isPending || sftpMut.isPending}
                        style={{
                            padding: '11px 18px', fontFamily: 'inherit', fontSize: 14.5, fontWeight: 600,
                            color: '#fff', background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.14)', borderRadius: 12,
                            cursor: (importMut.isPending || sftpMut.isPending) ? 'wait' : 'pointer',
                        }}>
                        {importMut.isPending ? 'Importing…' : 'Import Excel'}
                    </button>
                    <button onClick={() => sftpMut.mutate()} disabled={importMut.isPending || sftpMut.isPending}
                        style={{
                            padding: '11px 18px', fontFamily: 'inherit', fontSize: 14.5, fontWeight: 600,
                            color: '#fff', background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.14)', borderRadius: 12,
                            cursor: (importMut.isPending || sftpMut.isPending) ? 'wait' : 'pointer',
                        }}>
                        {sftpMut.isPending ? 'Importing…' : 'Import from SFTP'}
                    </button>
                    {/* The hidden picker. accept= filters the OS dialog to .xlsx files. */}
                    <input ref={fileInputRef} type="file" accept=".xlsx" onChange={onPickFile} style={{ display: 'none' }} />
                </div>

                {/* TABLE */}
                {isLoading ? (
                    <div style={{ overflowX: 'auto', ...panel, padding: 0 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                            <thead>
                                <tr style={{ textAlign: 'left', color: 'rgba(255,255,255,0.6)' }}>
                                    <th style={th}>Image</th>
                                    <th style={th}>Name</th>
                                    <th style={th}>SKU</th>
                                    <th style={th}>Price</th>
                                    <th style={th}>Category</th>
                                    <th style={th}>Stock</th>
                                    <th style={{ ...th, textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                        <td style={td}><Skeleton className="h-11 w-11 rounded-lg" style={darkTone} /></td>
                                        <td style={td}><Skeleton className="h-4 w-32" style={darkTone} /></td>
                                        <td style={td}><Skeleton className="h-4 w-20" style={darkTone} /></td>
                                        <td style={td}><Skeleton className="h-4 w-14" style={darkTone} /></td>
                                        <td style={td}><Skeleton className="h-4 w-24" style={darkTone} /></td>
                                        <td style={td}><Skeleton className="h-4 w-16" style={darkTone} /></td>
                                        <td style={{ ...td, textAlign: 'right' }}><Skeleton className="ml-auto h-8 w-16 rounded-lg" style={darkTone} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : isError ? (
                    <div style={{ ...panel, color: '#ff8fa3' }}>Couldn’t load products. Refresh the page.</div>
                ) : items.length === 0 ? (
                    <div style={panel}>No products found.</div>
                ) : (
                    <div style={{ overflowX: 'auto', ...panel, padding: 0 }}>
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
                                    <th style={th}>Category</th>
                                    <th style={th}>Stock</th>
                                    <th style={{ ...th, textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((p) => (
                                    <tr key={p.id} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                        <td style={td}>
                                            {p.imageUrl ? (
                                                <img src={p.imageUrl} alt={p.name}
                                                    style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8 }} />
                                            ) : (
                                                <div style={{ width: 44, height: 44, borderRadius: 8, background: 'rgba(255,255,255,0.08)' }} />
                                            )}
                                        </td>
                                        <td style={{ ...td, fontWeight: 600 }}>{p.name}</td>
                                        <td style={{ ...td, color: 'rgba(255,255,255,0.6)' }}>{p.sku}</td>
                                        <td style={td}>{formatCurrency(p.price)}</td>
                                        <td style={{ ...td, color: 'rgba(255,255,255,0.6)' }}>{p.categoryName}</td>
                                        <td style={td}>
                                            <span style={{ color: stockColor(p.quantityInStock) }}>
                                                {p.quantityInStock} · {STOCK_LABEL[stockLevel(p.quantityInStock)]}
                                            </span>
                                        </td>
                                        <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                                            <button style={smallBtn} onClick={() => setEditing(p)}>Edit</button>
                                            <button style={{ ...smallBtn, color: '#ff8fa3', marginLeft: 8 }}
                                                onClick={() => onDelete(p)}
                                                disabled={del.isPending && del.variables === p.id}>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* PAGER goes here in Step 11 */}
                {data && (
                    <Pagination
                        page={data.page}
                        totalPages={data.totalPages}
                        hasPrevious={data.hasPrevious}
                        hasNext={data.hasNext}
                        onPageChange={setPage}
                    />
                )}
            </div>

            {/* MODALS — render only when open */}
            {editing !== null && (
                <ProductFormModal
                    product={editing === 'new' ? null : editing}
                    stores={stores}
                    onClose={() => setEditing(null)}
                />
            )}
            {importResultOpen && (
                <ImportResultModal
                    result={importResult}
                    onClose={() => setImportResultOpen(false)}
                />
            )}
        </main>
    );
}

// ---- shared inline styles (this project styles with inline objects, see SellerDashboardPage) ----
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
const smallBtn: CSSProperties = {
    padding: '6px 12px', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#fff',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: 9, cursor: 'pointer',
};
function stockColor(q: number): string {
    const lvl = stockLevel(q);
    return lvl === 'out' ? '#ff8fa3' : lvl === 'low' ? '#ffcd8a' : '#8be0a4';
}
