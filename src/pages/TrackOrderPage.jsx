import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { ordersApi } from '../services/api';
import { supabase } from '../lib/supabase';
import { syncBus } from '../utils/syncBus';
import { TrackingResultSkeleton } from '../components/common/Skeletons';
import { ChevronLeft, Sparkles, AlertCircle, Lock } from 'lucide-react';

import { GuestLoginBanner } from '../components/tracking/GuestLoginBanner';
import { CustomerHubHeader } from '../components/tracking/CustomerHubHeader';
import { TrackingSearchForm } from '../components/tracking/TrackingSearchForm';
import { OrderTrackingCard } from '../components/tracking/OrderTrackingCard';
import { GovernoratesShippingGuide } from '../components/tracking/GovernoratesShippingGuide';
import { DeliveryGuarantees } from '../components/tracking/DeliveryGuarantees';

function mapDbOrderToTracking(raw) {
  if (!raw) return null;
  const status = raw.status || 'بانتظار التأكيد';
  const isCancelled = status === 'ملغي';

  const step =
    isCancelled
      ? -1
      : status === 'تم التسليم'
      ? 4
      : status === 'مع المندوب'
      ? 3
      : status === 'قيد التجهيز الطبي'
      ? 2
      : status === 'تم تأكيد الطلب'
      ? 1
      : 0;

  const estimatedTime = isCancelled
    ? 'الطلب ملغي - لا يوجد موعد تسليم'
    : status === 'تم التسليم'
    ? 'تم التسليم بنجاح'
    : status === 'بانتظار التأكيد'
    ? 'خلال 24 إلى 48 ساعة بعد مراجعة وتأكيد الطلب'
    : 'خلال 24 إلى 48 ساعة عمل';

  return {
    id: raw.id,
    phone: raw.customer_phone || '',
    customerName: raw.customer_name || 'عميلة بيبي زون',
    customerEmail: raw.customer_email || '',
    city: raw.city || 'القاهرة',
    district: raw.shipping_address || '',
    date: raw.created_at
      ? new Date(raw.created_at).toLocaleDateString('ar-EG', { dateStyle: 'full' })
      : 'اليوم',
    estimatedTime,
    status,
    isCancelled,
    statusLabel: isCancelled ? 'حالة الشحنة: تم إلغاء الطلب (ملغي)' : `حالة الشحنة: ${status}`,
    paymentMethod: raw.payment_method || 'الدفع عند الاستلام (COD)',
    courierName: raw.courier_name || '',
    courierPhone: raw.courier_phone || '',
    deliveryPin: raw.delivery_pin || '',
    currentStep: step,
    items: Array.isArray(raw.items) ? raw.items : [],
    total: Number(raw.total_amount) || 0
  };
}

