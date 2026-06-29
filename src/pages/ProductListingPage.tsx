// src/pages/ProductListingPage.tsx
import { useEffect, useState, type CSSProperties } from 'react';
import { useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo';
import type { SortOption } from '../types/product';
import type { ProductQueryParams } from '../api/products';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useDebounce } from '../hooks/useDebounce';
import { ProductCard } from '../components/products/ProductCard';
import { SkeletonCard } from '../components/products/SkeletonCard';
import { EmptyState } from '../components/products/EmptyState';
import { Pagination } from '../components/products/Pagination';

const PAGE_SIZE = 12;

const SORT_MAP: Record<SortOption, { sortBy: 'name' | 'price' | 'createdAt'; sortDescending: boolean }> = {
    name_asc: { sortBy: 'name', sortDescending: false },
    name_desc: { sortBy: 'name', sortDescending: true },
    price_asc: { sortBy: 'price', sortDescending: false },
    price_desc: { sortBy: 'price', sortDescending: true },
    newest: { sortBy: 'createdAt', sortDescending: true },
};
const SORT_LABELS: Record<SortOption, string> = {
    name_asc: 'Name: A–Z', name_desc: 'Name: Z–A', price_asc: 'Price: Low–High', price_desc: 'Price: High–Low', newest: 'Newest',
};

