import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { ProductListingPage } from './pages/ProductListingPage';
import { GoogleCallbackPage } from './pages/GoogleCallbackPage';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AdminRoute } from './routes/AdminRoute';
import { SellerRoute } from './routes/SellerRoute';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { AccountPage } from './pages/AccountPage';
import { SellerDashboardPage } from './pages/SellerDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';

function App() {
    return (
        <Routes>
            {/* Public: the marketing landing page; its CTAs open the global auth modal. */}
            <Route path="/" element={<LandingPage />} />

            {/* Public: the marketplace catalogue (GET /products is anonymous). */}
            <Route path="/products" element={<ProductListingPage />} />

            {/* Public: a single product's detail page (TB-59). */}
            <Route path="/products/:id" element={<ProductDetailPage />} />
            {/* Public: where the backend redirects after Google sign-in (TB-133). */}
            <Route path="/auth/callback" element={<GoogleCallbackPage />} />

            {/* Must be logged in for anything below. (/products is NO LONGER here.) */}
            <Route element={<ProtectedRoute />}>
                {/* Logged in (any role): your own account/profile (TB-134). */}
                <Route path="/account" element={<AccountPage />} />

                {/* Logged in AND Admin. */}
                <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="/admin/products" element={<AdminProductsPage />} />
                    <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                    <Route path="/admin/orders" element={<AdminOrdersPage />} />
                    <Route path="/admin/inventory" element={<AdminInventoryPage />} />
                    <Route path="/admin/payments" element={<AdminPaymentsPage />} />
                    <Route path="/admin/categories" element={<AdminCategoriesPage />} />
                </Route>



                {/* Logged in AND Seller. */}
                <Route element={<SellerRoute />}>
                    <Route path="/seller" element={<SellerDashboardPage />} />
                </Route>
            </Route>
        </Routes>
    );
}

export default App;