// src/types/admin.ts
// All shapes the Admin Orders / Inventory / Dashboard tabs need (TB-66).
// Every interface mirrors a backend DTO field-for-field (camelCase on the wire).

// ---------- ORDERS ----------

// One row in the admin orders table. Mirrors backend OrderSummaryResponse.
// NOTE (TB-66 / §5.4): there is intentionally NO customerEmail — the API does not return it.
export interface OrderSummary {
    orderId: number;
    orderDate: string;        // ISO date string, e.g. "2026-06-30T12:50:00Z" (JSON has no Date type)
    status: string;           // rolled-up status: Pending | Confirmed | Shipped | Delivered | Cancelled
    totalAmount: number;
    storeOrderCount: number;
    itemCount: number;
    paymentStatus: string | null;
}

// One store's slice of an order. Mirrors backend StoreOrderResponse.
// Status lives HERE (per store), not on the order (see §5.3).
export interface StoreOrder {
    storeOrderId: number;
    storeId: number;
    storeName: string;
    status: string;
    subTotal: number;
    commissionAmount: number;
    sellerNetAmount: number;
    // items[] also exist on the backend DTO, but the Manage modal doesn't need them, so we omit.
}

// The full order detail. Mirrors backend OrderResponse (the fields we actually use).
export interface OrderDetail {
    orderId: number;
    orderDate: string;
    status: string;
    totalAmount: number;
    paymentStatus: string | null;
    storeOrders: StoreOrder[];
}

// Body for PUT .../store-orders/{id}/status. Mirrors backend UpdateOrderStatusRequest.
export interface UpdateOrderStatusBody {
    status: string;          // must be one of the OrderStatus names (see §5.8)
}

// ---------- INVENTORY ----------

// One row in the inventory table. Mirrors backend InventoryResponse.
export interface InventoryItem {
    productId: number;
    productName: string;
    sku: string;
    quantity: number;
    lowStockThreshold: number;
    isLowStock: boolean;     // TRUST THIS for the red highlight (§5.6), don't recompute
    lastUpdated: string;     // ISO date string
}

// ---------- DASHBOARD ----------

// The KPI summary. Mirrors backend DashboardSummaryResponse.
// totalCommission is nullable (it's admin-only data; the type allows null defensively).
export interface DashboardSummary {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    lowStockCount: number;
    todaysNewOrders: number;
    totalCommission: number | null;
}

// One point on a time series, e.g. { period: "2026-06", value: 1234.5 }.
// Used for BOTH revenue (value = money) and new customers (value = count). Mirrors PeriodPointResponse.
export interface PeriodPoint {
    period: string;
    value: number;
}

// One row of the Top Products table. Mirrors TopProductResponse.
export interface TopProduct {
    productId: number;
    productName: string;
    unitsSold: number;
    revenue: number;
}

// One bar in the orders-by-status chart, e.g. { status: "Shipped", count: 12 }. Mirrors StatusCountResponse.
export interface StatusCount {
    status: string;
    count: number;
}