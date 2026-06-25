// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LOGIN_PATH } from '../lib/authRoutes';

// Gate for "must be logged in". Not authenticated -> bounce to the login location.
// We remember where they were trying to go (location.state.from) so a future /login
// page could send them back after a successful login.
export function ProtectedRoute() {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to={LOGIN_PATH} replace state={{ from: location }} />;
    }
    return <Outlet />;
}