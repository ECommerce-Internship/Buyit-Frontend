import { buyerSteps, sellerSteps } from '../data/landing';
import type { Step } from '../types/landing';

function StepCard({ st, badge, bg }: { st: Step; badge: string; bg: string }) {
  return (
    <div data-reveal style={{ position: 'relative', padding: 26, borderRadius: 18, background: bg, border: '1px solid #eeedf6' }}>
      <div style={{ width: 38, height: 38, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit', fontWeight: 700, fontSize: 16, color: '#fff', background: badge, marginBottom: 16 }}>{st.n}</div>
      <h3 style={{ margin: '0 0 7px', fontFamily: 'Outfit', fontSize: 17, fontWeight: 600, color: '#15131f' }}>{st.title}</h3>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: '#5b5870' }}>{st.text}</p>
    </div>
  );
}

const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 } as const;

export function HowItWorks() {
  return (
    <section id="how" style={{ background: '#fff', padding: 'clamp(64px, 8vw, 104px) 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div data-reveal style={{ textAlign: 'center', maxWidth: 620, margin: '0 auto 50px' }}>
          <div style={{ fontFamily: 'Outfit', fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6d5efc', marginBottom: 14 }}>How it works</div>
          <h2 style={{ margin: 0, fontFamily: 'Outfit', fontWeight: 700, fontSize: 'clamp(28px, 4vw, 44px)', lineHeight: 1.06, letterSpacing: '-0.03em', color: '#15131f' }}>Simple for both sides</h2>
        </div>

        <div data-reveal style={{ marginBottom: 16, fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#ff5e6c' }}>For buyers</div>
        <div style={{ ...grid, marginBottom: 48 }}>
          {buyerSteps.map((st) => (
            <StepCard key={st.n} st={st} badge="linear-gradient(120deg, #ff8a4c, #ff4d6d)" bg="#faf9fe" />
          ))}
        </div>

        <div data-reveal style={{ marginBottom: 16, fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6d5efc' }}>For sellers</div>
        <div style={grid}>
          {sellerSteps.map((st) => (
            <StepCard key={st.n} st={st} badge="linear-gradient(120deg, #8b5cf6, #6366f1)" bg="#f7f6fe" />
          ))}
        </div>
      </div>
    </section>
  );
}
