// src/hooks/useSellerOrders.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMyStoreOrders, updateMyStoreOrderStatus } from '../api/sellerOrders';
import type { UpdateOrderStatusBody } from '../types/admin';

function errMessage(err: unknown, fallback: string): string {
    const anyErr = err as { response?: { data?: { detail?: string; title?: string } } };
    return anyErr?.response?.data?.detail ?? anyErr?.response?.data?.title ?? fallback;
}

export function useSellerStoreOrders(page: number, pageSize: number) {
    return useQuery({
        queryKey: ['seller-store-orders', page, pageSize],
        queryFn: () => fetchMyStoreOrders(page, pageSize),
    });
}

export function useUpdateMyStoreOrderStatus(opts?: { onSuccess?: () => void; onError?: (msg: string) => void }) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { storeOrderId: number; body: UpdateOrderStatusBody }) =>
            updateMyStoreOrderStatus(vars.storeOrderId, vars.body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['seller-store-orders'] });
            opts?.onSuccess?.();
        },
        onError: (e) => opts?.onError?.(errMessage(e, 'Could not update the order status.')),
    });
}