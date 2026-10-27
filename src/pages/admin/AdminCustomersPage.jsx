import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAdmin } from '../../context/AdminContext';
import { useShop } from '../../context/ShopContext';
import {
  validateEmail,
  validateEgyptianPhone,
  validatePersonName,
  normalizeEgyptianPhone,
  sanitizeText
} from '../../utils/validators';
import {
  Users,
  Search,
  Filter,
  UserCheck,
  Crown,
  ShoppingBag,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Eye,
  X,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Shield,
  Key,
  Plus,
  Trash2,
  Save,
  Cloud,
  Loader2,
  Ban,
  Building2,
  Sparkles,
  RefreshCw,
  Info
} from 'lucide-react';
import ConfirmModal from '../../components/common/ConfirmModal';
import { TableRowSkeleton } from '../../components/common/Skeletons';

// Available granular permission definitions
const AVAILABLE_PERMISSIONS = [
  {
    id: 'view_catalog',
    name: 'تصفح الكتالوج والأسعار',
    desc: 'السماح للعميل بمشاهدة جميع منتجات وأقسام بيبي زون'
  },
  {
    id: 'place_orders',
    name: 'إتمام الطلبات وتأكيد الشراء',
    desc: 'القدرة على إضافة منتجات للسلة وإتمام عمليات الشراء والدفع'
  },
  {
    id: 'view_own_orders',
    name: 'تتبع الشحنات وسجل الطلبات',
    desc: 'الاطلاع على صفحة التتبع ومعرفة حالة التوصيل السريع'
  },
  {
    id: 'rate_products',
    name: 'كتابة تقييمات ومراجعات',
    desc: 'إضافة تقييم بالنجوم ومراجعة تجربة استخدام المنتجات'
  },
  {
    id: 'hospital_bag',
    name: 'حاسبة شنطة مستشفى الولادة',
    desc: 'الوصول لقائمة فحص حقيبة الولادة التفاعلية وحفظ عناصرها'
  },
  {
    id: 'vip_discounts',
    name: 'خصومات وأسعار VIP الحصرية',
    desc: 'تطبيق تخفيضات إضافية تلقائية للأعضاء المميزين'
  },
  {
    id: 'cod_payment',
    name: 'السماح بالدفع عند الاستلام (COD)',
    desc: 'إتاحة خيار السداد نقداً لمندوب الشحن عند باب المنزل'
  },
  {
    id: 'bulk_purchasing',
    name: 'الشراء بأسعار وكميات الجملة',
    desc: 'صلاحية مخصصة للتجار والموزعين لطلب كميات تجارية'
  }
];