export function ProductListingPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    const searchInUrl = searchParams.get('search') ?? '';
    const categoryInUrl = searchParams.get('category') ?? '';
    const minPriceInUrl = searchParams.get('minPrice') ?? '';
    const maxPriceInUrl = searchParams.get('maxPrice') ?? '';
    const sortInUrl = (searchParams.get('sort') as SortOption) || 'newest';
    const pageInUrl = Number(searchParams.get('page')) || 1;

    const [searchInput, setSearchInput] = useState(searchInUrl);
    const debouncedSearch = useDebounce(searchInput, 300);
    const [minPrice, setMinPrice] = useState(minPriceInUrl);
    const [maxPrice, setMaxPrice] = useState(maxPriceInUrl);

    function setParam(key: string, value: string) {
        const next = new URLSearchParams(searchParams);
        if (value) next.set(key, value); else next.delete(key);
        if (key !== 'page') next.set('page', '1'); // any filter change resets to page 1
        setSearchParams(next);
    }

    // Debounced search -> URL (guarded so deep links don't reset their page on mount).
    useEffect(() => {
        const current = searchParams.get('search') ?? '';
        if (debouncedSearch === current) return;
        setParam('search', debouncedSearch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch]);

    function commitPrice() {
        const next = new URLSearchParams(searchParams);
        if (minPrice) next.set('minPrice', minPrice); else next.delete('minPrice');
        if (maxPrice) next.set('maxPrice', maxPrice); else next.delete('maxPrice');
        next.set('page', '1');
        setSearchParams(next);
    }

    function resetFilters() {
        setSearchInput(''); setMinPrice(''); setMaxPrice('');
        setSearchParams(new URLSearchParams());
    }

    const { sortBy, sortDescending } = SORT_MAP[sortInUrl] ?? SORT_MAP.newest;
    const queryParams: ProductQueryParams = {
        search: searchInUrl || undefined,
        categoryId: categoryInUrl ? Number(categoryInUrl) : undefined,
        minPrice: minPriceInUrl ? Number(minPriceInUrl) : undefined,
        maxPrice: maxPriceInUrl ? Number(maxPriceInUrl) : undefined,
        sortBy, sortDescending, page: pageInUrl, pageSize: PAGE_SIZE,
    };

    const { data, isLoading, isError } = useProducts(queryParams);
    const { data: categories } = useCategories();

    // ---- shared inline styles (violet primary, per the theme decision) ----
    const chipBase: CSSProperties = { fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13.5, fontWeight: 600, padding: '9px 16px', borderRadius: 999, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .2s ease' };
    const activeChip: CSSProperties = { ...chipBase, background: 'linear-gradient(135deg,#8d6cff,#7c5cff)', color: '#fff', border: '1px solid transparent', boxShadow: '0 8px 18px -8px rgba(124,92,255,.6)' };
    const idleChip: CSSProperties = { ...chipBase, background: '#fff', color: '#56536a', border: '1px solid #eceaf2' };
    const inputStyle: CSSProperties = { fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13.5, color: '#15131f', padding: '9px 12px', border: '1px solid #eceaf2', borderRadius: 10, background: '#fff', outline: 'none' };

    const total = data?.totalCount ?? 0;
    const countLabel = isLoading ? 'Loading products…'
        : total === 0 ? 'No products found'
            : `Showing ${data!.items.length} of ${total} ${total === 1 ? 'product' : 'products'}`;

    return (
        <div style={{ minHeight: '100vh', width: '100%', background: '#f7f6fb', fontFamily: "'Plus Jakarta Sans',sans-serif", color: '#15131f', paddingBottom: 80 }}>
            {/* sticky header with the landing logo + working search */}
            <header style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(247,246,251,.86)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid #eceaf2' }}>
                <div style={{ maxWidth: 1180, margin: '0 auto', padding: '13px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                        <Logo height={26} to="/" />
                        <span style={{ fontSize: 13, color: '#9a97a8', fontWeight: 500 }}>/ Catalogue</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', background: '#fff', border: '1px solid #eceaf2', borderRadius: 11, minWidth: 240, color: '#9a97a8' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
                        <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search products…" style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 13.5, color: '#15131f', width: '100%' }} />
                    </div>
                </div>
            </header>

            <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 28px' }}>
                <div style={{ padding: '38px 0 22px' }}>
                    <h1 style={{ margin: 0, fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 34, letterSpacing: '-0.03em', color: '#15131f' }}>Browse the marketplace</h1>
                    <p style={{ margin: '8px 0 0', fontSize: 15, color: '#6b6878' }}>Thousands of products from independent sellers, all in one place.</p>
                </div>

                {/* toolbar: category chips (left) + price range & sort (right) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
                        <button style={categoryInUrl === '' ? activeChip : idleChip} onClick={() => setParam('category', '')}>All</button>
                        {categories?.map((c) => (
                            <button key={c.id} style={String(c.id) === categoryInUrl ? activeChip : idleChip} onClick={() => setParam('category', String(c.id))}>
                                {c.name}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
                        <form onSubmit={(e) => { e.preventDefault(); commitPrice(); }} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <input type="number" min={0} value={minPrice} onChange={(e) => setMinPrice(e.target.value)} onBlur={commitPrice} placeholder="Min $" style={{ ...inputStyle, width: 84 }} />
                            <span style={{ color: '#9a97a8' }}>–</span>
                            <input type="number" min={0} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} onBlur={commitPrice} placeholder="Max $" style={{ ...inputStyle, width: 84 }} />
                        </form>
                        <select value={sortInUrl} onChange={(e) => setParam('sort', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                            {(Object.keys(SORT_LABELS) as SortOption[]).map((k) => (<option key={k} value={k}>{SORT_LABELS[k]}</option>))}
                        </select>
                    </div>
                </div>

                <div style={{ fontSize: 13, color: '#9a97a8', margin: '14px 2px 18px', fontWeight: 500 }}>{countLabel}</div>

                {isError ? (
                    <div style={{ textAlign: 'center', padding: 64, color: '#c0392b' }}>Something went wrong loading products. Please try again.</div>
                ) : isLoading ? (
                    <div style={gridStyle}>{Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}</div>
                ) : !data || data.items.length === 0 ? (
                    <div style={{ background: '#fff', border: '1px solid #eceaf2', borderRadius: 18, overflow: 'hidden' }}>
                        <EmptyState onReset={resetFilters} />
                    </div>
                ) : (
                    <>
                        <div style={gridStyle}>{data.items.map((p) => <ProductCard key={p.id} product={p} />)}</div>
                        <Pagination page={data.page} totalPages={data.totalPages} hasPrevious={data.hasPrevious} hasNext={data.hasNext} onPageChange={(n) => setParam('page', String(n))} />
                    </>
                )}
            </div>
        </div>
    );
}

// auto-fill at 248px gives the 1 / 2 / 3 / 4 responsive columns the ticket asks for.
const gridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(248px, 1fr))', gap: 22 };