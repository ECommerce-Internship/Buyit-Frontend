// src/api/admin.ts
// The ONLY place that knows the admin/inventory/dashboard backend URLs (TB-66).
import axiosInstance from './axiosInstance';
import type { PaginatedResult } from '../types/product';
import type {
    OrderSummary,
    OrderDetail,
    UpdateOrderStatusBody,
    InventoryItem,
    DashboardSummary,
    PeriodPoint,
    TopProduct,
    StatusCount,
} from '../types/admin';

// ---------- ORDERS ----------

// Params the admin orders list accepts. All optional except paging (which has defaults).
export interface AdminOrderParams {
    page?: number;
    pageSize?: number;
    status?: string;   // omit for "All"
    from?: string;     // ISO date; omit for no lower bound
    to?: string;       // ISO date; omit for no upper bound
}

// LIST all orders (paginated). GET /api/v1/admin/orders
export async function fetchAdminOrders(
    params: AdminOrderParams,
): Promise<PaginatedResult<OrderSummary>> {
    const res = await axiosInstance.get<PaginatedResult<OrderSummary>>('/api/v1/admin/orders', {
        params, // axios turns this object into ?page=1&pageSize=10&status=Shipped ; undefined values are dropped
    });
    return res.data;
}

// GET one order's full detail (with its store-orders). GET /api/v1/admin/orders/{id}
export async function fetchAdminOrder(id: number): Promise<OrderDetail> {
    const res = await axiosInstance.get<OrderDetail>(`/api/v1/admin/orders/${id}`);
    return res.data;
}

// UPDATE one STORE-ORDER's status (§5.3). PUT /api/v1/admin/orders/store-orders/{storeOrderId}/status
export async function updateStoreOrderStatus(
    storeOrderId: number,
    body: UpdateOrderStatusBody,
): Promise<OrderDetail> {
    const res = await axiosInstance.put<OrderDetail>(
        `/api/v1/admin/orders/store-orders/${storeOrderId}/status`,
        body,
    );
    return res.data;
}

// ---------- INVENTORY ----------

// LIST all inventory rows (NOT paginated — a plain array, §5.7). GET /api/v1/inventory
export async function fetchInventory(): Promise<InventoryItem[]> {
    const res = await axiosInstance.get<InventoryItem[]>('/api/v1/inventory');
    return res.data;
}

// UPDATE a product's stock. PUT /api/v1/inventory/{productId}/stock
// IMPORTANT (§5.5): the body is the BARE NUMBER, e.g. 42 — NOT an object.
export async function updateStock(productId: number, newQuantity: number): Promise<InventoryItem> {
    const res = await axiosInstance.put<InventoryItem>(
        `/api/v1/inventory/${productId}/stock`,
        newQuantity, // sent as JSON `42`, matching [FromBody] int newQuantity
    );
    return res.data;
}

// UPDATE a product's low-stock threshold. PUT /api/v1/inventory/{productId}/threshold
// Same bare-number body convention as updateStock above.
export async function updateThreshold(productId: number, newThreshold: number): Promise<InventoryItem> {
    const res = await axiosInstance.put<InventoryItem>(
        `/api/v1/inventory/${productId}/threshold`,
        newThreshold,
    );
    return res.data;
}

// LIST inventory rows for ONE store (the seller's own, or an admin's pick).
// GET /api/v1/inventory/mine?storeId=X — ownership is enforced by the backend (403 otherwise).
export async function fetchInventoryByStore(storeId: number): Promise<InventoryItem[]> {
    const res = await axiosInstance.get<InventoryItem[]>('/api/v1/inventory/mine', {
        params: { storeId },
    });
    return res.data;
}

// ---------- DASHBOARD (five separate endpoints, §5.2) ----------

// KPI summary. GET /api/v1/admin/dashboard/summary
export async function fetchDashboardSummary(): Promise<DashboardSummary> {
    const res = await axiosInstance.get<DashboardSummary>('/api/v1/admin/dashboard/summary');
    return res.data;
}

// Revenue time-series over a rolling window. GET /api/v1/admin/dashboard/revenue?period=30d
// `range` is one of: 1d | 15d | 30d | 3m | 6m | 1y (the backend windows + buckets accordingly).
export async function fetchRevenue(range = '30d'): Promise<PeriodPoint[]> {
    const res = await axiosInstance.get<PeriodPoint[]>('/api/v1/admin/dashboard/revenue', {
        params: { period: range },
    });
    return res.data;
}

// Top products. GET /api/v1/admin/dashboard/top-products
export async function fetchTopProducts(): Promise<TopProduct[]> {
    const res = await axiosInstance.get<TopProduct[]>('/api/v1/admin/dashboard/top-products');
    return res.data;
}

// Orders grouped by status. GET /api/v1/admin/dashboard/orders-by-status
export async function fetchOrdersByStatus(): Promise<StatusCount[]> {
    const res = await axiosInstance.get<StatusCount[]>('/api/v1/admin/dashboard/orders-by-status');
    return res.data;
}