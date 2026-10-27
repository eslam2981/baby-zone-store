// Header navigation bar providing breadcrumbs quick search and notifications
import { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Plus,
  User,
  LogOut,
  Settings,
  ExternalLink,
  Package,
  Layers,
  TicketPercent,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronDown
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useShop } from '../../context/ShopContext';

export default function AdminHeader() {
  const {
    currentAdmin,
    logoutAdmin,
    hasAdminPermission,
    orders,
    coupons,
    activityLog,
    setIsMobileSidebarOpen,
    isSidebarCollapsed,
    toggleSidebar
  } = useAdmin();

  const { allProducts, logout } = useShop();
  const location = useLocation();
  const navigate = useNavigate();

  // Search, notification, and profile popover states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const quickActionRef = useRef(null);
  const searchRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (quickActionRef.current && !quickActionRef.current.contains(e.target)) {
        setIsQuickActionOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute breadcrumbs and title
  const path = location.pathname;
  let pageTitle = 'لوحة التحكم';
  let breadcrumb = 'الرئيسية';

  if (path.includes('/admin/products')) {
    pageTitle = 'إدارة المنتجات والكتالوج';
    breadcrumb = 'المنتجات';
  } else if (path.includes('/admin/categories')) {
    pageTitle = 'إدارة الأقسام والتصنيفات';
    breadcrumb = 'الأقسام والتصنيفات';
  } else if (path.includes('/admin/orders')) {
    pageTitle = 'الطلبات والمبيعات';
    breadcrumb = 'الطلبات';
  } else if (path.includes('/admin/customers')) {
    pageTitle = 'العملاء والمستخدمين';
    breadcrumb = 'قاعدة العملاء';
  } else if (path.includes('/admin/inventory')) {
    pageTitle = 'المخزون والمستودع';
    breadcrumb = 'المخزون';
  } else if (path.includes('/admin/coupons')) {
    pageTitle = 'الكوبونات والعروض الترويجية';
    breadcrumb = 'الخصومات';
  } else if (path.includes('/admin/reviews')) {
    pageTitle = 'التقييمات والآراء';
    breadcrumb = 'مراجعات المنتجات';
  } else if (path.includes('/admin/analytics')) {
    pageTitle = 'التقارير والإحصائيات المتقدمة';
    breadcrumb = 'التحليلات';
  } else if (path.includes('/admin/settings')) {
    pageTitle = 'إعدادات متجر بيبي زون';
    breadcrumb = 'الإعدادات العامة';
  } else if (path.includes('/admin/admins')) {
    pageTitle = 'فريق الإدارة والصلاحيات';
    breadcrumb = 'صلاحيات المشرفين';
  }

  // Quick search results
  const searchResults = searchQuery.trim()
    ? {
        products: allProducts
          .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
          .slice(0, 3),
        orders: orders
          .filter((o) => o.id.toLowerCase().includes(searchQuery.toLowerCase()) || o.customerName.includes(searchQuery))
          .slice(0, 3)
      }
    : null;

  // Unread notifications calculation
  const pendingOrders = orders.filter((o) => o.deliveryStatus === 'بانتظار التأكيد');
  const lowStockProducts = allProducts.filter((p) => p.stockCount <= 5);
  const totalNotifications = pendingOrders.length + lowStockProducts.length;

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-rawaa-border px-4 sm:px-6 py-3 transition-all">
      <div className="flex items-center justify-between gap-3">
        {/* Mobile menu trigger and breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl text-rawaa-dark hover:bg-rawaa-soft transition-colors cursor-pointer"
            aria-label="فتح القائمة الجانبية"
          >
            <Menu size={20} />
          </button>

          <div>
            <div className="flex items-center gap-1.5 text-[11px] text-rawaa-subtle font-medium">
              <Link to="/admin" className="hover:text-rawaa-primary transition-colors">
                لوحة الإدارة
              </Link>
              <span>/</span>
              <span className="text-rawaa-muted font-bold">{breadcrumb}</span>
            </div>
            <h1 className="font-heading text-base sm:text-lg font-black text-rawaa-dark leading-tight mt-0.5">
              {pageTitle}
            </h1>
          </div>
        </div>

        {/* Global search quick actions and admin profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global search bar */}
          <div className="relative" ref={searchRef}>
            <div className="hidden md:flex items-center bg-rawaa-soft border border-rawaa-border rounded-full h-9 px-3.5 focus-within:border-rawaa-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-rawaa-primary/15 transition-all w-52 lg:w-72">
              <Search size={15} className="text-rawaa-subtle shrink-0 ml-2" />
              <input
                type="text"
                placeholder="ابحث عن منتج، طلب، عميل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchOpen(true)}
                className="w-full bg-transparent border-none outline-none text-xs text-rawaa-dark placeholder-rawaa-subtle"
              />
            </div>

            {/* Live search results popover */}
            {isSearchOpen && searchResults && (
              <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-soft-xl border border-rawaa-border p-3 space-y-3 z-50 text-right animate-fadeIn">
                {searchResults.products.length === 0 && searchResults.orders.length === 0 ? (
                  <p className="text-xs text-rawaa-muted text-center py-4">لا توجد نتائج مطابقة لـ «{searchQuery}»</p>
                ) : (
                  <>
                    {searchResults.products.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold text-rawaa-subtle uppercase block mb-1 px-1">المنتجات</span>
                        <div className="space-y-1">
                          {searchResults.products.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setIsSearchOpen(false);
                                setSearchQuery('');
                                navigate('/admin/products');
                              }}
                              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-rawaa-soft w-full text-right transition-colors cursor-pointer"
                            >
                              <img src={p.mainImage} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                              <div className="flex-1 min-w-0">
                                <span className="block text-xs font-bold text-rawaa-dark truncate">{p.name}</span>
                                <span className="block text-[10px] text-rawaa-primary font-bold">{p.price} ج.م</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {searchResults.orders.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold text-rawaa-subtle uppercase block mb-1 px-1">الطلبات</span>
                        <div className="space-y-1">
                          {searchResults.orders.map((o) => (
                            <button
                              key={o.id}
                              type="button"
                              onClick={() => {
                                setIsSearchOpen(false);
                                setSearchQuery('');
                                navigate('/admin/orders');
                              }}
                              className="flex items-center justify-between p-2 rounded-lg hover:bg-rawaa-soft w-full text-right transition-colors cursor-pointer"
                            >
                              <div>
                                <span className="block text-xs font-mono font-bold text-rawaa-dark">{o.id}</span>
                                <span className="block text-[10px] text-rawaa-muted">{o.customerName} - {o.city}</span>
                              </div>
                              <span className="text-xs font-bold text-rawaa-primary">{o.total} ج.م</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Quick add action dropdown */}
          <div className="relative" ref={quickActionRef}>
            <button
              type="button"
              onClick={() => setIsQuickActionOpen((prev) => !prev)}
              className="flex items-center gap-1.5 bg-rawaa-primary hover:bg-rawaa-primary-hover active:scale-95 text-white text-xs font-bold h-9 px-3.5 rounded-full shadow-soft-xs transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">إجراء سريع</span>
              <ChevronDown size={14} className="hidden sm:inline opacity-70" />
            </button>

            {isQuickActionOpen && (
              <div className="absolute left-0 mt-2 w-52 bg-white rounded-2xl shadow-soft-xl border border-rawaa-border p-1.5 z-50 text-right animate-fadeIn">
                {hasAdminPermission('products') && (
                  <Link
                    to="/admin/products?action=add"
                    onClick={() => setIsQuickActionOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rawaa-dark hover:bg-rawaa-soft rounded-xl transition-colors"
                  >
                    <Package size={16} className="text-rawaa-primary" />
                    <span>إضافة منتج جديد</span>
                  </Link>
                )}
                {hasAdminPermission(['products', 'categories']) && (
                  <Link
                    to="/admin/categories?action=add"
                    onClick={() => setIsQuickActionOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rawaa-dark hover:bg-rawaa-soft rounded-xl transition-colors"
                  >
                    <Layers size={16} className="text-rawaa-sage" />
                    <span>إضافة قسم جديد</span>
                  </Link>
                )}
                {hasAdminPermission('coupons') && (
                  <Link
                    to="/admin/coupons?action=add"
                    onClick={() => setIsQuickActionOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rawaa-dark hover:bg-rawaa-soft rounded-xl transition-colors"
                  >
                    <TicketPercent size={16} className="text-rawaa-amber" />
                    <span>إنشاء كوبون خصم</span>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Notifications bell dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setIsNotificationsOpen((prev) => !prev)}
              className="relative p-2 rounded-full text-rawaa-dark hover:bg-rawaa-soft transition-colors cursor-pointer"
              aria-label="التنبيهات الإدارية"
            >
              <Bell size={19} />
              {totalNotifications > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {totalNotifications}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute left-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-soft-xl border border-rawaa-border p-3.5 z-50 text-right animate-fadeIn">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-rawaa-border">
                  <strong className="text-xs font-heading font-bold text-rawaa-dark">التنبيهات الإدارية</strong>
                  <span className="text-[10px] font-bold text-rawaa-primary bg-rawaa-primary-light px-2 py-0.5 rounded-full">
                    {totalNotifications} جديد
                  </span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto custom-modal-scroll">
                  {pendingOrders.map((ord) => (
                    <Link
                      key={ord.id}
                      to="/admin/orders"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="flex items-start gap-2.5 p-2 rounded-xl bg-amber-50 hover:bg-amber-100/70 border border-amber-200/60 transition-colors"
                    >
                      <Clock size={16} className="text-amber-600 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <span className="block text-xs font-bold text-rawaa-dark">
                          طلب جديد بحاجة لتأكيد #{ord.id}
                        </span>
                        <span className="block text-[10px] text-rawaa-muted mt-0.5">
                          {ord.customerName} • {ord.total} ج.م • {ord.city}
                        </span>
                      </div>
                    </Link>
                  ))}

                  {lowStockProducts.map((p) => (
                    <Link
                      key={p.id}
                      to="/admin/inventory"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="flex items-start gap-2.5 p-2 rounded-xl bg-red-50 hover:bg-red-100/70 border border-red-200/60 transition-colors"
                    >
                      <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <span className="block text-xs font-bold text-rawaa-dark truncate">
                          مخزون حرج: {p.name}
                        </span>
                        <span className="block text-[10px] text-red-600 font-bold mt-0.5">
                          متبقي فقط {p.stockCount} قطع في المستودع
                        </span>
                      </div>
                    </Link>
                  ))}

                  {totalNotifications === 0 && (
                    <div className="text-center py-6 text-rawaa-muted">
                      <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-1" />
                      <span className="text-xs font-medium">كل شيء يسير على ما يرام! لا توجد تنبيهات عاجلة</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Admin user profile menu */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1 sm:pr-2.5 sm:pl-1 bg-rawaa-soft hover:bg-rawaa-primary-light/60 rounded-full border border-rawaa-border transition-colors cursor-pointer"
            >
              <img
                src={currentAdmin?.avatar || '/logo.png'}
                alt={currentAdmin?.name || 'الأدمن'}
                className="w-7 h-7 rounded-full object-cover bg-white p-0.5 border border-rawaa-border"
              />
              <span className="text-xs font-bold text-rawaa-dark hidden sm:inline max-w-[100px] truncate">
                {currentAdmin?.name || 'إسلام جميل'}
              </span>
              <ChevronDown size={14} className="text-rawaa-muted hidden sm:inline" />
            </button>

            {isProfileOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-soft-xl border border-rawaa-border p-2 z-50 text-right animate-fadeIn">
                <div className="p-2 border-b border-rawaa-border mb-1">
                  <strong className="block text-xs font-bold text-rawaa-dark">
                    {currentAdmin?.name || 'إسلام جميل'}
                  </strong>
                  <span className="block text-[10px] text-rawaa-muted truncate">
                    {currentAdmin?.email || 'admin@babyzone-egypt.com'}
                  </span>
                  <span className="inline-block mt-1 bg-rawaa-primary-light text-rawaa-primary text-[9px] font-bold px-2 py-0.5 rounded-full">
                    {currentAdmin?.role || 'مدير عام المتجر'}
                  </span>
                </div>

                {hasAdminPermission('settings') && (
                  <Link
                    to="/admin/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-rawaa-dark hover:bg-rawaa-soft rounded-xl transition-colors"
                  >
                    <Settings size={15} />
                    <span>إعدادات الحساب والمتجر</span>
                  </Link>
                )}

                <Link
                  to="/"
                  target="_blank"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-rawaa-dark hover:bg-rawaa-soft rounded-xl transition-colors"
                >
                  <ExternalLink size={15} />
                  <span>معاينة واجهة المتجر</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    logoutAdmin();
                    logout();
                    navigate('/admin/login');
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl w-full text-right transition-colors cursor-pointer"
                >
                  <LogOut size={15} />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
