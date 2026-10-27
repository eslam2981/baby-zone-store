// Sidebar navigation component for store management and administrative controls
import { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  Package,
  Layers,
  ShoppingCart,
  Users,
  Boxes,
  TicketPercent,
  Star,
  Settings,
  ShieldCheck,
  ExternalLink,
  LogOut,
  ChevronRight,
  ChevronLeft,
  X
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useShop } from '../../context/ShopContext';

export default function AdminSidebar() {
  const {
    currentAdmin,
    logoutAdmin,
    orders,
    coupons,
    isSidebarCollapsed,
    toggleSidebar,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen
  } = useAdmin();

  const { allProducts } = useShop();
  const navigate = useNavigate();

  // Pending orders and low stock counters
  const pendingOrdersCount = orders.filter((o) => o.deliveryStatus === 'بانتظار التأكيد' || o.deliveryStatus === 'قيد التجهيز الطبي').length;
  const lowStockCount = allProducts.filter((p) => p.stockCount <= 5).length;
  const activeCouponsCount = coupons.filter((c) => c.isActive).length;

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  const hasPerm = (requiredPerm) => {
    if (!currentAdmin) return false;
    const perms = currentAdmin.permissions || [];
    if (
      perms.includes('all') ||
      perms.includes('*') ||
      currentAdmin.role?.includes('Super Admin') ||
      currentAdmin.role?.includes('مدير عام')
    ) {
      return true;
    }
    if (!requiredPerm) return true;
    if (Array.isArray(requiredPerm)) {
      return requiredPerm.some((p) => perms.includes(p));
    }
    return perms.includes(requiredPerm);
  };

  const navGroups = useMemo(() => [
    {
      title: 'الرئيسية والتحليلات',
      items: [
        {
          name: 'لوحة التحكم',
          path: '/admin',
          icon: LayoutDashboard,
          end: true,
          perm: null
        },
        {
          name: 'التقارير والإحصائيات',
          path: '/admin/analytics',
          icon: BarChart3,
          perm: 'analytics'
        }
      ]
    },
    {
      title: 'المتجر والطلبات',
      items: [
        {
          name: 'إدارة المنتجات',
          path: '/admin/products',
          icon: Package,
          badge: allProducts.length,
          badgeColor: 'bg-rawaa-soft text-rawaa-dark',
          perm: 'products'
        },
        {
          name: 'الأقسام والتصنيفات',
          path: '/admin/categories',
          icon: Layers,
          perm: ['products', 'categories']
        },
        {
          name: 'الطلبات والمبيعات',
          path: '/admin/orders',
          icon: ShoppingCart,
          badge: pendingOrdersCount > 0 ? pendingOrdersCount : null,
          badgeColor: 'bg-amber-500 text-white',
          perm: 'orders'
        },
        {
          name: 'العملاء والمستخدمين',
          path: '/admin/customers',
          icon: Users,
          perm: 'customers'
        }
      ]
    },
    {
      title: 'المستودع والتسويق',
      items: [
        {
          name: 'إدارة المخزون',
          path: '/admin/inventory',
          icon: Boxes,
          badge: lowStockCount > 0 ? lowStockCount : null,
          badgeColor: 'bg-red-500 text-white',
          perm: ['products', 'inventory']
        },
        {
          name: 'الكوبونات والخصومات',
          path: '/admin/coupons',
          icon: TicketPercent,
          badge: activeCouponsCount,
          badgeColor: 'bg-emerald-600 text-white',
          perm: 'coupons'
        },
        {
          name: 'التقييمات والآراء',
          path: '/admin/reviews',
          icon: Star,
          perm: 'reviews'
        }
      ]
    },
    {
      title: 'النظام والإعدادات',
      items: [
        {
          name: 'إعدادات المتجر',
          path: '/admin/settings',
          icon: Settings,
          perm: 'settings'
        },
        {
          name: 'فريق الإدارة والصلاحيات',
          path: '/admin/admins',
          icon: ShieldCheck,
          perm: 'admins'
        }
      ]
    }
  ], [allProducts.length, pendingOrdersCount, lowStockCount, activeCouponsCount]);

  const visibleNavGroups = useMemo(() => {
    return navGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => hasPerm(item.perm))
      }))
      .filter((group) => group.items.length > 0);
  }, [navGroups, currentAdmin]);

  const renderSidebarContent = (isMobile = false) => {
    const collapsed = isMobile ? false : isSidebarCollapsed;

    return (
      <div className="flex flex-col h-full bg-white text-rawaa-dark select-none border-l border-rawaa-border shadow-soft-xs">
        {/* Brand header */}
        <div className={`p-4 border-b border-rawaa-border flex items-center ${collapsed ? 'justify-center' : 'justify-between'} shrink-0 bg-white`}>
          <Link to="/admin" className="flex items-center gap-3 min-w-0" onClick={() => setIsMobileSidebarOpen(false)}>
            <img
              src="/logo.png"
              alt="شعار بيبي زون"
              className="w-10 h-10 object-contain rounded-full bg-rawaa-soft p-0.5 shadow-soft-xs shrink-0 border border-rawaa-border"
            />
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-heading font-black text-sm text-rawaa-dark tracking-tight leading-snug truncate">
                  بيبي <span className="text-rawaa-primary">زون</span>
                </span>
                <span className="text-[10px] text-rawaa-sage font-bold uppercase tracking-wider">
                  لوحة الإدارة والتحكم
                </span>
              </div>
            )}
          </Link>

          {/* Mobile close button */}
          {isMobile && (
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="w-9 h-9 rounded-xl text-rawaa-muted hover:text-rawaa-dark hover:bg-rawaa-soft flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label="إغلاق القائمة"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto custom-modal-scroll py-4 px-3 space-y-6">
          {visibleNavGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!collapsed && (
                <h4 className="px-3 text-[10px] font-bold text-rawaa-subtle uppercase tracking-wider mb-2">
                  {group.title}
                </h4>
              )}
              <div className="space-y-1">
                {group.items.map((item, iIdx) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={iIdx}
                      to={item.path}
                      end={item.end}
                      onClick={() => setIsMobileSidebarOpen(false)}
                      title={collapsed ? item.name : undefined}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all group cursor-pointer ${
                          isActive
                            ? 'bg-rawaa-primary text-white shadow-soft-xs translate-x-[-2px]'
                            : 'text-rawaa-dark/75 hover:bg-rawaa-soft hover:text-rawaa-primary'
                        } ${collapsed ? 'justify-center px-2' : ''}`
                      }
                    >
                      <Icon size={18} className="shrink-0 transition-transform group-hover:scale-110" />
                      {!collapsed && (
                        <span className="flex-1 truncate text-right">
                          {item.name}
                        </span>
                      )}
                      {!collapsed && item.badge !== undefined && item.badge !== null && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${item.badgeColor || 'bg-rawaa-soft text-rawaa-dark'}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer administrative controls */}
        <div className="p-3 border-t border-rawaa-border bg-rawaa-soft/40 flex flex-col gap-2 shrink-0">
          {/* Visit storefront direct link */}
          <Link
            to="/"
            target="_blank"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rawaa-sage bg-rawaa-sage-light hover:bg-rawaa-sage hover:text-white border border-rawaa-sage/25 shadow-soft-xs transition-all cursor-pointer ${
              collapsed ? 'justify-center px-2' : ''
            }`}
            title="معاينة المتجر كعميل"
          >
            <ExternalLink size={16} className="shrink-0" />
            {!collapsed && <span className="truncate">معاينة واجهة المتجر</span>}
          </Link>

          {/* Current admin profile and quick logout */}
          <div className={`flex items-center gap-2.5 p-2 rounded-xl bg-white border border-rawaa-border shadow-soft-xs ${collapsed ? 'justify-center' : ''}`}>
            <img
              src={currentAdmin?.avatar || '/logo.png'}
              alt={currentAdmin?.name || 'الأدمن'}
              className="w-8 h-8 rounded-full object-cover border border-rawaa-border bg-rawaa-soft p-0.5 shrink-0"
            />
            {!collapsed && (
              <div className="flex-1 min-w-0 text-right leading-tight">
                <span className="block text-xs font-bold text-rawaa-dark truncate">
                  {currentAdmin?.name || 'إسلام جميل'}
                </span>
                <span className="block text-[10px] text-rawaa-muted truncate">
                  {currentAdmin?.role || 'مدير عام المتجر'}
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-rawaa-muted hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
              title="تسجيل الخروج من لوحة التحكم"
              aria-label="تسجيل الخروج"
            >
              <LogOut size={16} />
            </button>
          </div>

          {/* Desktop collapse expand toggle trigger */}
          {!isMobile && (
            <button
              type="button"
              onClick={toggleSidebar}
              className="hidden lg:flex items-center justify-center py-1 text-rawaa-muted hover:text-rawaa-primary transition-colors cursor-pointer"
              title={collapsed ? 'توسيع القائمة الجانبية' : 'طي القائمة الجانبية'}
              aria-label="طي أو توسيع القائمة"
            >
              {collapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside
        className={`hidden lg:block fixed top-0 right-0 h-screen z-30 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile drawer backdrop and overlay in portal */}
      {isMobileSidebarOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="lg:hidden fixed inset-0 z-[99999] bg-rawaa-dark/60 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-hidden={!isMobileSidebarOpen}
        >
          <div
            className="fixed inset-y-0 right-0 w-72 max-w-[85vw] h-full shadow-2xl overflow-y-auto overscroll-contain transition-transform duration-300 ease-in-out animate-slideInRight"
            onClick={(e) => e.stopPropagation()}
          >
            {renderSidebarContent(true)}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
