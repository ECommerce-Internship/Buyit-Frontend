// src/pages/StorefrontPage.tsx
import { useEffect, useState, type CSSProperties } from 'react';
import { useParams, Link } from 'react-router-dom';
import Logo from '../components/Logo';
import type { ProductQueryParams } from '../api/products';
import { useStoreBySlug, useStoreProducts } from '../hooks/useStorefront';
import { useDebounce } from '../hooks/useDebounce';
import { ProductCard } from '../components/products/ProductCard';
import { SkeletonCard } from '../components/products/SkeletonCard';
import { Pagination } from '../components/products/Pagination';

const PAGE_SIZE = 12;

export function StorefrontPage() {
    // The ":slug" from the route "/stores/:slug" arrives here as a string (or undefined for a tick).
    const { slug } = useParams<{ slug: string }>();

    // Search box -> debounced value (waits until you stop typing) -> query. Plus the page number.
    const [searchInput, setSearchInput] = useState('');
    const debouncedSearch = useDebounce(searchInput, 300);
    const [page, setPage] = useState(1);

    // Any new search jumps back to the first page (page 3 of a filtered list might be empty).
    useEffect(() => { setPage(1); }, [debouncedSearch]);

    // The store header. A 404 (store not approved / not found) shows up as `storeError`.
    const { data: store, isLoading: storeLoading, isError: storeError } = useStoreBySlug(slug);

    // The product grid. Only the knobs this endpoint honours (search + paging) — NO sort.
    const queryParams: ProductQueryParams = {
        search: debouncedSearch || undefined,
        page,
        pageSize: PAGE_SIZE,
    };
    const { data, isLoading, isError } = useStoreProducts(slug, queryParams);

    // ---- STATE 1: the store itself is missing / hidden (backend replied 404). ----
    if (storeError) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, background: '#f7f6fb', fontFamily: "'Plus Jakarta Sans',sans-serif", color: '#15131f', textAlign: 'center', padding: 28 }}>
                <h1 style={{ margin: 0, fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 28, letterSpacing: '-0.02em' }}>Store not found</h1>
                <p style={{ margin: 0, color: '#6b6878', maxWidth: 380 }}>This store doesn't exist, or it isn't open for business right now.</p>
                <Link to="/products" style={{ marginTop: 6, fontWeight: 600, color: '#fff', padding: '11px 20px', borderRadius: 12, textDecoration: 'none', background: 'linear-gradient(135deg,#8d6cff,#7c5cff)' }}>Back to the marketplace</Link>
            </div>
        );
    }

    const total = data?.totalCount ?? 0;
    const countLabel = isLoading ? 'Loading products…'
        : total === 0 ? 'No products'
            : `${total} ${total === 1 ? 'product' : 'products'}`;

    return (
        <div style={{ minHeight: '100vh', width: '100%', background: '#f7f6fb', fontFamily: "'Plus Jakarta Sans',sans-serif", color: '#15131f', paddingBottom: 80 }}>
            {/* sticky header — the same shell as the catalogue, so the app feels consistent */}
            <header style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(247,246,251,.86)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid #eceaf2' }}>
                <div style={{ maxWidth: 1180, margin: '0 auto', padding: '13px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                        <Logo height={26} to="/" />
                        <span style={{ fontSize: 13, color: '#9a97a8', fontWeight: 500 }}>/ Store</span>
                    </div>
                    <Link to="/products" style={{ fontSize: 13.5, fontWeight: 600, color: '#7c5cff', textDecoration: 'none', whiteSpace: 'nowrap' }}>All products</Link>
                </div>
            </header>

            <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 28px' }}>
                {/* STORE HEADER — the "branding": monogram + name + description */}
                <div style={{ padding: '38px 0 10px' }}>
                    {storeLoading ? (
                        <div style={{ height: 54, width: 280, borderRadius: 12, background: '#ece9f5' }} />
                    ) : (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{ width: 54, height: 54, borderRadius: 14, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 22, color: '#fff', background: 'linear-gradient(135deg,#8d6cff,#7c5cff)' }}>
                                    {store?.name?.charAt(0).toUpperCase() ?? '?'}
                                </div>
                                <h1 style={{ margin: 0, fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 34, letterSpacing: '-0.03em', color: '#15131f' }}>{store?.name}</h1>
                            </div>
                            {store?.description && (
                                <p style={{ margin: '14px 0 0', fontSize: 15, lineHeight: 1.55, color: '#6b6878', maxWidth: 640 }}>{store.description}</p>
                            )}
                        </>
                    )}
                </div>

                {/* count (left) + search this store (right) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', margin: '18px 0 18px' }}>
                    <div style={{ fontSize: 13, color: '#9a97a8', fontWeight: 500 }}>{countLabel}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', background: '#fff', border: '1px solid #eceaf2', borderRadius: 11, minWidth: 240, color: '#9a97a8' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
                        <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search this store…" style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 13.5, color: '#15131f', width: '100%' }} />
                    </div>
                </div>

                {/* the grid + its states */}
                {isError ? (
                    <div style={{ textAlign: 'center', padding: 64, color: '#c0392b' }}>Something went wrong loading this store's products. Please try again.</div>
                ) : isLoading ? (
                    <div style={gridStyle}>{Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}</div>
                ) : !data || data.items.length === 0 ? (
                    <div style={{ background: '#fff', border: '1px solid #eceaf2', borderRadius: 18, padding: '72px 28px', textAlign: 'center', color: '#6b6878', fontSize: 15 }}>
                        This store has no products{debouncedSearch ? ' matching your search' : ' yet'}.
                    </div>
                ) : (
                    <>
                        <div style={gridStyle}>{data.items.map((p) => <ProductCard key={p.id} product={p} />)}</div>
                        <Pagination page={data.page} totalPages={data.totalPages} hasPrevious={data.hasPrevious} hasNext={data.hasNext} onPageChange={setPage} />
                    </>
                )}
            </div>
        </div>
    );
}

// Same responsive grid as the catalogue: auto-fill columns at a 248px minimum.
const gridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(248px, 1fr))', gap: 22 };
