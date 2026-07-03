// src/hooks/useStorefront.ts
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getStoreBySlug, getStoreProducts } from '../api/stores';
import type { ProductQueryParams } from '../api/products';

// Loads ONE approved store by slug for the storefront header. `enabled` holds the request until we
// actually have a slug (on the first render the URL param can be undefined). A 404 from the backend
// (store not approved / not found) surfaces as `isError`, which the page turns into a nice screen.
export function useStoreBySlug(slug: string | undefined) {
    return useQuery({
        queryKey: ['store', slug],
        queryFn: () => getStoreBySlug(slug!),   // the `!` is safe: `enabled` guarantees slug exists here
        enabled: !!slug,
    });
}

// Loads one page of that store's products. The key includes BOTH the slug and the params object, so
// changing the page or the (debounced) search text produces a new key -> an automatic refetch.
export function useStoreProducts(slug: string | undefined, params: ProductQueryParams) {
    return useQuery({
        queryKey: ['store-products', slug, params],
        queryFn: () => getStoreProducts(slug!, params),
        enabled: !!slug,
        placeholderData: keepPreviousData,   // keep the old page visible while the next one loads
    });
}