import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchProducts, type ProductQueryParams } from '../api/products';

export function useProducts(params: ProductQueryParams) {
    return useQuery({
        // The key IS the params: change a filter -> new key -> automatic refetch.
        queryKey: ['products', params],
        queryFn: () => fetchProducts(params),
        // Keep showing the previous page while the next one loads (smooth paging).
        placeholderData: keepPreviousData,
    });
}