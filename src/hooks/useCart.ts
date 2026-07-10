import { useQuery } from '@tanstack/react-query';
import { fetchCart } from '../api/cart';
import { useAuth } from '../context/AuthContext';

// Only Customers have a cart — Sellers/Admins never need this fetched, and logged-out
// visitors obviously don't either.
export function useCart() {
    const { isAuthenticated, user } = useAuth();
    const isCustomer = isAuthenticated && user?.role === 'Customer';

    return useQuery({
        queryKey: ['cart'],
        queryFn: fetchCart,
        enabled: isCustomer,
    });
}

// Total item count for the header badge — sums quantities (3 shirts + 1 mug = 4), not
// distinct product rows. Returns 0 whenever there's no cart to show (logged out, empty, etc).
export function useCartCount(): number {
    const { data } = useCart();
    if (!data) return 0;
    return data.items.reduce((sum, item) => sum + item.quantity, 0);
}