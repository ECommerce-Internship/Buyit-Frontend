import { useQuery } from '@tanstack/react-query';
import { fetchProductById } from '../api/products';

export function useProduct(id: number) {
    return useQuery({
        queryKey: ['product', id],
        queryFn: () => fetchProductById(id),
        // Don't fetch if the URL param wasn't a real positive number.
        enabled: Number.isFinite(id) && id > 0,
    });
}