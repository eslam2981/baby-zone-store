import { createContext, useContext, useMemo } from 'react';
import { useShop } from './ShopContext';
import { useAdminUi } from '../hooks/admin/useAdminUi';
import { useAdminOrders } from '../hooks/admin/useAdminOrders';
import { useAdminCoupons } from '../hooks/admin/useAdminCoupons';
import { useAdminReviews } from '../hooks/admin/useAdminReviews';
import { useAdminSettings } from '../hooks/admin/useAdminSettings';
import { useAdminCustomers } from '../hooks/admin/useAdminCustomers';
import { useAdminRealtime } from '../hooks/admin/useAdminRealtime';
import { useAdminAuth } from '../hooks/admin/useAdminAuth';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const { addToast, user, setUser } = useShop();

  const adminUi = useAdminUi();
  const settingsState = useAdminSettings({ addToast });
  const reviewsState = useAdminReviews({ addToast });
  const couponsState = useAdminCoupons({ addToast });
  const ordersState = useAdminOrders({ addToast });

  const customersState = useAdminCustomers({
    orders: ordersState.orders,
    setOrders: ordersState.setOrders,
    setReviews: reviewsState.setReviews,
    user,
    setUser,
    addToast
  });

  const realtimeState = useAdminRealtime({
    setOrders: ordersState.setOrders,
    setIsLoadingOrders: ordersState.setIsLoadingOrders,
    setCustomers: customersState.setCustomers,
    setIsLoadingCustomers: customersState.setIsLoadingCustomers,
    setCoupons: couponsState.setCoupons,
    setIsLoadingCoupons: couponsState.setIsLoadingCoupons,
    setReviews: reviewsState.setReviews,
    setIsLoadingReviews: reviewsState.setIsLoadingReviews,
    setStoreSettings: settingsState.setStoreSettings,
    setAdmins: settingsState.setAdmins,
    addToast,
    user
  });

  const authState = useAdminAuth({
    user,
    setUser,
    admins: settingsState.admins,
    addToast,
    addActivity: realtimeState.addActivity
  });

  const value = useMemo(() => ({
    // Authentication
    isAuthenticated: authState.isAuthenticated,
    currentAdmin: authState.currentAdmin,
    loginAdmin: authState.loginAdmin,
    logoutAdmin: authState.logoutAdmin,
    hasAdminPermission: authState.hasAdminPermission,
    // Real-time synchronization
    isRealtimeConnected: realtimeState.isRealtimeConnected,
    isSyncing: realtimeState.isSyncing,
    lastSyncTime: realtimeState.lastSyncTime,
    refreshAllRealtimeData: realtimeState.refreshAllRealtimeData,
    isAudioAlertsEnabled: realtimeState.isAudioAlertsEnabled,
    toggleAudioAlerts: realtimeState.toggleAudioAlerts,
    // Orders
    orders: ordersState.orders,
    isLoadingOrders: ordersState.isLoadingOrders,
    updateOrderStatus: ordersState.updateOrderStatus,
    deleteOrder: ordersState.deleteOrder,
    addOrder: ordersState.addOrder,
    refreshOrders: ordersState.refreshOrders,
    // Customers
    customers: customersState.mergedCustomers,
    rawCustomers: customersState.customers,
    isLoadingCustomers: customersState.isLoadingCustomers,
    updateCustomer: customersState.updateCustomer,
    updateCustomerStatus: customersState.updateCustomerStatus,
    updateCustomerPermissions: customersState.updateCustomerPermissions,
    addCustomer: customersState.addCustomer,
    deleteCustomer: customersState.deleteCustomer,
    // Coupons
    coupons: couponsState.coupons,
    isLoadingCoupons: couponsState.isLoadingCoupons,
    addCoupon: couponsState.addCoupon,
    updateCoupon: couponsState.updateCoupon,
    toggleCouponStatus: couponsState.toggleCouponStatus,
    deleteCoupon: couponsState.deleteCoupon,
    // Reviews
    reviews: reviewsState.reviews,
    isLoadingReviews: reviewsState.isLoadingReviews,
    toggleReviewApproval: reviewsState.toggleReviewApproval,
    deleteReview: reviewsState.deleteReview,
    // Settings
    storeSettings: settingsState.storeSettings,
    updateStoreSettings: settingsState.updateStoreSettings,
    // Admins
    admins: settingsState.admins,
    addAdmin: settingsState.addAdmin,
    updateAdmin: settingsState.updateAdmin,
    deleteAdmin: settingsState.deleteAdmin,
    // Activity Log
    activityLog: realtimeState.activityLog,
    addActivity: realtimeState.addActivity,
    // UI states
    isSidebarCollapsed: adminUi.isSidebarCollapsed,
    setIsSidebarCollapsed: adminUi.setIsSidebarCollapsed,
    toggleSidebar: adminUi.toggleSidebar,
    isMobileSidebarOpen: adminUi.isMobileSidebarOpen,
    setIsMobileSidebarOpen: adminUi.setIsMobileSidebarOpen
  }), [
    authState,
    realtimeState,
    ordersState,
    customersState,
    couponsState,
    reviewsState,
    settingsState,
    adminUi
  ]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
