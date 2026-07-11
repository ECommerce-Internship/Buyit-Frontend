import axiosInstance from './axiosInstance';
import type {
    PaginatedResult,
    ProductResponse,
    CreateProductBody,
    UpdateProductBody,
    ImportResult,
    ProductContentSuggestion,
} from '../types/product';

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
    storeId?: number;   // scope to ONE store (seller/admin management view)
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

// CREATE a product. Returns the created ProductResponse (HTTP 201). Admin/Seller only.
export async function createProduct(body: CreateProductBody): Promise<ProductResponse> {
    const res = await axiosInstance.post<ProductResponse>('/api/v1/product', body);
    return res.data;
}

// UPDATE an existing product. Returns the updated ProductResponse (HTTP 200). Admin/Seller only.
export async function updateProduct(
    id: number,
    body: UpdateProductBody,
): Promise<ProductResponse> {
    const res = await axiosInstance.put<ProductResponse>(`/api/v1/product/${id}`, body);
    return res.data;
}

// DELETE a product. The backend returns 204 No Content, so there is nothing to return.
export async function deleteProduct(id: number): Promise<void> {
    await axiosInstance.delete(`/api/v1/product/${id}`);
}

// UPLOAD (or replace) a product's image. multipart/form-data, ONE field named "file".
// Returns the new image URL string. Allowed: .jpg/.jpeg/.png, max 5 MB (enforced by backend).
export async function uploadProductImage(id: number, file: File): Promise<string> {
    const form = new FormData();
    form.append('file', file); // the field name MUST be "file" (matches IFormFile file)
    // Do NOT set Content-Type — the browser adds the multipart boundary automatically.
    const res = await axiosInstance.post<string>(`/api/v1/product/${id}/image`, form);
    return res.data;
}

// BULK-IMPORT products from an .xlsx file. multipart/form-data, ONE field named "file".
// Returns { addedCount, failedCount, errors[] }. Admin only. Max 10 MB (enforced by backend).
export async function importProducts(file: File): Promise<ImportResult> {
    const form = new FormData();
    form.append('file', file);
    const res = await axiosInstance.post<ImportResult>('/api/v1/product/import', form);
    return res.data;
}

// BULK-IMPORT products into ONE store, for a Seller (their own store) or Admin. Same multipart
// shape and { addedCount, failedCount, errors[] } result as importProducts, but scoped to storeId.
// The backend enforces that the caller owns that store (403 otherwise) and checks SKU uniqueness
// per-store, so every imported product lands in this store.
export async function importProductsForStore(storeId: number, file: File): Promise<ImportResult> {
    const form = new FormData();
    form.append('file', file);
    const res = await axiosInstance.post<ImportResult>(`/api/v1/product/import/${storeId}`, form);
    return res.data;
}

// TRIGGER an SFTP import. Unlike importProducts(), there is NO file to upload — the backend
// already knows the configured SFTP path and pulls the spreadsheet itself. Returns the SAME
// { addedCount, failedCount, errors[] } shape as the Excel import. Admin only.
// Errors surface as HTTP statuses the caller maps to messages: 502 (SFTP unreachable),
// 404 (file not found at the configured path), 400 (downloaded file isn't a valid spreadsheet).
export async function importProductsFromSftp(): Promise<ImportResult> {
    // POST with no second argument => empty request body, which is exactly what the endpoint wants.
    const res = await axiosInstance.post<ImportResult>('/api/v1/product/import-from-sftp');
    return res.data;
}

// GENERATE AI marketing content for an existing product. Admin only.
// Returns a SUGGESTION (not saved). `specs` is free text describing the product.
export async function generateProductContent(
    id: number,
    specs: string,
): Promise<ProductContentSuggestion> {
    const res = await axiosInstance.post<ProductContentSuggestion>(
        `/api/v1/product/${id}/generate-content`,
        { specs }, // matches the backend record GenerateContentRequest(string Specs)
    );
    return res.data;
}