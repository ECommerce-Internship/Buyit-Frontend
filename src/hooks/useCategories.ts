import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    type CategoryBody,
} from '../api/categories';

export function useCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
        // Categories change rarely; treat them as fresh for 5 minutes.
        staleTime: 5 * 60 * 1000,
    });
}

// Pull a human message out of the backend's error body, with a fallback (same as the admin hooks).
function errMessage(err: unknown, fallback: string): string {
    const anyErr = err as { response?: { data?: { detail?: string; title?: string } } };
    return anyErr?.response?.data?.detail ?? anyErr?.response?.data?.title ?? fallback;
}

// CREATE. On success, invalidate ['categories'] so BOTH this table and the product dropdowns refresh.
export function useCreateCategory(opts?: { onSuccess?: () => void; onError?: (m: string) => void }) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: CategoryBody) => createCategory(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['categories'] });
            opts?.onSuccess?.();
        },
        onError: (e) => opts?.onError?.(errMessage(e, 'Could not create the category.')),
    });
}

// UPDATE. Takes both the id and the new body. Same invalidation on success.
export function useUpdateCategory(opts?: { onSuccess?: () => void; onError?: (m: string) => void }) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { id: number; body: CategoryBody }) => updateCategory(vars.id, vars.body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['categories'] });
            opts?.onSuccess?.();
        },
        onError: (e) => opts?.onError?.(errMessage(e, 'Could not update the category.')),
    });
}

// DELETE. Surfaces the backend's 409 ("has linked products") message via onError.
export function useDeleteCategory(opts?: { onSuccess?: () => void; onError?: (m: string) => void }) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteCategory(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['categories'] });
            opts?.onSuccess?.();
        },
        onError: (e) => opts?.onError?.(errMessage(e, 'Could not delete the category.')),
    });
}