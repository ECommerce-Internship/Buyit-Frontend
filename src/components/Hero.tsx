import { Hoverable } from './ui/Hoverable';
import { MarketplaceRadar } from './MarketplaceRadar';
import { useAuthModal } from '../context/AuthModalContext';

export function Hero() {
  const { openAuth } = useAuthModal();

  return (
    <header
      id="top"
      data-hero
      style={{
        position: 'relative', overflow: 'hidden',
        background:
          'radial-gradient(50% 60% at 12% 0%, rgba(124,58,237,0.34), transparent 60%), ' +
          'radial-gradient(46% 56% at 92% 8%, rgba(34,211,238,0.18), transparent 62%), ' +
          'radial-gradient(60% 60% at 60% 110%, rgba(255,77,109,0.20), transparent 60%), #0a0a12',
      }}
    >
      <div aria-hidden data-depth="14" style={{
        position: 'absolute', inset: '-10%', zIndex: 0, pointerEvents: 'none',
        backgroundImage:
          'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), ' +
          'linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '56px 56px',
        WebkitMaskImage: 'radial-gradient(70% 60% at 50% 30%, #000 20%, transparent 75%)',
        maskImage: 'radial-gradient(70% 60% at 50% 30%, #000 20%, transparent 75%)',
      }} />

      <div className="hero-grid" style={{
        position: 'relative', zIndex: 2, maxWidth: 1200, margin: '0 auto',
        padding: 'clamp(48px, 8vw, 96px) 24px clamp(56px, 8vw, 104px)',
        display: 'grid', gridTemplateColumns: '1fr 1.12fr', gap: 48, alignItems: 'center',
      }}>
        {/* Left column */}
        <div>
          <div data-reveal style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 13px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', marginBottom: 24 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 10px #4ade80' }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.78)' }}>The multi-seller marketplace, reimagined</span>
          </div>

          <h1 data-reveal data-delay="60" style={{ margin: 0, fontFamily: 'Outfit', fontWeight: 700, fontSize: 'clamp(40px, 6.2vw, 70px)', lineHeight: 1.02, letterSpacing: '-0.035em', color: '#fff' }}>
            Buy anything.<br />
            <span style={{ background: 'linear-gradient(108deg, #a78bfa 0%, #ff6b81 52%, #ffb24d 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}>
              Sell everything.
            </span>
          </h1>

          <p data-reveal data-delay="120" style={{ margin: '22px 0 0', maxWidth: 520, fontSize: 'clamp(16px, 1.6vw, 18px)', lineHeight: 1.6, color: 'rgba(255,255,255,0.62)' }}>
            One marketplace, thousands of independent stores. Shop across every seller in a single cart — or open your own store and sell with AI-built listings, smart inventory, and trusted payments.
          </p>

          <div className="cta-row" data-reveal data-delay="180" style={{ display: 'flex', gap: 14, marginTop: 34 }}>
            <Hoverable as="button" onClick={() => openAuth('register', 'buyer')}
              style={{ fontFamily: 'inherit', fontSize: 15.5, fontWeight: 600, color: '#fff', padding: '15px 26px', border: 'none', borderRadius: 14, cursor: 'pointer', background: 'linear-gradient(120deg, #ff8a4c, #ff4d6d)', boxShadow: '0 14px 36px -10px rgba(255,77,109,0.7)', transition: 'transform .15s, box-shadow .2s' }}
              hoverStyle={{ transform: 'translateY(-2px)', boxShadow: '0 20px 48px -10px rgba(255,77,109,0.85)' }}>
              Start Shopping
            </Hoverable>
            <Hoverable as="button" onClick={() => openAuth('register', 'seller')}
              style={{ fontFamily: 'inherit', fontSize: 15.5, fontWeight: 600, color: '#fff', padding: '15px 26px', borderRadius: 14, cursor: 'pointer', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)', transition: 'transform .15s, background .2s, border-color .2s' }}
              hoverStyle={{ transform: 'translateY(-2px)', background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.4)' }}>
              Open Your Store
            </Hoverable>
          </div>

          <div data-reveal data-delay="240" style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 28, color: 'rgba(255,255,255,0.5)', fontSize: 13.5 }}>
            <span style={{ color: '#ffb24d', letterSpacing: 2 }}>&#9733;&#9733;&#9733;&#9733;&#9733;</span>
            <span>Loved by 12,400+ sellers and millions of buyers</span>
          </div>
        </div>

        {/* Right column — animated radar */}
        <MarketplaceRadar />
      </div>
    </header>
  );
}
