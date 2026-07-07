// src/hooks/useAdminData.ts
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
    fetchAdminOrders,
    fetchAdminOrder,
    updateStoreOrderStatus,
    fetchInventory,
    updateStock,
    fetchDashboardSummary,
    fetchRevenue,
    fetchTopProducts,
    fetchOrdersByStatus,
    type AdminOrderParams,
} from '../api/admin';
import type { UpdateOrderStatusBody } from '../types/admin';

// Pull a human message out of the backend's error body, with a fallback (same idea as TB-65).
function errMessage(err: unknown, fallback: string): string {
    const anyErr = err as { response?: { data?: { detail?: string; title?: string } } };
    return anyErr?.response?.data?.detail ?? anyErr?.response?.data?.title ?? fallback;
}

// ---------- ORDERS ----------

// READ the orders list. The key includes `params` so changing page/filter refetches automatically.
export function useAdminOrders(params: AdminOrderParams) {
    return useQuery({
        queryKey: ['admin-orders', params],
        queryFn: () => fetchAdminOrders(params),
    });
}

// READ one order's detail. `enabled` keeps it from firing until we actually have an id to load.
export function useAdminOrder(id: number | null) {
    return useQuery({
        queryKey: ['admin-order', id],
        queryFn: () => fetchAdminOrder(id as number),
        enabled: id !== null,
    });
}

// CHANGE a store-order's status. On success, refresh both the list and this order's detail.
export function useUpdateStoreOrderStatus(opts?: {
    onSuccess?: () => void;
    onError?: (msg: string) => void;
}) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { storeOrderId: number; body: UpdateOrderStatusBody }) =>
            updateStoreOrderStatus(vars.storeOrderId, vars.body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-orders'] });
            qc.invalidateQueries({ queryKey: ['admin-order'] });
            opts?.onSuccess?.();
        },
        onError: (e) => opts?.onError?.(errMessage(e, 'Could not update the status.')),
    });
}

// ---------- INVENTORY ----------

export function useInventory() {
    return useQuery({
        queryKey: ['admin-inventory'],
        queryFn: fetchInventory,
    });
}

export function useUpdateStock(opts?: {
    onSuccess?: () => void;
    onError?: (msg: string) => void;
}) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { productId: number; newQuantity: number }) =>
            updateStock(vars.productId, vars.newQuantity),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-inventory'] });
            opts?.onSuccess?.();
        },
        onError: (e) => opts?.onError?.(errMessage(e, 'Could not update stock.')),
    });
}

// ---------- DASHBOARD ----------
// Each piece is its own query so they load/cache/retry independently (§5.2).

export function useDashboardSummary() {
    return useQuery({ queryKey: ['dash-summary'], queryFn: fetchDashboardSummary });
}
// `range` is one of 1d|15d|30d|3m|6m|1y. keepPreviousData keeps the old series on screen
// while the next window loads, so switching ranges re-animates smoothly instead of blanking.
export function useRevenue(range = '30d') {
    return useQuery({
        queryKey: ['dash-revenue', range],
        queryFn: () => fetchRevenue(range),
        placeholderData: keepPreviousData,
    });
}
export function useTopProducts() {
    return useQuery({ queryKey: ['dash-top'], queryFn: fetchTopProducts });
}
export function useOrdersByStatus() {
    return useQuery({ queryKey: ['dash-by-status'], queryFn: fetchOrdersByStatus });
}