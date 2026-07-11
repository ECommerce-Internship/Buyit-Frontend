import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { searchProductsSemantic } from '../api/products';

// Meaning-based product search (TB-156). Only fires when `enabled` (i.e. there IS a query),
// so browsing the catalogue never pays for a Gemini embed call. Returns the flat ranked
// list of hits; the page applies category/price filters client-side.
export function useSemanticSearch(q: string, enabled: boolean) {
    return useQuery({
        queryKey: ['products-semantic', q],
        queryFn: () => searchProductsSemantic(q),
        enabled,
        // Keep the previous results visible while the next query embeds (smooth typing).
        placeholderData: keepPreviousData,
    });
}
