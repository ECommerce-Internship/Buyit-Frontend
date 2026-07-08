import { useState } from 'react';
import type { FormEvent } from 'react';
import { Hoverable } from './ui/Hoverable';
import { useAuthModal } from '../context/AuthModalContext';
import buyitIcon from '../assets/buyit-icon.png';
import buyitWordmark from '../assets/buyit-wordmark.png';

const footerLink = { textDecoration: 'none', fontSize: 14, color: 'rgba(255,255,255,0.5)' } as const;
const social = { width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' } as const;

const COLS = [
  { title: 'Product',     links: [['#features', 'Features'], ['#buyers', 'For Buyers'], ['#how', 'How it works'], ['#reviews', 'Reviews']] },
  { title: 'For sellers', links: [['#sellers', 'Open a store'], ['#sellers', 'Seller dashboard'], ['#features', 'Bulk import'], ['#features', 'AI listings']] },
  { title: 'Company',     links: [['#', 'About'], ['#', 'Careers'], ['#', 'Privacy'], ['#', 'Terms']] },
];

export function Footer() {
  const { openAuth } = useAuthModal();
  const [newsletter, setNewsletter] = useState('');
  const [done, setDone] = useState(false);

  // MOCKED: pretend-subscribe. Wire to real newsletter endpoint.
  const onSubmit = (e: FormEvent) => { e.preventDefault(); setDone(true); };

  return (
    <footer style={{ background: '#08080e', borderTop: '1px solid rgba(255,255,255,0.07)', padding: '56px 24px 32px' }}>
      <div className="split-grid" style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr', gap: 40 }}>
        <div>
          <a href="#top" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 16 }}>
            <img src={buyitIcon} alt="" aria-hidden style={{ height: 30, width: 'auto', display: 'block' }} />
            <img src={buyitWordmark} alt="Buyit" style={{ height: 21, width: 'auto', display: 'block' }} />
          </a>
          <p style={{ margin: '0 0 18px', maxWidth: 280, fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.45)' }}>The multi-seller marketplace where buyers shop everywhere and sellers build everything.</p>
          <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8, maxWidth: 320 }}>
            <input className="buyit-input" type="email" value={newsletter} onChange={(e) => setNewsletter(e.target.value)} placeholder="Your email" aria-label="Newsletter email"
              style={{ flex: 1, padding: '11px 13px', fontFamily: 'inherit', fontSize: 14, color: '#fff', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 11, outline: 'none' }} />
            <button type="submit" style={{ padding: '11px 16px', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: '#fff', border: 'none', borderRadius: 11, cursor: 'pointer', background: 'linear-gradient(120deg, #8b5cf6, #6366f1)' }}>
              {done ? 'Subscribed' : 'Join'}
            </button>
          </form>
        </div>

        {COLS.map((col) => (
          <div key={col.title}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: 16 }}>{col.title}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {col.links.map(([href, label], i) => (
                label === 'Open a store' ? (
                  <Hoverable
                    as="button"
                    key={i}
                    onClick={() => openAuth('register', 'seller')}
                    style={{ ...footerLink, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                    hoverStyle={{ color: '#fff' }}
                  >
                    {label}
                  </Hoverable>
                ) : (
                  <Hoverable as="a" key={i} href={href} style={footerLink} hoverStyle={{ color: '#fff' }}>{label}</Hoverable>
                )
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 1200, margin: '40px auto 0', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>&copy; 2026 Buyit. All rights reserved.</span>
        <div style={{ display: 'flex', gap: 10 }}>
          <Hoverable as="a" href="#" aria-label="Twitter" style={social} hoverStyle={{ color: '#fff', background: 'rgba(255,255,255,0.1)' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-7 8 8.3 12h-6.5l-5-6.6L6 22H3l7.5-8.6L2.5 2h6.6l4.6 6.1z" /></svg>
          </Hoverable>
          <Hoverable as="a" href="#" aria-label="Instagram" style={social} hoverStyle={{ color: '#fff', background: 'rgba(255,255,255,0.1)' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
          </Hoverable>
          <Hoverable as="a" href="#" aria-label="LinkedIn" style={social} hoverStyle={{ color: '#fff', background: 'rgba(255,255,255,0.1)' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M6.94 7.5a1.94 1.94 0 1 1 0-3.88 1.94 1.94 0 0 1 0 3.88zM5.2 9h3.5v11H5.2zM10.7 9h3.35v1.5h.05c.47-.88 1.6-1.8 3.3-1.8 3.53 0 4.18 2.32 4.18 5.34V20h-3.5v-4.84c0-1.15-.02-2.64-1.6-2.64-1.6 0-1.85 1.25-1.85 2.55V20h-3.5z" /></svg>
          </Hoverable>
        </div>
      </div>
    </footer>
  );
}
