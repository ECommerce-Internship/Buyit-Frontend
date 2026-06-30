// src/components/admin/AdminTabs.tsx
import { NavLink } from 'react-router-dom';
import type { CSSProperties } from 'react';

const TABS = [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/orders', label: 'Orders' },
    { to: '/admin/inventory', label: 'Inventory' },
    { to: '/admin/products', label: 'Products' }, // from TB-65
    { to: '/admin/payments', label: 'Payments' }, // from TB-136
];

export function AdminTabs() {
    return (
        <nav style= {{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }
}>
{
    TABS.map((t) => (
        <NavLink
                    key= { t.to }
                    to = { t.to }
                    style = {({ isActive }) =>({ ...tab, ...(isActive ? tabActive : null) })}
    >
{ t.label }
    </NavLink>
            ))}
</nav>
    );
}

const tab: CSSProperties = {
    padding: '9px 16px', fontFamily: 'inherit', fontSize: 14.5, fontWeight: 600,
    color: 'rgba(255,255,255,0.6)', textDecoration: 'none', borderRadius: 11,
    border: '1px solid transparent',
};
const tabActive: CSSProperties = {
    color: '#fff', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)',
};