// src/components/admin/AdminTabs.tsx
import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LogOut, UserCog } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './admin.css';

const TABS = [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/orders', label: 'Orders' },
    { to: '/admin/inventory', label: 'Inventory' },
    { to: '/admin/products', label: 'Products' }, // from TB-65
    { to: '/admin/payments', label: 'Payments' }, // from TB-136
    { to: '/admin/categories', label: 'Categories' }, // from TB-137
    { to: '/admin/stores', label: 'Stores' }, // from TB-140
    { to: '/admin/coupons', label: 'Coupons' }, // TB-157
];

// Left side panel shared by every admin page. Each link bolds on hover (admin.css);
// the active route gets the glowing gradient pill. On narrow screens it collapses back
// into a horizontal, wrapping bar (see the @media rule in admin.css).
export function AdminTabs() {
    const { logout } = useAuth();
    const [loggingOut, setLoggingOut] = useState(false);

    // Guard against a double-click firing two /logout calls.
    async function onLogout() {
        if (loggingOut) return;
        setLoggingOut(true);
        try {
            await logout();
        } finally {
            setLoggingOut(false);
        }
    }

    return (
        <nav className="admin-sidebar" aria-label="Admin sections">
            <span className="admin-sidebar-brand">Buyit Admin</span>

            <div className="admin-sidebar-links">
                {TABS.map((t) => (
                    <NavLink
                        key={t.to}
                        to={t.to}
                        className={({ isActive }) => `admin-side-link${isActive ? ' admin-side-link-active' : ''}`}
                    >
                        {t.label}
                    </NavLink>
                ))}
            </div>

            {/* Account + logout, pinned to the bottom of the panel. */}
            <div className="admin-sidebar-foot">
                <Link to="/account" className="admin-side-link" title="My account">
                    <UserCog size={16} aria-hidden />
                    My account
                </Link>
                <button
                    type="button"
                    onClick={onLogout}
                    disabled={loggingOut}
                    className="admin-side-link admin-side-logout"
                    style={{ opacity: loggingOut ? 0.6 : 1, cursor: loggingOut ? 'wait' : 'pointer' }}
                    title="Log out"
                >
                    <LogOut size={16} aria-hidden />
                    {loggingOut ? 'Logging out…' : 'Log out'}
                </button>
            </div>
        </nav>
    );
}
