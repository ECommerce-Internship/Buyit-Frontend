import { Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AdminRoute } from './routes/AdminRoute';
import { SellerRoute } from './routes/SellerRoute';

// TEMP placeholders so the guards + role redirects are testable NOW. Replace each with the
// real page in its own ticket (admin dashboard, seller dashboard/TB-139, products listing).
function Placeholder({ title }: { title: string }) {
    return <div style={{ padding: 40, fontFamily: 'system-ui' }}>{title}</div>;
}

function App() {
    return (
        <Routes>
            {/* Public: the marketing landing page; its CTAs open the global auth modal. */}
            <Route path="/" element={<LandingPage />} />

            {/* Must be logged in for anything below. */}
            <Route element={<ProtectedRoute />}>
                <Route path="/products" element={<Placeholder title="Shop — customer home (TEMP)" />} />

                {/* Logged in AND Admin. */}
                <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<Placeholder title="Admin dashboard (TEMP)" />} />
                </Route>

                {/* Logged in AND Seller. */}
                <Route element={<SellerRoute />}>
                    <Route path="/seller" element={<Placeholder title="Seller dashboard (TEMP)" />} />
                </Route>
            </Route>
        </Routes>
    );
}

export default App;