import axiosInstance from './axiosInstance';
import type { ProductReviewsResponse } from '../types/product';

// Fetch one page of a product's reviews (public endpoint).
// NOTE: PLURAL "/products/{id}/reviews" — the OPPOSITE of the singular product route.
export async function fetchProductReviews(
    productId: number,
    page = 1,
    pageSize = 10,
): Promise<ProductReviewsResponse> {
    const res = await axiosInstance.get<ProductReviewsResponse>(
        `/api/v1/products/${productId}/reviews`,
        { params: { page, pageSize } },
    );
    return res.data;
}