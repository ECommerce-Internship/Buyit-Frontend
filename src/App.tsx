import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { ProductListingPage } from './pages/ProductListingPage';
import { GoogleCallbackPage } from './pages/GoogleCallbackPage';
import { CartPage } from './pages/CartPage';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AdminRoute } from './routes/AdminRoute';
import { SellerRoute } from './routes/SellerRoute';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { AccountPage } from './pages/AccountPage';
import { SellerDashboardPage } from './pages/SellerDashboardPage';
import { SellerProductsPage } from './pages/seller/SellerProductsPage';
import { SellerInventoryPage } from './pages/seller/SellerInventoryPage';
import { SellerOrdersPage } from './pages/seller/SellerOrdersPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminStoresPage } from './pages/admin/AdminStoresPage';
import { StorefrontPage } from './pages/StorefrontPage';
import { ChatWidget } from './components/chat/ChatWidget';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import type { ReactElement } from 'react';

// Wraps a page element in its own ErrorBoundary so one broken page
// can't take down the whole app / other routes.
function page(element: ReactElement): ReactElement {
    return <ErrorBoundary>{element}</ErrorBoundary>;
}

function App() {
    return (
        <>
            <Routes>
                {/* Public: the marketing landing page; its CTAs open the global auth modal. */}
                <Route path="/" element={page(<LandingPage />)} />

                {/* Public: the marketplace catalogue (GET /products is anonymous). */}
                <Route path="/products" element={page(<ProductListingPage />)} />

                {/* Public: a single product's detail page (TB-59). */}
                <Route path="/products/:id" element={page(<ProductDetailPage />)} />
                {/* Public: one store's storefront — its header + only its products (TB-141). */}
                <Route path="/stores/:slug" element={page(<StorefrontPage />)} />
                {/* Public: where the backend redirects after Google sign-in (TB-133). */}
                <Route path="/auth/callback" element={page(<GoogleCallbackPage />)} />

                {/* Must be logged in for anything below. (/products is NO LONGER here.) */}
                <Route element={<ProtectedRoute />}>
                    {/* Cart / checkout / order confirmation. */}
                    <Route path="/cart" element={page(<CartPage />)} />
                    <Route path="/checkout" element={page(<CheckoutPage />)} />
                    <Route path="/orders/:id/confirmation" element={page(<OrderConfirmationPage />)} />
                    <Route path="/account" element={page(<AccountPage />)} />
                    <Route path="/orders" element={page(<MyOrdersPage />)} />
                    <Route path="/orders/:id" element={page(<OrderDetailPage />)} />

                    {/* Logged in AND Admin. */}
                    <Route element={<AdminRoute />}>
                        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                        <Route path="/admin/products" element={page(<AdminProductsPage />)} />
                        <Route path="/admin/dashboard" element={page(<AdminDashboardPage />)} />
                        <Route path="/admin/orders" element={page(<AdminOrdersPage />)} />
                        <Route path="/admin/inventory" element={page(<AdminInventoryPage />)} />
                        <Route path="/admin/payments" element={page(<AdminPaymentsPage />)} />
                        <Route path="/admin/categories" element={page(<AdminCategoriesPage />)} />
                        <Route path="/admin/stores" element={page(<AdminStoresPage />)} />
                    </Route>

                    {/* Logged in AND Seller. */}
                    <Route element={<SellerRoute />}>
                        <Route path="/seller" element={page(<SellerDashboardPage />)} />
                        <Route path="/seller/products" element={page(<SellerProductsPage />)} />
                        <Route path="/seller/inventory" element={page(<SellerInventoryPage />)} />
                        <Route path="/seller/orders" element={page(<SellerOrdersPage />)} />
                    </Route>
                </Route>
            </Routes>
            <ChatWidget />
        </>
    );
}

export default App;