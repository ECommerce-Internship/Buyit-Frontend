// src/hooks/useSellerDashboard.ts
import { useQuery } from '@tanstack/react-query';
import {
    fetchSellerDashboardSummary,
    fetchSellerRevenue,
    fetchSellerTopProducts,
    fetchSellerOrdersByStatus,
} from '../api/sellerDashboard';

export function useSellerDashboardSummary() {
    return useQuery({ queryKey: ['seller-dash-summary'], queryFn: fetchSellerDashboardSummary });
}
export function useSellerRevenue(period = 'month') {
    return useQuery({ queryKey: ['seller-dash-revenue', period], queryFn: () => fetchSellerRevenue(period) });
}
export function useSellerTopProducts() {
    return useQuery({ queryKey: ['seller-dash-top'], queryFn: fetchSellerTopProducts });
}
export function useSellerOrdersByStatus() {
    return useQuery({ queryKey: ['seller-dash-by-status'], queryFn: fetchSellerOrdersByStatus });
}