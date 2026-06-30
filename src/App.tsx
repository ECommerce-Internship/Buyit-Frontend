import { Routes, Route } from 'react-router-dom';
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

// TEMP placeholders so the guards are testable NOW. Replace each with the real page
// in its own ticket (admin dashboard, seller dashboard/TB-139).
function Placeholder({ title }: { title: string }) {
    return <div style={{ padding: 40, fontFamily: 'system-ui' }}>{title}</div>;
}

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
            {/* Must be logged in for anything below. */}
            <Route element={<ProtectedRoute />}>
                {/* Logged in (any role): your own account/profile (TB-134). */}
                <Route path="/account" element={<AccountPage />} />

                {/* Logged-in user cart. */}
                <Route path="/cart" element={<CartPage />} />

                {/* Logged in AND Admin. */}
                <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<Placeholder title="Admin dashboard (TEMP)" />} />
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