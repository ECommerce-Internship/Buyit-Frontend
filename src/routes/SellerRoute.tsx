// src/routes/SellerRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HOME_PATH } from '../lib/authRoutes';

// Gate for "must be a Seller". Non-sellers are sent to the app root.
// NOTE (TB-139): a seller with NO approved store still reaches the seller dashboard here;
// selling ACTIONS are gated separately by TB-139's pending-store UX, not by this route.
export function SellerRoute() {
    const { user } = useAuth();

    if (user?.role !== 'Seller') {
        return <Navigate to={HOME_PATH} replace />;
    }
    return <Outlet />;
}