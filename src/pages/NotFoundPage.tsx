import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
    return (
        <main style={page}>
            <div style={glow} aria-hidden />
            <div style={content}>
                <div style={brand}>Buyit</div>

                <span style={code}>404</span>

                <h1 style={title}>This page wandered off the shelf.</h1>
                <p style={subtitle}>
                    The page you're looking for doesn't exist, moved, or the link's just wrong.
                    Let's get you back to shopping.
                </p>

                <div style={actions}>
                    <Link to="/" style={primaryBtn}>Back to home</Link>
                    <Link to="/products" style={ghostBtn}>Browse products</Link>
                </div>
            </div>
        </main>
    );
}

const page: CSSProperties = {
    minHeight: '100vh', background: '#0a0a12', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden', padding: '40px 24px',
};
const glow: CSSProperties = {
    position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
    width: 700, height: 700, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.25), transparent 70%)',
    filter: 'blur(20px)', pointerEvents: 'none',
};
const content: CSSProperties = { position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 520 };
const brand: CSSProperties = {
    fontFamily: 'Outfit', fontWeight: 700, fontSize: 18, letterSpacing: 0.4,
    backgroundImage: 'linear-gradient(120deg, #c4b5fd, #ff9aa9)',
    WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
    color: 'transparent', marginBottom: 28,
};
const code: CSSProperties = {
    display: 'block', fontFamily: 'Outfit', fontWeight: 800, fontSize: 120, lineHeight: 1,
    backgroundImage: 'linear-gradient(120deg,#8b5cf6,#6366f1)',
    WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
    color: 'transparent',
};
const title: CSSProperties = { fontFamily: 'Outfit', fontSize: 26, fontWeight: 700, margin: '8px 0 10px' };
const subtitle: CSSProperties = { fontSize: 15, lineHeight: 1.6, color: 'rgba(255,255,255,0.6)', margin: '0 0 30px' };
const actions: CSSProperties = { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' };
const primaryBtn: CSSProperties = {
    padding: '13px 24px', fontFamily: 'inherit', fontSize: 14.5, fontWeight: 600, color: '#fff',
    textDecoration: 'none', borderRadius: 12, background: 'linear-gradient(120deg,#8b5cf6,#6366f1)',
};
const ghostBtn: CSSProperties = {
    padding: '13px 24px', fontFamily: 'inherit', fontSize: 14.5, fontWeight: 600, color: '#fff',
    textDecoration: 'none', borderRadius: 12, background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.14)',
};