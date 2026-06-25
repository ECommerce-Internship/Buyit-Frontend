// All placeholder/mock data for the Buyit landing page.
// MOCKED: every array below is static seed content — wire to real APIs as needed.

import type {
  HeroStore, Stat, Testimonial, Step, OrderStage, Category, Feature,
} from '../types/landing';

// Ring of stores the hero "radar" sweeps through.
export const heroStores: HeroStore[] = [
  { key: 'tech',    name: 'Nova Tech',    cat: 'Electronics',      rating: '4.9', products: '1,240', eta: '2-day', status: 'Delivered', statusColor: '#6ee7a0', accent1: '#a78bfa', accent2: '#6366f1', glow: '124,58,237' },
  { key: 'home',    name: 'Bloom Home',   cat: 'Home & Living',    rating: '4.8', products: '860',   eta: '3-day', status: 'Shipped',   statusColor: '#6d8cff', accent1: '#ff8a4c', accent2: '#ff4d6d', glow: '255,77,109' },
  { key: 'fashion', name: 'V612 Studio',  cat: 'Fashion & Apparel',rating: '4.7', products: '2,410', eta: '2-day', status: 'Delivered', statusColor: '#6ee7a0', accent1: '#22d3ee', accent2: '#6366f1', glow: '34,211,238' },
  { key: 'beauty',  name: 'Lumen Beauty', cat: 'Cosmetics',        rating: '4.9', products: '540',   eta: '1-day', status: 'Packing',   statusColor: '#ffb24d', accent1: '#f472b6', accent2: '#a78bfa', glow: '244,114,182' },
  { key: 'sports',  name: 'Apex Sports',  cat: 'Outdoor & Fitness',rating: '4.6', products: '970',   eta: '2-day', status: 'Delivered', statusColor: '#6ee7a0', accent1: '#34d399', accent2: '#22d3ee', glow: '52,211,153' },
];

export const stats: Stat[] = [
  { count: '12400', suffix: '+',  decimals: 0, comma: true,  prefix: '',   label: 'Active stores' },
  { count: '480',   suffix: 'K+', decimals: 0, comma: false, prefix: '',   label: 'Products listed' },
  { count: '3.2',   suffix: 'M+', decimals: 1, comma: false, prefix: '',   label: 'Orders delivered' },
  { count: '4.9',   suffix: '',   decimals: 1, comma: false, prefix: '\u2605 ', label: 'Avg. seller rating' },
];

export const testimonials: Testimonial[] = [
  { quote: "I check out once and three different stores ship my order separately. It just works — and I can track each one.", name: 'Maya Chen',     role: 'Buyer · Seattle',    initials: 'MC', color: 'linear-gradient(135deg,#8b5cf6,#6366f1)', rating: 5 },
  { quote: "Opening my store took an afternoon. The AI wrote every product description and my listings ranked almost immediately.", name: 'Diego Alvarez', role: 'Seller · Nova Tech',  initials: 'DA', color: 'linear-gradient(135deg,#ff8a4c,#ff4d6d)', rating: 5 },
  { quote: "Low-stock alerts saved me from overselling during a launch. The dashboard is genuinely the best I've used.", name: 'Priya Nair',    role: 'Seller · Bloom Home', initials: 'PN', color: 'linear-gradient(135deg,#22d3ee,#6366f1)', rating: 5 },
  { quote: "Coupons, reviews, refunds — everything I expect from a big retailer, but across thousands of small shops.", name: 'Sam Okafor',    role: 'Buyer · London',     initials: 'SO', color: 'linear-gradient(135deg,#a78bfa,#ff6b81)', rating: 5 },
];

export const buyerPoints: { text: string }[] = [
  { text: 'Browse hierarchical categories with search & filters' },
  { text: 'One shopping cart spanning many independent stores' },
  { text: 'Apply platform or store coupons at secure checkout' },
  { text: 'Track every order and cancel a single store\u2019s order' },
  { text: 'Leave verified 1\u20135 star reviews after delivery' },
];

