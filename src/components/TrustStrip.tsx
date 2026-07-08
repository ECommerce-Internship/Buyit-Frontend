import { stats } from '../data/landing';
import { CountUp } from './ui/CountUp';

/** Stats band under the hero. Numbers count up via <CountUp> when scrolled into view. */
export function TrustStrip() {
  return (
    <div style={{ position: 'relative', zIndex: 2, borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.015)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24 }}>
        {stats.map((s) => (
          <div key={s.label} data-reveal style={{ textAlign: 'center' }}>
            <CountUp
              to={Number(s.count)}
              decimals={s.decimals}
              comma={s.comma}
              prefix={s.prefix}
              suffix={s.suffix}
              delay={500}
              style={{ display: 'inline-block', fontFamily: 'Outfit', fontWeight: 700, fontSize: 'clamp(30px, 4vw, 42px)', letterSpacing: '-0.02em', background: 'linear-gradient(120deg, #c4b5fd, #ff9aa9)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}
            />
            <div style={{ marginTop: 6, fontSize: 13.5, color: 'rgba(255,255,255,0.55)' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
