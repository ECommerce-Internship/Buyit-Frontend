import { Hoverable } from './ui/Hoverable';
import { sellerPoints, orderStages } from '../data/landing';
import { useAuthModal } from '../context/AuthModalContext';

const CheckBadge = () => (
  <span style={{ flex: 'none', marginTop: 1, width: 22, height: 22, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: '#fff' }}>
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
  </span>
);

export function ForSellers() {
  const { openAuth } = useAuthModal();

  return (
    <section id="sellers" style={{ position: 'relative', background: 'radial-gradient(50% 70% at 85% 0%, rgba(124,58,237,0.28), transparent 60%), radial-gradient(50% 60% at 10% 100%, rgba(255,77,109,0.16), transparent 60%), #0b0b15', padding: 'clamp(64px, 8vw, 104px) 24px' }}>
      <div className="split-grid" style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
        {/* Seller mock (order fulfillment) */}
        <div data-reveal style={{ order: 0 }}>
          <div style={{ background: 'linear-gradient(165deg, rgba(30,27,52,0.7), rgba(14,13,26,0.65))', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24, boxShadow: '0 30px 70px -30px rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>StoreOrder #BQ-2381</span>
              <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 600, background: 'rgba(74,222,128,0.16)', color: '#6ee7a0', border: '1px solid rgba(74,222,128,0.3)' }}>Delivered</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18 }}>
              {orderStages.map((st) => (
                <div key={st.name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: '100%', height: 4, borderRadius: 3, background: st.bar }} />
                  <span style={{ fontSize: 10.5, fontWeight: 500, color: st.color }}>{st.name}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 11, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>4K Action Camera</div>
                  <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)' }}>Qty 1 &middot; in stock 24</div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>$189</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 11, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: 'linear-gradient(135deg, #ffb24d, #ff5e6c)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Tripod Mount</div>
                  <div style={{ fontSize: 11.5, color: '#ffb24d' }}>Low stock &middot; 3 left</div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>$29</span>
              </div>
            </div>
          </div>
        </div>

        <div data-reveal data-delay="120">
          <div style={{ fontFamily: 'Outfit', fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#ff8a6b', marginBottom: 14 }}>For Sellers</div>
          <h2 style={{ margin: 0, fontFamily: 'Outfit', fontWeight: 700, fontSize: 'clamp(28px, 3.8vw, 42px)', lineHeight: 1.08, letterSpacing: '-0.03em', color: '#fff' }}>Launch a store. Grow with AI.</h2>
          <p style={{ margin: '16px 0 26px', fontSize: 16.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.6)' }}>Open your store — it starts Pending until an admin approves it — then list products with AI and fulfill orders end to end.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            {sellerPoints.map((p) => (
              <div key={p.text} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <CheckBadge />
                <span style={{ fontSize: 15.5, lineHeight: 1.45, color: 'rgba(255,255,255,0.84)' }}>{p.text}</span>
              </div>
            ))}
          </div>

          <Hoverable as="button" onClick={() => openAuth('register', 'seller')}
            style={{ marginTop: 32, fontFamily: 'inherit', fontSize: 15, fontWeight: 600, color: '#fff', padding: '14px 24px', border: 'none', borderRadius: 13, cursor: 'pointer', background: 'linear-gradient(120deg, #8b5cf6, #6366f1)', boxShadow: '0 12px 30px -10px rgba(124,58,237,0.6)', transition: 'transform .15s, box-shadow .2s' }}
            hoverStyle={{ transform: 'translateY(-2px)', boxShadow: '0 18px 40px -10px rgba(124,58,237,0.8)' }}>
            Open Your Store
          </Hoverable>
        </div>
      </div>
    </section>
  );
}
