import HeroBanner from '../components/home/HeroBanner';
import TrustPillars from '../components/home/TrustPillars';
import CategoryPills from '../components/home/CategoryPills';
import BundleOfferSection from '../components/home/BundleOfferSection';
import PromotionalBanner from '../components/home/PromotionalBanner';
import ProductCatalog from '../components/catalog/ProductCatalog';
import GiftConcierge from '../components/home/GiftConcierge';
import SmartServicesBanner from '../components/home/SmartServicesBanner';
import FAQSection from '../components/home/FAQSection';
import { useEffect } from 'react';

export default function HomePage() {

  // Scroll window to top when homepage loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <main id="main-content">
      {/* Hero banner section with store highlights */}
      <HeroBanner />

      {/* Core trust and reliability pillars */}
      <TrustPillars />

      {/* Infinite scrolling category rail */}
      <CategoryPills />

      {/* Featured 4-in-1 Royal Bundle Package Offer */}
      <BundleOfferSection />

      {/* Promotional coupon and offer banner */}
      <PromotionalBanner />

      {/* Main interactive product catalog with filters */}
      <ProductCatalog showHeader={true} />

      {/* Personalized gift concierge section */}
      <GiftConcierge />

      {/* Smart interactive services banner for hospital bag and order tracking */}
      <SmartServicesBanner />

      {/* Frequently asked questions section */}
      <FAQSection />
    </main>
  );
}
