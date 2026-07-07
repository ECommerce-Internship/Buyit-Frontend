// src/api/sellerOrders.ts
import axiosInstance from './axiosInstance';
import type { PaginatedResult } from '../types/product';
import type { StoreOrder, UpdateOrderStatusBody, OrderDetail } from '../types/admin';

// LIST the seller's own StoreOrders (paginated). GET /api/v1/seller/store-orders
export async function fetchMyStoreOrders(page: number, pageSize: number): Promise<PaginatedResult<StoreOrder>> {
    const res = await axiosInstance.get<PaginatedResult<StoreOrder>>('/api/v1/seller/store-orders', {
        params: { page, pageSize },
    });
    return res.data;
}

// UPDATE one of the seller's own StoreOrders' status. Ownership + valid-transition checks are
// enforced server-side (403 if not the owner, 400 if the transition is invalid).
// PUT /api/v1/seller/store-orders/{storeOrderId}/status
export async function updateMyStoreOrderStatus(
    storeOrderId: number,
    body: UpdateOrderStatusBody,
): Promise<OrderDetail> {
    const res = await axiosInstance.put<OrderDetail>(
        `/api/v1/seller/store-orders/${storeOrderId}/status`,
        body,
    );
    return res.data;
}