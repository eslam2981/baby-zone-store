import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import {
  initialStoreSettings,
  initialAdmins
} from '../data/adminData';
import {
  ordersApi,
  customersApi,
  couponsApi,
  reviewsApi,
  storeSettingsApi,
  adminsApi,
  activityLogApi
} from '../services/api';
import { useShop } from './ShopContext';
import { DEFAULT_CUSTOMER_PERMISSIONS } from '../constants/permissions';

const AdminContext = createContext(null);

import {
  formatDbOrder,
  formatDbCustomer,
  formatDbCoupon,
  formatDbReview,
  formatDbAdmin,
  formatDbSettings
} from '../utils/mappers';
import { syncBus } from '../utils/syncBus';
export function AdminProvider({ children }) {
  const { allProducts, categories, addToast, user, setUser } = useShop();

  // Authentication state for administrative access (session-only, never persisted in localStorage)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const isAuth = sessionStorage.getItem('babyzone_admin_auth') === 'true';
      return Boolean(isAuth);
    } catch {
      return false;
    }
  });

  const [currentAdmin, setCurrentAdmin] = useState(() => {
    try {
      const isAuth = sessionStorage.getItem('babyzone_admin_auth') === 'true';
      if (!isAuth) return null;
      const saved = sessionStorage.getItem('babyzone_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Automatically reset admin state whenever storefront user is logged out or not an admin
  useEffect(() => {
    if (!user || !user.isAdmin) {
      setIsAuthenticated(false);
      setCurrentAdmin(null);
      try {
        sessionStorage.removeItem('babyzone_admin_auth');
        sessionStorage.removeItem('babyzone_admin_user');
        localStorage.removeItem('babyzone_admin_auth');
        localStorage.removeItem('babyzone_admin_user');
        localStorage.removeItem('babyzone_admins_list');
        localStorage.removeItem('babyzone_activity_log');
        localStorage.removeItem('babyzone_admin_coupons');
        localStorage.removeItem('babyzone_admin_customers');
      } catch {}
    }
  }, [user]);

  // Sidebar UI states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Reactive orders state synchronized with Supabase
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Initial fetch and real-time synchronization from Supabase orders table
  useEffect(() => {
    let isMounted = true;
    async function loadOrders() {
      try {
        setIsLoadingOrders(true);
        const data = await ordersApi.getAll();

        if (isMounted) {
          if (Array.isArray(data)) {
            const active = data.filter(
              (o) => o.status !== 'محذوف' && !o.id.startsWith('EGY-TEST') && o.id !== 'EGY-98421'
            );
            setOrders(active.map(formatDbOrder));
          } else {
            setOrders([]);
          }
        }
      } catch (err) {
        console.error('Error fetching orders from Supabase:', err);
      } finally {
        if (isMounted) setIsLoadingOrders(false);
      }
    }

    loadOrders();

    const channel = supabase
      .channel('realtime_orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            if (payload.new.status !== 'محذوف') {
              const newOrd = formatDbOrder(payload.new);
              setOrders((prev) => [newOrd, ...prev.filter((o) => o.id !== newOrd.id)]);
              syncBus.emit('ORDER_ADDED', { orderId: newOrd.id, order: newOrd, timestamp: Date.now() });
            }
          } else if (payload.eventType === 'UPDATE') {
            if (payload.new.status === 'محذوف') {
              setOrders((prev) => prev.filter((o) => o.id !== payload.new.id));
              syncBus.emit('ORDER_DELETED', { orderId: payload.new.id, timestamp: Date.now() });
            } else {
              const updatedOrd = formatDbOrder(payload.new);
              setOrders((prev) =>
                prev.map((o) => (o.id === updatedOrd.id ? updatedOrd : o))
              );
              syncBus.emit('ORDER_UPDATED', {
                orderId: payload.new.id,
                newStatus: payload.new.status,
                timestamp: Date.now()
              });
            }
          } else if (payload.eventType === 'DELETE') {
            setOrders((prev) => prev.filter((o) => o.id !== payload.old.id));
            syncBus.emit('ORDER_DELETED', { orderId: payload.old.id, timestamp: Date.now() });
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Server-driven customers state synchronized with Supabase Cloud
  const [customers, setCustomers] = useState([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadCustomers() {
      try {
        setIsLoadingCustomers(true);
        const data = await customersApi.getAll();

        if (isMounted) {
          if (Array.isArray(data)) {
            setCustomers(data.map(formatDbCustomer));
          } else {
            setCustomers([]);
          }
        }
      } catch (err) {
        console.warn('Notice loading customers from API:', err);
      } finally {
        if (isMounted) setIsLoadingCustomers(false);
      }
    }

    loadCustomers();

    const customerChannel = supabase
      .channel('realtime_customers')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customers' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newCust = formatDbCustomer(payload.new);
            setCustomers((prev) => [newCust, ...prev.filter((c) => c.id !== newCust.id)]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedCust = formatDbCustomer(payload.new);
            setCustomers((prev) =>
              prev.map((c) => (c.id === updatedCust.id ? updatedCust : c))
            );
          } else if (payload.eventType === 'DELETE') {
            setCustomers((prev) => prev.filter((c) => c.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(customerChannel);
    };
  }, []);

  // Server-driven coupons state synchronized with Supabase
  const [coupons, setCoupons] = useState([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadCoupons() {
      try {
        const data = await couponsApi.getAll();
        if (isMounted && Array.isArray(data)) {
          setCoupons(data.map(formatDbCoupon));
        }
      } catch (e) {
        console.warn('Coupons API notice:', e.message);
      } finally {
        if (isMounted) {
          setIsLoadingCoupons(false);
        }
      }
    }
    loadCoupons();

    const channel = supabase
      .channel('realtime_coupons')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'coupons' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const cp = formatDbCoupon(payload.new);
          setCoupons((prev) => [cp, ...prev.filter((c) => c.id !== cp.id)]);
        } else if (payload.eventType === 'UPDATE') {
          const cp = formatDbCoupon(payload.new);
          setCoupons((prev) => prev.map((c) => (c.id === cp.id ? cp : c)));
        } else if (payload.eventType === 'DELETE') {
          setCoupons((prev) => prev.filter((c) => c.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Server-driven reviews state synchronized with Supabase
  const [reviews, setReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadReviews() {
      try {
        const data = await reviewsApi.getAll();
        if (isMounted && Array.isArray(data)) {
          setReviews(data.map(formatDbReview));
        }
      } catch (e) {
        console.warn('Reviews API notice:', e.message);
      } finally {
        if (isMounted) {
          setIsLoadingReviews(false);
        }
      }
    }
    loadReviews();

    const channel = supabase
      .channel('realtime_reviews')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const rev = formatDbReview(payload.new);
          setReviews((prev) => [rev, ...prev.filter((r) => r.id !== rev.id)]);
        } else if (payload.eventType === 'UPDATE') {
          const rev = formatDbReview(payload.new);
          setReviews((prev) => prev.map((r) => (r.id === rev.id ? rev : r)));
        } else if (payload.eventType === 'DELETE') {
          setReviews((prev) => prev.filter((r) => r.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Server-driven store settings state synchronized with Supabase
  const [storeSettings, setStoreSettings] = useState(initialStoreSettings);

  useEffect(() => {
    let isMounted = true;
    async function loadSettings() {
      try {
        const data = await storeSettingsApi.get();
        if (isMounted && data) {
          setStoreSettings(formatDbSettings(data));
        }
      } catch (e) {
        console.warn('Store settings API notice:', e.message);
      }
    }
    loadSettings();

    const channel = supabase
      .channel('realtime_store_settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'store_settings' }, (payload) => {
        if (payload.new) {
          setStoreSettings(formatDbSettings(payload.new));
        }
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Server-driven administrative team members state
  // Server-driven administrative team members state (strictly in-memory and Supabase Cloud)
  const [admins, setAdmins] = useState(initialAdmins);

  useEffect(() => {
    let isMounted = true;
    async function loadAdmins() {
      try {
        const data = await adminsApi.getAll();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setAdmins((prev) => {
            const apiAdmins = data.map(formatDbAdmin);
            const merged = apiAdmins.map((adm) => {
              const localMatch = prev.find(
                (p) => p.id === adm.id || p.email.toLowerCase() === adm.email.toLowerCase()
              );
              const resolvedPassword = adm.password || localMatch?.password || null;

              return {
                ...adm,
                password: resolvedPassword
              };
            });

            for (const p of prev) {
              if (!merged.some((m) => m.id === p.id || m.email.toLowerCase() === p.email.toLowerCase())) {
                merged.push(p);
              }
            }
            return merged;
          });
        }
      } catch (e) {
        console.warn('Admins API notice:', e.message);
      }
    }
    loadAdmins();

    const channel = supabase
      .channel('realtime_admins')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admins' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const adm = formatDbAdmin(payload.new);
          setAdmins((prev) => {
            const localMatch = prev.find((p) => p.id === adm.id || p.email.toLowerCase() === adm.email.toLowerCase());
            const resolved = {
              ...adm,
              password: adm.password || localMatch?.password || null
            };
            return [resolved, ...prev.filter((a) => a.id !== adm.id && a.email.toLowerCase() !== adm.email.toLowerCase())];
          });
        } else if (payload.eventType === 'UPDATE') {
          const adm = formatDbAdmin(payload.new);
          setAdmins((prev) => {
            const localMatch = prev.find((p) => p.id === adm.id || p.email.toLowerCase() === adm.email.toLowerCase());
            const resolved = {
              ...adm,
              password: adm.password || localMatch?.password || null
            };
            return prev.map((a) => (a.id === adm.id ? resolved : a));
          });
        } else if (payload.eventType === 'DELETE') {
          setAdmins((prev) => prev.filter((a) => a.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Server-driven activity log state
  const [activityLog, setActivityLog] = useState([]);

  useEffect(() => {
    let isMounted = true;
    async function loadActivityLog() {
      try {
        const data = await activityLogApi.getAll();
        if (isMounted && Array.isArray(data)) {
          setActivityLog(data.map((entry) => ({
            id: entry.id,
            adminName: entry.admin_name,
            action: entry.action,
            target: entry.target,
            time: entry.created_at ? new Date(entry.created_at).toLocaleTimeString('ar-EG') : 'الآن',
            type: entry.type || 'general'
          })));
        }
      } catch (e) {
        console.warn('Activity log API notice:', e.message);
      }
    }
    loadActivityLog();

    const channel = supabase
      .channel('realtime_activity_log')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_log' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const entry = {
            id: payload.new.id,
            adminName: payload.new.admin_name,
            action: payload.new.action,
            target: payload.new.target,
            time: 'الآن',
            type: payload.new.type || 'general'
          };
          setActivityLog((prev) => [entry, ...prev.filter((a) => a.id !== entry.id)]);
        }
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Activity logger helper
  const addActivity = async (action, target, type = 'general') => {
    const adminName = currentAdmin ? currentAdmin.name : 'مدير النظام';
    const newAct = {
      id: `act-${Date.now()}`,
      adminName,
      action,
      target,
      time: 'الآن',
      type
    };
    setActivityLog((prev) => [newAct, ...prev]);
    try {
      await activityLogApi.add(adminName, action, target, type);
    } catch (e) {
      // Activity logging failure should not break app flow
    }
  };

  const hasAdminPermission = (requiredPerm) => {
    if (!isAuthenticated || !currentAdmin) return false;
    const perms = currentAdmin.permissions || [];
    if (perms.includes('all') || perms.includes('*') || currentAdmin.role?.includes('Super Admin')) {
      return true;
    }
    if (Array.isArray(requiredPerm)) {
      return requiredPerm.some((p) => perms.includes(p));
    }
    return perms.includes(requiredPerm);
  };

  // Admin authentication handlers
  // Secure session establishment helper
  const establishAdminSession = (adminProfile) => {
    setCurrentAdmin(adminProfile);
    setIsAuthenticated(true);

    try {
      sessionStorage.setItem('babyzone_admin_auth', 'true');
      sessionStorage.setItem('babyzone_admin_user', JSON.stringify({
        id: adminProfile.id,
        name: adminProfile.name,
        email: adminProfile.email,
        role: adminProfile.role,
        permissions: adminProfile.permissions
      }));
      // Purge any lingering localStorage keys to ensure zero sensitive data remains
      localStorage.removeItem('babyzone_admin_auth');
      localStorage.removeItem('babyzone_admin_user');
      localStorage.removeItem('babyzone_admins_list');
      localStorage.removeItem('babyzone_activity_log');
      localStorage.removeItem('babyzone_admin_coupons');
      localStorage.removeItem('babyzone_admin_customers');
    } catch (e) {
      console.warn('Storage save error:', e);
    }

    if (setUser) {
      setUser({
        email: adminProfile.email,
        name: adminProfile.name,
        isAdmin: true,
        role: adminProfile.role,
        permissions: adminProfile.permissions || ['all'],
        loggedInAt: new Date().toISOString()
      });
    }

    addActivity('تسجيل الدخول إلى لوحة التحكم', `بواسطة ${adminProfile.name} (${adminProfile.role})`, 'auth');
    if (addToast) {
      addToast(`مرحباً بك يا ${adminProfile.name} في لوحة تحكم بيبي زون`, 'success');
    }
    return { success: true, admin: adminProfile };
  };

  // Secure admin authentication handlers with Supabase Auth integration
  const loginAdmin = async (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanEmail || !cleanPass) {
      return { success: false, error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' };
    }

    // 1. Primary: Verify credentials securely with Supabase Auth server (JWT verification)
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPass
      });

      if (!authError && authData?.user) {
        const matchingAdmin = admins.find(
          (a) => a.email && a.email.trim().toLowerCase() === cleanEmail
        );
        const adminProfile = matchingAdmin || {
          id: authData.user.id,
          name: authData.user.user_metadata?.full_name || 'مدير النظام',
          email: authData.user.email,
          role: authData.user.user_metadata?.role || 'مدير النظام (Super Admin)',
          permissions: ['all'],
          lastLogin: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        };
        return establishAdminSession(adminProfile);
      }
    } catch (authErr) {
      console.warn('Supabase Auth sign-in notice:', authErr?.message);
    }

    // 2. Secondary: Authenticate against admins team database record
    const foundAdmin = admins.find(
      (a) => a.email && a.email.trim().toLowerCase() === cleanEmail
    );

    const envAdminEmail = (import.meta.env.VITE_ADMIN_EMAIL || 'admin@babyzone-egypt.com').trim().toLowerCase();
    const isSuperAdminEmail = cleanEmail === envAdminEmail || (foundAdmin && foundAdmin.role?.includes('Super Admin'));

    if (!foundAdmin && !isSuperAdminEmail) {
      return { success: false, error: 'البريد الإلكتروني غير مسجل ضمن فريق الإدارة' };
    }

    const isDbPasswordMatch = Boolean(foundAdmin?.password && cleanPass === foundAdmin.password);

    if (!isDbPasswordMatch) {
      return { success: false, error: 'كلمة المرور غير صحيحة' };
    }

    const adminProfile = {
      ...foundAdmin,
      lastLogin: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    return establishAdminSession(adminProfile);
  };

  const logoutAdmin = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase sign-out notice:', e);
    }
    setIsAuthenticated(false);
    setCurrentAdmin(null);
    try {
      sessionStorage.removeItem('babyzone_admin_auth');
      sessionStorage.removeItem('babyzone_admin_user');
      localStorage.removeItem('babyzone_admin_auth');
      localStorage.removeItem('babyzone_admin_user');
      localStorage.removeItem('babyzone_admins_list');
      localStorage.removeItem('babyzone_activity_log');
      localStorage.removeItem('babyzone_admin_coupons');
      localStorage.removeItem('babyzone_admin_customers');
      localStorage.removeItem('rawaa_user');
    } catch (e) {
      console.warn('Storage remove error:', e);
    }
    if (setUser) {
      setUser(null);
    }
    if (addToast) {
      addToast('تم تسجيل الخروج من لوحة التحكم بنجاح', 'info');
    }
  };


  // Dynamic customer list synthesized from base customers + actual Supabase orders
  const mergedCustomers = useMemo(() => {
    const map = new Map();
    for (const c of customers) {
      map.set(c.phone || c.id, { ...c });
    }
    for (const ord of orders) {
      const key = ord.customerPhone || ord.customerEmail || ord.customerName;
      if (key) {
        if (map.has(key)) {
          const existing = map.get(key);
          existing.ordersCount = (existing.ordersCount || 1) + 1;
          existing.totalSpent = (existing.totalSpent || 0) + (ord.total || 0);
          existing.lastOrder = ord.date;
        } else {
          map.set(key, {
            id: `cust-${ord.id}`,
            name: ord.customerName,
            phone: ord.customerPhone || '',
            email: ord.customerEmail || '',
            city: ord.city || 'القاهرة',
            address: ord.address || '',
            ordersCount: 1,
            totalSpent: ord.total || 0,
            status: 'نشط',
            joinedDate: ord.date ? ord.date.split('T')[0] : new Date().toISOString().split('T')[0],
            isVip: (ord.total || 0) >= 1300
          });
        }
      }
    }
    return Array.from(map.values());
  }, [customers, orders]);

  // Order management methods with direct Supabase synchronization
  const updateOrderStatus = async (orderId, newStatus) => {
    const paymentStatus = newStatus === 'تم التسليم' ? 'مدفوع بالكامل' : undefined;
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            deliveryStatus: newStatus,
            status: newStatus,
            paymentStatus: paymentStatus || ord.paymentStatus
          };
        }
        return ord;
      })
    );
    addActivity('تحديث حالة الطلب', `الطلب ${orderId} أصبح: ${newStatus}`, 'order');
    if (addToast) {
      addToast(`تم تحديث حالة الطلب #${orderId} إلى «${newStatus}»`, 'success');
    }

    // Immediately emit cross-tab / intra-window sync event (0ms instant response)
    syncBus.emit('ORDER_UPDATED', {
      orderId,
      newStatus,
      paymentStatus,
      timestamp: Date.now()
    });

    try {
      await ordersApi.updateStatus(orderId, newStatus);
    } catch (err) {
      console.error('API update order status error:', err);
    }
  };

  const deleteOrder = async (orderId) => {
    setOrders((prev) => prev.filter((ord) => ord.id !== orderId));
    addActivity('حذف طلب', `تم حذف الطلب ${orderId}`, 'order');
    if (addToast) {
      addToast(`تم حذف الطلب #${orderId} بنجاح`, 'info');
    }

    // Immediately emit deletion event across all tabs
    syncBus.emit('ORDER_DELETED', { orderId, timestamp: Date.now() });

    try {
      await ordersApi.softDelete(orderId);
      await ordersApi.hardDelete(orderId);
    } catch (err) {
      console.error('API delete order error:', err);
    }
  };

  const addOrder = async (orderData) => {
    const orderId = orderData.id || `EGY-${Date.now().toString().slice(-5)}`;
    const formattedOrder = {
      ...orderData,
      id: orderId,
      total: Number(orderData.total) || 0,
      totalAmount: Number(orderData.total) || 0,
      subtotal: Number(orderData.subtotal || orderData.total) || 0,
      deliveryStatus: orderData.deliveryStatus || 'بانتظار التأكيد',
      status: orderData.deliveryStatus || 'بانتظار التأكيد',
      date: new Date().toISOString()
    };

    setOrders((prev) => [formattedOrder, ...prev.filter((o) => o.id !== orderId)]);
    addActivity('تسجيل طلب جديد', `الطلب: ${orderId} للعميل: ${formattedOrder.customerName}`, 'order');
    if (addToast) {
      addToast(`تم تسجيل الطلب #${orderId} بنجاح`, 'success');
    }

    syncBus.emit('ORDER_ADDED', { orderId, order: formattedOrder, timestamp: Date.now() });

    try {
      const dbOrder = {
        id: orderId,
        customer_name: formattedOrder.customerName,
        customer_phone: formattedOrder.customerPhone || '',
        customer_email: formattedOrder.customerEmail || '',
        shipping_address: formattedOrder.address || '',
        city: formattedOrder.city || 'القاهرة',
        total_amount: formattedOrder.total,
        payment_method: formattedOrder.paymentMethod || 'الدفع عند الاستلام (COD)',
        status: formattedOrder.deliveryStatus,
        items: formattedOrder.items || []
      };
      await ordersApi.create(dbOrder);
    } catch (err) {
      console.error('API insert order error:', err);
    }
    return formattedOrder;
  };

  const refreshOrders = async () => {
    try {
      setIsLoadingOrders(true);
      const data = await ordersApi.getAll();
      if (Array.isArray(data)) {
        const active = data.filter(
          (o) => o.status !== 'محذوف' && !o.id.startsWith('EGY-TEST') && o.id !== 'EGY-98421'
        );
        setOrders(active.map(formatDbOrder));
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('API refresh orders error:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Coupon management methods
  const addCoupon = async (newCoupon) => {
    const couponObj = {
      ...newCoupon,
      id: `cp-${Date.now()}`,
      code: newCoupon.code.trim().toUpperCase(),
      usageCount: 0,
      isActive: true
    };
    setCoupons((prev) => [couponObj, ...prev]);
    addActivity('إنشاء كوبون ترويجي', `كود الكوبون: ${couponObj.code}`, 'coupon');
    if (addToast) {
      addToast(`تم إنشاء كوبون الخصم ${couponObj.code} بنجاح`, 'success');
    }
    try {
      await couponsApi.create(couponObj);
    } catch (e) {
      console.warn('Coupons create API error:', e.message);
    }
  };

  const toggleCouponStatus = async (couponId) => {
    let nextState = false;
    let couponCode = '';
    setCoupons((prev) =>
      prev.map((cp) => {
        if (cp.id === couponId) {
          nextState = !cp.isActive;
          couponCode = cp.code;
          return { ...cp, isActive: nextState };
        }
        return cp;
      })
    );
    addActivity('تغيير حالة كوبون', `${couponCode || couponId} أصبحت ${nextState ? 'نشط' : 'معطل'}`, 'coupon');
    try {
      await couponsApi.toggleStatus(couponId, nextState);
    } catch (e) {
      console.warn('Coupons toggle status API error:', e.message);
    }
  };

  const updateCoupon = async (couponId, updatedData) => {
    setCoupons((prev) =>
      prev.map((cp) => (cp.id === couponId ? { ...cp, ...updatedData } : cp))
    );
    addActivity('تعديل كوبون', `كود الكوبون: ${updatedData.code || couponId}`, 'coupon');
    if (addToast) {
      addToast('تم تحديث بيانات الكوبون بنجاح', 'success');
    }
    try {
      await couponsApi.update(couponId, updatedData);
    } catch (e) {
      console.warn('Coupons update API error:', e.message);
    }
  };

  const deleteCoupon = async (couponId) => {
    setCoupons((prev) => prev.filter((cp) => cp.id !== couponId));
    addActivity('حذف كوبون', `كود الكوبون ${couponId}`, 'coupon');
    if (addToast) {
      addToast('تم حذف الكوبون بنجاح', 'info');
    }
    try {
      await couponsApi.delete(couponId);
    } catch (e) {
      console.warn('Coupons delete API error:', e.message);
    }
  };

  // Review management methods
  const toggleReviewApproval = async (reviewId) => {
    let nextState = false;
    let custName = '';
    setReviews((prev) =>
      prev.map((rev) => {
        if (rev.id === reviewId) {
          nextState = !rev.isApproved;
          custName = rev.customerName;
          return { ...rev, isApproved: nextState };
        }
        return rev;
      })
    );
    addActivity('تحديث مراجعة عميلة', `تم ${nextState ? 'اعتماد' : 'إخفاء'} تقييم ${custName}`, 'review');
    try {
      await reviewsApi.toggleApproval(reviewId, nextState);
    } catch (e) {
      console.warn('Reviews toggle approval API error:', e.message);
    }
  };

  const deleteReview = async (reviewId) => {
    setReviews((prev) => prev.filter((rev) => rev.id !== reviewId));
    addActivity('حذف تقييم', `تم حذف تقييم ${reviewId}`, 'review');
    if (addToast) {
      addToast('تم حذف التقييم', 'info');
    }
    try {
      await reviewsApi.delete(reviewId);
    } catch (e) {
      console.warn('Reviews delete API error:', e.message);
    }
  };

  // Customer management methods synchronized with Supabase Cloud
  const updateCustomer = async (customerId, updatedData) => {
    // Optimistic local state update
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, ...updatedData } : c))
    );

    addActivity('تحديث ملف وصلاحيات العميل', `العميل ${updatedData.name || customerId}`, 'customer');
    if (addToast) {
      addToast('تم حفظ التعديلات والصلاحيات على السيرفر بنجاح', 'success');
    }

    // Direct Supabase Cloud update
    try {
      const payload = {};
      if (updatedData.name !== undefined) payload.name = updatedData.name;
      if (updatedData.email !== undefined) payload.email = updatedData.email;
      if (updatedData.phone !== undefined) payload.phone = updatedData.phone;
      if (updatedData.city !== undefined) payload.city = updatedData.city;
      if (updatedData.address !== undefined) payload.address = updatedData.address;
      if (updatedData.role !== undefined) payload.role = updatedData.role;
      if (updatedData.permissions !== undefined) payload.permissions = updatedData.permissions;
      if (updatedData.isVip !== undefined) payload.is_vip = updatedData.isVip;
      if (updatedData.is_vip !== undefined) payload.is_vip = updatedData.is_vip;
      if (updatedData.status !== undefined) payload.status = updatedData.status;
      if (updatedData.notes !== undefined) payload.notes = updatedData.notes;

      if (Object.keys(payload).length > 0) {
        await customersApi.update(customerId, payload);
      }
    } catch (e) {
      console.warn('API customer update notice:', e.message);
    }
  };

  const updateCustomerStatus = async (customerId, statusUpdate) => {
    const patch = typeof statusUpdate === 'string' ? { status: statusUpdate } : statusUpdate;
    return updateCustomer(customerId, patch);
  };

  const updateCustomerPermissions = async (customerId, permissions) => {
    return updateCustomer(customerId, { permissions });
  };

  const addCustomer = async (customerData) => {
    const id = customerData.id || `cust-${Date.now()}`;
    const newCust = {
      ...customerData,
      id,
      ordersCount: 0,
      totalSpent: 0,
      joinedDate: new Date().toISOString().split('T')[0],
      status: customerData.status || 'نشط',
      permissions: customerData.permissions || DEFAULT_CUSTOMER_PERMISSIONS,
      role: customerData.role || 'customer'
    };

    setCustomers((prev) => [newCust, ...prev]);
    addActivity('إضافة عميل جديد', `${newCust.name} (${newCust.phone || newCust.email})`, 'customer');
    if (addToast) {
      addToast(`تم تسجيل العميل «${newCust.name}» على السيرفر بنجاح`, 'success');
    }

    try {
      await customersApi.create({
        id,
        name: newCust.name,
        email: newCust.email,
        phone: newCust.phone || '',
        city: newCust.city || 'القاهرة',
        address: newCust.address || '',
        role: newCust.role,
        permissions: newCust.permissions,
        is_vip: Boolean(newCust.isVip),
        status: newCust.status,
        notes: newCust.notes || ''
      });
    } catch (e) {
      console.warn('API customer insert notice:', e.message);
    }
  };

  const deleteCustomer = async (customerId) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    addActivity('حذف عميل', `رقم العميل ${customerId}`, 'customer');
    if (addToast) {
      addToast('تم حذف العميل من قاعدة البيانات', 'info');
    }

    try {
      await customersApi.delete(customerId);
    } catch (e) {
      console.warn('API customer delete notice:', e.message);
    }
  };

  // Settings update method
  const updateStoreSettings = async (newSettings) => {
    setStoreSettings(newSettings);
    addActivity('تحديث إعدادات المتجر', 'تم تعديل الإعدادات العامة والتوصيل', 'settings');
    if (addToast) {
      addToast('تم حفظ إعدادات المتجر بنجاح', 'success');
    }
    try {
      await storeSettingsApi.update(newSettings);
    } catch (e) {
      console.warn('Store settings update API error:', e.message);
    }
  };

  // Team member methods
  const addAdmin = async (adminData) => {
    const newAdmin = {
      ...adminData,
      id: `adm-${Date.now()}`,
      password: adminData.password || null,
      lastLogin: 'لم يسجل دخول بعد',
      status: 'نشط'
    };
    setAdmins((prev) => [...prev, newAdmin]);
    addActivity('إضافة عضو إداري جديد', `${newAdmin.name} (${newAdmin.role})`, 'admin');
    if (addToast) {
      addToast(`تمت إضافة ${newAdmin.name} إلى فريق الإدارة بنجاح`, 'success');
    }
    try {
      await adminsApi.create(newAdmin);
    } catch (e) {
      console.warn('Admins create API error:', e.message);
    }
  };

  const updateAdmin = async (adminId, updatedData) => {
    setAdmins((prev) => prev.map((a) => (a.id === adminId ? { ...a, ...updatedData } : a)));
    addActivity('تحديث بيانات مشرف', `رقم الحساب ${adminId}`, 'admin');
    if (addToast) {
      addToast('تم تحديث بيانات المشرف بنجاح', 'success');
    }
    try {
      await adminsApi.update(adminId, updatedData);
    } catch (e) {
      console.warn('Admins update API error:', e.message);
    }
  };

  const deleteAdmin = async (adminId) => {
    if (adminId === 'adm-1') {
      if (addToast) {
        addToast('لا يمكن حذف حساب مدير النظام الرئيسي', 'warning');
      }
      return;
    }
    setAdmins((prev) => prev.filter((a) => a.id !== adminId));
    addActivity('حذف عضو إداري', `رقم الحساب ${adminId}`, 'admin');
    if (addToast) {
      addToast('تم حذف الحساب الإداري', 'info');
    }
    try {
      await adminsApi.delete(adminId);
    } catch (e) {
      console.warn('Admins delete API error:', e.message);
    }
  };

  const value = {
    isAuthenticated,
    currentAdmin,
    loginAdmin,
    logoutAdmin,
    hasAdminPermission,
    // Orders
    orders,
    isLoadingOrders,
    updateOrderStatus,
    deleteOrder,
    addOrder,
    refreshOrders,
    // Customers
    customers: mergedCustomers,
    rawCustomers: customers,
    isLoadingCustomers,
    updateCustomer,
    updateCustomerStatus,
    updateCustomerPermissions,
    addCustomer,
    deleteCustomer,
    // Coupons
    coupons,
    isLoadingCoupons,
    addCoupon,
    updateCoupon,
    toggleCouponStatus,
    deleteCoupon,
    // Reviews
    reviews,
    isLoadingReviews,
    toggleReviewApproval,
    deleteReview,
    // Settings
    storeSettings,
    updateStoreSettings,
    // Admins
    admins,
    addAdmin,
    updateAdmin,
    deleteAdmin,
    // Activity Log
    activityLog,
    addActivity,
    // UI states
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    toggleSidebar: () => setIsSidebarCollapsed((prev) => !prev),
    isMobileSidebarOpen,
    setIsMobileSidebarOpen
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
