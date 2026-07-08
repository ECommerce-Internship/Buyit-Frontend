// src/routes/AdminRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HOME_PATH } from '../lib/authRoutes';

// Gate for "must be an Admin". Anyone else is sent to the app root.
// (Place this INSIDE ProtectedRoute in the route tree, so "logged in" is already guaranteed.)
export function AdminRoute() {
    const { user } = useAuth();

    if (user?.role !== 'Admin') {
        return <Navigate to={HOME_PATH} replace />;
    }
    return <Outlet />;
}