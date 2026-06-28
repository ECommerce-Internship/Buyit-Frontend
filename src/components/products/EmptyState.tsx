// src/components/products/EmptyState.tsx
export function EmptyState({ onReset }: { onReset: () => void }) {
    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '72px 28px', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            <div style={{ position: 'relative', width: 108, height: 108, marginBottom: 26, animation: 'esfloat 4s ease-in-out infinite' }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle at 50% 40%, rgba(141,108,255,.18), rgba(141,108,255,0) 70%)' }} />
                <div style={{ position: 'absolute', inset: 18, borderRadius: 24, background: 'linear-gradient(150deg,#ffffff,#f4f2fb)', border: '1px solid #eceaf2', boxShadow: '0 14px 30px -14px rgba(124,92,255,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="40" height="40" viewBox="0 0 48 48" fill="none" stroke="#8d6cff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="21" cy="21" r="12" /><path d="M30 30 L40 40" />
                    </svg>
                </div>
            </div>
            <h3 style={{ margin: 0, fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 21, letterSpacing: '-0.02em', color: '#15131f' }}>No products found</h3>
            <p style={{ margin: '9px 0 0', fontSize: 14.5, lineHeight: 1.55, color: '#6b6878', maxWidth: 300 }}>Try adjusting your filters — or reset to see everything in the catalogue.</p>
            <button onClick={onReset} style={{ marginTop: 24, display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: "'Outfit',sans-serif", fontSize: 14.5, fontWeight: 600, color: '#fff', padding: '12px 22px', border: 'none', borderRadius: 12, cursor: 'pointer', background: 'linear-gradient(135deg,#8d6cff,#7c5cff)', boxShadow: '0 10px 22px -8px rgba(124,92,255,.6)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
                Reset filters
            </button>
        </div>
    );
}