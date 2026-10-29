import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import {
  ordersApi,
  customersApi,
  couponsApi,
  reviewsApi,
  storeSettingsApi,
  adminsApi,
  activityLogApi
} from '../../services/api';
import {
  formatDbOrder,
  formatDbCustomer,
  formatDbCoupon,
  formatDbReview,
  formatDbAdmin,
  formatDbSettings
} from '../../utils/mappers';
import { syncBus } from '../../utils/syncBus';
import {
  playOrderAlertChime,
  playUpdateChime,
  isAudioAlertEnabled,
  setAudioAlertEnabled
} from '../../utils/audioAlert';

export function useAdminRealtime({
  setOrders,
  setIsLoadingOrders,
  setCustomers,
  setIsLoadingCustomers,
  setCoupons,
  setIsLoadingCoupons,
  setReviews,
  setIsLoadingReviews,
  setStoreSettings,
  setAdmins,
  addToast,
  currentAdmin,
  user
}) {
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(() => new Date());
  const [isAudioAlertsEnabled, setIsAudioAlertsEnabled] = useState(() => isAudioAlertEnabled());
  const [activityLog, setActivityLog] = useState([]);

  const isAuthorizedAdmin = useCallback(() => {
    try {
      const isAuthInSession = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('babyzone_admin_auth') === 'true';
      const isUserAdmin = Boolean(user?.isAdmin || currentAdmin?.role);
      return isAuthInSession || isUserAdmin;
    } catch {
      return false;
    }
  }, [user, currentAdmin]);

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

  const addActivity = useCallback(async (action, target, type = 'general') => {
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
    } catch {
      // Activity logging failure should not break app flow
    }
  }, [currentAdmin]);

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
        activityLogApi.getRecent(30)
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
      if (admData.status === 'fulfilled' && Array.isArray(admData.value)) {
        setAdmins(admData.value.map(formatDbAdmin));
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
      if (!silent && addToast && isAuthorizedAdmin()) {
        addToast('تمت المزامنة اللحظية لكافة بيانات المتجر بنجاح ⚡', 'success');
      }
    } catch (err) {
      console.warn('Realtime refresh error:', err);
      setIsRealtimeConnected(false);
    } finally {
      if (!silent) setIsSyncing(false);
      if (typeof setIsLoadingOrders === 'function') setIsLoadingOrders(false);
      if (typeof setIsLoadingCustomers === 'function') setIsLoadingCustomers(false);
      if (typeof setIsLoadingCoupons === 'function') setIsLoadingCoupons(false);
      if (typeof setIsLoadingReviews === 'function') setIsLoadingReviews(false);
    }
  }, [
    setOrders,
    setIsLoadingOrders,
    setCustomers,
    setIsLoadingCustomers,
    setCoupons,
    setIsLoadingCoupons,
    setReviews,
    setIsLoadingReviews,
    setStoreSettings,
    setAdmins,
    addToast,
    isAuthorizedAdmin
  ]);

  useEffect(() => {
    let isMounted = true;
    let reconnectTimeout = null;
    let channel = null;

    refreshAllRealtimeData(true);

    function setupRealtimeChannel() {
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch {
          // Channel removal
        }
      }

      const channelName = 'realtime_admin_hub';
      channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload) => {
            if (!isMounted) return;
            if (payload.eventType === 'INSERT') {
              if (payload.new.status !== 'محذوف' && !payload.new.id.startsWith('EGY-TEST') && payload.new.id !== 'EGY-98421') {
                const newOrd = formatDbOrder(payload.new);
                setOrders((prev) => [newOrd, ...prev.filter((o) => o.id !== newOrd.id)]);

                // Only notify and alert authorized admin accounts
                if (isAuthorizedAdmin()) {
                  playOrderAlertChime();
                  if (addToast) {
                    addToast(`🔔 طلب جديد وارد لحظياً! #${newOrd.id} بقيمة ${newOrd.total} ج.م للعميل ${newOrd.customerName}`, 'success');
                  }
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
              const deletedPhone = payload.old?.phone ? String(payload.old.phone).trim() : null;
              setCustomers((prev) =>
                prev.filter(
                  (c) =>
                    String(c.id) !== String(deletedId) &&
                    (!deletedEmail || c.email?.toLowerCase().trim() !== deletedEmail) &&
                    (!deletedPhone || (c.phone || '').trim() !== deletedPhone)
                )
              );
              syncBus.emit('CUSTOMER_DELETED', {
                customerId: deletedId,
                email: deletedEmail,
                phone: deletedPhone,
                timestamp: Date.now()
              });
            }
          }
        )
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
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'reviews' },
          (payload) => {
            if (!isMounted) return;
            if (payload.eventType === 'INSERT') {
              const rev = formatDbReview(payload.new);
              setReviews((prev) => [rev, ...prev.filter((r) => r.id !== rev.id)]);

              // Only notify authorized admin accounts
              if (isAuthorizedAdmin()) {
                playUpdateChime();
                if (addToast) {
                  addToast(`⭐ تقييم جديد وصل للتو من ${rev.customerName} على ${rev.productName}`, 'info');
                }
              }
            } else if (payload.eventType === 'UPDATE') {
              const rev = formatDbReview(payload.new);
              setReviews((prev) => prev.map((r) => (r.id === rev.id ? rev : r)));
            } else if (payload.eventType === 'DELETE') {
              setReviews((prev) => prev.filter((r) => r.id !== payload.old.id));
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'admins' },
          (payload) => {
            if (!isMounted) return;
            if (payload.eventType === 'INSERT') {
              const adm = formatDbAdmin(payload.new);
              setAdmins((prev) => [adm, ...prev.filter((a) => a.id !== adm.id)]);
              syncBus.emit('ADMIN_ADDED', { admin: adm, timestamp: Date.now() });
            } else if (payload.eventType === 'UPDATE') {
              const adm = formatDbAdmin(payload.new);
              setAdmins((prev) => prev.map((a) => (a.id === adm.id ? adm : a)));
              if (adm.status === 'معطل') {
                syncBus.emit('ADMIN_REMOVED', { adminId: adm.id, email: adm.email, timestamp: Date.now() });
              } else {
                syncBus.emit('ADMIN_UPDATED', { adminId: adm.id, admin: adm, timestamp: Date.now() });
              }
            } else if (payload.eventType === 'DELETE') {
              const deletedId = payload.old?.id;
              const deletedEmail = payload.old?.email ? payload.old.email.toLowerCase().trim() : null;
              setAdmins((prev) => prev.filter((a) => a.id !== deletedId));
              syncBus.emit('ADMIN_REMOVED', { adminId: deletedId, email: deletedEmail, timestamp: Date.now() });
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'store_settings' },
          (payload) => {
            if (!isMounted) return;
            if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
              setStoreSettings(formatDbSettings(payload.new));
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'activity_log' },
          (payload) => {
            if (!isMounted) return;
            if (payload.new) {
              setActivityLog((prev) => [
                {
                  id: payload.new.id,
                  adminName: payload.new.admin_name,
                  action: payload.new.action,
                  target: payload.new.target,
                  time: payload.new.created_at
                    ? new Date(payload.new.created_at).toLocaleTimeString('ar-EG')
                    : 'الآن',
                  type: payload.new.type || 'general'
                },
                ...prev
              ]);
            }
          }
        )
        .subscribe((status, err) => {
          if (!isMounted) return;
          if (status === 'SUBSCRIBED') {
            setIsRealtimeConnected(true);
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            setIsRealtimeConnected(false);
            console.warn(`Admin hub ${status}, auto-reconnecting...`, err || '');
            clearTimeout(reconnectTimeout);
            reconnectTimeout = setTimeout(() => {
              if (isMounted) setupRealtimeChannel();
            }, 3500);
          }
        });
    }

    setupRealtimeChannel();

    const unsubVisChange = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible' && isMounted) {
        refreshAllRealtimeData(true);
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', unsubVisChange);
    }

    const unsubOrderSync = syncBus.on('ORDER_ADDED', () => refreshAllRealtimeData(true));
    const unsubOrderUpd = syncBus.on('ORDER_UPDATED', () => refreshAllRealtimeData(true));
    const unsubOrderDel = syncBus.on('ORDER_DELETED', () => refreshAllRealtimeData(true));
    const unsubCustSync = syncBus.on('CUSTOMER_UPDATED', () => refreshAllRealtimeData(true));
    const unsubRevSync = syncBus.on('REVIEW_ADDED', () => refreshAllRealtimeData(true));

    return () => {
      isMounted = false;
      clearTimeout(reconnectTimeout);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', unsubVisChange);
      }
      if (channel) {
        supabase.removeChannel(channel);
      }
      unsubOrderSync();
      unsubOrderUpd();
      unsubOrderDel();
      unsubCustSync();
      unsubRevSync();
    };
  }, [
    refreshAllRealtimeData,
    setOrders,
    setCustomers,
    setCoupons,
    setReviews,
    setStoreSettings,
    setAdmins,
    addToast,
    isAuthorizedAdmin
  ]);

  return {
    isRealtimeConnected,
    isSyncing,
    lastSyncTime,
    isAudioAlertsEnabled,
    toggleAudioAlerts,
    activityLog,
    addActivity,
    refreshAllRealtimeData
  };
}

