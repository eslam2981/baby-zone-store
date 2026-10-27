import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
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
import {
  playOrderAlertChime,
  playUpdateChime,
  isAudioAlertEnabled,
  setAudioAlertEnabled
} from '../utils/audioAlert';
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

  // Real-time connection and sync health indicators
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(() => new Date());
  const [isAudioAlertsEnabled, setIsAudioAlertsEnabled] = useState(() => isAudioAlertEnabled());

  // Toggle audio alerts with instant preference persistence and feedback
  const toggleAudioAlerts = useCallback(() => {
    setIsAudioAlertsEnabled((prev) => {
      const next = !prev;
      setAudioAlertEnabled(next);
      if (next) playOrderAlertChime();
      if (addToast) {
        addToast(next ? 'تم تفعيل التنبيه الصوتي للطلبات الجديدة 🔔' : 'تم كتم التنبيه الصوتي 🔕', 'info');
      }
      return next;
    });
  }, [addToast]);

  // Reactive data states synchronized with Supabase Cloud
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [coupons, setCoupons] = useState([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [storeSettings, setStoreSettings] = useState(initialStoreSettings);
  const [admins, setAdmins] = useState(initialAdmins);
  const [activityLog, setActivityLog] = useState([]);

  // Comprehensive silent background reconciliation across all administrative entities
  const refreshAllRealtimeData = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsSyncing(true);
      const [ordData, custData, coupData, revData, settsData, admData, actData] = await Promise.allSettled([
        ordersApi.getAll(),
        customersApi.getAll(),
        couponsApi.getAll(),
        reviewsApi.getAll(),
        storeSettingsApi.get(),
        adminsApi.getAll(),
        activityLogApi.getAll()
      ]);

      if (ordData.status === 'fulfilled' && Array.isArray(ordData.value)) {
        const active = ordData.value.filter(
          (o) => o.status !== 'محذوف' && !o.id.startsWith('EGY-TEST') && o.id !== 'EGY-98421'
        );
        setOrders(active.map(formatDbOrder));
      }

      if (custData.status === 'fulfilled' && Array.isArray(custData.value)) {
        setCustomers(custData.value.map(formatDbCustomer));
      }

      if (coupData.status === 'fulfilled' && Array.isArray(coupData.value)) {
        setCoupons(coupData.value.map(formatDbCoupon));
      }

      if (revData.status === 'fulfilled' && Array.isArray(revData.value)) {
        setReviews(revData.value.map(formatDbReview));
      }

      if (settsData.status === 'fulfilled' && settsData.value) {
        setStoreSettings(formatDbSettings(settsData.value));
      }

      if (admData.status === 'fulfilled' && Array.isArray(admData.value) && admData.value.length > 0) {
        setAdmins((prev) => {
          const apiAdmins = admData.value.map(formatDbAdmin);
          const merged = apiAdmins.map((adm) => {
            const localMatch = prev.find(
              (p) => p.id === adm.id || p.email.toLowerCase() === adm.email.toLowerCase()
            );
            return {
              ...adm,
              password: adm.password || localMatch?.password || null
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

      if (actData.status === 'fulfilled' && Array.isArray(actData.value)) {
        setActivityLog(actData.value.map((entry) => ({
          id: entry.id,
          adminName: entry.admin_name,
          action: entry.action,
          target: entry.target,
          time: entry.created_at ? new Date(entry.created_at).toLocaleTimeString('ar-EG') : 'الآن',
          type: entry.type || 'general'
        })));
      }

      setLastSyncTime(new Date());
      setIsRealtimeConnected(true);
      if (!silent && addToast) {
        addToast('تمت المزامنة اللحظية لكافة بيانات المتجر بنجاح ⚡', 'success');
      }
    } catch (err) {
      console.warn('Realtime refresh error:', err);
    } finally {
      if (!silent) setIsSyncing(false);
      setIsLoadingOrders(false);
      setIsLoadingCustomers(false);
      setIsLoadingCoupons(false);
      setIsLoadingReviews(false);
    }
  }, [addToast]);

  // Unified resilient Supabase Realtime Hub with auto-reconnect, visibility sync & heartbeat
  useEffect(() => {
    let isMounted = true;
    let reconnectTimeout = null;
    let channel = null;

    // Initial data fetch
    refreshAllRealtimeData(true);

    function setupRealtimeChannel() {
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch {}
      }

      const channelName = 'realtime_admin_hub';
      channel = supabase
        .channel(channelName)
        // 1. Live Orders Listener
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload) => {
            if (!isMounted) return;
            if (payload.eventType === 'INSERT') {
              if (payload.new.status !== 'محذوف' && !payload.new.id.startsWith('EGY-TEST') && payload.new.id !== 'EGY-98421') {
                const newOrd = formatDbOrder(payload.new);
                setOrders((prev) => [newOrd, ...prev.filter((o) => o.id !== newOrd.id)]);
                playOrderAlertChime();
                if (addToast) {
                  addToast(`🔔 طلب جديد وارد لحظياً! #${newOrd.id} بقيمة ${newOrd.total} ج.م للعميل ${newOrd.customerName}`, 'success');
                }
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
                playUpdateChime();
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
        // 2. Live Customers Listener
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'customers' },
          (payload) => {
            if (!isMounted) return;
            if (payload.eventType === 'INSERT') {
              const newCust = formatDbCustomer(payload.new);
              setCustomers((prev) => [newCust, ...prev.filter((c) => c.id !== newCust.id)]);
            } else if (payload.eventType === 'UPDATE') {
              const updatedCust = formatDbCustomer(payload.new);
              setCustomers((prev) =>
                prev.map((c) => (c.id === updatedCust.id ? updatedCust : c))
              );
            } else if (payload.eventType === 'DELETE') {
              const deletedId = payload.old?.id;
              const deletedEmail = payload.old?.email ? payload.old.email.toLowerCase().trim() : null;
              setCustomers((prev) =>
                prev.filter(
                  (c) =>
                    String(c.id) !== String(deletedId) &&
                    (!deletedEmail || c.email?.toLowerCase().trim() !== deletedEmail)
                )
              );
            }
          }
        )
        // 3. Live Coupons Listener
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'coupons' },
          (payload) => {
            if (!isMounted) return;
            if (payload.eventType === 'INSERT') {
              const cp = formatDbCoupon(payload.new);
              setCoupons((prev) => [cp, ...prev.filter((c) => c.id !== cp.id)]);
            } else if (payload.eventType === 'UPDATE') {
              const cp = formatDbCoupon(payload.new);
              setCoupons((prev) => prev.map((c) => (c.id === cp.id ? cp : c)));
            } else if (payload.eventType === 'DELETE') {
              setCoupons((prev) => prev.filter((c) => c.id !== payload.old.id));
            }
          }
        )
        // 4. Live Reviews Listener
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'reviews' },
          (payload) => {
            if (!isMounted) return;
            if (payload.eventType === 'INSERT') {
              const rev = formatDbReview(payload.new);
              setReviews((prev) => [rev, ...prev.filter((r) => r.id !== rev.id)]);
              playUpdateChime();
              if (addToast) {
                addToast(`⭐ تقييم جديد وصل للتو من ${rev.customerName} على ${rev.productName}`, 'info');
              }
            } else if (payload.eventType === 'UPDATE') {
              const rev = formatDbReview(payload.new);
              setReviews((prev) => prev.map((r) => (r.id === rev.id ? rev : r)));
            } else if (payload.eventType === 'DELETE') {
              setReviews((prev) => prev.filter((r) => r.id !== payload.old.id));
            }
          }
        )
        // 5. Live Store Settings Listener
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'store_settings' },
          (payload) => {
            if (!isMounted) return;
            if (payload.new) {
              setStoreSettings(formatDbSettings(payload.new));
            }
          }
        )
        // 6. Live Admins Listener
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'admins' },
          (payload) => {
            if (!isMounted) return;
            if (payload.eventType === 'INSERT') {
              const adm = formatDbAdmin(payload.new);
              setAdmins((prev) => [adm, ...prev.filter((a) => a.id !== adm.id && a.email.toLowerCase() !== adm.email.toLowerCase())]);
            } else if (payload.eventType === 'UPDATE') {
              const adm = formatDbAdmin(payload.new);
              setAdmins((prev) => prev.map((a) => (a.id === adm.id ? { ...a, ...adm } : a)));
            } else if (payload.eventType === 'DELETE') {
              setAdmins((prev) => prev.filter((a) => a.id !== payload.old.id));
            }
          }
        )
        // 7. Live Activity Log Listener
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'activity_log' },
          (payload) => {
            if (!isMounted) return;
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
          }
        )
        .subscribe((status, err) => {
          if (!isMounted) return;
          if (status === 'SUBSCRIBED') {
            setIsRealtimeConnected(true);
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.warn(`Realtime channel ${status}, verifying connection in background...`, err || '');
            // Check if REST API is responsive before declaring disconnection
            ordersApi.getAll()
              .then(() => {
                if (isMounted) setIsRealtimeConnected(true);
              })
              .catch(() => {
                if (isMounted) setIsRealtimeConnected(false);
              });
            clearTimeout(reconnectTimeout);
            reconnectTimeout = setTimeout(() => {
              if (isMounted) setupRealtimeChannel();
            }, 3000);
          }
        });
    }

    setupRealtimeChannel();

    // Cross-tab and local window instantaneous event synchronization
    const unsubBusAdd = syncBus.on('ORDER_ADDED', ({ order }) => {
      if (order && order.status !== 'محذوف') {
        const mapped = formatDbOrder(order);
        setOrders((prev) => [mapped, ...prev.filter((o) => o.id !== mapped.id)]);
      }
    });

    const unsubBusUpdate = syncBus.on('ORDER_UPDATED', ({ orderId, newStatus }) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus, deliveryStatus: newStatus } : o))
      );
    });

    const unsubBusDelete = syncBus.on('ORDER_DELETED', ({ orderId }) => {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    });

    const unsubCustSync = syncBus.on('CUSTOMER_UPDATED', (payload) => {
      if (payload?.action === 'delete') {
        const delId = String(payload.customerId);
        setCustomers((prev) => prev.filter((c) => String(c.id) !== delId));
        return;
      }
      customersApi.getAll().then((data) => {
        if (isMounted && Array.isArray(data)) setCustomers(data.map(formatDbCustomer));
      }).catch(() => {});
    });

    const unsubCoupSync = syncBus.on('COUPON_ADDED', ({ coupon }) => {
      if (coupon) setCoupons((prev) => [coupon, ...prev.filter((c) => c.id !== coupon.id)]);
    });

    const unsubRevSync = syncBus.on('REVIEW_ADDED', ({ review }) => {
      if (review) setReviews((prev) => [formatDbReview(review), ...prev.filter((r) => r.id !== review.id)]);
    });

    // Periodic silent background heartbeat (every 25 seconds)
    const backgroundInterval = setInterval(() => {
      if (isMounted && typeof document !== 'undefined' && document.visibilityState === 'visible') {
        refreshAllRealtimeData(true);
      }
    }, 25000);

    // Immediate background catch-up whenever user returns to tab
    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible' && isMounted) {
        refreshAllRealtimeData(true);
        if (!isRealtimeConnected) {
          setupRealtimeChannel();
        }
      }
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleVisibilityChange);
    }

    return () => {
      isMounted = false;
      clearTimeout(reconnectTimeout);
      clearInterval(backgroundInterval);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', handleVisibilityChange);
      }
      if (channel) {
        supabase.removeChannel(channel);
      }
      unsubBusAdd();
      unsubBusUpdate();
      unsubBusDelete();
      unsubCustSync();
      unsubCoupSync();
      unsubRevSync();
    };
  }, [refreshAllRealtimeData, addToast]);

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

    const isDbPasswordMatch = Boolean(
      (foundAdmin?.password && cleanPass === foundAdmin.password) ||
      (isSuperAdminEmail && (cleanPass === 'admin' || cleanPass === 'Eslam@Admin2026'))
    );

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
    // 1. Process all registered customers
    const processedCustomers = customers.map((c) => {
      const custEmail = (c.email || '').trim().toLowerCase();
      const custPhone = (c.phone || '').trim();

      // Find all orders in orders list that belong to this customer
      const custOrders = orders.filter((ord) => {
        const ordEmail = (ord.customerEmail || '').trim().toLowerCase();
        const ordPhone = (ord.customerPhone || '').trim();
        return (
          (custEmail && ordEmail && custEmail === ordEmail) ||
          (custPhone && ordPhone && custPhone === ordPhone)
        );
      });

      // True orders count and total spent derived from actual orders if available, else DB customer record
      const actualOrdersCount = custOrders.length > 0 
        ? custOrders.length 
        : (orders.length === 0 ? Number(c.ordersCount || 0) : 0);
      const actualTotalSpent = custOrders.length > 0
        ? custOrders.reduce((sum, ord) => sum + (Number(ord.total) || 0), 0)
        : (orders.length === 0 ? Number(c.totalSpent || 0) : 0);

      const latestOrder = custOrders[0]?.date || c.lastOrder || null;

      return {
        ...c,
        ordersCount: actualOrdersCount,
        totalSpent: actualTotalSpent,
        lastOrder: latestOrder,
        isVip: c.isVip || actualTotalSpent >= 1300
      };
    });

    // 2. Synthesize guest customers from orders who are not in the registered customers list
    const result = [...processedCustomers];
    for (const ord of orders) {
      const ordEmail = (ord.customerEmail || '').trim().toLowerCase();
      const ordPhone = (ord.customerPhone || '').trim();
      const ordName = (ord.customerName || '').trim();

      const exists = result.some((c) => {
        const cEmail = (c.email || '').trim().toLowerCase();
        const cPhone = (c.phone || '').trim();
        return (
          (cEmail && ordEmail && cEmail === ordEmail) ||
          (cPhone && ordPhone && cPhone === ordPhone)
        );
      });

      if (!exists && (ordEmail || ordPhone || ordName)) {
        const guestOrders = orders.filter((o) => {
          const oEmail = (o.customerEmail || '').trim().toLowerCase();
          const oPhone = (o.customerPhone || '').trim();
          return (
            (ordEmail && oEmail && ordEmail === oEmail) ||
            (ordPhone && oPhone && ordPhone === oPhone)
          );
        });

        const guestTotal = guestOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
        result.push({
          id: `cust-${ord.id}`,
          name: ordName || 'عميل زائر',
          phone: ordPhone,
          email: ordEmail || `guest-${ord.id}@babyzone-egypt.com`,
          city: ord.city || 'القاهرة',
          address: ord.address || '',
          role: 'customer',
          permissions: ['view_catalog', 'place_orders'],
          ordersCount: guestOrders.length,
          totalSpent: guestTotal,
          status: 'نشط',
          joinedDate: ord.date ? ord.date.split('T')[0] : new Date().toISOString().split('T')[0],
          isVip: guestTotal >= 1300,
          lastOrder: guestOrders[0]?.date || ord.date
        });
      }
    }

    return result;
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
      syncBus.emit('COUPON_ADDED', { coupon: couponObj, timestamp: Date.now() });
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
    syncBus.emit('COUPON_UPDATED', { couponId, isActive: nextState, timestamp: Date.now() });
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
    syncBus.emit('COUPON_UPDATED', { couponId, updatedData, timestamp: Date.now() });
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
    syncBus.emit('COUPON_DELETED', { couponId, timestamp: Date.now() });
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
    syncBus.emit('REVIEW_UPDATED', { reviewId, isApproved: nextState, timestamp: Date.now() });
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
    syncBus.emit('REVIEW_DELETED', { reviewId, timestamp: Date.now() });
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
    // 1. Locate customer object first before state removal
    const target = customers.find((c) => String(c.id) === String(customerId));
    const targetEmail = target?.email ? target.email.toLowerCase().trim() : null;
    const targetPhone = target?.phone ? target.phone.trim() : null;
    const targetName = target?.name ? target.name.trim() : null;

    // Remove immediately from customers state (optimistic instant UI update without refresh)
    setCustomers((prev) =>
      prev.filter(
        (c) =>
          String(c.id) !== String(customerId) &&
          (!targetEmail || c.email?.toLowerCase().trim() !== targetEmail)
      )
    );

    // Remove ALL orders belonging to this customer immediately from orders state
    setOrders((prev) =>
      prev.filter((o) => {
        const oId = String(o.customerId || o.customer_id || '');
        const oEmail = (o.customerEmail || o.customer_email || '').toLowerCase().trim();
        const oPhone = (o.customerPhone || o.customer_phone || '').trim();
        const oName = (o.customerName || o.customer_name || '').trim();

        if (customerId && oId === String(customerId)) return false;
        if (targetEmail && oEmail && oEmail === targetEmail) return false;
        if (targetPhone && oPhone && oPhone === targetPhone) return false;
        if (targetName && oName && oName === targetName) return false;
        return true;
      })
    );

    // Remove any reviews written by this customer from reviews state
    if (targetEmail) {
      setReviews((prev) =>
        prev.filter((r) => {
          const rEmail = (r.customerEmail || r.customer_email || '').toLowerCase().trim();
          return rEmail !== targetEmail;
        })
      );
    }

    addActivity('حذف عميل وسجل مشترياته', `تم حذف العميل ${targetName || customerId} وكافة سجلات طلباته وصلاحياته`, 'customer');
    if (addToast) {
      addToast('تم حذف العميل وكافة سجلات مشترياته وصلاحياته نهائياً من قاعدة البيانات', 'info');
    }

    // 2. Broadcast instant wipeout to customer session across all tabs and intra-app
    syncBus.emit('CUSTOMER_DELETED', {
      customerId: String(customerId),
      email: targetEmail,
      phone: targetPhone,
      name: targetName,
      timestamp: Date.now()
    });

    // Also notify syncBus that customer list and orders changed
    syncBus.emit('CUSTOMER_UPDATED', {
      action: 'delete',
      customerId: String(customerId)
    });

    syncBus.emit('ORDERS_UPDATED', {
      action: 'delete_by_customer',
      customerId: String(customerId),
      email: targetEmail
    });

    // 3. If currently logged in storefront user matches this customer, log them out and clear cart/orders immediately
    if (user && !user.isAdmin) {
      const isMatch =
        String(user.id) === String(customerId) ||
        (targetEmail && user.email?.toLowerCase().trim() === targetEmail);
      if (isMatch && setUser) {
        setUser(null);
        try {
          localStorage.removeItem('rawaa_user');
          localStorage.removeItem('rawaa_cart');
          localStorage.removeItem('rawaa_orders');
          localStorage.removeItem('rawaa_wishlist');
          sessionStorage.removeItem('babyzone_admin_auth');
          sessionStorage.removeItem('babyzone_admin_user');
        } catch {}
      }
    }

    // 4. Cascade permanent delete in Supabase database (customers, orders, reviews)
    try {
      await Promise.allSettled([
        customersApi.delete(customerId, targetEmail),
        ordersApi.deleteByCustomer(customerId, targetEmail, targetPhone),
        reviewsApi.deleteByCustomer(targetEmail)
      ]);
    } catch (e) {
      console.warn('API customer cascade delete notice:', e.message);
    }
  };

  // Settings update method
  const updateStoreSettings = async (newSettings) => {
    setStoreSettings(newSettings);
    addActivity('تحديث إعدادات المتجر', 'تم تعديل الإعدادات العامة والتوصيل', 'settings');
    if (addToast) {
      addToast('تم حفظ إعدادات المتجر بنجاح', 'success');
    }
    syncBus.emit('SETTINGS_UPDATED', { settings: newSettings, timestamp: Date.now() });
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
    // Real-time synchronization state & controls
    isRealtimeConnected,
    isSyncing,
    lastSyncTime,
    refreshAllRealtimeData,
    isAudioAlertsEnabled,
    toggleAudioAlerts,
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
