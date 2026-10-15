import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TopAnnouncement from '../components/common/TopAnnouncement';
import Header from '../components/common/Header';
import MegaMenu from '../components/common/MegaMenu';
import MobileNav from '../components/common/MobileNav';
import MobileBottomBar from '../components/common/MobileBottomBar';
import Footer from '../components/common/Footer';
import CartDrawer from '../components/cart/CartDrawer';
import WishlistDrawer from '../components/modals/WishlistDrawer';
import AuthModal from '../components/modals/AuthModal';
import QuickViewModal from '../components/catalog/QuickViewModal';
import ToastContainer from '../components/common/ToastContainer';
import WhatsAppButton from '../components/common/WhatsAppButton';

export default function MainLayout() {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-rawaa-bg flex flex-col font-sans text-rawaa-dark antialiased selection:bg-rawaa-primary selection:text-white">
      {/* Top announcement banner for active offers */}
      <TopAnnouncement />

      {/* Main site header with navigation and actions */}
      <Header
        isMegaMenuOpen={isMegaMenuOpen}
        onOpenMegaMenu={() => setIsMegaMenuOpen((prev) => !prev)}
      />

      {/* Mega menu modal for store categories */}
      <MegaMenu
        isOpen={isMegaMenuOpen}
        onClose={() => setIsMegaMenuOpen(false)}
      />

      {/* Mobile slide navigation drawer */}
      <MobileNav />

      {/* Routed page container with bottom safe padding */}
      <div className="flex-1 pb-20 lg:pb-0">
        <Outlet />
      </div>

      {/* Store footer with links and payment badges */}
      <Footer />

      {/* Interactive global drawers and dialogs */}
      <CartDrawer />
      <WishlistDrawer />
      <AuthModal />
      <QuickViewModal />

      {/* Mobile bottom navigation bar */}
      <MobileBottomBar />

      {/* Floating feedback toast notifications */}
      <ToastContainer />

      {/* Floating circular whatsapp button */}
      <WhatsAppButton />
    </div>
  );
}
