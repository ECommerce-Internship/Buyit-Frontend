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