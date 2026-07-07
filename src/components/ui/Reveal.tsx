import { useEffect, useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';

/**
 * Reveal — fades + slides its children up the first time they scroll into view
 * (then stays put), the same idea as the landing page's data-reveal cascade.
 *
 * It animates a WRAPPER element, so children keep their own transforms (e.g. an
 * .admin-lift hover) without conflict. `delay` (ms) staggers a row of cards.
 * Honours prefers-reduced-motion by rendering visible immediately.
 */
export function Reveal({
  children,
  delay = 0,
  style,
}: {
  children: ReactNode;
  delay?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) return; // leave visible

    el.style.opacity = '0';
    el.style.transform = 'translateY(22px)';
    el.style.transition =
      'opacity .6s cubic-bezier(.2,.7,.2,1), transform .6s cubic-bezier(.2,.7,.2,1)';

    let timer = 0;
    const obs = new IntersectionObserver(
      (entries, o) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          timer = window.setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'none';
          }, delay);
          o.unobserve(el); // reveal once
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -8% 0px' },
    );
    obs.observe(el);

    return () => {
      clearTimeout(timer);
      obs.disconnect();
    };
  }, [delay]);

  return (
    <div ref={ref} style={style}>
      {children}
    </div>
  );
}
