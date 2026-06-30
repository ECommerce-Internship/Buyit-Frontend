// One product as the API returns it (GET /api/v1/products -> items[]).
// Field names are camelCase to match the backend's JSON exactly.
export interface ProductResponse {
    id: number;
    name: string;
    description: string;
    sku: string;
    price: number;
    imageUrl: string | null;   // null => show a gray placeholder
    createdAt: string;         // ISO date string

    categoryId: number;
    categoryName: string;

    // Marketplace: which store sells this product ("Sold by {storeName}").
    storeId: number;
    storeName: string;
    storeSlug: string;         // links to /stores/{storeSlug}

    quantityInStock: number;   // drives the stock badge
    averageRating: number;     // 0 when there are no reviews
    reviewCount: number;       // 0 when there are no reviews
}

// The generic "one page of results + paging metadata" shape the backend uses.
export interface PaginatedResult<T> {
    items: T[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
}

// A category as GET /api/v1/categories returns it (a FLAT list — both top-level
// categories and subcategories come back in one array).
export interface CategoryResponse {
    id: number;
    name: string;
    description: string | null;
    parentCategoryId: number | null;
    subcategoryCount: number;
    subcategories: CategoryResponse[] | null;
}

// The five sort choices the dropdown offers. We keep them as friendly UI tokens and
// translate them to the backend's (sortBy, sortDescending) pair in the page (Step 9).
export type SortOption =
    | 'name_asc'    // Name A–Z
    | 'name_desc'   // Name Z–A
    | 'price_asc'   // Price Low–High
    | 'price_desc'  // Price High–Low
    | 'newest';     // Newest first

// One review exactly as GET /api/v1/products/{id}/reviews returns it
// (inside the `reviews.items[]` array). Field names match the backend JSON.
export interface ReviewResponse {
    reviewId: number;
    productId: number;
    userId: number;
    reviewerName: string;   // a display name only — never the whole user
    rating: number;         // 1–5
    comment: string | null; // a star-only review has no text -> null
    createdAt: string;      // ISO date string, e.g. "2026-06-20T14:03:00Z"
}
// The body the browser sends to CREATE (POST) or EDIT (PUT) a review.
// Mirrors the backend record SubmitReviewRequest(int Rating, string? Comment).
// rating: required integer 1-5.  comment: optional, max 1000 chars, or null (star-only).
export interface SubmitReviewBody {
    rating: number;
    comment: string | null;
}

// The full payload of GET /api/v1/products/{id}/reviews.
// `reviews` reuses the same PaginatedResult<T> shape already defined above.
export interface ProductReviewsResponse {
    averageRating: number;
    totalCount: number;
    reviews: PaginatedResult<ReviewResponse>;
}