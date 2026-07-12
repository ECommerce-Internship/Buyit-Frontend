import { useState } from 'react';
import { Hoverable } from './ui/Hoverable';
import { useAuthModal } from '../context/AuthModalContext';
import buyitLogo from '../assets/buyit-logo.png';

const navLink = (extra = {}) => ({
    textDecoration: 'none', fontSize: 'clamp(11.5px, 1.5vw, 14.5px)', fontWeight: 500,
    whiteSpace: 'nowrap', color: 'rgba(255,255,255,0.66)', ...extra,
}) as const;

export function Nav() {
    const { openAuth } = useAuthModal();
    const [mobileMenu, setMobileMenu] = useState(false);
    const links = [
        { href: '#features', label: 'Features' },
        { href: '#buyers', label: 'For Buyers' },
        { href: '#sellers', label: 'For Sellers' },
        { href: '#how', label: 'How it works' },
        { href: '#reviews', label: 'Reviews' },
    ];

    return (
        <nav style={{
            position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)', background: 'rgba(10,10,18,0.72)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
            <div style={{
                maxWidth: 1200, margin: '0 auto',
                padding: 'clamp(10px, 1.8vw, 14px) clamp(10px, 3vw, 24px)', display: 'flex',
                alignItems: 'center', justifyContent: 'space-between', gap: 'clamp(8px, 2vw, 20px)',
            }}>
                <a href="#top" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
                    <img
                        src={buyitLogo}
                        alt="Buyit"
                        style={{ height: 'clamp(34px, 4vw, 44px)', width: 'auto', display: 'block' }}
                    />
                </a>

                <div className="hidden md:flex" style={{ alignItems: 'center', gap: 'clamp(10px, 2vw, 30px)' }}>
                    {links.map((l) => (
                        <Hoverable as="a" key={l.href} href={l.href} style={navLink()} hoverStyle={{ color: '#fff' }}>
                            {l.label}
                        </Hoverable>
                    ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="hidden md:flex" style={{ alignItems: 'center', gap: 'clamp(5px, 1.2vw, 12px)' }}>
                        <Hoverable
                            as="button"
                            onClick={() => openAuth('register', 'seller')}
                            style={{ background: 'transparent', border: 'none', whiteSpace: 'nowrap', color: 'rgba(255,255,255,0.82)', fontFamily: 'inherit', fontSize: 'clamp(11.5px, 1.5vw, 14.5px)', fontWeight: 600, cursor: 'pointer', padding: 'clamp(6px, 1vw, 9px) clamp(5px, 1vw, 8px)' }}
                            hoverStyle={{ color: '#fff' }}
                        >
                            Sell on Buyit
                        </Hoverable>
                        <Hoverable
                            as="button"
                            onClick={() => openAuth('login', 'buyer')}
                            style={{ background: 'transparent', border: 'none', whiteSpace: 'nowrap', color: 'rgba(255,255,255,0.82)', fontFamily: 'inherit', fontSize: 'clamp(11.5px, 1.5vw, 14.5px)', fontWeight: 600, cursor: 'pointer', padding: 'clamp(6px, 1vw, 9px) clamp(5px, 1vw, 8px)' }}
                            hoverStyle={{ color: '#fff' }}
                        >
                            Log in
                        </Hoverable>
                        <Hoverable
                            as="button"
                            onClick={() => openAuth('register', 'buyer')}
                            style={{ fontFamily: 'inherit', fontSize: 'clamp(11.5px, 1.5vw, 14.5px)', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', padding: 'clamp(8px, 1vw, 10px) clamp(10px, 1.8vw, 18px)', border: 'none', borderRadius: 11, cursor: 'pointer', background: 'linear-gradient(120deg, #ff8a4c, #ff4d6d)', boxShadow: '0 8px 22px -8px rgba(255,77,109,0.6)', transition: 'transform .15s, box-shadow .2s' }}
                            hoverStyle={{ transform: 'translateY(-1px)', boxShadow: '0 12px 30px -8px rgba(255,77,109,0.8)' }}
                        >
                            Get started
                        </Hoverable>
                    </div>
                    <button
                        onClick={() => setMobileMenu((v) => !v)}
                        className="menu-btn flex md:hidden"
                        aria-label="Open menu"
                        style={{ alignItems: 'center', justifyContent: 'center', width: 40, height: 40, padding: 0, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 11, color: '#fff', cursor: 'pointer', flexShrink: 0 }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
                    </button>
                </div>
            </div>

            {mobileMenu && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '14px 24px', display: 'flex', flexDirection: 'column', gap: 4, background: 'rgba(10,10,18,0.96)' }}>
                    {links.map((l) => (
                        <a key={l.href} href={l.href} onClick={() => setMobileMenu(false)}
                            style={{ textDecoration: 'none', padding: '11px 6px', fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>
                            {l.label}
                        </a>
                    ))}
                    <button
                        onClick={() => { setMobileMenu(false); openAuth('login', 'buyer'); }}
                        style={{ textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '11px 6px', fontFamily: 'inherit', fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}
                    >
                        Log in
                    </button>
                    <button
                        onClick={() => { setMobileMenu(false); openAuth('register', 'buyer'); }}
                        style={{ textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '11px 6px', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, color: '#ff5f6d' }}
                    >
                        Get started
                    </button>
                    <button
                        onClick={() => { setMobileMenu(false); openAuth('register', 'seller'); }}
                        style={{ textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '11px 6px', fontFamily: 'inherit', fontSize: 15, fontWeight: 600, color: '#ff9a4c' }}
                    >
                        Sell on Buyit
                    </button>
                </div>
            )}
        </nav>
    );
}