import { Hoverable } from './ui/Hoverable';
import { useAuthModal } from '../context/AuthModalContext';

export function FinalCTA() {
  const { openAuth } = useAuthModal();

  return (
    <section style={{ position: 'relative', overflow: 'hidden', background: 'radial-gradient(60% 120% at 20% 0%, rgba(124,58,237,0.4), transparent 55%), radial-gradient(60% 120% at 90% 100%, rgba(255,77,109,0.32), transparent 55%), #0b0b15', padding: 'clamp(64px, 9vw, 120px) 24px' }}>
      <div data-reveal style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontFamily: 'Outfit', fontWeight: 700, fontSize: 'clamp(32px, 5.5vw, 60px)', lineHeight: 1.04, letterSpacing: '-0.03em', color: '#fff' }}>Join Buyit today</h2>
        <p style={{ margin: '18px auto 0', maxWidth: 500, fontSize: 17, lineHeight: 1.6, color: 'rgba(255,255,255,0.62)' }}>Whether you're here to shop across thousands of stores or to build your own, it starts with one account.</p>
        <div className="cta-row" style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 36 }}>
          <Hoverable as="button" onClick={() => openAuth('register', 'buyer')}
            style={{ fontFamily: 'inherit', fontSize: 15.5, fontWeight: 600, color: '#fff', padding: '15px 28px', border: 'none', borderRadius: 14, cursor: 'pointer', background: 'linear-gradient(120deg, #ff8a4c, #ff4d6d)', boxShadow: '0 14px 36px -10px rgba(255,77,109,0.7)', transition: 'transform .15s, box-shadow .2s' }}
            hoverStyle={{ transform: 'translateY(-2px)', boxShadow: '0 20px 48px -10px rgba(255,77,109,0.85)' }}>
            Start Shopping
          </Hoverable>
          <Hoverable as="button" onClick={() => openAuth('register', 'seller')}
            style={{ fontFamily: 'inherit', fontSize: 15.5, fontWeight: 600, color: '#fff', padding: '15px 28px', borderRadius: 14, cursor: 'pointer', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.22)', transition: 'transform .15s, background .2s' }}
            hoverStyle={{ transform: 'translateY(-2px)', background: 'rgba(255,255,255,0.14)' }}>
            Open Your Store
          </Hoverable>
        </div>
      </div>
    </section>
  );
}
