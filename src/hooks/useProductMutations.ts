import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImage,
    importProducts,
    generateProductContent,
} from '../api/products';
import type {
    CreateProductBody,
    UpdateProductBody,
    ProductResponse,
    ImportResult,
    ProductContentSuggestion,
} from '../types/product';

// Pull a human message out of the backend's ProblemDetails error body, with a fallback.
// (Same idea as useCreateStore.ts.)
function errMessage(err: unknown, fallback: string): string {
    const anyErr = err as { response?: { data?: { detail?: string; title?: string } } };
    return anyErr?.response?.data?.detail ?? anyErr?.response?.data?.title ?? fallback;
}

// CREATE
export function useCreateProduct(opts?: {
    onSuccess?: (p: ProductResponse) => void;
    onError?: (msg: string) => void;
}) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: CreateProductBody) => createProduct(body),
        onSuccess: (p) => {
            qc.invalidateQueries({ queryKey: ['products'] });
            opts?.onSuccess?.(p);
        },
        onError: (e) => opts?.onError?.(errMessage(e, 'Could not create the product.')),
    });
}

// UPDATE — note the variables are an object { id, body } because a mutation takes ONE argument.
export function useUpdateProduct(opts?: {
    onSuccess?: (p: ProductResponse) => void;
    onError?: (msg: string) => void;
}) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { id: number; body: UpdateProductBody }) =>
            updateProduct(vars.id, vars.body),
        onSuccess: (p) => {
            qc.invalidateQueries({ queryKey: ['products'] });
            opts?.onSuccess?.(p);
        },
        onError: (e) => opts?.onError?.(errMessage(e, 'Could not update the product.')),
    });
}

// DELETE
export function useDeleteProduct(opts?: {
    onSuccess?: () => void;
    onError?: (msg: string) => void;
}) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteProduct(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['products'] });
            opts?.onSuccess?.();
        },
        onError: (e) => opts?.onError?.(errMessage(e, 'Could not delete the product.')),
    });
}

// UPLOAD IMAGE
export function useUploadProductImage(opts?: {
    onSuccess?: (url: string) => void;
    onError?: (msg: string) => void;
}) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { id: number; file: File }) =>
            uploadProductImage(vars.id, vars.file),
        onSuccess: (url) => {
            qc.invalidateQueries({ queryKey: ['products'] });
            opts?.onSuccess?.(url);
        },
        onError: (e) => opts?.onError?.(errMessage(e, 'Could not upload the image.')),
    });
}

// IMPORT EXCEL
export function useImportProducts(opts?: {
    onSuccess?: (result: ImportResult) => void;
    onError?: (msg: string) => void;
}) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (file: File) => importProducts(file),
        onSuccess: (result) => {
            qc.invalidateQueries({ queryKey: ['products'] });
            opts?.onSuccess?.(result);
        },
        onError: (e) => opts?.onError?.(errMessage(e, 'Import failed.')),
    });
}

// GENERATE CONTENT (no cache invalidation — it doesn't change the database)
export function useGenerateContent(opts?: {
    onSuccess?: (s: ProductContentSuggestion) => void;
    onError?: (msg: string) => void;
}) {
    return useMutation({
        mutationFn: (vars: { id: number; specs: string }) =>
            generateProductContent(vars.id, vars.specs),
        onSuccess: (s) => opts?.onSuccess?.(s),
        onError: (e) => opts?.onError?.(errMessage(e, 'Could not generate content.')),
    });
}