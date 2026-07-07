import { useEffect } from 'react';

/**
 * useLandingMotion — ports the imperative bits of the original design:
 *   1. data-reveal  : fade/slide-in each element AS IT SCROLLS INTO VIEW
 *   2. data-depth   : pointer parallax inside the [data-hero] element
 *
 * (Stat count-up now lives in the reusable <CountUp> component.)
 *
 * Attach the returned ref to the page root. Honours prefers-reduced-motion.
 *
 * Reveal is driven by an IntersectionObserver: every [data-reveal] element starts
 * hidden and animates in the first time it enters the viewport (then is unobserved
 * so it only plays once). Elements already on screen at load reveal immediately.
 * `data-delay` (ms) adds a per-element offset; items entering together stagger.
 */
export function useLandingMotion(rootRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- Scroll-triggered reveal ----------------------------------------
    const els = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
    const timers: number[] = [];
    let observer: IntersectionObserver | null = null;

    const show = (el: HTMLElement, delay: number) => {
      const t = window.setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      }, delay);
      timers.push(t);
    };

    if (reduced || !('IntersectionObserver' in window)) {
      // No motion (or no IO support): just make everything visible.
      els.forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    } else {
      els.forEach((el) => {
        // data-reveal="pop" scales in (for badges/chips); the default slides up.
        const pop = el.getAttribute('data-reveal') === 'pop';
        el.style.opacity = '0';
        el.style.transform = pop ? 'scale(.5)' : 'translateY(26px)';
        el.style.transition = pop
          ? 'opacity .45s ease, transform .45s cubic-bezier(.34,1.56,.64,1)' // overshoot = "pop"
          : 'opacity .7s cubic-bezier(.2,.7,.2,1), transform .7s cubic-bezier(.2,.7,.2,1)';
      });

      observer = new IntersectionObserver(
        (entries, obs) => {
          // Stagger the items that cross into view together for a cascade feel.
          entries
            .filter((e) => e.isIntersecting)
            .forEach((entry, i) => {
              const el = entry.target as HTMLElement;
              const extra = parseFloat(el.getAttribute('data-delay') || '0');
              show(el, extra + i * 80);
              obs.unobserve(el); // reveal once
            });
        },
        // Trigger a touch before the element is fully in view.
        { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
      );
      els.forEach((el) => observer!.observe(el));
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
      observer?.disconnect();
      if (hero && onMove) hero.removeEventListener('mousemove', onMove);
    };
  }, [rootRef]);
}
