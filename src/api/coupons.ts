import axiosInstance from './axiosInstance';
import type { CouponResponse, CreateCouponBody, UpdateCouponBody } from '../types/coupon';

// Omitted -> Admin sees everything, Seller sees coupons across all stores they own.
export interface CouponQueryParams {
    storeId?: number;
}

export async function fetchCoupons(params: CouponQueryParams = {}): Promise<CouponResponse[]> {
    const res = await axiosInstance.get<CouponResponse[]>('/api/v1/coupon', { params });
    return res.data;
}

export async function fetchCouponById(id: number): Promise<CouponResponse> {
    const res = await axiosInstance.get<CouponResponse>(`/api/v1/coupon/${id}`);
    return res.data;
}

export async function createCoupon(body: CreateCouponBody): Promise<CouponResponse> {
    const res = await axiosInstance.post<CouponResponse>('/api/v1/coupon', body);
    return res.data;
}

export async function updateCoupon(id: number, body: UpdateCouponBody): Promise<CouponResponse> {
    const res = await axiosInstance.put<CouponResponse>(`/api/v1/coupon/${id}`, body);
    return res.data;
}

// Backend returns 204 No Content.
export async function deactivateCoupon(id: number): Promise<void> {
    await axiosInstance.delete(`/api/v1/coupon/${id}`);
}