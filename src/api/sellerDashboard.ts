// src/api/sellerDashboard.ts
import axiosInstance from './axiosInstance';
import type { DashboardSummary, PeriodPoint, TopProduct, StatusCount } from '../types/admin';

export async function fetchSellerDashboardSummary(): Promise<DashboardSummary> {
    const res = await axiosInstance.get<DashboardSummary>('/api/v1/seller/dashboard/summary');
    return res.data;
}

// Revenue time-series over a rolling window. `range` is one of 1d|15d|30d|3m|6m|1y.
export async function fetchSellerRevenue(range = '30d'): Promise<PeriodPoint[]> {
    const res = await axiosInstance.get<PeriodPoint[]>('/api/v1/seller/dashboard/revenue', {
        params: { period: range },
    });
    return res.data;
}

export async function fetchSellerTopProducts(): Promise<TopProduct[]> {
    const res = await axiosInstance.get<TopProduct[]>('/api/v1/seller/dashboard/top-products');
    return res.data;
}

export async function fetchSellerOrdersByStatus(): Promise<StatusCount[]> {
    const res = await axiosInstance.get<StatusCount[]>('/api/v1/seller/dashboard/orders-by-status');
    return res.data;
}