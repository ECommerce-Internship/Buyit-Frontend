// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LOGIN_PATH } from '../lib/authRoutes';

// Gate for "must be logged in". Not authenticated -> bounce to the login location.
// We remember where they were trying to go (location.state.from) so a future /login
// page could send them back after a successful login.
export function ProtectedRoute() {
    const { isAuthenticated, isInitializing } = useAuth();
    const location = useLocation();

    // Wait for the mount-time session-restore check (AuthContext) to finish before
    // deciding — otherwise a page reload would bounce to login before it even had a
    // chance to rebuild the session from the refresh-token cookie.
    if (isInitializing) {
        return null;
    }

    if (!isAuthenticated) {
        return <Navigate to={LOGIN_PATH} replace state={{ from: location }} />;
    }
    return <Outlet />;
}