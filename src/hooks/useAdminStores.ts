// src/hooks/useAdminStores.ts
import { useQuery } from '@tanstack/react-query';
import { getAllStoresAdmin } from '../api/stores';

// Admin-only: all stores, for the product-create store picker. Cached 5 min (stores rarely change).
export function useAdminStores() {
    return useQuery({
        queryKey: ['admin-stores'],
        queryFn: getAllStoresAdmin,
        staleTime: 5 * 60 * 1000,
    });
}
