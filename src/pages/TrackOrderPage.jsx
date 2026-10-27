import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { ordersApi } from '../services/api';
import { supabase } from '../lib/supabase';
import { syncBus } from '../utils/syncBus';
import { sanitizeText, normalizeEgyptianPhone, REGEX_PATTERNS } from '../utils/validators';
import { OrderCardSkeleton, TrackingResultSkeleton } from '../components/common/Skeletons';
import { GOVERNORATES } from '../data/shippingData';
import {
  Search,
  Truck,
  Package,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Calendar,
  AlertCircle,
  HelpCircle,
  ChevronLeft,
  ArrowRight,
  Sparkles,
  Loader2,
  User,
  Lock,
  ShoppingBag,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

function mapDbOrderToTracking(raw) {
  if (!raw) return null;
  const status = raw.status || 'بانتظار التأكيد';
  const isCancelled = status === 'ملغي';

  // 0: بانتظار التأكيد (لم يتم التأكيد بعد)
  // 1: تم تأكيد الطلب
  // 2: قيد التجهيز الطبي
  // 3: مع المندوب
  // 4: تم التسليم
  // -1: ملغي
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
  const [selectedGovernorate, setSelectedGovernorate] = useState(GOVERNORATES[0]);

  // Customer dedicated orders state
  const [customerOrders, setCustomerOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Smooth scroll window to top when tracking page mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Fetch logged in customer's personal orders with silent background support
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

      // Functionally update activeOrder to maintain selection and receive status updates immediately
      setActiveOrder((prevActive) => {
        if (!prevActive) {
          return mapped.find((o) => o.status !== 'تم التسليم') || mapped[0] || null;
        }
        const updated = mapped.find((o) => o.id === prevActive.id);
        return updated || prevActive;
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

  // Real-time zero-latency synchronization via syncBus (cross-tab and intra-app)
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

      // 1. Immediately update customerOrders list in state (0ms)
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

      // 2. Immediately update active live stepper and banner (0ms)
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

      // 3. Silently refresh from database to guarantee full synchronization
      loadUserOrders(false);
    });

    const unsubAdd = syncBus.on('ORDER_ADDED', ({ order }) => {
      if (order) {
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
  }, [loadUserOrders]);

  // Real-time synchronization for customer orders via Supabase websocket
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

  // High-reliability background polling fallback (every 3.5s silent refresh across devices)
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

  // Handle tracking form submission via ordersApi service
  const handleSearch = async (e) => {
    e?.preventDefault();
    const rawInput = searchInput.trim();
    if (!rawInput) {
      addToast('يرجى إدخال رقم الطلب أو رقم الهاتف للاستعلام', 'warning');
      return;
    }

    const cleanQuery = sanitizeText(rawInput);
    if (REGEX_PATTERNS.DANGEROUS_HTML.test(rawInput)) {
      addToast('إدخال غير صالح، يحتوي على رموز غير مسموح بها', 'warning');
      return;
    }

    if (cleanQuery.length < 3 || cleanQuery.length > 35) {
      addToast('يرجى التأكد من كتابة رقم الطلب أو رقم الموبايل بشكل صحيح (3 إلى 35 خانة)', 'warning');
      return;
    }

    // If it looks like a phone, normalize it
    const normalizedQuery = /^\+?[0-9\s\-]+$/.test(cleanQuery)
      ? normalizeEgyptianPhone(cleanQuery)
      : cleanQuery;

    setIsSearching(true);
    try {
      const raw = await ordersApi.track(normalizedQuery);

      if (raw) {
        const mapped = mapDbOrderToTracking(raw);
        setActiveOrder(mapped);
        setHasSearched(true);
        addToast(`تم العثور على بيانات الطلب #${mapped.id} بنجاح`, 'success');
        setTimeout(() => {
          const el = document.getElementById('tracking-result-card');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      } else {
        setActiveOrder(null);
        setHasSearched(true);
        addToast('لم يتم العثور على طلب مسجل بهذا الرقم أو الهاتف حالياً', 'info');
      }
    } catch (err) {
      console.error(err);
      setActiveOrder(null);
      setHasSearched(true);
      addToast('تعذر الاتصال بالسيرفر للتحقق من بيانات الطلب', 'error');
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

  const activeInFlightCount = customerOrders.filter((o) => o.status !== 'تم التسليم' && o.status !== 'ملغي').length;
  const completedOrdersCount = customerOrders.filter((o) => o.status === 'تم التسليم').length;
  const cancelledOrdersCount = customerOrders.filter((o) => o.status === 'ملغي').length;
  const totalCustomerSpent = customerOrders.reduce(
    (sum, ord) => sum + (ord.status !== 'ملغي' ? (Number(ord.total) || 0) : 0),
    0
  );

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-8 sm:py-12">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs and navigation path */}
        <div className="flex items-center gap-2 text-xs text-rawaa-muted mb-6">
          <Link to="/" className="hover:text-rawaa-primary transition-colors">الرئيسية</Link>
          <ChevronLeft size={14} />
          <span className="text-rawaa-dark font-medium">
            {user ? 'صفحتي وسجل طلباتي' : 'تتبع شحنتك المباشر'}
          </span>
        </div>

        {/* LOGGED IN CUSTOMER HUB HEADER */}
        {user ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft-md border border-rawaa-border mb-8 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-rawaa-border/60">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-rawaa-primary-light text-rawaa-primary flex items-center justify-center font-heading font-black text-2xl shadow-soft-xs border border-rawaa-primary/20 shrink-0">
                  {user.name ? user.name.charAt(0) : <User size={28} />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h1 className="font-heading text-xl sm:text-2xl font-black text-rawaa-dark">
                      أهلاً بكِ في صفحتكِ الخاصة، {user.name}
                    </h1>
                    <span className="text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-0.5 rounded-full">
                      عضوية عائلة بيبي زون المفعلة
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-rawaa-muted">
                    <span>📧 {user.email}</span>
                    {user.phone ? <span dir="ltr">📱 {user.phone}</span> : <span className="text-rawaa-subtle">📱 لم يُسجل هاتف بعد</span>}
                    {user.city ? <span>📍 {user.city}</span> : <span className="text-rawaa-subtle">📍 لم تُحدد المحافظة</span>}
                  </div>
                </div>
              </div>

              {/* Quick stats pills */}
              <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap">
                <div className="bg-[#FAF7F2] border border-rawaa-border rounded-2xl px-3.5 py-2 text-center min-w-[80px]">
                  <div className="text-[11px] text-rawaa-muted">إجمالي الطلبات</div>
                  <div className="font-heading text-base sm:text-lg font-black text-rawaa-dark">{customerOrders.length}</div>
                </div>
                <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl px-3.5 py-2 text-center min-w-[90px]">
                  <div className="text-[11px] text-purple-800 font-medium">إجمالي المشتريات</div>
                  <div className="font-heading text-base sm:text-lg font-black text-purple-950">{formatPrice(totalCustomerSpent)}</div>
                </div>
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl px-3.5 py-2 text-center min-w-[80px]">
                  <div className="text-[11px] text-amber-800 font-medium">قيد الشحن</div>
                  <div className="font-heading text-base sm:text-lg font-black text-amber-900">{activeInFlightCount}</div>
                </div>
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl px-3.5 py-2 text-center min-w-[80px]">
                  <div className="text-[11px] text-emerald-800 font-medium">تم استلامها</div>
                  <div className="font-heading text-base sm:text-lg font-black text-emerald-900">{completedOrdersCount}</div>
                </div>
                {cancelledOrdersCount > 0 && (
                  <div className="bg-red-50/70 border border-red-200/80 rounded-2xl px-3.5 py-2 text-center min-w-[70px]">
                    <div className="text-[11px] text-red-800 font-medium">ملغية</div>
                    <div className="font-heading text-base sm:text-lg font-black text-red-900">{cancelledOrdersCount}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Customer's personal orders list */}
            <div className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Package size={18} className="text-rawaa-primary" />
                  <h2 className="font-heading text-base font-bold text-rawaa-dark">
                    سجل طلباتك الخاصة ({customerOrders.length})
                  </h2>
                </div>
                <span className="text-xs text-rawaa-muted">
                  يتم تحديث حالات الشحن تلقائياً وبشكل فوري
                </span>
              </div>

              {isLoadingOrders ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <OrderCardSkeleton />
                  <OrderCardSkeleton />
                  <OrderCardSkeleton />
                </div>
              ) : customerOrders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customerOrders.map((ord) => {
                    const isSelected = activeOrder?.id === ord.id;
                    const statusColor =
                      ord.status === 'تم التسليم'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : ord.status === 'مع المندوب'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : ord.status === 'قيد التجهيز الطبي'
                        ? 'bg-purple-50 text-purple-800 border-purple-200'
                        : ord.status === 'تم تأكيد الطلب'
                        ? 'bg-teal-50 text-teal-800 border-teal-200'
                        : ord.status === 'ملغي'
                        ? 'bg-red-50 text-red-800 border-red-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200';

                    return (
                      <div
                        key={ord.id}
                        className={`rounded-2xl p-4 transition-all border text-right cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-white border-rawaa-primary ring-2 ring-rawaa-primary/20 shadow-soft-md'
                            : 'bg-[#FAF7F2] hover:bg-white border-rawaa-border hover:border-rawaa-primary/40 shadow-soft-2xs'
                        }`}
                        onClick={() => handleSelectOrder(ord)}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <span className="font-mono text-xs font-black text-rawaa-dark bg-white border border-rawaa-border px-2.5 py-1 rounded-lg">
                              #{ord.id}
                            </span>
                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusColor}`}>
                              {ord.status}
                            </span>
                          </div>

                          <div className="text-[11px] text-rawaa-muted mb-3 flex items-center gap-1.5">
                            <Calendar size={13} className="text-rawaa-subtle shrink-0" />
                            <span>{ord.date}</span>
                          </div>

                          {/* Items thumbnails preview */}
                          {ord.items && ord.items.length > 0 && (
                            <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
                              {ord.items.slice(0, 3).map((it, iIdx) => (
                                <img
                                  key={iIdx}
                                  src={it.image}
                                  alt={it.name}
                                  className="w-10 h-10 rounded-lg object-cover border border-rawaa-border bg-white shrink-0"
                                  title={`${it.name} (${it.quantity || it.qty || 1} قطعة)`}
                                />
                              ))}
                              {ord.items.length > 3 && (
                                <span className="w-10 h-10 rounded-lg bg-rawaa-soft border border-rawaa-border flex items-center justify-center text-[10px] font-bold text-rawaa-muted shrink-0">
                                  +{ord.items.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="pt-3 border-t border-rawaa-border/60 flex items-center justify-between gap-2">
                          <div>
                            <span className="text-[10px] text-rawaa-muted block">الإجمالي:</span>
                            <span className="font-heading text-sm font-black text-rawaa-primary">
                              {formatPrice(ord.total)}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectOrder(ord);
                            }}
                            className={`text-xs font-bold py-1.5 px-3.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-rawaa-primary text-white shadow-soft-xs'
                                : 'bg-white hover:bg-rawaa-primary hover:text-white text-rawaa-dark border border-rawaa-border'
                            }`}
                          >
                            <span>تتبع المسار</span>
                            <Truck size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-[#FAF7F2] rounded-2xl p-8 border border-dashed border-rawaa-border text-center">
                  <div className="w-14 h-14 rounded-full bg-rawaa-primary-light text-rawaa-primary flex items-center justify-center mx-auto mb-3">
                    <ShoppingBag size={24} />
                  </div>
                  <h3 className="font-heading text-sm font-bold text-rawaa-dark mb-1">
                    لم تقومي بتسجيل أي طلبات بعد بحسابك
                  </h3>
                  <p className="text-xs text-rawaa-muted max-w-md mx-auto mb-4 leading-relaxed">
                    تصفحي منتجات بيبي زون وأضيفي مستلزمات طفلك للسلة، وستظهر جميع طلباتك هنا تلقائياً لتمكينك من تتبع مسار الشحنة خطوة بخطوة.
                  </p>
                  <Link
                    to="/category/all"
                    className="inline-flex items-center gap-2 bg-rawaa-primary hover:bg-rawaa-primary-hover text-white text-xs font-bold px-6 py-2.5 rounded-full transition-all shadow-soft-xs"
                  >
                    <span>تصفح المنتجات وبدء التسوق</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* GUEST USER LOGIN PROMPT BANNER */
          <div className="bg-gradient-to-r from-white via-rawaa-soft to-white rounded-3xl p-6 sm:p-8 shadow-soft-md border border-rawaa-border mb-8 text-center max-w-3xl mx-auto">
            <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 border border-amber-200">
              <Lock size={26} />
            </div>
            <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-rawaa-dark mb-2">
              صفحتكِ الشخصية وسجل طلباتك
            </h2>
            <p className="text-xs sm:text-sm text-rawaa-muted leading-relaxed max-w-lg mx-auto mb-5">
              سجّلي دخولك الآن لعرض صفحتكِ الخاصة التي تحتوي على جميع طلباتك السابقة وتتبع شحناتك الحالية تلقائياً دون الحاجة لكتابة رقم الطلب كل مرة.
            </p>
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="inline-flex items-center gap-2 bg-rawaa-primary hover:bg-rawaa-primary-hover text-white text-xs font-bold py-3 px-7 rounded-full transition-all shadow-soft-sm hover:shadow-soft-md cursor-pointer"
            >
              <User size={16} />
              <span>تسجيل الدخول / إنشاء حساب جديد</span>
            </button>
          </div>
        )}

        {/* Hero header with visual badges */}
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

        {/* Search input form card */}
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-soft-md border border-rawaa-border p-4 sm:p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="أدخلي كود الطلب (مثل: EGY-...) أو رقم هاتفك..."
                className="w-full bg-[#FAF7F2] border border-rawaa-border rounded-xl pr-11 pl-4 py-3.5 text-sm text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white transition-all placeholder:text-rawaa-subtle"
                dir="rtl"
                required
              />
              <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-rawaa-subtle" />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="bg-rawaa-primary hover:bg-rawaa-primary-hover active:scale-95 text-white text-sm font-bold px-7 py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-soft-sm transition-all cursor-pointer shrink-0 disabled:opacity-50"
            >
              {isSearching ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  <span>جاري البحث...</span>
                </>
              ) : (
                <>
                  <span>تتبع الشحنة</span>
                  <Truck size={17} />
                </>
              )}
            </button>
          </form>

          {/* Quick guidance note */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-rawaa-border/60 text-xs text-rawaa-muted">
            <Sparkles size={14} className="text-rawaa-primary shrink-0" />
            <span>يمكنك الاستعلام برقم هاتفك المسجل في الطلب أو كود الشحنة المرسل إليكِ عبر واتساب.</span>
          </div>
        </div>

        {/* Live order tracking card results */}
        {isSearching ? (
          <TrackingResultSkeleton />
        ) : activeOrder ? (
          <div id="tracking-result-card" className="bg-white rounded-2xl shadow-soft-lg border border-rawaa-border overflow-hidden mb-12 scroll-mt-24 animate-fadeIn">
            {/* Header banner of order status */}
            <div className={`p-5 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
              activeOrder.isCancelled
                ? 'bg-gradient-to-r from-[#2e0e0e] via-[#451414] to-[#2e0e0e] text-white border-b border-red-500/30'
                : 'bg-gradient-to-r from-rawaa-dark via-[#26352E] to-rawaa-dark text-white'
            }`}>
              <div>
                <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                  <span className="text-xs bg-white/15 px-3 py-0.5 rounded-full font-mono font-bold tracking-wider text-white">
                    #{activeOrder.id}
                  </span>
                  <span className={`text-xs font-medium ${activeOrder.isCancelled ? 'text-red-300' : 'text-amber-300'}`}>
                    {activeOrder.date}
                  </span>
                  {activeOrder.isCancelled ? (
                    <span className="text-xs text-red-200 bg-red-600/40 border border-red-400/40 px-2.5 py-0.5 rounded-full font-bold">
                      طلب ملغي
                    </span>
                  ) : activeOrder.customerName && (
                    <span className="text-xs text-white/80 bg-white/10 px-2.5 py-0.5 rounded-full">
                      المستلم: {activeOrder.customerName}
                    </span>
                  )}
                </div>
                <h2 className="font-heading text-lg sm:text-2xl font-bold !text-white text-white">
                  {activeOrder.statusLabel}
                </h2>
                <p className="text-xs sm:text-sm text-white/90 mt-1 flex items-center gap-1.5">
                  {activeOrder.isCancelled ? (
                    <>
                      <AlertCircle size={15} className="text-red-400 shrink-0" />
                      <span>حالة الشحنة: <strong className="text-red-200 font-bold">{activeOrder.estimatedTime}</strong></span>
                    </>
                  ) : (
                    <>
                      <Clock size={15} className="text-amber-400 shrink-0" />
                      <span>الموعد المتوقع: <strong className="text-white font-bold">{activeOrder.estimatedTime}</strong></span>
                    </>
                  )}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {!activeOrder.isCancelled ? (
                  activeOrder.deliveryPin ? (
                    <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-2.5 text-right">
                      <div className="text-[11px] text-white/70">كود التحقق الأمني للاستلام</div>
                      <div className="font-mono text-lg font-extrabold text-amber-300 tracking-widest">{activeOrder.deliveryPin}</div>
                    </div>
                  ) : (
                    <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-2.5 text-right">
                      <div className="text-[11px] text-white/70">رقم الشحنة المرجعي</div>
                      <div className="font-mono text-base font-extrabold text-amber-300 tracking-wider">#{activeOrder.id}</div>
                    </div>
                  )
                ) : (
                  <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-xl px-4 py-2.5 text-right">
                    <div className="text-[11px] text-red-200">حالة المسار</div>
                    <div className="font-bold text-sm text-red-100">تم إلغاء الشحنة</div>
                  </div>
                )}
                <a
                  href={`https://wa.me/201035401549?text=${encodeURIComponent(
                    activeOrder.isCancelled
                      ? `مرحباً بيبي زون، بخصوص طلبي الملغي رقم #${activeOrder.id}، أود الاستفسار عن إمكانية إعادة تفعيله.`
                      : `مرحباً بيبي زون، أود الاستفسار عن طلبي رقم ${activeOrder.id}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className={`${
                    activeOrder.isCancelled
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  } text-white text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2 transition-colors shrink-0 shadow-sm`}
                >
                  <Phone size={15} />
                  <span>{activeOrder.isCancelled ? 'تواصل لإعادة تفعيل الطلب' : 'تواصل بخصوص هذا الطلب'}</span>
                </a>
              </div>
            </div>

            {/* Visual 4 step tracking stepper OR Cancelled Alert Banner */}
            {activeOrder.isCancelled ? (
              <div className="p-6 sm:p-8 bg-red-50/80 border-b border-red-200 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-right animate-fadeIn">
                <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 border border-red-300 flex items-center justify-center shrink-0 shadow-soft-xs">
                  <AlertCircle size={32} />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-base sm:text-lg font-black text-red-950 mb-1">
                    تم إلغاء هذا الطلب (الشحنة ملغية ولن يتم تسليمها)
                  </h3>
                  <p className="text-xs sm:text-sm text-red-800 leading-relaxed max-w-2xl">
                    تم تسجيل هذا الطلب كـ «ملغي» في النظام ولن يتم تجهيزه أو تسليمه لشركة الشحن. إذا تم إلغاء الطلب بالخطأ أو تودين استبدال المنتجات وإعادة شحنها، فريق خدمة عملاء بيبي زون في خدمتك دائماً عبر الواتساب.
                  </p>
                </div>
                <a
                  href={`https://wa.me/201035401549?text=${encodeURIComponent(`مرحباً بيبي زون، بخصوص طلبي الملغي #${activeOrder.id}، أود إعادة تأكيده.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-5 py-3 rounded-xl transition-all shadow-soft-xs flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <Phone size={15} />
                  <span>مراسلة الدعم لإعادة الطلب</span>
                </a>
              </div>
            ) : (
              <div className="p-6 sm:p-8 bg-[#FAF7F2] border-b border-rawaa-border">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
                  {/* Step 1: Confirmation */}
                  {activeOrder.currentStep >= 1 ? (
                    <div className="flex sm:flex-col items-center gap-3 text-right sm:text-center p-3 rounded-xl transition-all bg-white shadow-soft-xs border border-emerald-200">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-emerald-500 text-white font-bold">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <h3 className="font-heading text-xs sm:text-sm font-bold text-rawaa-dark">تم تأكيد الطلب</h3>
                        <p className="text-[11px] text-rawaa-muted mt-0.5">تمت المراجعة والتأكيد</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex sm:flex-col items-center gap-3 text-right sm:text-center p-3 rounded-xl transition-all bg-amber-50/80 shadow-soft-xs border border-amber-300 ring-2 ring-amber-400/20">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-amber-500 text-white font-bold animate-pulse">
                        <Clock size={20} />
                      </div>
                      <div>
                        <h3 className="font-heading text-xs sm:text-sm font-bold text-amber-950">بانتظار التأكيد</h3>
                        <p className="text-[11px] text-amber-800 font-medium mt-0.5">جاري مراجعة الطلب من الإدارة</p>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Sanitization & Packaging */}
                  <div className={`flex sm:flex-col items-center gap-3 text-right sm:text-center p-3 rounded-xl transition-all ${
                    activeOrder.currentStep >= 2
                      ? activeOrder.currentStep === 2
                        ? 'bg-purple-50/70 shadow-soft-xs border border-purple-300 ring-2 ring-purple-400/20'
                        : 'bg-white shadow-soft-xs border border-emerald-200'
                      : 'opacity-50'
                  }`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      activeOrder.currentStep > 2
                        ? 'bg-emerald-500 text-white'
                        : activeOrder.currentStep === 2
                        ? 'bg-purple-600 text-white animate-pulse'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {activeOrder.currentStep > 2 ? <CheckCircle2 size={20} /> : <ShieldCheck size={20} />}
                    </div>
                    <div>
                      <h3 className="font-heading text-xs sm:text-sm font-bold text-rawaa-dark">
                        {activeOrder.currentStep === 2 ? 'قيد التجهيز الطبي' : 'التعقيم والتغليف'}
                      </h3>
                      <p className="text-[11px] text-rawaa-muted mt-0.5">
                        {activeOrder.currentStep === 2 ? 'جاري التعقيم والتغليف' : 'تغليف طبي معقم 100%'}
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Out for Delivery */}
                  <div className={`flex sm:flex-col items-center gap-3 text-right sm:text-center p-3 rounded-xl transition-all ${
                    activeOrder.currentStep >= 3
                      ? activeOrder.currentStep === 3
                        ? 'bg-white shadow-soft-xs border border-rawaa-primary ring-2 ring-rawaa-primary/20'
                        : 'bg-white shadow-soft-xs border border-emerald-200'
                      : 'opacity-50'
                  }`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      activeOrder.currentStep > 3
                        ? 'bg-emerald-500 text-white'
                        : activeOrder.currentStep === 3
                        ? 'bg-rawaa-primary text-white animate-pulse'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {activeOrder.currentStep > 3 ? <CheckCircle2 size={20} /> : <Truck size={20} />}
                    </div>
                    <div>
                      <h3 className="font-heading text-xs sm:text-sm font-bold text-rawaa-dark">مع مندوب التوصيل</h3>
                      <p className={`text-[11px] mt-0.5 ${activeOrder.currentStep === 3 ? 'text-rawaa-primary font-semibold' : 'text-rawaa-muted'}`}>
                        {activeOrder.currentStep > 3 ? 'وصل المندوب للعنوان' : activeOrder.currentStep === 3 ? 'في الطريق إلى عنوانك الآن' : 'تسليم الشحنة لمندوب الشحن'}
                      </p>
                    </div>
                  </div>

                  {/* Step 4: Delivered */}
                  <div className={`flex sm:flex-col items-center gap-3 text-right sm:text-center p-3 rounded-xl transition-all ${
                    activeOrder.currentStep >= 4
                      ? 'bg-white shadow-soft-xs border border-emerald-300 ring-2 ring-emerald-400/20'
                      : 'opacity-50'
                  }`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      activeOrder.currentStep >= 4
                        ? 'bg-emerald-500 text-white font-bold'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      <Package size={20} />
                    </div>
                    <div>
                      <h3 className="font-heading text-xs sm:text-sm font-bold text-rawaa-dark">
                        {activeOrder.currentStep >= 4 ? 'تم التسليم بنجاح' : 'تم التسليم'}
                      </h3>
                      <p className="text-[11px] text-rawaa-muted mt-0.5">
                        {activeOrder.currentStep >= 4 ? 'تم استلام المنتج ومعاينته' : 'استلام المنتج ومعاينته'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Order details grid */}
            <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Delivery and recipient information */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-[#FAF7F2] rounded-xl p-4 border border-rawaa-border">
                  <h4 className="font-heading text-xs font-bold text-rawaa-dark mb-3 flex items-center gap-2">
                    <MapPin size={15} className="text-rawaa-primary" />
                    <span>عنوان الاستلام ومعلومات المستلم</span>
                  </h4>
                  <div className="text-xs space-y-2 text-rawaa-muted">
                    <div><strong>الاسم:</strong> {activeOrder.customerName}</div>
                    <div><strong>المدينة:</strong> {activeOrder.city}</div>
                    <div><strong>العنوان:</strong> {activeOrder.district}</div>
                    <div><strong>الهاتف:</strong> <span dir="ltr">{activeOrder.phone}</span></div>
                    <div><strong>طريقة السداد:</strong> {activeOrder.paymentMethod}</div>
                  </div>
                </div>

                {/* Courier info card */}
                {activeOrder.courierName ? (
                  <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-200/60">
                    <h4 className="font-heading text-xs font-bold text-emerald-900 mb-2 flex items-center gap-2">
                      <Truck size={15} className="text-emerald-700" />
                      <span>كابتن التوصيل المعين</span>
                    </h4>
                    <div className="text-xs text-emerald-800 space-y-1">
                      <div className="font-bold">{activeOrder.courierName}</div>
                      {activeOrder.courierPhone && (
                        <div className="font-mono text-xs text-emerald-700" dir="ltr">📞 {activeOrder.courierPhone}</div>
                      )}
                      <div className="text-emerald-700 font-medium">سيارة مجهزة لنقل مستلزمات الأطفال</div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#FAF7F2] rounded-xl p-4 border border-rawaa-border">
                    <h4 className="font-heading text-xs font-bold text-rawaa-dark mb-1.5 flex items-center gap-2">
                      <Truck size={15} className="text-rawaa-primary" />
                      <span>بيانات شركة الشحن والمندوب</span>
                    </h4>
                    <p className="text-xs text-rawaa-muted leading-relaxed">
                      {activeOrder.currentStep >= 3
                        ? 'الشحنة مع مندوب التوصيل السريع إلى عنوانكم'
                        : 'يتم تعيين المندوب وتوفير رقم التواصل فور الانتهاء من التجهيز وتأكيد الشحن.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Package items list */}
              <div className="lg:col-span-2">
                <h4 className="font-heading text-xs font-bold text-rawaa-dark mb-3 flex items-center gap-2">
                  <Package size={15} className="text-rawaa-primary" />
                  <span>محتويات الطرد ({activeOrder.items.length} منتجات)</span>
                </h4>

                <div className="space-y-3">
                  {activeOrder.items.map((item, idx) => {
                    const itemQty = item.quantity || item.qty || 1;
                    return (
                      <div key={item.id || idx} className="flex items-center justify-between gap-4 p-3 bg-[#FAF7F2] rounded-xl border border-rawaa-border">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-14 h-14 rounded-lg object-cover border border-rawaa-border bg-white"
                          />
                          <div>
                            <Link to={`/product/${item.id}`} className="font-heading text-xs font-bold text-rawaa-dark hover:text-rawaa-primary transition-colors line-clamp-1">
                              {item.name}
                            </Link>
                            <div className="text-[11px] text-rawaa-muted mt-0.5">
                              اللون: {item.color} | الكمية: {itemQty}
                            </div>
                          </div>
                        </div>
                        <div className="font-heading text-xs font-bold text-rawaa-primary shrink-0">
                          {formatPrice(item.price * itemQty)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-3 border-t border-rawaa-border flex items-center justify-between text-sm">
                  <span className="font-heading font-bold text-rawaa-dark">إجمالي الشحنة (شامل الضريبة ومصاريف الشحن):</span>
                  <span className="font-heading text-base font-extrabold text-rawaa-primary">{formatPrice(activeOrder.total)}</span>
                </div>
              </div>
            </div>
          </div>
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

        {/* Governorates shipping guide and calculator */}
        <div className="bg-white rounded-2xl shadow-soft-md border border-rawaa-border p-6 sm:p-8 mb-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-6 border-b border-rawaa-border">
            <div>
              <span className="text-xs text-rawaa-primary font-bold">دليل الشحن السريع في مصر</span>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-rawaa-dark mt-1">
                مواعيد وتكلفة التوصيل لجميع المحافظات
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-800 font-semibold px-3 py-1.5 rounded-full border border-emerald-200">
              <ShieldCheck size={16} />
              <span>شحن مبرد ومعقم للمنتجات الحساسة</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {GOVERNORATES.map((gov, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-rawaa-border bg-[#FAF7F2] hover:border-rawaa-primary hover:bg-white transition-all cursor-default"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-heading text-sm font-bold text-rawaa-dark">{gov.name}</h3>
                  <span className="text-[10px] font-bold bg-rawaa-primary-light text-rawaa-primary px-2 py-0.5 rounded-full">
                    {gov.speed}
                  </span>
                </div>
                <div className="text-xs text-rawaa-muted space-y-1.5 mt-2">
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-rawaa-subtle shrink-0" />
                    <span>{gov.eta}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck size={13} className="text-rawaa-subtle shrink-0" />
                    <span className="text-rawaa-dark font-medium">{gov.fee}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safe delivery guarantees pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-5 rounded-2xl border border-rawaa-border shadow-soft-xs text-center">
            <div className="w-12 h-12 rounded-full bg-rawaa-primary-light text-rawaa-primary flex items-center justify-center mx-auto mb-3">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-heading text-sm font-bold text-rawaa-dark mb-1">
              حق المعاينة قبل الدفع
            </h3>
            <p className="text-xs text-rawaa-muted leading-relaxed">
              يحق لكِ فحص المنتج والتأكد من سلامته التامة ومطابقته للطلب بحضور المندوب قبل دفع أي مليم.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-rawaa-border shadow-soft-xs text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <Truck size={24} />
            </div>
            <h3 className="font-heading text-sm font-bold text-rawaa-dark mb-1">
              سيارات نقل مكيفة
            </h3>
            <p className="text-xs text-rawaa-muted leading-relaxed">
              شحن مخصص يضمن عدم تأثر الخامات العضوية أو السيليكون الطبي أو عبوات الرضاعة بدرجات الحرارة.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-rawaa-border shadow-soft-xs text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-3">
              <Phone size={24} />
            </div>
            <h3 className="font-heading text-sm font-bold text-rawaa-dark mb-1">
              دعم فوري على الواتساب
            </h3>
            <p className="text-xs text-rawaa-muted leading-relaxed">
              فريق خدمة عملاء متواجد على مدار اليوم لتغيير موعد التسليم أو تعديل العنوان فور رغبتك.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
