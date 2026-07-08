// src/api/categories.ts
import axiosInstance from './axiosInstance';
import type { CategoryResponse } from '../types/product';

// GET /api/v1/categories -> a FLAT array of categories.
export async function fetchCategories(): Promise<CategoryResponse[]> {
    const res = await axiosInstance.get<CategoryResponse[]>('/api/v1/categories');
    return res.data;
}

// The JSON body the create/update endpoints expect. Mirrors the backend
// Create/UpdateCategoryRequest (they're identical, so ONE shape serves both).
export interface CategoryBody {
    name: string;
    description: string | null;
    parentCategoryId: number | null;
}

// CREATE a category (admin only). POST /api/v1/categories -> 201 with the new CategoryResponse.
export async function createCategory(body: CategoryBody): Promise<CategoryResponse> {
    const res = await axiosInstance.post<CategoryResponse>('/api/v1/categories', body);
    return res.data;
}

// UPDATE a category (admin only). PUT /api/v1/categories/{id} -> 204 No Content (no body back).
export async function updateCategory(id: number, body: CategoryBody): Promise<void> {
    await axiosInstance.put(`/api/v1/categories/${id}`, body);
}

// DELETE a category (admin only). DELETE /api/v1/categories/{id} -> 204,
// or 409 if products are still linked to it (we surface that message as a toast).
export async function deleteCategory(id: number): Promise<void> {
    await axiosInstance.delete(`/api/v1/categories/${id}`);
}