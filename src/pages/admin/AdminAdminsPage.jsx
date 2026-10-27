import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAdmin } from '../../context/AdminContext';
import { useShop } from '../../context/ShopContext';
import {
  validateEmail,
  validateEgyptianPhone,
  validatePersonName,
  validatePassword,
  normalizeEgyptianPhone,
  sanitizeText
} from '../../utils/validators';
import {
  ShieldCheck,
  UserPlus,
  Mail,
  Phone,
  Shield,
  CheckCircle2,
  Lock,
  Trash2,
  Key,
  Calendar,
  AlertCircle,
  Zap,
  X,
  RefreshCw
} from 'lucide-react';
import ConfirmModal from '../../components/common/ConfirmModal';

/* Administrator team members management and role based access control */
export default function AdminAdminsPage() {
  const { admins, addAdmin, updateAdmin, deleteAdmin, currentAdmin, isRealtimeConnected, isSyncing, refreshAllRealtimeData } = useAdmin();
  const { addToast } = useShop();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [editingAdminPassword, setEditingAdminPassword] = useState(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'مشرف طلبات',
    phone: '',
    status: 'نشط',
    permissions: ['orders', 'products']
  });

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isModalOpen || Boolean(editingAdminPassword)) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen, editingAdminPassword]);

  /* Submit handler for adding new administrator */
  const handleSubmit = (e) => {
    e.preventDefault();

    const cleanName = sanitizeText(formData.name);
    const nameErr = validatePersonName(cleanName, true, 2, 70);
    if (nameErr) {
      if (addToast) addToast(nameErr, 'warning');
      return;
    }

    const cleanEmail = sanitizeText(formData.email);
    const emailErr = validateEmail(cleanEmail, true);
    if (emailErr) {
      if (addToast) addToast(emailErr, 'warning');
      return;
    }

    // Check if email is already taken
    const exists = (admins || []).some((a) => a.email && a.email.toLowerCase() === cleanEmail.toLowerCase());
    if (exists) {
      if (addToast) addToast('هذا البريد الإلكتروني مسجل بالفعل لمشرف آخر', 'warning');
      return;
    }

    const passErr = validatePassword(formData.password, 6);
    if (passErr) {
      if (addToast) addToast(passErr, 'warning');
      return;
    }

    let cleanPhone = '';
    if (formData.phone && formData.phone.trim()) {
      const phoneErr = validateEgyptianPhone(formData.phone, false);
      if (phoneErr) {
        if (addToast) addToast(phoneErr, 'warning');
        return;
      }
      cleanPhone = normalizeEgyptianPhone(formData.phone);
    }

    addAdmin({
      ...formData,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password: formData.password.trim(),
      createdAt: new Date().toISOString().split('T')[0]
    });

    if (addToast) addToast(`تم إضافة المشرف الجديد ${cleanName} بنجاح`, 'success');
    setIsModalOpen(false);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'مشرف طلبات',
      phone: '',
      status: 'نشط',
      permissions: ['orders', 'products']
    });
  };

  /* Toggle individual permission flag */
  const handleTogglePermission = (perm) => {
    if (formData.permissions.includes(perm)) {
      setFormData({
        ...formData,
        permissions: formData.permissions.filter((p) => p !== perm)
      });
    } else {
      setFormData({
        ...formData,
        permissions: [...formData.permissions, perm]
      });
    }
  };

  /* Handler for updating an admin's password */
  const handleSavePassword = (e) => {
    e.preventDefault();
    if (!editingAdminPassword) return;

    const passErr = validatePassword(newPasswordValue, 6);
    if (passErr) {
      if (addToast) addToast(passErr, 'warning');
      return;
    }

    updateAdmin(editingAdminPassword.id, {
      password: newPasswordValue.trim(),
      permissions: editingAdminPassword.permissions
    });

    if (addToast) addToast(`تم تحديث كلمة المرور للمشرف ${editingAdminPassword.name} بنجاح`, 'success');
    setEditingAdminPassword(null);
    setNewPasswordValue('');
  };

  // Lock background scroll when any modal is open
  useEffect(() => {
    if (isModalOpen || Boolean(editingAdminPassword)) {
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
  }, [isModalOpen, editingAdminPassword]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-rawaa-border shadow-soft">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-rawaa-primary/10 text-rawaa-primary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-2xl font-bold font-cairo text-rawaa-dark">إدارة فريق العمل والصلاحيات</h1>
              <p className="text-xs text-rawaa-dark/60 mt-0.5">
                تعيين مدراء النظام والمشرفين وتحديد الصلاحيات الممنوحة لكل مسؤول
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>مشرفين لحظي (0ms)</span>
          </span>

          <button
            type="button"
            onClick={() => refreshAllRealtimeData && refreshAllRealtimeData()}
            disabled={isSyncing}
            title="مزامنة المشرفين والصلاحيات لحظياً الآن"
            className="p-2 rounded-xl border border-rawaa-border hover:bg-rawaa-soft text-rawaa-dark/70 hover:text-rawaa-dark transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-rawaa-peach' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-rawaa-primary text-white rounded-xl text-xs font-bold hover:bg-rawaa-primary/90 transition-all shadow-md shadow-rawaa-primary/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة مشرف جديد</span>
          </button>
        </div>
      </div>

      {/* Admins Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {(admins || []).map((admin) => {
          const isCurrentUser = currentAdmin?.email === admin.email;

          return (
            <div
              key={admin.id}
              className="bg-white rounded-2xl border border-rawaa-border shadow-soft p-4 sm:p-5 flex flex-col justify-between space-y-4 hover:border-rawaa-primary/40 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-rawaa-primary/10 text-rawaa-primary font-black text-sm flex items-center justify-center flex-shrink-0">
                      {admin.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-rawaa-dark flex items-center gap-1.5">
                        <span>{admin.name}</span>
                        {isCurrentUser && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-rawaa-sage text-white font-normal">
                            أنت
                          </span>
                        )}
                      </h3>
                      <div className="text-[11px] text-rawaa-primary font-bold mt-0.5">
                        {admin.role}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      admin.status === 'نشط'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}
                  >
                    {admin.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-rawaa-dark/70 pt-2 border-t border-rawaa-border/50">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-rawaa-dark/40" />
                    <span className="font-mono">{admin.email}</span>
                  </div>
                  {admin.phone && (
                    <div className="flex items-center gap-2" dir="ltr">
                      <Phone className="w-3.5 h-3.5 text-rawaa-dark/40" />
                      <span className="font-mono">{admin.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <div className="flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-rawaa-dark/40 shrink-0" />
                      <span className="text-[11px] text-rawaa-dark/70">
                        كلمة المرور: <span className="font-mono text-rawaa-muted">••••••••</span>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAdminPassword(admin);
                        setNewPasswordValue(admin.password || '');
                      }}
                      className="text-[10px] text-rawaa-primary hover:underline font-bold px-1.5 py-0.5 rounded hover:bg-rawaa-primary/10 transition-colors"
                    >
                      تغيير
                    </button>
                  </div>
                </div>

                {/* Permissions Badges */}
                <div className="mt-3 pt-3 border-t border-rawaa-border/50">
                  <div className="text-[11px] font-bold text-rawaa-dark/60 mb-2">الصلاحيات:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {admin.permissions?.map((p) => (
                      <span
                        key={p}
                        className="px-2 py-0.5 rounded-md bg-rawaa-soft text-[10px] font-bold text-rawaa-dark border border-rawaa-border"
                      >
                        {p === 'all' ? (
                          <span className="flex items-center gap-1 text-rawaa-primary">
                            <Zap className="w-3 h-3 fill-rawaa-primary" />
                            <span>كامل الصلاحيات</span>
                          </span>
                        ) : p === 'orders' ? (
                          'إدارة الطلبات'
                        ) : p === 'products' ? (
                          'المنتجات والمخزون'
                        ) : p === 'customers' ? (
                          'قاعدة العملاء'
                        ) : p === 'coupons' ? (
                          'الكوبونات'
                        ) : (
                          p
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              {!isCurrentUser && (
                <div className="pt-3 border-t border-rawaa-border flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      updateAdmin(admin.id, {
                        status: admin.status === 'نشط' ? 'معطل' : 'نشط'
                      })
                    }
                    className="text-xs font-bold text-rawaa-dark/70 hover:text-rawaa-dark"
                  >
                    {admin.status === 'نشط' ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdminToDelete(admin)}
                    className="p-1.5 rounded-lg text-rawaa-dark/40 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="حذف المشرف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Admin Modal rendered via createPortal */}
      {isModalOpen && createPortal(
        <div
          className="fixed inset-0 z-[99999] overflow-hidden bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-rawaa-border max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 bg-rawaa-soft/60 border-b border-rawaa-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-rawaa-primary" />
                <h3 className="font-bold font-cairo text-rawaa-dark">إضافة مشرف جديد للمنصة</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white text-rawaa-dark/60 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <div className="p-4 sm:p-6 space-y-4 flex-1 min-h-0 overflow-y-auto custom-modal-scroll">
              <div>
                <label className="block text-xs font-bold text-rawaa-dark mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  placeholder="مثال: ياسمين أحمد"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-sm font-bold text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-rawaa-dark mb-1">البريد الإلكتروني *</label>
                <input
                  type="email"
                  dir="ltr"
                  placeholder="admin@babyzone-egypt.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-sm text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-rawaa-dark mb-1">كلمة المرور الخاصة بالمشرف *</label>
                <input
                  type="password"
                  dir="ltr"
                  placeholder="كلمة مرور الحساب الإداري (6 أحرف على الأقل)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-sm text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
                  required
                />
                <span className="text-[10px] text-rawaa-muted mt-1 block">كلمة المرور التي سيستخدمها المشرف لتسجيل الدخول للوحة التحكم</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-rawaa-dark mb-1">الدور الوظيفي</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-xs font-bold text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
                  >
                    <option value="مدير عام">مدير عام</option>
                    <option value="مشرف طلبات">مشرف طلبات</option>
                    <option value="مسؤول مخزون">مسؤول مخزون</option>
                    <option value="خدمة عملاء">خدمة عملاء</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-rawaa-dark mb-1">رقم الهاتف</label>
                  <input
                    type="tel"
                    dir="ltr"
                    placeholder="01012345678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-sm font-mono text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-rawaa-dark">تحديد الصلاحيات الممنوحة</label>
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.permissions.includes('all')) {
                        setFormData({ ...formData, permissions: ['orders', 'products'] });
                      } else {
                        setFormData({ ...formData, permissions: ['all'] });
                      }
                    }}
                    className="text-[11px] font-bold text-rawaa-primary hover:underline"
                  >
                    {formData.permissions.includes('all') ? 'إلغاء كامل الصلاحيات' : '⚡ منح كامل الصلاحيات (Super Admin)'}
                  </button>
                </div>

                {formData.permissions.includes('all') ? (
                  <div className="p-3 bg-rawaa-primary/10 border border-rawaa-primary/30 rounded-xl text-xs font-bold text-rawaa-primary flex items-center gap-2">
                    <Zap className="w-4 h-4 fill-rawaa-primary" />
                    <span>تم منح هذا الحساب صلاحية كاملة (Super Admin) للوصول لكافة أقسام وإعدادات لوحة التحكم.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-rawaa-soft cursor-pointer border border-rawaa-border/50">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes('orders')}
                        onChange={() => handleTogglePermission('orders')}
                        className="w-4 h-4 rounded text-rawaa-primary focus:ring-rawaa-primary"
                      />
                      <span>إدارة الطلبات والشحنات والفواتير</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-rawaa-soft cursor-pointer border border-rawaa-border/50">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes('products')}
                        onChange={() => handleTogglePermission('products')}
                        className="w-4 h-4 rounded text-rawaa-primary focus:ring-rawaa-primary"
                      />
                      <span>إدارة المنتجات والأقسام</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-rawaa-soft cursor-pointer border border-rawaa-border/50">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes('inventory')}
                        onChange={() => handleTogglePermission('inventory')}
                        className="w-4 h-4 rounded text-rawaa-primary focus:ring-rawaa-primary"
                      />
                      <span>مراقبة المخزون وتنبيهات النواقص</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-rawaa-soft cursor-pointer border border-rawaa-border/50">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes('customers')}
                        onChange={() => handleTogglePermission('customers')}
                        className="w-4 h-4 rounded text-rawaa-primary focus:ring-rawaa-primary"
                      />
                      <span>استعراض وتعديل بيانات العملاء</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-rawaa-soft cursor-pointer border border-rawaa-border/50">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes('coupons')}
                        onChange={() => handleTogglePermission('coupons')}
                        className="w-4 h-4 rounded text-rawaa-primary focus:ring-rawaa-primary"
                      />
                      <span>إصدار وتفعيل كوبونات الخصم</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-rawaa-soft cursor-pointer border border-rawaa-border/50">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes('reviews')}
                        onChange={() => handleTogglePermission('reviews')}
                        className="w-4 h-4 rounded text-rawaa-primary focus:ring-rawaa-primary"
                      />
                      <span>مراجعة واعتماد تقييمات العملاء</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-rawaa-soft cursor-pointer border border-rawaa-border/50">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes('analytics')}
                        onChange={() => handleTogglePermission('analytics')}
                        className="w-4 h-4 rounded text-rawaa-primary focus:ring-rawaa-primary"
                      />
                      <span>التقارير والإحصائيات والأرباح</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-rawaa-soft cursor-pointer border border-rawaa-border/50">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes('settings')}
                        onChange={() => handleTogglePermission('settings')}
                        className="w-4 h-4 rounded text-rawaa-primary focus:ring-rawaa-primary"
                      />
                      <span>إعدادات المتجر وبيانات الاتصال</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-rawaa-soft cursor-pointer border border-rawaa-border/50">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes('admins')}
                        onChange={() => handleTogglePermission('admins')}
                        className="w-4 h-4 rounded text-rawaa-primary focus:ring-rawaa-primary"
                      />
                      <span>إدارة فريق العمل والصلاحيات</span>
                    </label>
                  </div>
                )}
              </div>


              </div>

              <div className="flex items-center justify-end gap-2 p-4 sm:px-6 py-3 border-t border-rawaa-border shrink-0 bg-white">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-rawaa-border text-rawaa-dark text-xs font-bold rounded-xl hover:bg-rawaa-soft transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rawaa-primary text-white text-xs font-bold rounded-xl hover:bg-rawaa-primary/90 active:scale-[0.99] transition-all shadow-xs cursor-pointer"
                >
                  حفظ المشرف
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Password update modal rendered via createPortal */}
      {Boolean(editingAdminPassword) && createPortal(
        <div
          className="fixed inset-0 z-[99999] overflow-hidden bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
          onClick={() => setEditingAdminPassword(null)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-rawaa-border overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-rawaa-soft/60 border-b border-rawaa-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-rawaa-primary" />
                <h3 className="font-bold text-sm text-rawaa-dark">
                  تعديل كلمة مرور المشرف
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingAdminPassword(null)}
                className="p-1 rounded-lg text-rawaa-dark/40 hover:text-rawaa-dark hover:bg-rawaa-soft"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePassword} className="p-5 space-y-4">
              <div>
                <span className="block text-xs font-semibold text-rawaa-dark mb-1">
                  المشرف: <strong className="font-bold text-rawaa-primary">{editingAdminPassword?.name}</strong> ({editingAdminPassword?.email})
                </span>
                <label className="block text-xs font-bold text-rawaa-dark mt-3 mb-1">
                  كلمة المرور الجديدة:
                </label>
                <input
                  type="text"
                  dir="ltr"
                  placeholder="أدخل كلمة مرور جديدة"
                  value={newPasswordValue}
                  onChange={(e) => setNewPasswordValue(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-sm font-mono text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
                  required
                  autoFocus
                />
                <span className="text-[10px] text-rawaa-muted mt-1 block">
                  سيتم حفظ كلمة المرور وتفعيلها فورياً على السيرفر
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-rawaa-border">
                <button
                  type="button"
                  onClick={() => setEditingAdminPassword(null)}
                  className="px-4 py-2 border border-rawaa-border text-rawaa-dark text-xs font-bold rounded-xl hover:bg-rawaa-soft transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rawaa-primary text-white text-xs font-bold rounded-xl hover:bg-rawaa-primary/90 transition-colors shadow-xs"
                >
                  حفظ وتحديث كلمة المرور
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Confirmation modal for admin deletion */}
      <ConfirmModal
        isOpen={Boolean(adminToDelete)}
        title="تأكيد حذف المشرف"
        message={`هل أنت متأكد من رغبتك في حذف المشرف «${adminToDelete?.name || ''}» (${adminToDelete?.role || ''}) من فريق العمل؟`}
        confirmText="تأكيد الحذف"
        cancelText="إلغاء"
        isDestructive={true}
        onConfirm={() => {
          if (adminToDelete) {
            deleteAdmin(adminToDelete.id);
            setAdminToDelete(null);
          }
        }}
        onCancel={() => setAdminToDelete(null)}
      />
    </div>
  );
}
