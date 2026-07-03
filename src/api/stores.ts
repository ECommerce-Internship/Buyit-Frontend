// src/api/stores.ts
import axiosInstance from './axiosInstance';
import type { AuthResponse } from '../types/auth';
import type { Store, RegisterSellerBody, CreateStoreBody } from '../types/store';
import type { PaginatedResult, ProductResponse } from '../types/product';
import type { ProductQueryParams } from './products';

// REGISTER A SELLER in one step: creates a Seller account + a Pending first store and returns
// the SAME shape as login (tokens + user). Public endpoint (no login needed to call it).
export async function registerSeller(body: RegisterSellerBody): Promise<AuthResponse> {
    const res = await axiosInstance.post<AuthResponse>('/api/v1/auth/register-seller', body);
    return res.data;
}

// UPGRADE A LOGGED-IN CUSTOMER to a Seller and open their first Pending store. Returns FRESH
// tokens (role=Seller + storeIds) so the app can swap the session in via login(...). The token
// (attached automatically by axiosInstance) identifies the customer being upgraded.
export async function becomeSeller(body: CreateStoreBody): Promise<AuthResponse> {
    const res = await axiosInstance.post<AuthResponse>('/api/v1/auth/become-seller', body);
    return res.data;
}

// CREATE AN ADDITIONAL STORE for someone who is ALREADY a Seller/Admin. The token (attached
// automatically by axiosInstance) proves the role. Returns the new store (HTTP 201), which
// starts with status "Pending".
export async function createStore(body: CreateStoreBody): Promise<Store> {
    const res = await axiosInstance.post<Store>('/api/v1/Stores', body);
    return res.data;
}

// LIST THE SIGNED-IN SELLER'S OWN STORES (any status, newest first). Backed by
// GET /api/v1/Stores/mine — survives a page refresh, unlike the old in-session workaround.
export async function getMyStores(): Promise<Store[]> {
    const res = await axiosInstance.get<Store[]>('/api/v1/Stores/mine');
    return res.data;
}

// ADMIN: list EVERY store (any status). Backed by GET /api/v1/admin/stores (Admin only).
// Used to populate the store dropdown in the product-create form (TB-65).
export async function getAllStoresAdmin(): Promise<Store[]> {
    const res = await axiosInstance.get<Store[]>('/api/v1/admin/stores');
    return res.data;
}

// ADMIN: list ONLY the stores awaiting approval. GET /api/v1/admin/stores/pending (Admin only).
export async function getPendingStoresAdmin(): Promise<Store[]> {
    const res = await axiosInstance.get<Store[]>('/api/v1/admin/stores/pending');
    return res.data;
}

// ADMIN: approve a store (Pending -> Approved, or re-approve a Suspended/Rejected one).
// PUT /api/v1/admin/stores/{id}/approve -> 200 + the updated store.
export async function approveStore(id: number): Promise<Store> {
    const res = await axiosInstance.put<Store>(`/api/v1/admin/stores/${id}/approve`);
    return res.data;
}

// ADMIN: reject a store application (-> Rejected). PUT .../{id}/reject -> 200 + the updated store.
export async function rejectStore(id: number): Promise<Store> {
    const res = await axiosInstance.put<Store>(`/api/v1/admin/stores/${id}/reject`);
    return res.data;
}

// ADMIN: suspend a live store (Approved -> Suspended). PUT .../{id}/suspend -> 200 + updated store.
export async function suspendStore(id: number): Promise<Store> {
    const res = await axiosInstance.put<Store>(`/api/v1/admin/stores/${id}/suspend`);
    return res.data;
}

// PUBLIC: view ONE approved store by its URL slug. GET /api/v1/Stores/{slug} -> 200 + the store.
// The backend returns ONLY Approved stores; a pending/suspended/rejected/unknown slug -> 404
// (which the storefront page turns into a friendly "Store not found" screen).
export async function getStoreBySlug(slug: string): Promise<Store> {
    const res = await axiosInstance.get<Store>(`/api/v1/Stores/${slug}`);
    return res.data;
}

// PUBLIC: one page of an approved store's products. GET /api/v1/Stores/{slug}/products.
// Same paginated shape as the main catalogue. Honours search/categoryId/minPrice/maxPrice/page/
// pageSize; it IGNORES sortBy/sortDescending (this endpoint always sorts by name A-Z). 404 if the
// store isn't Approved / doesn't exist.
export async function getStoreProducts(
    slug: string,
    params: ProductQueryParams,
): Promise<PaginatedResult<ProductResponse>> {
    const res = await axiosInstance.get<PaginatedResult<ProductResponse>>(
        `/api/v1/Stores/${slug}/products`,
        { params },
    );
    return res.data;
}
