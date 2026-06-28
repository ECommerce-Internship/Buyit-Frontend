// src/api/categories.ts
import axiosInstance from './axiosInstance';
import type { CategoryResponse } from '../types/product';

// GET /api/v1/categories -> a FLAT array of categories.
export async function fetchCategories(): Promise<CategoryResponse[]> {
    const res = await axiosInstance.get<CategoryResponse[]>('/api/v1/categories');
    return res.data;
}