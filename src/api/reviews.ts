import axiosInstance from './axiosInstance';
import type { ProductReviewsResponse, ReviewResponse, SubmitReviewBody } from '../types/product';

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
// CREATE a review for a product. Customer-only; the backend enforces that the user has a
// DELIVERED order for this product (else 403) and only one review per product (else 409).
// Returns the newly created review (HTTP 201).
export async function submitReview(
    productId: number,
    body: SubmitReviewBody,
): Promise<ReviewResponse> {
    const res = await axiosInstance.post<ReviewResponse>(
        `/api/v1/products/${productId}/reviews`,
        body,
    );
    return res.data;
}

// EDIT one of YOUR reviews. NOTE the FLAT url (/reviews/{id}) — no product id here.
// Owner-only, and only allowed within 48 hours of submission (else 400). Returns the
// updated review (HTTP 200).
export async function updateReview(
    reviewId: number,
    body: SubmitReviewBody,
): Promise<ReviewResponse> {
    const res = await axiosInstance.put<ReviewResponse>(
        `/api/v1/reviews/${reviewId}`,
        body,
    );
    return res.data;
}

// DELETE one of YOUR reviews. Owner-only. Returns nothing (HTTP 204 No Content), so there is
// no res.data to read — the function resolves to void on success.
export async function deleteReview(reviewId: number): Promise<void> {
    await axiosInstance.delete(`/api/v1/reviews/${reviewId}`);
}