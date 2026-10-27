// Authentication & permission guard protecting administrative routes from unauthorized access
import { Navigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { useShop } from '../../context/ShopContext';

export default function AdminGuard({ children }) {
  const { isAuthenticated, currentAdmin, hasAdminPermission } = useAdmin();
  const { user } = useShop();
  const location = useLocation();

  // Protect administrative dashboard: if not an authenticated admin or if an ordinary customer, bounce to store homepage
  if (!isAuthenticated || !currentAdmin || (user && !user.isAdmin)) {
    return <Navigate to="/" replace />;
  }

  // Check route-specific permissions
  const pathname = location.pathname.toLowerCase();
  let requiredPermission = null;

  if (pathname.includes('/admin/products') || pathname.includes('/admin/categories')) {
    requiredPermission = 'products';
  } else if (pathname.includes('/admin/orders')) {
    requiredPermission = 'orders';
  } else if (pathname.includes('/admin/customers')) {
    requiredPermission = 'customers';
  } else if (pathname.includes('/admin/inventory')) {
    requiredPermission = 'inventory';
  } else if (pathname.includes('/admin/coupons')) {
    requiredPermission = 'coupons';
  } else if (pathname.includes('/admin/reviews')) {
    requiredPermission = 'reviews';
  } else if (pathname.includes('/admin/analytics')) {
    requiredPermission = 'analytics';
  } else if (pathname.includes('/admin/settings')) {
    requiredPermission = 'settings';
  } else if (pathname.includes('/admin/admins')) {
    requiredPermission = 'admins';
  }

  if (requiredPermission && !hasAdminPermission(requiredPermission)) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
