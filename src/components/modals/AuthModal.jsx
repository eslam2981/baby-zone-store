import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { useAdmin } from '../../context/AdminContext';
import { ordersApi } from '../../services/api';
import {
  X,
  User,
  Mail,
  Lock,
  Phone,
  Heart,
  LogOut,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  Package,
} from 'lucide-react';

export default function AuthModal() {
  const { isAuthOpen, setIsAuthOpen, user, login, logout, formatPrice } = useShop();
  const { isAuthenticated, currentAdmin, admins, loginAdmin, logoutAdmin } = useAdmin();

  // Active tab state for login and registration views
  const [activeTab, setActiveTab] = useState('login');
  const [userOrders, setUserOrders] = useState([]);
  const [isLoadingUserOrders, setIsLoadingUserOrders] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [babyStage, setBabyStage] = useState('expecting');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isRendered, setIsRendered] = useState(isAuthOpen);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isAuthOpen) {
      setIsRendered(true);
      setErrorMessage('');
      const timer = setTimeout(() => setIsVisible(true), 20);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isAuthOpen]);

  // Fetch real customer stats from Supabase Cloud when modal is open
  useEffect(() => {
    let isMounted = true;
    async function loadCustomerStats() {
      if (!user || (!user.email && !user.phone)) {
        setUserOrders([]);
        return;
      }
      try {
        setIsLoadingUserOrders(true);
        const data = await ordersApi.getByCustomer(user.email, user.phone);
        if (isMounted && Array.isArray(data)) {
          setUserOrders(data);
        }
      } catch (err) {
        console.warn('Error loading customer orders in modal:', err);
      } finally {
        if (isMounted) setIsLoadingUserOrders(false);
      }
    }

    if (isAuthOpen && user && !user.isAdmin) {
      loadCustomerStats();
    }
    return () => {
      isMounted = false;
    };
  }, [isAuthOpen, user]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsAuthOpen(false);
      setIsRendered(false);
      setErrorMessage('');
    }, 300);
  };

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isVisible) {
        handleClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  if (!isRendered || typeof document === 'undefined') return null;

  const isAdmin = Boolean(
    isAuthenticated && currentAdmin && (user?.isAdmin || currentAdmin)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMessage('');

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('يرجى إدخال البريد الإلكتروني');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage('صيغة البريد الإلكتروني غير صحيحة (مثال: name@example.com)');
      return;
    }

    // Check if the email belongs to any registered admin member
    const matchingAdmin = (admins || []).find(
      (a) => a.email && a.email.trim().toLowerCase() === cleanEmail.toLowerCase()
    );

    setIsSubmitting(true);
    try {
      if (matchingAdmin) {
        if (!password) {
          setErrorMessage('يرجى إدخال كلمة المرور لتسجيل الدخول كمدير');
          setIsSubmitting(false);
          return;
        }
        const res = await loginAdmin(cleanEmail, password);
        const isSuccess = typeof res === 'boolean' ? res : res?.success;
        if (!isSuccess) {
          setErrorMessage(res?.error || 'كلمة المرور الخاصة بمدير النظام غير صحيحة');
          setIsSubmitting(false);
          return;
        }
        await login(cleanEmail, matchingAdmin.name, {
          isAdmin: true,
          role: matchingAdmin.role,
          permissions: matchingAdmin.permissions || ['all']
        });
        handleClose();
        return;
      }

      if (activeTab === 'login') {
        const derivedName = cleanEmail.split('@')[0] || 'عميل بيبي زون';
        const res = await login(cleanEmail, derivedName, { isRegistration: false });
        if (res) {
          handleClose();
        } else {
          setErrorMessage('هذا الحساب غير مسجل أو تم حذفه من قِبل الإدارة. يمكنك إنشاء حساب جديد من تبويب "إنشاء حساب جديد".');
        }
      } else {
        const cleanName = name.trim();
        if (!cleanName || cleanName.length < 2) {
          setErrorMessage('يرجى كتابة الاسم الكريم (حرفين على الأقل)');
          setIsSubmitting(false);
          return;
        }
        if (password && password.length < 6) {
          setErrorMessage('كلمة المرور يجب أن لا تقل عن 6 خانات للأمان');
          setIsSubmitting(false);
          return;
        }
        const res = await login(cleanEmail, cleanName, {
          isRegistration: true,
          babyStage,
          phone: phone.trim() || undefined
        });
        if (res) {
          handleClose();
        } else {
          setErrorMessage('تعذر إنشاء الحساب، يرجى المحاولة مرة أخرى والتأكد من البيانات.');
        }
      }
    } catch (err) {
      console.error('Auth submit error:', err);
      setErrorMessage(err?.message || 'حدث خطأ غير متوقع أثناء معالجة الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      className={`fixed inset-0 bg-rawaa-dark/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain transition-opacity duration-300 ease-out ${
        isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-white rounded-2xl sm:rounded-panel max-w-md w-full p-5 sm:p-8 shadow-soft-xl relative border border-rawaa-border my-auto max-h-[92vh] overflow-y-auto overflow-x-hidden overscroll-contain transition-all duration-300 ease-out transform ${
          isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute top-4 left-4 w-8 h-8 rounded-full bg-rawaa-soft hover:bg-rawaa-primary-light text-rawaa-muted hover:text-rawaa-primary flex items-center justify-center transition-colors cursor-pointer"
          onClick={handleClose}
          aria-label="إغلاق نافذة الحساب"
        >
          <X size={18} />
        </button>

        {user ? (
          <div className="text-center py-4">
            {isAdmin ? (
              <>
                <div className="w-16 h-16 rounded-full bg-rawaa-primary/10 border-2 border-rawaa-primary/30 text-rawaa-primary flex items-center justify-center mx-auto mb-3 shadow-soft-xs">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="font-heading text-xl font-bold text-rawaa-dark">
                  أهلاً بك، {currentAdmin?.name || user.name || 'مدير النظام'}!
                </h3>
                <div className="flex items-center justify-center gap-2 mt-1 mb-4">
                  <span className="text-xs text-rawaa-muted">{currentAdmin?.email || user.email}</span>
                  <span className="text-[10px] font-bold bg-rawaa-sage/15 text-rawaa-sage px-2.5 py-0.5 rounded-full border border-rawaa-sage/30">
                    {currentAdmin?.role || 'مشرف إداري'}
                  </span>
                </div>

                <div className="bg-rawaa-soft border border-rawaa-border rounded-xl p-3.5 text-right flex flex-col gap-2 mb-4 text-xs text-rawaa-dark">
                  <div className="flex items-center justify-between pb-1.5 border-b border-rawaa-border">
                    <span className="font-bold text-[11px]">حالة الحساب الإداري:</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1.5 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      صلاحيات مفعلة
                    </span>
                  </div>
                  <div className="pt-1">
                    <span className="font-semibold text-rawaa-dark text-[11px] block mb-1.5">الصلاحيات المتاحة لك:</span>
                    <div className="flex flex-wrap gap-1">
                      {(currentAdmin?.permissions || ['all']).includes('all') || (currentAdmin?.permissions || []).includes('*') ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold">
                          ⚡ كامل صلاحيات لوحة التحكم (Super Admin)
                        </span>
                      ) : (
                        (currentAdmin?.permissions || []).map((perm) => (
                          <span key={perm} className="bg-white border border-rawaa-border text-rawaa-dark text-[10px] px-2 py-0.5 rounded font-medium shadow-2xs">
                            {perm === 'orders' ? 'الطلبات والمبيعات' :
                             perm === 'products' ? 'إدارة المنتجات' :
                             perm === 'inventory' ? 'المخزون' :
                             perm === 'customers' ? 'العملاء' :
                             perm === 'coupons' ? 'كوبونات الخصم' :
                             perm === 'reviews' ? 'التقييمات' :
                             perm === 'analytics' ? 'التقارير والإحصائيات' :
                             perm === 'settings' ? 'إعدادات المتجر' :
                             perm === 'admins' ? 'فريق الإدارة' : perm}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <Link
                  to="/admin"
                  onClick={handleClose}
                  className="w-full bg-rawaa-primary hover:bg-rawaa-primary-hover text-white text-xs font-bold py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-all shadow-soft-sm hover:shadow-soft-md hover:-translate-y-0.5 cursor-pointer mb-2.5"
                >
                  <ShieldCheck size={16} />
                  <span>الانتقال إلى لوحة الإدارة والتحكم</span>
                  <ArrowLeft size={14} />
                </Link>

                <button
                  type="button"
                  className="w-full border border-rawaa-border hover:border-red-300 hover:bg-red-50 text-red-600 text-xs font-bold py-2.5 px-4 rounded-full flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  onClick={() => {
                    logout();
                    logoutAdmin();
                    handleClose();
                  }}
                >
                  <LogOut size={16} />
                  <span>تسجيل الخروج من الحساب</span>
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-rawaa-primary-light text-rawaa-primary flex items-center justify-center mx-auto mb-3 font-heading font-black text-2xl shadow-soft-xs border border-rawaa-primary/20">
                  {user.name ? user.name.charAt(0) : <User size={30} />}
                </div>
                <div className="flex items-center justify-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-heading text-xl font-black text-rawaa-dark">أهلاً بكِ، {user.name}!</h3>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    user.isVip || userOrders.reduce((sum, ord) => sum + (ord.status !== 'ملغي' ? (Number(ord.total_amount) || 0) : 0), 0) >= 1300
                      ? 'bg-amber-50 text-amber-900 border-amber-300'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    {user.isVip || userOrders.reduce((sum, ord) => sum + (ord.status !== 'ملغي' ? (Number(ord.total_amount) || 0) : 0), 0) >= 1300
                      ? '⭐ عضوية VIP الذهبية'
                      : 'عضوية مسجلة'}
                  </span>
                </div>
                <p className="text-xs text-rawaa-muted mb-4 font-mono">{user.email}</p>

                {/* Real User Stats Grid */}
                <div className="grid grid-cols-3 gap-2.5 mb-4">
                  <div className="bg-rawaa-soft/80 border border-rawaa-border/70 rounded-2xl p-2.5 text-center">
                    <span className="text-[10px] text-rawaa-muted font-bold block mb-1">الطلبات المسجلة</span>
                    <strong className="font-heading text-lg font-black text-rawaa-dark block">
                      {isLoadingUserOrders ? '...' : userOrders.length}
                    </strong>
                  </div>
                  <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-2.5 text-center">
                    <span className="text-[10px] text-purple-800 font-medium block mb-1">إجمالي المشتريات</span>
                    <strong className="font-heading text-xs sm:text-sm font-black text-purple-950 block truncate">
                      {isLoadingUserOrders
                        ? '...'
                        : `${userOrders.reduce((sum, ord) => sum + (ord.status !== 'ملغي' ? (Number(ord.total_amount) || 0) : 0), 0).toLocaleString()} ج.م`}
                    </strong>
                  </div>
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-2.5 text-center">
                    <span className="text-[10px] text-amber-800 font-medium block mb-1">قيد التوصيل</span>
                    <strong className="font-heading text-lg font-black text-amber-900 block">
                      {isLoadingUserOrders
                        ? '...'
                        : userOrders.filter((o) => o.status !== 'تم التسليم' && o.status !== 'ملغي').length}
                    </strong>
                  </div>
                </div>

                {/* Real Customer Contact Card */}
                <div className="bg-rawaa-soft rounded-2xl p-3.5 text-right flex flex-col gap-2 mb-4 text-xs text-rawaa-dark border border-rawaa-border/60">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-rawaa-muted">رقم الهاتف المعتمد:</span>
                    <strong className="text-rawaa-dark font-mono font-bold" dir="ltr">
                      {user.phone || 'لم يُسجل هاتف بعد'}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-rawaa-border/60">
                    <span className="text-rawaa-muted">المحافظة والعنوان:</span>
                    <strong className="text-rawaa-dark font-bold">
                      {user.city ? `${user.city}${user.address ? ` - ${user.address}` : ''}` : 'لم تُحدد المحافظة'}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-rawaa-border/60">
                    <span className="text-rawaa-muted">حالة السيرفر:</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      متصل ومسجل بالسيرفر السحابي
                    </span>
                  </div>
                </div>

                <Link
                  to="/track-order"
                  onClick={handleClose}
                  className="w-full bg-rawaa-primary hover:bg-rawaa-primary-hover text-white text-xs font-bold py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-all shadow-soft-sm hover:shadow-soft-md hover:-translate-y-0.5 cursor-pointer mb-2.5"
                >
                  <Package size={16} />
                  <span>صفحتي الخاصة وسجل طلباتي ({userOrders.length})</span>
                  <ArrowLeft size={14} />
                </Link>

                <button
                  type="button"
                  className="w-full border border-rawaa-border hover:border-red-300 hover:bg-red-50 text-red-600 text-xs font-bold py-2.5 px-4 rounded-full flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  onClick={() => {
                    logout();
                    logoutAdmin();
                    handleClose();
                  }}
                >
                  <LogOut size={16} />
                  <span>تسجيل الخروج من الحساب</span>
                </button>
              </>
            )}
          </div>
        ) : (
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-rawaa-primary-light text-rawaa-primary flex items-center justify-center mx-auto mb-2.5">
                <Heart size={22} />
              </div>
              <h3 className="font-heading text-xl font-bold text-rawaa-dark">عضوية عائلة بيبي زون</h3>
              <p className="text-xs text-rawaa-muted mt-1">
                سجلي دخولك لتتبع طلبياتك وحفظ مقاسات طفلك وتلقي عروض المناسبات الحصرية
              </p>
            </div>

            {/* Tab switch between login and registration */}
            <div className="flex bg-rawaa-soft rounded-full p-1 mb-4 text-xs font-bold">
              <button
                type="button"
                className={`flex-1 py-2 rounded-full transition-all cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-white text-rawaa-primary shadow-soft-xs'
                    : 'text-rawaa-muted hover:text-rawaa-dark'
                }`}
                onClick={() => {
                  setActiveTab('login');
                  setErrorMessage('');
                }}
              >
                تسجيل الدخول
              </button>
              <button
                type="button"
                className={`flex-1 py-2 rounded-full transition-all cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-white text-rawaa-primary shadow-soft-xs'
                    : 'text-rawaa-muted hover:text-rawaa-dark'
                }`}
                onClick={() => {
                  setActiveTab('register');
                  setErrorMessage('');
                }}
              >
                إنشاء حساب جديد
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="text-red-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              {activeTab === 'register' && (
                <div>
                  <label htmlFor="reg-name" className="block text-xs font-semibold text-rawaa-dark mb-1">
                    الاسم:
                  </label>
                  <div className="flex items-center bg-rawaa-soft border border-rawaa-border rounded-xl px-3 py-2 focus-within:border-rawaa-primary focus-within:bg-white">
                    <User size={16} className="text-rawaa-muted ml-2" />
                    <input
                      id="reg-name"
                      type="text"
                      placeholder="مثال: سارة الشمري"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full bg-transparent text-xs text-rawaa-dark outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="auth-email" className="block text-xs font-semibold text-rawaa-dark mb-1">
                  البريد الإلكتروني:
                </label>
                <div className="flex items-center bg-rawaa-soft border border-rawaa-border rounded-xl px-3 py-2 focus-within:border-rawaa-primary focus-within:bg-white">
                  <Mail size={16} className="text-rawaa-muted ml-2" />
                  <input
                    id="auth-email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-transparent text-xs text-rawaa-dark outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="auth-password" className="block text-xs font-semibold text-rawaa-dark mb-1">
                  {activeTab === 'register' ? 'كلمة المرور (6 خانات على الأقل):' : 'كلمة المرور:'}
                </label>
                <div className="flex items-center bg-rawaa-soft border border-rawaa-border rounded-xl px-3 py-2.5 focus-within:border-rawaa-primary focus-within:bg-white">
                  <Lock size={16} className="text-rawaa-muted ml-2 shrink-0" />
                  <input
                    id="auth-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={activeTab === 'register'}
                    minLength={activeTab === 'register' ? 6 : undefined}
                    className="w-full bg-transparent text-xs text-rawaa-dark outline-none"
                  />
                </div>
              </div>

              {activeTab === 'register' && (
                <div>
                  <label htmlFor="reg-phone" className="block text-xs font-semibold text-rawaa-dark mb-1">
                    رقم الهاتف (اختياري لتأكيد الشحن والتواصل):
                  </label>
                  <div className="flex items-center bg-rawaa-soft border border-rawaa-border rounded-xl px-3 py-2.5 focus-within:border-rawaa-primary focus-within:bg-white">
                    <Phone size={16} className="text-rawaa-muted ml-2 shrink-0" />
                    <input
                      id="reg-phone"
                      type="tel"
                      placeholder="01xxxxxxxxx"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-transparent text-xs text-rawaa-dark outline-none font-mono"
                      dir="ltr"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'register' && (
                <div>
                  <label htmlFor="baby-stage-select" className="block text-xs font-semibold text-rawaa-dark mb-1">
                    مرحلة الطفل الحالية:
                  </label>
                  <select
                    id="baby-stage-select"
                    value={babyStage}
                    onChange={(e) => setBabyStage(e.target.value)}
                    className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl p-2.5 text-xs text-rawaa-dark outline-none"
                  >
                    <option value="expecting">في انتظار المولود (فترة الحمل)</option>
                    <option value="newborn">حديث ولادة (0-6 أشهر)</option>
                    <option value="infant">رضيع (6-12 شهر)</option>
                    <option value="toddler">طفولة مبكرة (1-3 سنوات)</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-rawaa-primary hover:bg-rawaa-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold py-3.5 sm:py-3 rounded-full mt-2 shadow-soft-sm hover:shadow-soft-md transition-all hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>جاري معالجة الحساب...</span>
                  </>
                ) : (
                  <span>{activeTab === 'login' ? 'دخول إلى حسابي' : 'إنشاء الحساب وبدء التجربة'}</span>
                )}
              </button>
            </form>

            <p className="text-[11px] text-rawaa-subtle text-center mt-4">
              يمكنك دائماً الشراء كزائر دون الحاجة لتسجيل حساب مسبق
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
