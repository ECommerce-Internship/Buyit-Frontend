// src/hooks/usePayments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAdminPayments, refundPayment, type AdminPaymentParams } from '../api/payments';

// Pull a human message out of the backend's error body, with a fallback (same idea as TB-66).
function errMessage(err: unknown, fallback: string): string {
    const anyErr = err as { response?: { data?: { detail?: string; title?: string } } };
    return anyErr?.response?.data?.detail ?? anyErr?.response?.data?.title ?? fallback;
}

// READ the payments list. The key includes `params`, so changing page/filter refetches itself.
export function useAdminPayments(params: AdminPaymentParams) {
    return useQuery({
        queryKey: ['admin-payments', params],
        queryFn: () => fetchAdminPayments(params),
    });
}

// REFUND a paid payment. On success, invalidate the list so the row flips to Refunded.
export function useRefundPayment(opts?: {
    onSuccess?: () => void;
    onError?: (msg: string) => void;
}) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (paymentId: number) => refundPayment(paymentId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-payments'] });
            opts?.onSuccess?.();
        },
        onError: (e) => opts?.onError?.(errMessage(e, 'Could not refund this payment.')),
    });
}