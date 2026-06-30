// src/hooks/useCreateStore.ts
import { useMutation } from '@tanstack/react-query';
import { createStore } from '../api/stores';
import type { Store, CreateStoreBody } from '../types/store';

// Wraps POST /api/v1/Stores as a React Query mutation. The caller passes onSuccess so the page
// can react (e.g. refetch its store list + show a toast). onError lets it show a message.
export function useCreateStore(options?: {
    onSuccess?: (store: Store) => void;
    onError?: (message: string) => void;
}) {
    return useMutation({
        mutationFn: (body: CreateStoreBody) => createStore(body),
        onSuccess: (store) => options?.onSuccess?.(store),
        onError: (err: unknown) => {
            // Pull a human message out of the backend's ProblemDetails error, if present.
            const anyErr = err as { response?: { data?: { detail?: string } } };
            const message = anyErr?.response?.data?.detail ?? 'Could not create the store. Please try again.';
            options?.onError?.(message);
        },
    });
}
