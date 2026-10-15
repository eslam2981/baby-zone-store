import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ShopProvider } from './context/ShopContext';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import TrackOrderPage from './pages/TrackOrderPage';
import HospitalBagPage from './pages/HospitalBagPage';

export default function App() {
  return (
    <ShopProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            {/* Default home landing page route */}
            <Route index element={<HomePage />} />

            {/* Category catalog route with sidebar filters */}
            <Route path="category/:categoryId" element={<CategoryPage />} />

            {/* Dedicated product detail page route */}
            <Route path="product/:productId" element={<ProductDetailsPage />} />

            {/* Live package and order tracking route */}
            <Route path="track-order" element={<TrackOrderPage />} />

            {/* Interactive hospital bag and newborn checklist route */}
            <Route path="hospital-bag" element={<HospitalBagPage />} />

            {/* Catch all route redirecting back to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ShopProvider>
  );
}
