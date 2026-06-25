import { useEffect, useState } from 'react';
import { heroStores } from '../data/landing';

/**
 * MarketplaceRadar — the animated hero scene.
 * Five stores sit on an orbit ring around a central Buyer hub. A rotating
 * gradient spoke + ambient conic sweep "check" each store in turn, auto-cycling
 * every 2.2s (paused while a store is hovered). The active store lifts, glows,
 * and reveals a detail card (name, rating, category, products, delivery, status).
 */
export function MarketplaceRadar() {
  const [activeStore, setActiveStore] = useState(0);
  const [hoverShop, setHoverShop] = useState('');

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const id = window.setInterval(() => {
      if (hoverShop) return;
      setActiveStore((i) => (i + 1) % heroStores.length);
    }, 2200);
    return () => clearInterval(id);
  }, [hoverShop]);

  const act = hoverShop
    ? Math.max(0, heroStores.findIndex((h) => h.key === hoverShop))
    : activeStore;

  // Geometry: ring at 36% horizontal / 30% vertical radius, centred at (50%, 54%).
  const computed = heroStores.map((h, i) => {
    const a = ((-90 + i * 72) * Math.PI) / 180;
    const cos = Math.cos(a), sin = Math.sin(a);
    const leftPct = 50 + 36 * cos;
    const topPct = 54 + 30 * sin;
    const active = i === act;
    return {
      ...h,
      leftPct, topPct,
      vx: (leftPct * 6).toFixed(1), // viewBox 600 coords (container square)
      vy: (topPct * 6).toFixed(1),
      active,
      z: active ? 40 : 5,
      lift: active ? 'scale(1.16) translateY(-6px)' : 'scale(1)',
      pkgGlow: active
        ? `drop-shadow(0 0 18px rgba(${h.glow},0.95))`
        : `drop-shadow(0 0 6px rgba(${h.glow},0.4))`,
      cap: `repeating-linear-gradient(90deg, ${h.accent1} 0 8px, ${h.accent2} 8px 16px)`,
      border: active ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.22)',
      prod1: `rgba(${h.glow},0.55)`,
      statusBg: `${h.statusColor}26`,
      cardBelow: sin < -0.2,
    };
  });
  const A = computed[act] || computed[0];

  // Faint static spokes (precomputed endpoints in the 600×600 viewBox).
  const spokes = [
    [300, 144], [505.4, 268.4], [426.9, 469.6], [173.0, 469.6], [94.6, 268.4],
  ];

  return (
    <div
      data-reveal
      data-delay="120"
      data-depth="-18"
      style={{ position: 'relative', width: '100%', maxWidth: 660, margin: '0 auto', aspectRatio: '1 / 1' }}
    >
      {/* ambient rotating sweep */}
      <div aria-hidden style={{ position: 'absolute', left: '50%', top: '54%', width: '70%', aspectRatio: '1 / 1', transform: 'translate(-50%, -50%)', borderRadius: '50%', background: 'conic-gradient(from 0deg, rgba(124,58,237,0) 0deg, rgba(124,58,237,0.30) 55deg, rgba(255,107,129,0.18) 120deg, rgba(124,58,237,0) 200deg)', filter: 'blur(7px)', animation: 'spin 16s linear infinite', opacity: 0.7, pointerEvents: 'none' }} />
      {/* soft floor glow */}
      <div aria-hidden style={{ position: 'absolute', left: '50%', top: '54%', width: '56%', aspectRatio: '1 / 1', transform: 'translate(-50%, -50%)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.42), rgba(124,58,237,0) 68%)', filter: 'blur(10px)', pointerEvents: 'none' }} />

      {/* orbit + spokes */}
      <svg viewBox="0 0 600 600" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
        <defs>
          <linearGradient id="spokeG" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#ff6b81" />
          </linearGradient>
        </defs>
        <ellipse cx="300" cy="324" rx="216" ry="180" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1.3" strokeDasharray="2 9" />
        <g stroke="rgba(255,255,255,0.06)" strokeWidth="1.2">
          {spokes.map(([x, y], i) => <line key={i} x1="300" y1="324" x2={x} y2={y} />)}
        </g>
        <line
          x1="300" y1="324" x2={A.vx} y2={A.vy}
          stroke="url(#spokeG)" strokeWidth="2.6" strokeLinecap="round" strokeDasharray="6 9"
          style={{ animation: 'flow 2.2s linear infinite', transition: 'all 0.75s cubic-bezier(.4,0,.2,1)' }}
        />
      </svg>

      {/* center hub */}
      <div data-depth="8" style={{ position: 'absolute', left: '50%', top: '54%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, zIndex: 25 }}>
        <div style={{ position: 'relative', width: 64, height: 64 }}>
          <div aria-hidden style={{ position: 'absolute', inset: 0, borderRadius: 19, border: '1px solid rgba(167,139,250,0.55)', animation: 'hubPing 2.4s ease-out infinite' }} />
          <div style={{ position: 'relative', width: 64, height: 64, borderRadius: 19, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(167,139,250,0.34), rgba(99,102,241,0.2))', border: '1px solid rgba(167,139,250,0.55)', boxShadow: '0 0 34px rgba(124,58,237,0.6)', color: '#e3d9ff' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" />
              <path d="M2 3h2.2l2.1 11.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H5.3" />
            </svg>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#fff' }}>Buyer</span>
          <span style={{ fontSize: 10.5, fontWeight: 600, color: 'rgba(167,139,250,0.92)', letterSpacing: '0.01em' }}>Checking {A.name}</span>
        </div>
      </div>

      {/* store ring */}
      {computed.map((st) => (
        <div
          key={st.key}
          tabIndex={0}
          role="button"
          aria-label={`${st.name}, ${st.cat}, rated ${st.rating}, ${st.status}`}
          onMouseEnter={() => setHoverShop(st.key)}
          onMouseLeave={() => setHoverShop('')}
          onFocus={() => setHoverShop(st.key)}
          onBlur={() => setHoverShop('')}
          style={{ position: 'absolute', left: `${st.leftPct}%`, top: `${st.topPct}%`, transform: 'translate(-50%, -50%)', cursor: 'pointer', outline: 'none', zIndex: st.z }}
        >
          <div style={{ position: 'relative', transition: 'transform 0.55s cubic-bezier(.2,.85,.25,1)', transform: st.lift }}>
            {st.active && (
              <div style={{ position: 'absolute', ...(st.cardBelow ? { top: 'calc(100% + 16px)' } : { bottom: 'calc(100% + 16px)' }), left: '50%', transform: 'translateX(-50%)', width: 178, padding: '12px 13px', borderRadius: 15, background: 'rgba(16,14,30,0.94)', border: '1px solid rgba(255,255,255,0.14)', boxShadow: '0 20px 44px -16px rgba(0,0,0,0.78)', backdropFilter: 'blur(10px)', zIndex: 30, animation: 'authFade 0.3s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{st.name}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#ffb24d', whiteSpace: 'nowrap' }}>&#9733; {st.rating}</span>
                </div>
                <div style={{ marginTop: 2, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{st.cat}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <div style={{ flex: 1, padding: '6px 8px', borderRadius: 9, background: 'rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: 9.5, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.42)' }}>Products</div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: '#fff' }}>{st.products}</div>
                  </div>
                  <div style={{ flex: 1, padding: '6px 8px', borderRadius: 9, background: 'rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: 9.5, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.42)' }}>Delivery</div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: '#fff' }}>{st.eta}</div>
                  </div>
                </div>
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 7, padding: '5px 10px', borderRadius: 999, background: st.statusBg, width: 'fit-content' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: st.statusColor, boxShadow: `0 0 8px ${st.statusColor}` }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: st.statusColor }}>{st.status}</span>
                </div>
              </div>
            )}
            <div style={{ filter: st.pkgGlow, transition: 'filter 0.5s ease' }}>
              <div style={{ width: 34, height: 14, margin: '0 auto', borderRadius: '8px 8px 3px 3px', background: st.cap }} />
              <div style={{ width: 74, height: 56, borderRadius: '4px 4px 11px 11px', background: 'linear-gradient(165deg, rgba(255,255,255,0.18), rgba(255,255,255,0.05))', border: `1px solid ${st.border}`, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <div style={{ width: 17, height: 26, borderRadius: 3, background: st.prod1 }} />
                <div style={{ width: 13, height: 30, borderRadius: 3, background: 'rgba(255,255,255,0.3)' }} />
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* status legend */}
      <div style={{ position: 'absolute', left: '50%', bottom: '1.5%', transform: 'translateX(-50%)', display: 'flex', gap: 14, padding: '8px 15px', borderRadius: 999, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(6px)', zIndex: 25 }}>
        {[['#6ee7a0', 'Delivered'], ['#6d8cff', 'Shipped'], ['#ffb24d', 'Packing']].map(([c, label]) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />{label}
          </span>
        ))}
      </div>
    </div>
  );
}
