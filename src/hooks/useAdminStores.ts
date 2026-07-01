// src/hooks/useAdminStores.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getAllStoresAdmin,
    getPendingStoresAdmin,
    approveStore,
    rejectStore,
    suspendStore,
} from '../api/stores';

// Pull a human message out of the backend's error body, with a fallback (same as the other admin hooks).
function errMessage(err: unknown, fallback: string): string {
    const anyErr = err as { response?: { data?: { detail?: string; title?: string } } };
    return anyErr?.response?.data?.detail ?? anyErr?.response?.data?.title ?? fallback;
}

// Admin-only: ALL stores (any status). Also feeds the product-create store picker (TB-65).
export function useAdminStores() {
    return useQuery({
        queryKey: ['admin-stores'],
        queryFn: getAllStoresAdmin,
        staleTime: 5 * 60 * 1000,
    });
}

// Admin-only: just the stores awaiting approval (the pending queue).
// Key starts with ['admin-stores'] so invalidating that prefix refreshes this too.
export function usePendingStores() {
    return useQuery({
        queryKey: ['admin-stores', 'pending'],
        queryFn: getPendingStoresAdmin,
    });
}

type ModerationOpts = { onSuccess?: () => void; onError?: (m: string) => void };

// Shared factory: every moderation action invalidates ['admin-stores'] on success, which (by
// prefix match) refreshes BOTH the all-stores table and the pending queue.
function useStoreModeration(
    fn: (id: number) => Promise<unknown>,
    fallback: string,
    opts?: ModerationOpts,
) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => fn(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-stores'] });
            opts?.onSuccess?.();
        },
        onError: (e) => opts?.onError?.(errMessage(e, fallback)),
    });
}

export function useApproveStore(opts?: ModerationOpts) {
    return useStoreModeration(approveStore, 'Could not approve the store.', opts);
}
export function useRejectStore(opts?: ModerationOpts) {
    return useStoreModeration(rejectStore, 'Could not reject the store.', opts);
}
export function useSuspendStore(opts?: ModerationOpts) {
    return useStoreModeration(suspendStore, 'Could not suspend the store.', opts);
}
