// src/components/admin/AdminTabs.tsx
import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import type { CSSProperties } from 'react';
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
];

export function AdminTabs() {
    const { logout } = useAuth();

    return (
        <nav style={{ display: 'flex', gap: 8, marginBottom: 26, flexWrap: 'wrap', alignItems: 'center' }}>
            {TABS.map((t) => (
                <NavLink
                    key={t.to}
                    to={t.to}
                    className={({ isActive }) => `admin-tab${isActive ? ' admin-tab-active' : ''}`}
                    style={({ isActive }) => ({ ...tab, ...(isActive ? tabActive : null) })}
                >
                    {t.label}
                </NavLink>
            ))}

            {/* Pushed to the right; sits on every admin page since AdminTabs is shared. */}
            <button type="button" onClick={() => logout()} style={logoutBtn} title="Log out">
                <LogOut size={15} aria-hidden />
                Log out
            </button>
        </nav>
    );
}

const tab: CSSProperties = {
    padding: '9px 16px', fontFamily: 'inherit', fontSize: 14.5, fontWeight: 600,
    color: 'rgba(255,255,255,0.62)', textDecoration: 'none', borderRadius: 11,
    border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)',
};
// The vivid fill/border/glow come from the `.admin-tab-active` class (see admin.css).
const tabActive: CSSProperties = {
    color: '#fff',
};

const logoutBtn: CSSProperties = {
    marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 7,
    padding: '9px 16px', fontFamily: 'inherit', fontSize: 14.5, fontWeight: 600,
    color: '#ff8fa3', cursor: 'pointer', borderRadius: 11,
    border: '1px solid rgba(255,93,122,0.28)', background: 'rgba(255,93,122,0.08)',
};
