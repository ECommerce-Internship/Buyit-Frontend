import axiosInstance from './axiosInstance';
import type { PaginatedResult, ProductResponse } from '../types/product';

// The exact query knobs the backend's ProductQueryParameters understands.
// Everything optional: we only send what's set (axios drops `undefined` params).
export interface ProductQueryParams {
    search?: string;
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'name' | 'price' | 'createdAt';
    sortDescending?: boolean;
    page?: number;
    pageSize?: number;
}

export async function fetchProducts(
    params: ProductQueryParams,
): Promise<PaginatedResult<ProductResponse>> {
    const res = await axiosInstance.get<PaginatedResult<ProductResponse>>(
        '/api/v1/product',   // singular: ProductController's [controller] route token = "Product"
        { params },
    );
    return res.data;
}

// Fetch ONE product by id for the detail page.
// NOTE: singular "/product/{id}" — the controller's [controller] route token is "Product".
export async function fetchProductById(id: number): Promise<ProductResponse> {
    const res = await axiosInstance.get<ProductResponse>(`/api/v1/product/${id}`);
    return res.data;
}