export default function AdminCustomersPage() {
  const {
    customers,
    orders,
    isLoadingCustomers,
    updateCustomer,
    updateCustomerStatus,
    updateCustomerPermissions,
    addCustomer,
    deleteCustomer
  } = useAdmin();
  const { addToast } = useShop();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');

  // Customer drawer and edit modal states
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isSavingOnServer, setIsSavingOnServer] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Add customer modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: 'القاهرة',
    address: '',
    role: 'customer',
    isVip: false,
    status: 'نشط',
    permissions: ['view_catalog', 'place_orders', 'view_own_orders', 'rate_products', 'hospital_bag'],
    notes: ''
  });

  // Lock background scroll when drawer or modal is open
  useEffect(() => {
    if (selectedCustomer || isAddModalOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [selectedCustomer, isAddModalOpen]);

  // Extract unique cities from customers for filtering
  const cities = useMemo(() => {
    const set = new Set((customers || []).map((c) => c.city).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [customers]);

  // Filter customers based on search query status role and city
  const filteredCustomers = useMemo(() => {
    return (customers || []).filter((c) => {
      const matchSearch =
        !searchQuery.trim() ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        (c.city && c.city.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'vip' && c.isVip) ||
        (selectedStatus === 'active' && c.status === 'نشط' && !c.isVip) ||
        (selectedStatus === 'blocked' && c.status === 'محظور') ||
        (selectedStatus === 'inactive' && c.status === 'غير نشط');

      const matchRole =
        selectedRole === 'all' ||
        c.role === selectedRole;

      const matchCity = selectedCity === 'all' || c.city === selectedCity;

      return matchSearch && matchStatus && matchRole && matchCity;
    });
  }, [customers, searchQuery, selectedStatus, selectedRole, selectedCity]);

  // Customer statistics
  const stats = useMemo(() => {
    const total = customers.length;
    const vipCount = customers.filter((c) => c.isVip || c.role === 'vip_customer').length;
    const activeCount = customers.filter((c) => c.status === 'نشط').length;
    const blockedCount = customers.filter((c) => c.status === 'محظور').length;
    const totalSpent = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    return { total, vipCount, activeCount, blockedCount, totalSpent };
  }, [customers]);

  // Orders for selected customer in drawer
  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return orders.filter(
      (o) =>
        o.customerEmail === selectedCustomer.email ||
        o.customerPhone === selectedCustomer.phone ||
        o.customerName === selectedCustomer.name
    );
  }, [selectedCustomer, orders]);

  // Handle drawer field updates
  const handleDrawerFieldChange = (field, value) => {
    setSelectedCustomer((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // Toggle permission in drawer
  const handleTogglePermission = (permId) => {
    setSelectedCustomer((prev) => {
      const current = Array.isArray(prev.permissions) ? prev.permissions : [];
      const updated = current.includes(permId)
        ? current.filter((p) => p !== permId)
        : [...current, permId];
      return {
        ...prev,
        permissions: updated
      };
    });
  };

  // Save changes to Supabase Cloud server
  const handleSaveCustomerToServer = async () => {
    if (!selectedCustomer) return;

    const cleanName = sanitizeText(selectedCustomer.name);
    const nameErr = validatePersonName(cleanName, true, 2, 70);
    if (nameErr) {
      if (addToast) addToast(nameErr, 'warning');
      return;
    }

    const cleanEmail = sanitizeText(selectedCustomer.email);
    const emailErr = validateEmail(cleanEmail, true);
    if (emailErr) {
      if (addToast) addToast(emailErr, 'warning');
      return;
    }

    let cleanPhone = sanitizeText(selectedCustomer.phone);
    if (cleanPhone) {
      const phoneErr = validateEgyptianPhone(cleanPhone, false);
      if (phoneErr) {
        if (addToast) addToast(phoneErr, 'warning');
        return;
      }
      cleanPhone = normalizeEgyptianPhone(cleanPhone);
    }

    try {
      setIsSavingOnServer(true);
      await updateCustomer(selectedCustomer.id, {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        city: selectedCustomer.city,
        address: sanitizeText(selectedCustomer.address),
        role: selectedCustomer.role,
        permissions: selectedCustomer.permissions,
        isVip: selectedCustomer.isVip,
        status: selectedCustomer.status,
        notes: sanitizeText(selectedCustomer.notes)
      });
      if (addToast) addToast('تم حفظ وتحديث بيانات العميل بنجاح', 'success');
    } finally {
      setIsSavingOnServer(false);
    }
  };

  // Handle adding new customer on server
  const handleCreateCustomerSubmit = async (e) => {
    e.preventDefault();

    const cleanName = sanitizeText(newCustomerForm.name);
    const nameErr = validatePersonName(cleanName, true, 2, 70);
    if (nameErr) {
      if (addToast) addToast(nameErr, 'warning');
      return;
    }

    const cleanEmail = sanitizeText(newCustomerForm.email);
    const emailErr = validateEmail(cleanEmail, true);
    if (emailErr) {
      if (addToast) addToast(emailErr, 'warning');
      return;
    }

    let cleanPhone = '';
    if (newCustomerForm.phone && newCustomerForm.phone.trim()) {
      const phoneErr = validateEgyptianPhone(newCustomerForm.phone, false);
      if (phoneErr) {
        if (addToast) addToast(phoneErr, 'warning');
        return;
      }
      cleanPhone = normalizeEgyptianPhone(newCustomerForm.phone);
    }

    await addCustomer({
      ...newCustomerForm,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      address: sanitizeText(newCustomerForm.address),
      notes: sanitizeText(newCustomerForm.notes),
      isVip: newCustomerForm.role === 'vip_customer' || newCustomerForm.isVip
    });

    if (addToast) addToast('تم إضافة العميل الجديد بنجاح', 'success');
    setIsAddModalOpen(false);
    setNewCustomerForm({
      name: '',
      email: '',
      phone: '',
      city: 'القاهرة',
      address: '',
      role: 'customer',
      isVip: false,
      status: 'نشط',
      permissions: ['view_catalog', 'place_orders', 'view_own_orders', 'rate_products', 'hospital_bag'],
      notes: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header with Server Sync Status and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-rawaa-border shadow-soft">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-2xl bg-rawaa-primary/10 text-rawaa-primary flex items-center justify-center shrink-0 shadow-soft-xs">
              <Users className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black font-heading text-rawaa-dark">
                  إدارة العملاء والصلاحيات
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  السيرفر السحابي (Supabase Live)
                </span>
              </div>
              <p className="text-xs text-rawaa-muted mt-1 leading-relaxed">
                إدارة ملفات العملاء، تحديد الصلاحيات والرتب التنفيذية، والتحكم بحالات التفعيل والحظر مباشرة على السيرفر
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-rawaa-primary hover:bg-rawaa-primary-hover active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-soft-xs transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>تسجيل عميل جديد</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-white p-5 rounded-3xl border border-rawaa-border shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rawaa-muted">إجمالي العملاء المسجلين</span>
            <span className="w-8 h-8 rounded-xl bg-rawaa-soft text-rawaa-dark flex items-center justify-center">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-heading text-rawaa-dark">
            {stats.total}
          </div>
          <div className="text-[11px] text-rawaa-muted mt-1">حسابات موثقة ومخزنة بالسيرفر</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-rawaa-border shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rawaa-muted">العملاء النشطون</span>
            <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-heading text-emerald-600">
            {stats.activeCount}
          </div>
          <div className="text-[11px] text-rawaa-muted mt-1">مفعلون بكامل الصلاحيات</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-rawaa-border shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rawaa-muted">أعضاء فئة VIP</span>
            <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Crown className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-heading text-amber-600">
            {stats.vipCount}
          </div>
          <div className="text-[11px] text-rawaa-muted mt-1">يتمتعون بالخصومات والأولوية</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-rawaa-border shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rawaa-muted">إجمالي مشتريات العملاء</span>
            <span className="w-8 h-8 rounded-xl bg-rawaa-primary/10 text-rawaa-primary flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-heading text-rawaa-primary">
            {stats.totalSpent.toLocaleString()} <span className="text-xs font-normal">ج.م</span>
          </div>
          <div className="text-[11px] text-rawaa-muted mt-1">القيمة الإجمالية المسجلة بالسيرفر</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-rawaa-border shadow-soft space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-rawaa-muted" />
            <input
              type="text"
              placeholder="البحث بالاسم، رقم الهاتف، البريد الإلكتروني، أو المحافظة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-rawaa-primary focus:bg-white transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {/* Status Tabs */}
            <div className="flex items-center gap-1 bg-rawaa-soft/60 p-1 rounded-2xl border border-rawaa-border text-xs shrink-0">
              <button
                type="button"
                onClick={() => setSelectedStatus('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  selectedStatus === 'all'
                    ? 'bg-rawaa-primary text-white shadow-soft-xs'
                    : 'text-rawaa-muted hover:text-rawaa-dark'
                }`}
              >
                الكل ({customers.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus('active')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  selectedStatus === 'active'
                    ? 'bg-emerald-600 text-white shadow-soft-xs'
                    : 'text-rawaa-muted hover:text-rawaa-dark'
                }`}
              >
                نشط
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus('vip')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedStatus === 'vip'
                    ? 'bg-amber-600 text-white shadow-soft-xs'
                    : 'text-rawaa-muted hover:text-rawaa-dark'
                }`}
              >
                <span>VIP</span>
                <Crown className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus('blocked')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  selectedStatus === 'blocked'
                    ? 'bg-rose-600 text-white shadow-soft-xs'
                    : 'text-rawaa-muted hover:text-rawaa-dark'
                }`}
              >
                محظور
              </button>
            </div>

            {/* City Selector */}
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-3 py-2 bg-rawaa-soft/60 border border-rawaa-border rounded-2xl text-xs font-bold text-rawaa-dark focus:outline-none focus:border-rawaa-primary shrink-0"
            >
              <option value="all">كل المحافظات</option>
              {cities
                .filter((c) => c !== 'all')
                .map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-rawaa-muted pt-1 border-t border-rawaa-border/50">
          <span>يتم عرض {filteredCustomers.length} عميل من أصل {customers.length} مسجلين بالسيرفر</span>
          {(searchQuery || selectedStatus !== 'all' || selectedCity !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedStatus('all');
                setSelectedCity('all');
              }}
              className="text-rawaa-primary font-bold hover:underline cursor-pointer"
            >
              إعادة ضبط الفلاتر
            </button>
          )}
        </div>
      </div>

      {/* Customers Table & Mobile Cards */}
      <div className="bg-white rounded-3xl border border-rawaa-border shadow-soft overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto custom-modal-scroll">
          <table className="w-full text-right text-xs min-w-[880px] border-collapse">
            <thead className="bg-[#FAF7F2] border-b border-rawaa-border text-xs font-bold text-rawaa-muted">
              <tr className="whitespace-nowrap">
                <th className="px-5 py-4 min-w-[220px]">العميل</th>
                <th className="px-4 py-4 min-w-[170px]">بيانات التواصل</th>
                <th className="px-4 py-4">المحافظة</th>
                <th className="px-4 py-4">الرتبة</th>
                <th className="px-4 py-4">الصلاحيات</th>
                <th className="px-4 py-4">الطلبات والمشتريات</th>
                <th className="px-4 py-4">الحالة</th>
                <th className="px-5 py-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rawaa-border/60">
              {isLoadingCustomers ? (
                <>
                  <TableRowSkeleton cols={8} />
                  <TableRowSkeleton cols={8} />
                  <TableRowSkeleton cols={8} />
                  <TableRowSkeleton cols={8} />
                  <TableRowSkeleton cols={8} />
                </>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-14 text-center text-rawaa-muted">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30 text-rawaa-primary" />
                    <p className="font-heading font-black text-sm text-rawaa-dark">لا يوجد عملاء مسجلين حالياً</p>
                    <p className="text-xs text-rawaa-muted mt-1 max-w-sm mx-auto leading-relaxed">
                      يتم حفظ وتسجيل العملاء وصلاحياتهم آلياً على السيرفر السحابي فور قيام أي عميلة بالتسجيل أو الشراء، أو يمكنك إضافة عميل يدوياً
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(true)}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-rawaa-primary hover:bg-rawaa-primary-hover text-white text-xs font-bold rounded-2xl transition-all cursor-pointer shadow-soft-xs"
                    >
                      <Plus size={15} />
                      <span>تسجيل أول عميل على السيرفر</span>
                    </button>
                  </td>
                </tr>
              ) : (
                (filteredCustomers || []).map((customer) => {
                  const permCount = Array.isArray(customer.permissions) ? customer.permissions.length : 5;
                  const isBlocked = customer.status === 'محظور';

                  return (
                    <tr key={customer.id} className="hover:bg-rawaa-soft/30 transition-colors">
                      <td className="px-5 py-4 min-w-[220px]">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-2xl font-bold flex items-center justify-center text-sm shrink-0 shadow-soft-xs ${
                            customer.isVip
                              ? 'bg-amber-100 text-amber-700 border border-amber-200'
                              : isBlocked
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : 'bg-rawaa-primary/10 text-rawaa-primary border border-rawaa-primary/20'
                          }`}>
                            {customer.name?.charAt(0) || 'ع'}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-rawaa-dark flex items-center gap-1.5 line-clamp-1">
                              <span>{customer.name}</span>
                              {customer.isVip && (
                                <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                              )}
                            </div>
                            <div className="text-[11px] text-rawaa-muted flex items-center gap-1 mt-0.5 whitespace-nowrap">
                              <Calendar className="w-3 h-3 shrink-0" />
                              <span>انضم {customer.joinedDate || '2026'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 min-w-[170px]">
                        <div className="space-y-0.5 text-xs">
                          <div className="flex items-center gap-1.5 text-rawaa-dark font-mono whitespace-nowrap" dir="ltr">
                            <Phone className="w-3 h-3 text-rawaa-muted shrink-0" />
                            <span>{customer.phone || 'غير مسجل'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-rawaa-muted text-[11px] truncate max-w-[170px]">
                            <Mail className="w-3 h-3 text-rawaa-muted shrink-0" />
                            <span>{customer.email || 'بدون إيميل'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rawaa-soft text-xs text-rawaa-dark font-medium whitespace-nowrap">
                          <MapPin className="w-3 h-3 text-rawaa-primary shrink-0" />
                          <span>{customer.city || 'القاهرة'}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        {customer.role === 'vip_customer' || customer.isVip ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Crown className="w-3 h-3" />
                            عميلة VIP
                          </span>
                        ) : customer.role === 'wholesaler' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <Building2 className="w-3 h-3" />
                            تاجر / جملة
                          </span>
                        ) : customer.role === 'supervisor' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            <Shield className="w-3 h-3" />
                            مشرفة دعم
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                            عميلة مسجلة
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rawaa-primary/5 text-rawaa-primary font-bold text-[11px] border border-rawaa-primary/15">
                          <Key size={13} />
                          <span>{permCount} صلاحيات نشطة</span>
                        </div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="font-bold text-rawaa-dark">
                          <span>{customer.ordersCount || 0} طلب</span>
                          <span className="text-rawaa-muted mx-1">·</span>
                          <span className="text-rawaa-primary font-heading">
                            {(customer.totalSpent || 0).toLocaleString()} ج.م
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        {isBlocked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <Ban className="w-3 h-3" />
                            محظور
                          </span>
                        ) : customer.status === 'نشط' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            نشط
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                            غير نشط
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedCustomer(customer)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rawaa-soft hover:bg-rawaa-primary hover:text-white rounded-xl text-xs font-bold text-rawaa-dark transition-all cursor-pointer whitespace-nowrap"
                            title="تعديل الصلاحيات والبيانات"
                          >
                            <Key className="w-3.5 h-3.5" />
                            <span>الصلاحيات</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(customer.id)}
                            className="p-1.5 text-rawaa-muted hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="حذف من السيرفر"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile card view (Visible on < md screens) */}
        <div className="md:hidden divide-y divide-rawaa-border/60">
          {isLoadingCustomers ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse bg-rawaa-soft/60 rounded-2xl p-4 h-28" />
              ))}
            </div>
          ) : (!filteredCustomers || filteredCustomers.length === 0) ? (
            <div className="py-12 px-4 text-center text-rawaa-muted">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30 text-rawaa-primary" />
              <p className="font-heading font-black text-sm text-rawaa-dark">لا يوجد عملاء مسجلين حالياً</p>
            </div>
          ) : (
            (filteredCustomers || []).map((customer) => {
              const permCount = Array.isArray(customer.permissions) ? customer.permissions.length : 5;
              const isBlocked = customer.status === 'محظور';

              return (
                <div key={customer.id} className="p-4 hover:bg-rawaa-soft/30 transition-colors space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-11 h-11 rounded-2xl font-bold flex items-center justify-center text-sm shrink-0 shadow-soft-xs ${
                        customer.isVip
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : isBlocked
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-rawaa-primary/10 text-rawaa-primary border border-rawaa-primary/20'
                      }`}>
                        {customer.name?.charAt(0) || 'ع'}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-rawaa-dark flex items-center gap-1.5 truncate">
                          <span>{customer.name}</span>
                          {customer.isVip && (
                            <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                          )}
                        </div>
                        <div className="text-[10px] text-rawaa-muted flex items-center gap-1.5 mt-0.5">
                          <span>{customer.city || 'مصر'}</span>
                          <span>•</span>
                          <span>انضم {customer.joinedDate || '2026'}</span>
                        </div>
                      </div>
                    </div>

                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                      isBlocked
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : customer.status === 'نشط'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                      {customer.status}
                    </span>
                  </div>

                  {/* Contact & financial stats row */}
                  <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-rawaa-border/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      {customer.phone && (
                        <a
                          href={`tel:${customer.phone}`}
                          className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg"
                          dir="ltr"
                        >
                          <Phone size={11} />
                          <span>{customer.phone}</span>
                        </a>
                      )}
                      <span className="text-[11px] text-rawaa-muted">
                        {customer.orderCount || 0} طلبات
                      </span>
                    </div>

                    <div className="text-[11px] font-bold text-rawaa-dark">
                      {(customer.totalSpent || 0).toLocaleString()} <span className="text-[9px] text-rawaa-primary font-normal">ج.م</span>
                    </div>
                  </div>

                  {/* Permissions & action buttons */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-dashed border-rawaa-border/60">
                    <span className="text-[10px] text-rawaa-muted font-medium">
                      الصلاحيات: <strong className="text-rawaa-dark">{permCount}</strong> / 8
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedCustomer(customer)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rawaa-soft hover:bg-rawaa-primary hover:text-white rounded-xl text-xs font-bold text-rawaa-dark transition-all cursor-pointer"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>الصلاحيات والملف</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(customer.id)}
                        className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                        title="حذف العميل"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Customer Profile & Permissions Management Drawer rendered via createPortal */}
      {selectedCustomer && createPortal(
        <div
          className="fixed inset-0 z-[99999] overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fadeIn overscroll-contain"
          onClick={() => setSelectedCustomer(null)}
        >
          <div
            className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-r border-rawaa-border animate-slideLeft overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-6 bg-gradient-to-l from-rawaa-soft to-white border-b border-rawaa-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3.5">
                <div className={`w-13 h-13 rounded-2xl font-black text-xl flex items-center justify-center shadow-soft-sm ${
                  selectedCustomer.isVip
                    ? 'bg-amber-100 text-amber-700 border border-amber-300'
                    : 'bg-rawaa-primary text-white shadow-rawaa-primary/25'
                }`}>
                  {selectedCustomer.name?.charAt(0) || 'ع'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black font-heading text-rawaa-dark">
                      {selectedCustomer.name}
                    </h2>
                    {selectedCustomer.isVip && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        VIP
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-rawaa-muted mt-0.5 flex items-center gap-2">
                    <span>{selectedCustomer.email || 'بدون بريد إلكتروني'}</span>
                    <span>·</span>
                    <span className="font-mono" dir="ltr">{selectedCustomer.phone}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="w-9 h-9 rounded-full bg-rawaa-soft hover:bg-rawaa-border text-rawaa-muted hover:text-rawaa-dark flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-modal-scroll">
              {/* Cloud Server Live Sync Banner */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Cloud className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-emerald-900">سجل متصل بالسيرفر السحابي (Supabase)</div>
                    <div className="text-[11px] text-emerald-700">أي تعديل تحفظه يتم تطبيقه فوراً على السيرفر</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-md border border-emerald-200 text-emerald-800 font-bold">
                  {selectedCustomer.id}
                </span>
              </div>

              {/* Quick stats grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-rawaa-soft/70 p-3.5 rounded-2xl text-center border border-rawaa-border/60">
                  <div className="text-[11px] text-rawaa-muted font-bold">عدد الطلبات الحقيقية</div>
                  <div className="text-lg font-black font-heading text-rawaa-dark mt-1">
                    {customerOrders.length > 0 ? customerOrders.length : (selectedCustomer.ordersCount || 0)}
                  </div>
                </div>
                <div className="bg-rawaa-soft/70 p-3.5 rounded-2xl text-center border border-rawaa-border/60">
                  <div className="text-[11px] text-rawaa-muted font-bold">إجمالي المشتريات</div>
                  <div className="text-lg font-black font-heading text-rawaa-primary mt-1">
                    {(customerOrders.length > 0
                      ? customerOrders.reduce((sum, ord) => sum + (ord.deliveryStatus !== 'ملغي' && ord.status !== 'ملغي' ? (Number(ord.total) || 0) : 0), 0)
                      : (selectedCustomer.totalSpent || 0)
                    ).toLocaleString()}
                    <span className="text-[10px] font-normal mr-0.5">ج.م</span>
                  </div>
                </div>
                <div className="bg-rawaa-soft/70 p-3.5 rounded-2xl text-center border border-rawaa-border/60">
                  <div className="text-[11px] text-rawaa-muted font-bold">حالة الحساب</div>
                  <div className={`text-xs font-bold mt-2 ${
                    selectedCustomer.status === 'نشط'
                      ? 'text-emerald-700'
                      : selectedCustomer.status === 'محظور'
                      ? 'text-rose-700'
                      : 'text-gray-600'
                  }`}>
                    {selectedCustomer.status || 'نشط'}
                  </div>
                </div>
              </div>

              {/* Role and Account Status Section */}
              <div className="bg-white border border-rawaa-border rounded-2xl p-5 space-y-4 shadow-soft-xs">
                <div className="flex items-center gap-2 pb-2 border-b border-rawaa-border">
                  <ShieldCheck className="w-4 h-4 text-rawaa-primary" />
                  <h3 className="font-heading text-xs font-black text-rawaa-dark uppercase">
                    الرتبة وحالة الحساب على السيرفر
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-rawaa-dark mb-1.5">رتبة ونوع الحساب</label>
                    <select
                      value={selectedCustomer.role || 'customer'}
                      onChange={(e) => {
                        const newRole = e.target.value;
                        handleDrawerFieldChange('role', newRole);
                        handleDrawerFieldChange('isVip', newRole === 'vip_customer');
                      }}
                      className="w-full px-3 py-2 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-xs font-bold text-rawaa-dark focus:outline-none focus:border-rawaa-primary"
                    >
                      <option value="customer">عميلة مسجلة عادية (Customer)</option>
                      <option value="vip_customer">عميلة VIP ذهبية (VIP Client)</option>
                      <option value="wholesaler">تاجر / توريد جملة (Wholesaler)</option>
                      <option value="supervisor">مشرفة دعم ومتابعة (Supervisor)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-rawaa-dark mb-1.5">حالة التفعيل</label>
                    <select
                      value={selectedCustomer.status || 'نشط'}
                      onChange={(e) => handleDrawerFieldChange('status', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-xl text-xs font-bold focus:outline-none ${
                        selectedCustomer.status === 'محظور'
                          ? 'bg-rose-50 border-rose-300 text-rose-800'
                          : selectedCustomer.status === 'نشط'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-rawaa-soft/60 border-rawaa-border text-rawaa-dark'
                      }`}
                    >
                      <option value="نشط">نشط — مسموح بكامل الصلاحيات</option>
                      <option value="غير نشط">غير نشط — قيد المراجعة</option>
                      <option value="محظور">محظور — ممنوع من الشراء والطلب</option>
                    </select>
                  </div>
                </div>

                {/* VIP Fast Toggle */}
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-600" />
                    <div>
                      <span className="text-xs font-bold text-amber-900 block">عضوية VIP الخاصة</span>
                      <span className="text-[11px] text-amber-700">تمنح العميل خصم تلقائي وأولوية شحن</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(selectedCustomer.isVip)}
                    onChange={(e) => {
                      handleDrawerFieldChange('isVip', e.target.checked);
                      if (e.target.checked && selectedCustomer.role === 'customer') {
                        handleDrawerFieldChange('role', 'vip_customer');
                      }
                    }}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Granular Permissions Matrix */}
              <div className="bg-white border border-rawaa-border rounded-2xl p-5 space-y-4 shadow-soft-xs">
                <div className="flex items-center justify-between pb-2 border-b border-rawaa-border">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-rawaa-primary" />
                    <h3 className="font-heading text-xs font-black text-rawaa-dark uppercase">
                      مصفوفة الصلاحيات الممنوحة للعميل
                    </h3>
                  </div>
                  <span className="text-[11px] text-rawaa-muted font-bold">
                    {(selectedCustomer.permissions || []).length} من أصل {AVAILABLE_PERMISSIONS.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {AVAILABLE_PERMISSIONS.map((perm) => {
                    const isGranted = Array.isArray(selectedCustomer.permissions) && selectedCustomer.permissions.includes(perm.id);

                    return (
                      <label
                        key={perm.id}
                        className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                          isGranted
                            ? 'bg-rawaa-primary/5 border-rawaa-primary/25 shadow-soft-xs'
                            : 'bg-rawaa-soft/40 border-rawaa-border/60 hover:border-rawaa-border'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isGranted}
                          onChange={() => handleTogglePermission(perm.id)}
                          className="w-4 h-4 mt-0.5 rounded text-rawaa-primary focus:ring-rawaa-primary cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <span className={`block text-xs font-bold ${isGranted ? 'text-rawaa-primary' : 'text-rawaa-dark'}`}>
                            {perm.name}
                          </span>
                          <span className="block text-[11px] text-rawaa-muted mt-0.5 leading-relaxed">
                            {perm.desc}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Contact Information Editable */}
              <div className="bg-white border border-rawaa-border rounded-2xl p-5 space-y-3 shadow-soft-xs">
                <h3 className="font-heading text-xs font-black text-rawaa-dark uppercase pb-2 border-b border-rawaa-border">
                  بيانات التواصل والعنوان
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-rawaa-dark mb-1">الاسم الكامل</label>
                    <input
                      type="text"
                      value={selectedCustomer.name || ''}
                      onChange={(e) => handleDrawerFieldChange('name', e.target.value)}
                      className="w-full px-3 py-2 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-xs font-bold text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-rawaa-dark mb-1">رقم الهاتف</label>
                      <input
                        type="text"
                        value={selectedCustomer.phone || ''}
                        onChange={(e) => handleDrawerFieldChange('phone', e.target.value)}
                        className="w-full px-3 py-2 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-xs font-mono font-bold text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-rawaa-dark mb-1">المحافظة</label>
                      <input
                        type="text"
                        value={selectedCustomer.city || ''}
                        onChange={(e) => handleDrawerFieldChange('city', e.target.value)}
                        className="w-full px-3 py-2 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-xs font-bold text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-rawaa-dark mb-1">العنوان التفصيلي</label>
                    <input
                      type="text"
                      value={selectedCustomer.address || ''}
                      onChange={(e) => handleDrawerFieldChange('address', e.target.value)}
                      className="w-full px-3 py-2 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-xs font-medium text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-rawaa-dark mb-1">ملاحظات الإدارة الداخلية</label>
                    <textarea
                      rows={2}
                      value={selectedCustomer.notes || ''}
                      onChange={(e) => handleDrawerFieldChange('notes', e.target.value)}
                      placeholder="أضف أي ملاحظات خاصة بالعميل..."
                      className="w-full px-3 py-2 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-xs font-medium text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Order history */}
              <div className="space-y-3">
                <h3 className="font-heading text-xs font-black text-rawaa-dark uppercase flex items-center justify-between">
                  <span>سجل طلبات العميل من السيرفر</span>
                  <span className="text-rawaa-primary font-bold text-[11px]">
                    {customerOrders.length} طلب
                  </span>
                </h3>

                {customerOrders.length === 0 ? (
                  <div className="p-5 text-center bg-rawaa-soft/40 rounded-2xl border border-dashed border-rawaa-border text-rawaa-muted text-xs">
                    لم يقم العميل بأي طلبات بعد
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customerOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-3 bg-rawaa-soft/40 border border-rawaa-border rounded-2xl text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className="font-mono text-rawaa-dark">#{ord.id}</span>
                          <span className="text-rawaa-primary font-heading">
                            {ord.total?.toLocaleString() || ord.totalAmount?.toLocaleString()} ج.م
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-rawaa-muted text-[11px]">
                          <span>{ord.date ? ord.date.split('T')[0] : '2026-10-26'}</span>
                          <span className="px-2 py-0.5 rounded-lg bg-white border border-rawaa-border font-medium text-rawaa-dark">
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Actions Footer */}
            <div className="p-5 bg-gradient-to-r from-rawaa-soft to-white border-t border-rawaa-border flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(selectedCustomer.id)}
                className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 size={15} />
                <span>حذف العميل</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="px-4 py-2.5 bg-rawaa-soft hover:bg-rawaa-border text-rawaa-dark rounded-2xl text-xs font-bold transition-all cursor-pointer"
                >
                  إغلاق
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustomerToServer}
                  disabled={isSavingOnServer}
                  className="px-5 py-2.5 bg-rawaa-primary hover:bg-rawaa-primary-hover active:scale-95 text-white rounded-2xl text-xs font-bold transition-all shadow-soft-xs cursor-pointer flex items-center gap-2 disabled:opacity-60"
                >
                  {isSavingOnServer ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>جارٍ الحفظ على السيرفر...</span>
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      <span>حفظ الصلاحيات على السيرفر</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Add Customer Modal rendered via createPortal */}
      {isAddModalOpen && createPortal(
        <div
          className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn overflow-hidden"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full text-right shadow-2xl border border-rawaa-border animate-scaleUp relative max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-rawaa-border shrink-0 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rawaa-primary/10 text-rawaa-primary flex items-center justify-center">
                  <Plus size={18} />
                </div>
                <div>
                  <h3 className="font-heading text-base font-black text-rawaa-dark">تسجيل عميل جديد على السيرفر</h3>
                  <p className="text-[11px] text-rawaa-muted">سيتم حفظ الحساب والصلاحيات مباشرة في قاعدة بيانات Supabase</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full text-rawaa-muted hover:text-rawaa-dark hover:bg-rawaa-soft transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomerSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <div className="space-y-3.5 flex-1 min-h-0 overflow-y-auto custom-modal-scroll p-4 sm:p-6 py-4">
              <div>
                <label className="block text-xs font-bold text-rawaa-dark mb-1">اسم العميل بالكامل *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: ياسمين عبد العزيز"
                  value={newCustomerForm.name}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-xs font-bold text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-rawaa-dark mb-1">البريد الإلكتروني *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={newCustomerForm.email}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-xs font-medium text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-rawaa-dark mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    placeholder="010XXXXXXXX"
                    value={newCustomerForm.phone}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-xs font-mono font-bold text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-rawaa-dark mb-1">المحافظة</label>
                  <input
                    type="text"
                    value={newCustomerForm.city}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-xs font-bold text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-rawaa-dark mb-1">الرتبة</label>
                  <select
                    value={newCustomerForm.role}
                    onChange={(e) => {
                      const r = e.target.value;
                      setNewCustomerForm({
                        ...newCustomerForm,
                        role: r,
                        isVip: r === 'vip_customer'
                      });
                    }}
                    className="w-full px-3.5 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-xs font-bold text-rawaa-dark focus:outline-none focus:border-rawaa-primary"
                  >
                    <option value="customer">عميلة مسجلة (Customer)</option>
                    <option value="vip_customer">عميلة VIP مميزة</option>
                    <option value="wholesaler">تاجر / جملة</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-rawaa-dark mb-1">العنوان</label>
                <input
                  type="text"
                  placeholder="الشارع، رقم العمارة، الحي..."
                  value={newCustomerForm.address}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-xs font-medium text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
                />
              </div>

              </div>

              <div className="flex items-center gap-2 p-4 sm:px-6 py-3 border-t border-rawaa-border shrink-0 bg-white">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-rawaa-dark bg-rawaa-soft hover:bg-rawaa-border rounded-xl transition-all cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-rawaa-primary hover:bg-rawaa-primary-hover active:scale-[0.99] rounded-xl transition-all shadow-soft-xs cursor-pointer"
                >
                  تأكيد وحفظ على السيرفر
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Customer Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteConfirmId)}
        title="تأكيد حذف العميل من السيرفر؟"
        message="هل أنت متأكد من رغبتك في حذف هذا العميل من قاعدة بيانات بيبي زون السحابية؟ سيتم إزالة حسابه وسجل صلاحياته نهائياً."
        confirmText="نعم، حذف الحساب نهائياً"
        cancelText="تراجع"
        isDestructive={true}
        onConfirm={async () => {
          if (deleteConfirmId) {
            const idToDelete = deleteConfirmId;
            setDeleteConfirmId(null);
            if (selectedCustomer && String(selectedCustomer.id) === String(idToDelete)) {
              setSelectedCustomer(null);
            }
            await deleteCustomer(idToDelete);
          }
        }}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
