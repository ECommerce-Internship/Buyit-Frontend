import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchProducts, type ProductQueryParams } from '../api/products';

export function useProducts(params: ProductQueryParams, enabled = true) {
    return useQuery({
        // The key IS the params: change a filter -> new key -> automatic refetch.
        queryKey: ['products', params],
        queryFn: () => fetchProducts(params),
        // Skip the keyword call when the page is driven by semantic search instead.
        enabled,
        // Keep showing the previous page while the next one loads (smooth paging).
        placeholderData: keepPreviousData,
    });
}