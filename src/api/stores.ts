// src/api/stores.ts
import axiosInstance from './axiosInstance';
import type { AuthResponse } from '../types/auth';
import type { Store, RegisterSellerBody, CreateStoreBody } from '../types/store';

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
