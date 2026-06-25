import { useEffect, useState } from 'react';
import { Hoverable } from './ui/Hoverable';
import { testimonials } from '../data/landing';

const arrowBtn = {
  width: 42, height: 42, borderRadius: '50%', display: 'flex', alignItems: 'center',
  justifyContent: 'center', background: '#fff', border: '1px solid #e3e1ee', color: '#3a3750',
  cursor: 'pointer', transition: 'background .15s, border-color .15s',
} as const;
const arrowHover = { background: '#f5f3ff', borderColor: '#c9bffb' } as const;

export function Testimonials() {
  const [tIndex, setTIndex] = useState(0);
  const t = testimonials[tIndex];
  const next = () => setTIndex((i) => (i + 1) % testimonials.length);
  const prev = () => setTIndex((i) => (i - 1 + testimonials.length) % testimonials.length);

  // Auto-advance every 6.5s (matches the source). Paused under reduced-motion.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => {
      setTIndex((i) => (i + 1) % testimonials.length);
    }, 6500);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="reviews" style={{ background: '#fff', padding: 'clamp(64px, 8vw, 104px) 24px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
        <div data-reveal style={{ fontFamily: 'Outfit', fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6d5efc', marginBottom: 14 }}>Loved by the community</div>

        <div data-reveal data-delay="80" style={{ position: 'relative', padding: '40px 32px', borderRadius: 24, background: 'linear-gradient(165deg, #faf9ff, #f4f1ff)', border: '1px solid #ebe7fb', boxShadow: '0 24px 60px -34px rgba(99,102,241,0.4)', minHeight: 230 }}>
          <div style={{ color: '#ffb24d', fontSize: 18, letterSpacing: 3, marginBottom: 18 }}>{'\u2605'.repeat(t.rating)}</div>
          <p style={{ margin: '0 0 26px', fontFamily: 'Outfit', fontSize: 'clamp(19px, 2.6vw, 26px)', lineHeight: 1.42, fontWeight: 500, letterSpacing: '-0.01em', color: '#221f33' }}>&ldquo;{t.quote}&rdquo;</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit', fontWeight: 700, color: '#fff', background: t.color }}>{t.initials}</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: '#15131f' }}>{t.name}</div>
              <div style={{ fontSize: 13, color: '#6b6880' }}>{t.role}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 26 }}>
          <Hoverable as="button" onClick={prev} aria-label="Previous review" style={arrowBtn} hoverStyle={arrowHover}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </Hoverable>
          <div style={{ display: 'flex', gap: 8 }}>
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setTIndex(i)} aria-label="Go to review"
                style={{ width: 9, height: 9, borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0, background: i === tIndex ? 'linear-gradient(120deg,#8b5cf6,#ff6b81)' : '#d8d4ea', transition: 'background .2s' }} />
            ))}
          </div>
          <Hoverable as="button" onClick={next} aria-label="Next review" style={arrowBtn} hoverStyle={arrowHover}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
          </Hoverable>
        </div>
      </div>
    </section>
  );
}
