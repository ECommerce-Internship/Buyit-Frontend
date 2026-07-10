import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchCoupons,
    fetchCouponById,
    createCoupon,
    updateCoupon,
    deactivateCoupon,
    type CouponQueryParams,
} from '../api/coupons';
import type { CreateCouponBody, UpdateCouponBody } from '../types/coupon';

function errMessage(err: unknown, fallback: string): string {
    const anyErr = err as { response?: { data?: { detail?: string; title?: string } } };
    return anyErr?.response?.data?.detail ?? anyErr?.response?.data?.title ?? fallback;
}

type MutationOpts = { onSuccess?: () => void; onError?: (msg: string) => void };

// Used by BOTH Admin (no params = everything) and Seller (storeId = their selected store).
export function useCoupons(params: CouponQueryParams = {}) {
    return useQuery({
        queryKey: ['coupons', params],
        queryFn: () => fetchCoupons(params),
    });
}

export function useCoupon(id: number | null) {
    return useQuery({
        queryKey: ['coupon', id],
        queryFn: () => fetchCouponById(id as number),
        enabled: id !== null,
    });
}

export function useCreateCoupon(opts?: MutationOpts) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: CreateCouponBody) => createCoupon(body),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['coupons'] }); opts?.onSuccess?.(); },
        onError: (e) => opts?.onError?.(errMessage(e, 'Could not create coupon.')),
    });
}

export function useUpdateCoupon(opts?: MutationOpts) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { id: number; body: UpdateCouponBody }) => updateCoupon(vars.id, vars.body),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['coupons'] }); opts?.onSuccess?.(); },
        onError: (e) => opts?.onError?.(errMessage(e, 'Could not update coupon.')),
    });
}

export function useDeactivateCoupon(opts?: MutationOpts) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deactivateCoupon(id),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['coupons'] }); opts?.onSuccess?.(); },
        onError: (e) => opts?.onError?.(errMessage(e, 'Could not deactivate coupon.')),
    });
}