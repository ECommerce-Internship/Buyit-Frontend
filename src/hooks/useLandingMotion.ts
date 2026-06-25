import { useEffect } from 'react';

/**
 * useLandingMotion — ports the imperative bits of the original design:
 *   1. data-reveal  : staggered fade/slide-in cascade in document order
 *   2. data-depth   : pointer parallax inside the [data-hero] element
 *
 * (Stat count-up now lives in the reusable <CountUp> component.)
 *
 * Attach the returned ref to the page root. Honours prefers-reduced-motion.
 *
 * NOTE FOR PORT: this is a faithful 1:1 reproduction of the source's
 * querySelector-driven approach. In a greenfield React build you'd likely
 * swap this for an IntersectionObserver hook + a <Reveal> wrapper component.
 */
export function useLandingMotion(rootRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- Reveal cascade --------------------------------------------------
    const els = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
    const timers: number[] = [];

    if (reduced) {
      els.forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    } else {
      els.forEach((el) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(26px)';
        el.style.transition =
          'opacity .7s cubic-bezier(.2,.7,.2,1), transform .7s cubic-bezier(.2,.7,.2,1)';
      });
      const reveal = (el: HTMLElement, delay: number) => {
        const t = window.setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'none';
        }, delay);
        timers.push(t);
      };
      const vh = window.innerHeight || 800;
      els.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        const extra = parseFloat(el.getAttribute('data-delay') || '0');
        const base = r.top < vh ? i * 70 : 220 + i * 45;
        reveal(el, base + extra);
      });
    }

    // --- Pointer parallax ------------------------------------------------
    let onMove: ((e: MouseEvent) => void) | null = null;
    const hero = root.querySelector<HTMLElement>('[data-hero]');
    if (!reduced && hero) {
      onMove = (e: MouseEvent) => {
        const r = hero.getBoundingClientRect();
        const cx = (e.clientX - r.left) / r.width - 0.5;
        const cy = (e.clientY - r.top) / r.height - 0.5;
        hero.querySelectorAll<HTMLElement>('[data-depth]').forEach((el) => {
          const d = parseFloat(el.getAttribute('data-depth') || '0');
          el.style.transform = `translate(${cx * d}px,${cy * d}px)`;
        });
      };
      hero.addEventListener('mousemove', onMove);
    }

    return () => {
      timers.forEach(clearTimeout);
      if (hero && onMove) hero.removeEventListener('mousemove', onMove);
    };
  }, [rootRef]);
}
