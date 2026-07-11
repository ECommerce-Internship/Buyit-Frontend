import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImage,
    importProducts,
    importProductsForStore,
    importProductsFromSftp,
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

// SFTP import has distinct failure modes the UI must explain clearly (see TB-138 acceptance
// criteria). We branch on the HTTP status to pick a human sentence, but still prefer the
// backend's own ProblemDetails `detail` text when it sent one.
function sftpErrMessage(err: unknown): string {
    const anyErr = err as {
        response?: { status?: number; data?: { detail?: string; title?: string } };
    };
    const status = anyErr?.response?.status;
    const detail = anyErr?.response?.data?.detail;

    switch (status) {
        case 502:
            // The API could not reach the SFTP server (SftpConnectionException).
            return detail ?? 'Could not connect to the SFTP server. Check it is online and try again.';
        case 404:
            // The configured file path does not exist on the SFTP server (SftpFileNotFoundException).
            return detail ?? 'The import file was not found on the SFTP server.';
        case 400:
            // The file downloaded but failed validation (not a valid product spreadsheet).
            return detail ?? 'The file on the SFTP server is not a valid product spreadsheet.';
        case 401:
            return 'Your session has expired. Please sign in again.';
        case 403:
            return detail ?? 'You don’t have permission to run the SFTP import (Admin only).';
        default:
            // Network error, 500, or anything unexpected.
            return detail ?? 'The SFTP import failed. Please try again.';
    }
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

// IMPORT EXCEL — store-scoped (seller). Same result shape as useImportProducts, but takes the
// target storeId and refreshes the SELLER product list ('seller-products') the page reads from.
export function useImportProductsForStore(opts?: {
    onSuccess?: (result: ImportResult) => void;
    onError?: (msg: string) => void;
}) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { storeId: number; file: File }) => importProductsForStore(vars.storeId, vars.file),
        onSuccess: (result) => {
            qc.invalidateQueries({ queryKey: ['seller-products'] });
            opts?.onSuccess?.(result);
        },
        onError: (e) => opts?.onError?.(errMessage(e, 'Import failed.')),
    });
}

// IMPORT FROM SFTP — same result + cache behaviour as Excel import, but no file argument
// and status-aware error messages (502 / 404 / 400). The backend pulls the configured file.
export function useImportFromSftp(opts?: {
    onSuccess?: (result: ImportResult) => void;
    onError?: (msg: string) => void;
}) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => importProductsFromSftp(), // no argument: the server knows the path
        onSuccess: (result) => {
            qc.invalidateQueries({ queryKey: ['products'] }); // new products exist -> refresh table
            opts?.onSuccess?.(result);
        },
        onError: (e) => opts?.onError?.(sftpErrMessage(e)),
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