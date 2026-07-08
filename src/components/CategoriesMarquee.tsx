import { categories } from '../data/landing';

/** Infinite horizontal marquee of category chips (data is duplicated for the loop). */
export function CategoriesMarquee() {
  const loop = categories.concat(categories);

  return (
    <section style={{ background: '#f7f7fb', padding: 'clamp(48px, 6vw, 72px) 0', overflow: 'hidden' }}>
      <div data-reveal style={{ maxWidth: 1100, margin: '0 auto 28px', padding: '0 24px' }}>
        <h2 style={{ margin: 0, fontFamily: 'Outfit', fontWeight: 700, fontSize: 'clamp(22px, 3vw, 32px)', letterSpacing: '-0.02em', color: '#15131f' }}>Explore hundreds of categories</h2>
      </div>
      <div className="marquee-track" style={{ display: 'flex', gap: 14 }}>
        {loop.map((c, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 18px', borderRadius: 999, background: '#fff', border: '1px solid #e9e8f2', boxShadow: '0 1px 2px rgba(16,24,40,0.04)', whiteSpace: 'nowrap', fontSize: 14, fontWeight: 500, color: '#3a3750' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.dot }} />
            {c.top} <span style={{ color: '#9b97ad' }}>&middot; {c.sub}</span>
          </span>
        ))}
      </div>
    </section>
  );
}
