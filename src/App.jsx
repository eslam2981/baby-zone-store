import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ShopProvider } from './context/ShopContext';
import { AdminProvider } from './context/AdminContext';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import TrackOrderPage from './pages/TrackOrderPage';
import HospitalBagPage from './pages/HospitalBagPage';
import ScrollToTop from './components/common/ScrollToTop';
import ErrorBoundary from './components/common/ErrorBoundary';

/* Administrative layout and authentication guard imports */
import AdminGuard from './components/admin/AdminGuard';
import AdminLayout from './layouts/admin/AdminLayout';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminInventoryPage from './pages/admin/AdminInventoryPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminAdminsPage from './pages/admin/AdminAdminsPage';

/* Root application component configuring global providers and routing */
export default function App() {
  return (
    <ErrorBoundary>
      <ShopProvider>
        <AdminProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
            {/* Storefront customer-facing routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="category/:categoryId" element={<CategoryPage />} />
              <Route path="product/:productId" element={<ProductDetailsPage />} />
              <Route path="track-order" element={<TrackOrderPage />} />
              <Route path="hospital-bag" element={<HospitalBagPage />} />
            </Route>

            {/* Admin login route */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Protected admin dashboard nested routes */}
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <AdminLayout />
                </AdminGuard>
              }
            >
              <Route index element={<AdminOverviewPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="customers" element={<AdminCustomersPage />} />
              <Route path="inventory" element={<AdminInventoryPage />} />
              <Route path="coupons" element={<AdminCouponsPage />} />
              <Route path="reviews" element={<AdminReviewsPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="admins" element={<AdminAdminsPage />} />
            </Route>

            {/* Fallback route redirecting unknown paths to homepage */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AdminProvider>
    </ShopProvider>
  </ErrorBoundary>
  );
}
