import { Hoverable } from './ui/Hoverable';
import { buyerPoints } from '../data/landing';
import { useAuthModal } from '../context/AuthModalContext';

const CheckBadge = ({ bg, delay }: { bg: string; delay?: number }) => (
  // data-reveal="pop" makes the badge scale-in (overshoot) as its row lands.
  <span data-reveal="pop" data-delay={delay} style={{ flex: 'none', marginTop: 1, width: 22, height: 22, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, color: '#fff' }}>
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
  </span>
);

export function ForBuyers() {
  const { openAuth } = useAuthModal();

  return (
    <section id="buyers" style={{ background: '#f7f7fb', padding: 'clamp(64px, 8vw, 104px) 24px' }}>
      <div className="split-grid" style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
        <div data-reveal>
          <div style={{ fontFamily: 'Outfit', fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6d5efc', marginBottom: 14 }}>For Buyers</div>
          <h2 style={{ margin: 0, fontFamily: 'Outfit', fontWeight: 700, fontSize: 'clamp(28px, 3.8vw, 42px)', lineHeight: 1.08, letterSpacing: '-0.03em', color: '#15131f' }}>Shop every store in a single cart</h2>
          <p style={{ margin: '16px 0 26px', fontSize: 16.5, lineHeight: 1.6, color: '#5b5870' }}>Discover thousands of independent sellers, check out once, and track each store's delivery on its own.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            {buyerPoints.map((p, i) => (
              // Each row reveals on scroll, one after the other, so the list ticks off
              // like a checklist. data-delay staggers them (110ms apart).
              <div
                key={p.text}
                data-reveal
                data-delay={i * 110}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}
              >
                <CheckBadge bg="linear-gradient(135deg, #ff8a4c, #ff4d6d)" delay={i * 110 + 60} />
                <span style={{ fontSize: 15.5, lineHeight: 1.45, color: '#2c2940' }}>{p.text}</span>
              </div>
            ))}
          </div>

          <Hoverable as="button" onClick={() => openAuth('register', 'buyer')}
            style={{ marginTop: 32, fontFamily: 'inherit', fontSize: 15, fontWeight: 600, color: '#fff', padding: '14px 24px', border: 'none', borderRadius: 13, cursor: 'pointer', background: 'linear-gradient(120deg, #ff8a4c, #ff4d6d)', boxShadow: '0 12px 30px -10px rgba(255,77,109,0.55)', transition: 'transform .15s, box-shadow .2s' }}
            hoverStyle={{ transform: 'translateY(-2px)', boxShadow: '0 18px 40px -10px rgba(255,77,109,0.7)' }}>
            Start Shopping
          </Hoverable>
        </div>

        {/* Buyer mock */}
        <div data-reveal data-delay="120" style={{ position: 'relative' }}>
          <div style={{ background: '#fff', border: '1px solid #e9e8f2', borderRadius: 24, boxShadow: '0 30px 70px -30px rgba(45,32,99,0.4)', padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', border: '1px solid #ececf3', borderRadius: 12, color: '#9b97ad', fontSize: 14 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
              Search across every store&hellip;
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '14px 0 16px' }}>
              <span style={{ padding: '6px 12px', borderRadius: 999, fontSize: 12.5, fontWeight: 600, background: '#efedfd', color: '#6d5efc' }}>All</span>
              <span style={{ padding: '6px 12px', borderRadius: 999, fontSize: 12.5, fontWeight: 500, background: '#f3f2f8', color: '#6b6880' }}>Electronics</span>
              <span style={{ padding: '6px 12px', borderRadius: 999, fontSize: 12.5, fontWeight: 500, background: '#f3f2f8', color: '#6b6880' }}>Home</span>
              <span style={{ padding: '6px 12px', borderRadius: 999, fontSize: 12.5, fontWeight: 500, background: '#f3f2f8', color: '#6b6880' }}>Fashion</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ border: '1px solid #efeef5', borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ height: 76, background: 'linear-gradient(135deg, #c4b5fd, #8b5cf6)' }} />
                <div style={{ padding: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#2c2940' }}>Wireless Buds</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: '#15131f' }}>$79</span>
                    <span style={{ fontSize: 11, color: '#ffb24d' }}>&#9733; 4.9</span>
                  </div>
                </div>
              </div>
              <div style={{ border: '1px solid #efeef5', borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ height: 76, background: 'linear-gradient(135deg, #ffb24d, #ff5e6c)' }} />
                <div style={{ padding: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#2c2940' }}>Linen Throw</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: '#15131f' }}>$42</span>
                    <span style={{ fontSize: 11, color: '#ffb24d' }}>&#9733; 4.8</span>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 13, background: '#15131f', color: '#fff' }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Cart &middot; 3 stores</span>
              <span style={{ fontSize: 14, fontWeight: 700 }}>Checkout &rarr;</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
