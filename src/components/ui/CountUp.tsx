import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

/**
 * CountUp — animates a number from 0 to `to` the first time it scrolls into
 * view (and immediately on load if already visible). Uses an IntersectionObserver
 * so it fires on reload or on appearance, then disconnects — it animates once.
 *
 * Easing is ease-out cubic, so the count decelerates as it approaches the target.
 * An optional `delay` holds the count at 0 after it enters view (e.g. to let a
 * fade-in settle first). Honours prefers-reduced-motion by jumping to the value.
 *
 * Usage:
 *   <CountUp to={12400} comma suffix="+" />            // 12,400+
 *   <CountUp to={480} suffix="K+" />                   // 480K+
 *   <CountUp to={3.2} decimals={1} suffix="M+" />      // 3.2M+
 *   <CountUp to={4.9} decimals={1} prefix={'★ '} /> // ★ 4.9
 */
interface CountUpProps {
  /** Final value to count to. */
  to: number;
  /** Decimal places to display (0 = integer). */
  decimals?: number;
  /** Group the integer part with thousands separators. */
  comma?: boolean;
  /** Text rendered before the number (e.g. '★ '). */
  prefix?: string;
  /** Text rendered after the number (e.g. 'K+'). */
  suffix?: string;
  /** Animation length in milliseconds. */
  duration?: number;
  /** Delay in milliseconds between entering view and the count starting. */
  delay?: number;
  /** Fraction of the element that must be visible before it starts. */
  threshold?: number;
  className?: string;
  style?: CSSProperties;
}

const format = (value: number, decimals: number, comma: boolean): string => {
  let out = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
  if (comma) {
    const parts = out.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    out = parts.join('.');
  }
  return out;
};

// Fast start, gentle landing — slows down near the end.
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function CountUp({
  to,
  decimals = 0,
  comma = false,
  prefix = '',
  suffix = '',
  duration = 1700,
  delay = 0,
  threshold = 0.3,
  className,
  style,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  // Reduced-motion users skip the animation and see the final value immediately.
  const [value, setValue] = useState(() => (prefersReducedMotion() ? to : 0));

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let raf = 0;
    let timer = 0;
    let started = false;

    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        setValue(to * easeOutCubic(p));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          started = true;
          observer.disconnect();
          if (delay > 0) timer = window.setTimeout(run, delay);
          else run();
        }
      },
      { threshold },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [to, duration, delay, threshold]);

  return (
    <span ref={ref} className={className} style={style}>
      {prefix}
      {format(value, decimals, comma)}
      {suffix}
    </span>
  );
}
