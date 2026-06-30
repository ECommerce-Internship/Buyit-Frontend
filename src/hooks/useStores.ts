// src/hooks/useStores.ts
import { useQuery } from '@tanstack/react-query';
import { getMyStores } from '../api/stores';

// Loads the signed-in seller's own stores from GET /api/v1/Stores/mine. Unlike the old
// in-session list, this survives a page refresh. `enabled` lets a caller hold the request
// until the user is known to be a seller.
export function useStores(enabled = true) {
    return useQuery({
        queryKey: ['my-stores'],
        queryFn: getMyStores,
        enabled,
    });
}
