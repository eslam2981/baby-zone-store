// Application root mount entry point rendering strict mode app
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Security: Immediately sanitize and purge any sensitive administrator / internal data from localStorage
try {
  const SENSITIVE_STORAGE_KEYS = [
    'babyzone_activity_log',
    'babyzone_admin_coupons',
    'babyzone_admin_customers',
    'babyzone_admins_list',
    'babyzone_admin_user',
    'babyzone_admin_auth',
    'babyzone_admin_orders',
    'babyzone_admin_products',
    'babyzone_admin_categories',
    'babyzone_admin_inventory',
    'babyzone_admin_reviews',
    'babyzone_admin_settings'
  ];
  SENSITIVE_STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
  });

  // Verify and sanitize rawaa_user if it had admin privilege flags
  const storedUser = localStorage.getItem('rawaa_user');
  if (storedUser) {
    const parsed = JSON.parse(storedUser);
    if (parsed?.isAdmin) {
      localStorage.removeItem('rawaa_user');
    }
  }
} catch (e) {
  console.warn('Storage security sanitization:', e);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
