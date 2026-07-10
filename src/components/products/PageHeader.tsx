import { useState, type ReactNode, type KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../Logo';
import { useAuth } from '../../context/AuthContext';
import { useCartCount } from '../../hooks/useCart';
import { User, Package, ShoppingCart } from 'lucide-react';

function IconNavLink({ to, label, children, badge }: { to: string; label: string; children: ReactNode; badge?: number }) {
    const [hover, setHover] = useState(false);
    return (
        <Link
            to={to}
            title={label}
            aria-label={label}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 38, height: 38, borderRadius: 10,
                color: hover ? '#7c5cff' : '#56536a',
                background: hover ? '#f1edff' : '#fff',
                border: '1px solid #eceaf2',
                textDecoration: 'none', transition: 'all .2s ease',
            }}
        >
            {children}
            {badge !== undefined && (
                <span style={{
                    position: 'absolute', top: -6, right: -6,
                    minWidth: 18, height: 18, padding: '0 4px',
                    borderRadius: 999, background: 'linear-gradient(135deg,#8d6cff,#7c5cff)',
                    color: '#fff', fontSize: 10.5, fontWeight: 700, lineHeight: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 6px -1px rgba(124,92,255,.6)', border: '1.5px solid #fff',
                }}>
                    {badge > 99 ? '99+' : badge}
                </span>
            )}
        </Link>
    );
}

interface PageHeaderProps {
    crumbLabel: string;
    // ProductListingPage owns its own debounced/URL-synced search state and passes it in
    // (controlled). If omitted, the header manages its own input and, on Enter, navigates
    // to /products?search=... — that's what ProductDetailPage gets for free.
    searchValue?: string;
    onSearchChange?: (value: string) => void;
}

export function PageHeader({ crumbLabel, searchValue, onSearchChange }: PageHeaderProps) {
    const { isAuthenticated } = useAuth();
    const cartCount = useCartCount();
    const navigate = useNavigate();
    const [localSearch, setLocalSearch] = useState('');

    const controlled = searchValue !== undefined && onSearchChange !== undefined;
    const value = controlled ? searchValue : localSearch;

    function handleChange(v: string) {
        if (controlled) onSearchChange!(v);
        else setLocalSearch(v);
    }

    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (!controlled && e.key === 'Enter' && localSearch.trim()) {
            navigate(`/products?search=${encodeURIComponent(localSearch.trim())}`);
        }
    }

    return (
        <header style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(247,246,251,.86)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid #eceaf2' }}>
            <div style={{ maxWidth: 1180, margin: '0 auto', padding: '13px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <Logo height={26} to="/" />
                    <span style={{ fontSize: 13, color: '#9a97a8', fontWeight: 500 }}>/ {crumbLabel}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', background: '#fff', border: '1px solid #eceaf2', borderRadius: 11, minWidth: 240, color: '#9a97a8' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
                    <input
                        value={value}
                        onChange={(e) => handleChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search products…"
                        style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 13.5, color: '#15131f', width: '100%' }}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {isAuthenticated && (
                        <IconNavLink to="/orders" label="My orders">
                            <Package size={18} strokeWidth={2} />
                        </IconNavLink>
                    )}
                    {isAuthenticated && (
                        <IconNavLink to="/account" label="My account">
                            <User size={18} strokeWidth={2} />
                        </IconNavLink>
                    )}
                    <IconNavLink to="/cart" label="My cart" badge={cartCount}>
                        <ShoppingCart size={18} strokeWidth={2} />
                    </IconNavLink>
                </div>
            </div>
        </header>
    );
}