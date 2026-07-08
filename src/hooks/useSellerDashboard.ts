// src/hooks/useSellerDashboard.ts
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
    fetchSellerDashboardSummary,
    fetchSellerRevenue,
    fetchSellerTopProducts,
    fetchSellerOrdersByStatus,
} from '../api/sellerDashboard';

export function useSellerDashboardSummary() {
    return useQuery({ queryKey: ['seller-dash-summary'], queryFn: fetchSellerDashboardSummary });
}
// `range` is one of 1d|15d|30d|3m|6m|1y (same tokens as Admin). keepPreviousData keeps the old
// series on screen while the next window loads, so switching ranges re-animates instead of blanking.
export function useSellerRevenue(range = '30d') {
    return useQuery({
        queryKey: ['seller-dash-revenue', range],
        queryFn: () => fetchSellerRevenue(range),
        placeholderData: keepPreviousData,
    });
}
export function useSellerTopProducts() {
    return useQuery({ queryKey: ['seller-dash-top'], queryFn: fetchSellerTopProducts });
}
export function useSellerOrdersByStatus() {
    return useQuery({ queryKey: ['seller-dash-by-status'], queryFn: fetchSellerOrdersByStatus });
}