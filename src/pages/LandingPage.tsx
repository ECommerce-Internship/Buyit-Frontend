import { useRef } from 'react';
import { useLandingMotion } from '../hooks/useLandingMotion';
import { Nav } from '../components/Nav';
import { Hero } from '../components/Hero';
import { TrustStrip } from '../components/TrustStrip';
import { Features } from '../components/Features';
import { ForBuyers } from '../components/ForBuyers';
import { ForSellers } from '../components/ForSellers';
import { SellerDashboard } from '../components/SellerDashboard';
import { HowItWorks } from '../components/HowItWorks';
import { CategoriesMarquee } from '../components/CategoriesMarquee';
import { Testimonials } from '../components/Testimonials';
import { FinalCTA } from '../components/FinalCTA';
import { Footer } from '../components/Footer';

/**
 * The Buyit marketing landing page. The auth modal is provided globally by
 * <AuthModalProvider> (see App.tsx); any CTA opens it via useAuthModal().
 */
export function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  useLandingMotion(rootRef);

  return (
    <div
      ref={rootRef}
      id="buyit-root"
      style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif", background: '#0a0a12', color: '#15131f', overflowX: 'hidden' }}
    >
      <Nav />
      <Hero />
      <TrustStrip />
      <Features />
      <ForBuyers />
      <ForSellers />
      <SellerDashboard />
      <HowItWorks />
      <CategoriesMarquee />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </div>
  );
}
