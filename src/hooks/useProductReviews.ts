import { useQuery } from '@tanstack/react-query';
import { fetchProductReviews } from '../api/reviews';

export function useProductReviews(productId: number) {
    return useQuery({
        queryKey: ['product-reviews', productId],
        queryFn: () => fetchProductReviews(productId),
        enabled: Number.isFinite(productId) && productId > 0,
    });
}