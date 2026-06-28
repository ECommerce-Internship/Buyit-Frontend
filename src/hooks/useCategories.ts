import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '../api/categories';

export function useCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
        // Categories change rarely; treat them as fresh for 5 minutes.
        staleTime: 5 * 60 * 1000,
    });
}