export const sellerPoints: { text: string }[] = [
  { text: 'Open a store \u2014 Pending until an admin approves it' },
  { text: 'Generate listings, copy & SEO with Gemini AI' },
  { text: 'Real-time inventory with low-stock thresholds' },
  { text: 'Bulk import catalogs via Excel & SFTP' },
  { text: 'Fulfill per-store orders: Confirmed \u2192 Shipped \u2192 Delivered' },
];

export const orderStages: OrderStage[] = [
  { name: 'Pending',   bar: '#6ee7a0', color: 'rgba(255,255,255,0.7)' },
  { name: 'Confirmed', bar: '#6ee7a0', color: 'rgba(255,255,255,0.7)' },
  { name: 'Shipped',   bar: '#6ee7a0', color: 'rgba(255,255,255,0.7)' },
  { name: 'Delivered', bar: '#6ee7a0', color: '#6ee7a0' },
];

export const buyerSteps: Step[] = [
  { n: '1', title: 'Discover',         text: 'Search and filter across thousands of stores and categories to find exactly what you want.' },
  { n: '2', title: 'Add to cart',      text: 'Mix products from many sellers in one cart and apply coupons at checkout.' },
  { n: '3', title: 'Get it delivered', text: 'Each store ships independently; track every delivery from one place.' },
];

export const sellerSteps: Step[] = [
  { n: '1', title: 'Open store',     text: 'Create your store in minutes \u2014 it goes live once an admin approves it.' },
  { n: '2', title: 'List with AI',   text: 'Auto-generate descriptions, marketing copy and SEO, or bulk import your catalog.' },
  { n: '3', title: 'Fulfill & grow', text: 'Process per-store orders and watch revenue climb on your dashboard.' },
];

export const categories: Category[] = [
  { top: 'Electronics',   sub: 'Laptops',     dot: '#8b5cf6' },
  { top: 'Fashion',       sub: 'Sneakers',    dot: '#ff5e6c' },
  { top: 'Home & Living', sub: 'Decor',       dot: '#ffb24d' },
  { top: 'Beauty',        sub: 'Skincare',    dot: '#22d3ee' },
  { top: 'Sports',        sub: 'Fitness',     dot: '#6366f1' },
  { top: 'Toys & Games',  sub: 'Board games', dot: '#a78bfa' },
  { top: 'Books',         sub: 'Fiction',     dot: '#ff8a4c' },
  { top: 'Grocery',       sub: 'Pantry',      dot: '#6ee7a0' },
  { top: 'Automotive',    sub: 'Accessories', dot: '#8b5cf6' },
  { top: 'Pet Supplies',  sub: 'Food',        dot: '#ff5e6c' },
];

// Feature copy; icons live in Features.tsx (one inline SVG per index, in order).
export const features: Feature[] = [
  { title: 'Multi-Seller Marketplace', text: 'Every customer order fans out into independent per-store orders, each fulfilled separately by its seller.', tone: 'violet' },
  { title: 'AI Product Content',       text: 'Sellers auto-generate descriptions, marketing copy and SEO with Google Gemini in seconds.', tone: 'rose' },
  { title: 'Smart Inventory',          text: 'Real-time stock, low-stock alerts, custom thresholds, and overselling protection built in.', tone: 'violet' },
  { title: 'Secure Auth & Roles',      text: 'Email/password and Google sign-in, role-based access for Customer, Seller & Admin, refresh-token sessions across devices.', tone: 'violet' },
  { title: 'Coupons & Discounts',      text: 'Platform-wide or store-specific promo codes, applied right in the cart at checkout.', tone: 'rose' },
  { title: 'Reviews & Ratings',        text: 'Verified-buyer 1\u20135 star reviews with admin moderation keep quality high and trust real.', tone: 'rose' },
  { title: 'Payments & Refunds',       text: 'Credit card, debit card and PayPal, with refunds and full payment status tracking.', tone: 'violet' },
  { title: 'Bulk Catalog Import',      text: 'Sellers import entire catalogs via Excel upload and SFTP \u2014 thousands of products in minutes.', tone: 'violet' },
];
