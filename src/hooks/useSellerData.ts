// src/hooks/useSellerData.ts
// Seller-scoped equivalents of the admin hooks: everything here is filtered to ONE store
// (the store the seller currently has selected), rather than the whole marketplace.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProducts, type ProductQueryParams } from '../api/products';
import { fetchInventoryByStore, updateStock, updateThreshold } from '../api/admin';

function errMessage(err: unknown, fallback: string): string {
    const anyErr = err as { response?: { data?: { detail?: string; title?: string } } };
    return anyErr?.response?.data?.detail ?? anyErr?.response?.data?.title ?? fallback;
}

// ---------- PRODUCTS ----------

// One store's products (any status the store is in — the backend bypasses the public
// "Approved only" filter for the owner/admin). `enabled: storeId !== null` holds the request
// until a store is actually selected.
export function useSellerProducts(storeId: number | null, params: Omit<ProductQueryParams, 'storeId'>) {
    return useQuery({
        queryKey: ['seller-products', storeId, params],
        queryFn: () => fetchProducts({ ...params, storeId: storeId as number }),
        enabled: storeId !== null,
    });
}

// ---------- INVENTORY ----------

export function useSellerInventory(storeId: number | null) {
    return useQuery({
        queryKey: ['seller-inventory', storeId],
        queryFn: () => fetchInventoryByStore(storeId as number),
        enabled: storeId !== null,
    });
}

type MutationOpts = { onSuccess?: () => void; onError?: (msg: string) => void };

export function useSellerUpdateStock(opts?: MutationOpts) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { productId: number; newQuantity: number }) =>
            updateStock(vars.productId, vars.newQuantity),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['seller-inventory'] });
            opts?.onSuccess?.();
        },
        onError: (e) => opts?.onError?.(errMessage(e, 'Could not update stock.')),
    });
}

export function useUpdateThreshold(opts?: MutationOpts) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { productId: number; newThreshold: number }) =>
            updateThreshold(vars.productId, vars.newThreshold),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['seller-inventory'] });
            qc.invalidateQueries({ queryKey: ['admin-inventory'] }); // keep Admin's view fresh too
            opts?.onSuccess?.();
        },
        onError: (e) => opts?.onError?.(errMessage(e, 'Could not update threshold.')),
    });
}