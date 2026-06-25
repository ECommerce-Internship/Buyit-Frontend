/** Seller dashboard preview (browser-chrome card with charts). */
export function SellerDashboard() {
  const kpis = [
    { label: 'Revenue (30d)', value: '$48,920', delta: '\u2191 18.4%', deltaColor: '#6ee7a0' },
    { label: 'Orders',        value: '1,284',   delta: '\u2191 9.1%',  deltaColor: '#6ee7a0' },
    { label: 'Avg. rating',   value: '4.9',     delta: '\u2605\u2605\u2605\u2605\u2605', deltaColor: '#ffb24d' },
  ];
  const donut = [
    { label: 'Delivered 58%', color: '#6ee7a0' },
    { label: 'Shipped 22%',   color: '#6d8cff' },
    { label: 'Pending 13%',   color: '#ffb24d' },
  ];

  return (
    <section style={{ background: '#0a0a12', padding: 'clamp(48px, 6vw, 80px) 24px clamp(64px, 8vw, 100px)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div data-reveal style={{ textAlign: 'center', maxWidth: 620, margin: '0 auto 44px' }}>
          <div style={{ fontFamily: 'Outfit', fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6d8cff', marginBottom: 14 }}>Seller Dashboard</div>
          <h2 style={{ margin: 0, fontFamily: 'Outfit', fontWeight: 700, fontSize: 'clamp(28px, 4vw, 44px)', lineHeight: 1.06, letterSpacing: '-0.03em', color: '#fff' }}>Run your business at a glance</h2>
        </div>

        <div data-reveal data-delay="100" style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: 22, overflow: 'hidden', background: 'linear-gradient(180deg, #16141f, #100e18)', boxShadow: '0 40px 90px -36px rgba(124,58,237,0.5)' }}>
          {/* window chrome */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
            <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff5f57' }} />
            <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#febc2e' }} />
            <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#28c840' }} />
            <span style={{ marginLeft: 12, fontSize: 12.5, color: 'rgba(255,255,255,0.45)' }}>dashboard.buyit.app</span>
          </div>

          <div style={{ padding: 24 }}>
            {/* KPI cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 18 }}>
              {kpis.map((k) => (
                <div key={k.label} style={{ padding: 16, borderRadius: 15, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{k.label}</div>
                  <div style={{ fontFamily: 'Outfit', fontSize: 26, fontWeight: 700, color: '#fff', marginTop: 4 }}>{k.value}</div>
                  <div style={{ fontSize: 12, color: k.deltaColor, marginTop: 2 }}>{k.delta}</div>
                </div>
              ))}
            </div>

            <div className="dash-grid" style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 16 }}>
              {/* Revenue trend */}
              <div style={{ padding: 18, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 14 }}>Revenue trend</div>
                <svg viewBox="0 0 380 130" preserveAspectRatio="none" style={{ width: '100%', height: 130 }}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(139,92,246,0.5)" /><stop offset="100%" stopColor="rgba(139,92,246,0)" /></linearGradient>
                    <linearGradient id="revl" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#a78bfa" /><stop offset="100%" stopColor="#ff7a92" /></linearGradient>
                  </defs>
                  <path d="M0 96 L42 84 L84 92 L126 64 L168 72 L210 44 L252 52 L294 28 L336 34 L380 14 L380 130 L0 130 Z" fill="url(#rev)" />
                  <path d="M0 96 L42 84 L84 92 L126 64 L168 72 L210 44 L252 52 L294 28 L336 34 L380 14" fill="none" stroke="url(#revl)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="600" style={{ animation: 'drawLine 2.4s ease forwards' }} />
                </svg>
              </div>

              {/* Orders by status (donut) */}
              <div style={{ padding: 18, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 12 }}>Orders by status</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <svg width="92" height="92" viewBox="0 0 42 42">
                    <circle cx="21" cy="21" r="15.9" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
                    <circle cx="21" cy="21" r="15.9" fill="none" stroke="#6ee7a0" strokeWidth="5" strokeDasharray="58 42" strokeDashoffset="25" transform="rotate(-90 21 21)" />
                    <circle cx="21" cy="21" r="15.9" fill="none" stroke="#6d8cff" strokeWidth="5" strokeDasharray="22 78" strokeDashoffset="-33" transform="rotate(-90 21 21)" />
                    <circle cx="21" cy="21" r="15.9" fill="none" stroke="#ffb24d" strokeWidth="5" strokeDasharray="13 87" strokeDashoffset="-55" transform="rotate(-90 21 21)" />
                  </svg>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 12 }}>
                    {donut.map((d) => (
                      <span key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'rgba(255,255,255,0.7)' }}>
                        <span style={{ width: 9, height: 9, borderRadius: 2, background: d.color }} />{d.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
