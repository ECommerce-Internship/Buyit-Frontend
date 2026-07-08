import type { ReactNode } from 'react';
import { Hoverable } from './ui/Hoverable';
import { features } from '../data/landing';

// One inline icon per feature, in the same order as the `features` data array.
const icons: ReactNode[] = [
  // Multi-Seller Marketplace
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="5" cy="12" r="2.2" /><circle cx="19" cy="6" r="2.2" /><circle cx="19" cy="18" r="2.2" /><path d="M7 11l9.8-4M7 13l9.8 4" /></svg>,
  // AI Product Content
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.7 5.5L19 10l-5.3 1.5L12 17l-1.7-5.5L5 10l5.3-1.5z" /><path d="M18.5 14l.8 2.4 2.4.8-2.4.8-.8 2.4-.8-2.4-2.4-.8 2.4-.8z" /></svg>,
  // Smart Inventory
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7l9-4 9 4v10l-9 4-9-4z" /><path d="M3 7l9 4 9-4M12 11v10" /></svg>,
  // Secure Auth & Roles
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l8 3v5c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" /><path d="M9 12l2 2 4-4" /></svg>,
  // Coupons & Discounts
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z" /><path d="M15 6v12" /></svg>,
  // Reviews & Ratings
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l2.7 5.5 6 .9-4.35 4.2 1.05 6L12 16.9 6.6 19.6l1.05-6L3.3 9.4l6-.9z" /></svg>,
  // Payments & Refunds
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2.5" /><path d="M2 10h20" /></svg>,
  // Bulk Catalog Import
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15V4M8 8l4-4 4 4" /><path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" /></svg>,
];

const TONE = {
  violet: { bg: 'linear-gradient(135deg, #eef0ff, #f6edff)', color: '#6d5efc' },
  rose:   { bg: 'linear-gradient(135deg, #fff0e6, #ffe9ef)', color: '#ff5e6c' },
} as const;

export function Features() {
  return (
    <section id="features" style={{ background: '#ffffff', padding: 'clamp(64px, 8vw, 110px) 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div data-reveal style={{ maxWidth: 680, marginBottom: 52 }}>
          <div style={{ fontFamily: 'Outfit', fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6d5efc', marginBottom: 14 }}>Why Buyit</div>
          <h2 style={{ margin: 0, fontFamily: 'Outfit', fontWeight: 700, fontSize: 'clamp(30px, 4.4vw, 48px)', lineHeight: 1.05, letterSpacing: '-0.03em', color: '#15131f' }}>Everything a modern marketplace needs</h2>
          <p style={{ margin: '18px 0 0', fontSize: 17, lineHeight: 1.6, color: '#5b5870' }}>Real capabilities that power both sides of the transaction — from per-store fulfillment to AI listings and trusted payments.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(248px, 1fr))', gap: 20 }}>
          {features.map((f, i) => (
            <Hoverable
              key={f.title}
              data-reveal
              data-delay={String((i % 3) * 60)}
              style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 28, background: '#fff', border: '1px solid #ecebf3', borderRadius: 22, boxShadow: '0 1px 2px rgba(16,24,40,0.04)', transition: 'transform .25s, box-shadow .25s, border-color .25s' }}
              hoverStyle={{ transform: 'translateY(-5px)', boxShadow: '0 22px 46px -20px rgba(99,102,241,0.32)', borderColor: '#ded9fb' }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: TONE[f.tone].bg, color: TONE[f.tone].color }}>
                {icons[i]}
              </div>
              <h3 style={{ margin: 0, fontFamily: 'Outfit', fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em', color: '#15131f' }}>{f.title}</h3>
              <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.55, color: '#5b5870' }}>{f.text}</p>
            </Hoverable>
          ))}
        </div>
      </div>
    </section>
  );
}
