// src/components/seller/SellerTabs.tsx
import type { CSSProperties } from 'react';
import { NavLink } from 'react-router-dom';

const TABS = [
    { to: '/seller', label: 'Dashboard', end: true },
    { to: '/seller/products', label: 'Products', end: false },
    { to: '/seller/inventory', label: 'Inventory', end: false },
];

export function SellerTabs() {
    return (
        <nav style={{ display: 'flex', gap: 6, marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.09)', paddingBottom: 2 }}>
            {TABS.map((t) => (
                <NavLink
                    key={t.to}
                    to={t.to}
                    end={t.end}
                    style={({ isActive }) => ({
                        ...tabStyle,
                        color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                        borderBottom: isActive ? '2px solid #8b5cf6' : '2px solid transparent',
                    })}
                >
                    {t.label}
                </NavLink>
            ))}
        </nav>
    );
}

const tabStyle: CSSProperties = {
    padding: '10px 4px', fontFamily: 'inherit', fontSize: 14.5, fontWeight: 600,
    textDecoration: 'none', marginRight: 20,
};