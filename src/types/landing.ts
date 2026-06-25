// Shared types for the Buyit landing page port.

export interface HeroStore {
  key: string;
  name: string;
  cat: string;
  rating: string;
  products: string;
  eta: string;
  status: 'Delivered' | 'Shipped' | 'Packing';
  statusColor: string; // hex
  accent1: string;     // hex (package cap stripe A)
  accent2: string;     // hex (package cap stripe B)
  glow: string;        // "r,g,b" used inside rgba()
}

export interface Stat {
  count: string;
  suffix: string;
  decimals: number;
  comma: boolean;
  prefix: string;
  label: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
  color: string; // css gradient
  rating: number;
}

export interface Step {
  n: string;
  title: string;
  text: string;
}

export interface OrderStage {
  name: string;
  bar: string;   // hex
  color: string; // css color
}

export interface Category {
  top: string;
  sub: string;
  dot: string; // hex
}

export interface Feature {
  title: string;
  text: string;
  tone: 'violet' | 'rose';
}

export type AuthMode = 'login' | 'register';
export type AuthRole = 'buyer' | 'seller';