export default function TrackOrderPage() {
  const { formatPrice, addToast, user, setIsAuthOpen } = useShop();
  const [searchInput, setSearchInput] = useState('');
  const [activeOrder, setActiveOrder] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const [customerOrders, setCustomerOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const loadUserOrders = useCallback(async (showLoading = true) => {
    if (!user || (!user.email && !user.phone)) {
      setCustomerOrders([]);
      return;
    }

    try {
      if (showLoading) setIsLoadingOrders(true);
      const orders = await ordersApi.getByCustomer(user.email, user.phone);
      const mapped = (orders || []).map(mapDbOrderToTracking);
      setCustomerOrders(mapped);

      setActiveOrder((prevActive) => {
        if (!prevActive) {
          return mapped.find((o) => o.status !== 'تم التسليم') || mapped[0] || null;
        }
        const updated = mapped.find((o) => o.id === prevActive.id);
        return updated || mapped.find((o) => o.status !== 'تم التسليم') || mapped[0] || null;
      });
    } catch (err) {
      console.error('Error fetching customer orders:', err);
    } finally {
      if (showLoading) setIsLoadingOrders(false);
    }
  }, [user]);

  useEffect(() => {
    loadUserOrders(true);
  }, [loadUserOrders]);

  useEffect(() => {
    const unsubUpdate = syncBus.on('ORDER_UPDATED', ({ orderId, newStatus }) => {
      const isCancelled = newStatus === 'ملغي';
      const step =
        isCancelled
          ? -1
          : newStatus === 'تم التسليم'
          ? 4
          : newStatus === 'مع المندوب'
          ? 3
          : newStatus === 'قيد التجهيز الطبي'
          ? 2
          : newStatus === 'تم تأكيد الطلب'
          ? 1
          : 0;

      const estimatedTime = isCancelled
        ? 'الطلب ملغي - لا يوجد موعد تسليم'
        : newStatus === 'تم التسليم'
        ? 'تم التسليم بنجاح'
        : newStatus === 'بانتظار التأكيد'
        ? 'خلال 24 إلى 48 ساعة بعد مراجعة وتأكيد الطلب'
        : 'خلال 24 إلى 48 ساعة عمل';

      setCustomerOrders((prevOrders) =>
        prevOrders.map((ord) => {
          if (ord.id === orderId) {
            return {
              ...ord,
              status: newStatus,
              isCancelled,
              statusLabel: isCancelled ? 'حالة الشحنة: تم إلغاء الطلب (ملغي)' : `حالة الشحنة: ${newStatus}`,
              currentStep: step,
              estimatedTime
            };
          }
          return ord;
        })
      );

      setActiveOrder((prev) => {
        if (!prev || prev.id !== orderId) return prev;
        return {
          ...prev,
          status: newStatus,
          isCancelled,
          statusLabel: isCancelled ? 'حالة الشحنة: تم إلغاء الطلب (ملغي)' : `حالة الشحنة: ${newStatus}`,
          currentStep: step,
          estimatedTime
        };
      });

      loadUserOrders(false);
    });

    const unsubAdd = syncBus.on('ORDER_ADDED', ({ order }) => {
      if (!order || !user) return;
      const orderEmail = (order.customer_email || '').toLowerCase().trim();
      const userEmail = (user.email || '').toLowerCase().trim();
      const orderPhone = (order.customer_phone || '').trim();
      const userPhone = (user.phone || '').trim();

      const isMine =
        (userEmail && orderEmail && userEmail === orderEmail) ||
        (!orderEmail && userPhone && orderPhone && userPhone === orderPhone);

      if (isMine) {
        const mapped = mapDbOrderToTracking(order);
        setCustomerOrders((prev) => [mapped, ...prev.filter((o) => o.id !== mapped.id)]);
        setActiveOrder((prev) => (!prev ? mapped : prev));
        loadUserOrders(false);
      }
    });

    const unsubDelete = syncBus.on('ORDER_DELETED', ({ orderId }) => {
      setCustomerOrders((prev) => prev.filter((o) => o.id !== orderId));
      setActiveOrder((prev) => (prev?.id === orderId ? null : prev));
      loadUserOrders(false);
    });

    return () => {
      unsubUpdate();
      unsubAdd();
      unsubDelete();
    };
  }, [loadUserOrders, user]);

  useEffect(() => {
    const channelId = user ? (user.email || user.id) : 'guest';
    const channel = supabase
      .channel(`cust_orders_realtime_${channelId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (user) {
            loadUserOrders(false);
          } else if (activeOrder?.id && payload?.new?.id === activeOrder.id) {
            const mapped = mapDbOrderToTracking(payload.new);
            setActiveOrder(mapped);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeOrder?.id, loadUserOrders]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (user && (user.email || user.phone)) {
        loadUserOrders(false);
      } else if (activeOrder?.id) {
        ordersApi.getById(activeOrder.id).then((fresh) => {
          if (fresh && fresh.status !== 'محذوف') {
            const mapped = mapDbOrderToTracking(fresh);
            setActiveOrder((current) => {
              if (!current || current.id !== mapped.id) return current;
              if (current.status !== mapped.status) {
                return mapped;
              }
              return current;
            });
          }
        }).catch(() => {});
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [user, activeOrder?.id, loadUserOrders]);

  const handleSearch = async (normalizedQuery) => {
    setIsSearching(true);
    try {
      const raw = await ordersApi.track(normalizedQuery);
      if (raw) {
        const mapped = mapDbOrderToTracking(raw);
        setActiveOrder(mapped);
        setHasSearched(true);
        if (addToast) addToast(`تم العثور على بيانات الطلب #${mapped.id} بنجاح`, 'success');
        setTimeout(() => {
          const el = document.getElementById('tracking-result-card');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      } else {
        setActiveOrder(null);
        setHasSearched(true);
        if (addToast) addToast('لم يتم العثور على طلب مسجل بهذا الرقم أو الهاتف حالياً', 'info');
      }
    } catch (err) {
      console.error(err);
      setActiveOrder(null);
      setHasSearched(true);
      if (addToast) addToast('تعذر العثور على بيانات الطلب، يرجى التحقق من الكود والمحاولة لاحقاً', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectOrder = (order) => {
    setActiveOrder(order);
    setHasSearched(false);
    setTimeout(() => {
      const el = document.getElementById('tracking-result-card');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-8 sm:py-12">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-rawaa-muted mb-6">
          <Link to="/" className="hover:text-rawaa-primary transition-colors">الرئيسية</Link>
          <ChevronLeft size={14} />
          <span className="text-rawaa-dark font-medium">
            {user ? 'صفحتي وسجل طلباتي' : 'تتبع شحنتك المباشر'}
          </span>
        </div>

        {/* Logged in customer hub OR guest login banner */}
        {user ? (
          user.permissions && !user.permissions.includes('view_own_orders') && !user.isAdmin ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-xs text-amber-900 flex items-center gap-3 shadow-2xs">
              <Lock size={20} className="text-amber-700 shrink-0" />
              <div>
                <strong className="block font-bold mb-0.5 text-amber-950">صلاحية تتبع الشحنات وسجل الطلبات معطلة لحسابك:</strong>
                <span className="text-[11px] text-amber-800">
                  تم تقييد الاطلاع على سجل طلبات الحساب من قِبل إدارة المتجر. يمكنك الاستعلام بكود الطلب أدناه.
                </span>
              </div>
            </div>
          ) : (
            <CustomerHubHeader
              user={user}
              customerOrders={customerOrders}
              isLoadingOrders={isLoadingOrders}
              activeOrder={activeOrder}
              onSelectOrder={handleSelectOrder}
              formatPrice={formatPrice}
            />
          )
        ) : (
          <GuestLoginBanner onOpenAuth={() => setIsAuthOpen(true)} />
        )}

        {/* Hero header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 bg-rawaa-primary-light text-rawaa-primary text-xs font-bold px-4 py-1.5 rounded-full mb-3 shadow-soft-xs">
            <Sparkles size={14} />
            <span>نظام التتبع الحي لجميع محافظات جمهورية مصر العربية</span>
          </div>
          <h2 className="font-heading text-xl sm:text-3xl font-extrabold text-rawaa-dark mb-2 tracking-tight">
            {user ? 'الاستعلام المباشر عن أي شحنة' : 'تتبعي مسار طلبيتك وموعد وصولها'}
          </h2>
          <p className="text-xs sm:text-sm text-rawaa-muted leading-relaxed">
            أدخلي كود الطلب (مثل EGY-...) أو رقم الهاتف المسجل للاطلاع على حالة وموقع الشحنة فوراً.
          </p>
        </div>

        {/* Search input form */}
        <TrackingSearchForm
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onSearch={handleSearch}
          isSearching={isSearching}
          addToast={addToast}
        />

        {/* Results */}
        {isSearching ? (
          <TrackingResultSkeleton />
        ) : activeOrder ? (
          <OrderTrackingCard activeOrder={activeOrder} formatPrice={formatPrice} />
        ) : hasSearched ? (
          <div className="bg-white rounded-2xl shadow-soft-sm border border-rawaa-border p-8 text-center max-w-lg mx-auto mb-12">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} />
            </div>
            <h3 className="font-heading text-base font-bold text-rawaa-dark mb-2">
              لم نعثر على بيانات هذا الطلب
            </h3>
            <p className="text-xs text-rawaa-muted mb-6 leading-relaxed">
              يرجى التأكد من كتابة كود الطلب بالصيغة الصحيحة (مثل EGY-12345) أو إدخال رقم الهاتف المستخدم عند إتمام الشراء.
            </p>
          </div>
        ) : null}

        {/* Governorates shipping guide */}
        <GovernoratesShippingGuide />

        {/* Guarantees */}
        <DeliveryGuarantees />
      </div>
    </div>
  );
}
