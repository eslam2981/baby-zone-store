import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import {
  Tag,
  Plus,
  Percent,
  Calendar,
  CheckCircle2,
  XCircle,
  Copy,
  Edit2,
  Trash2,
  Check,
  TrendingUp,
  AlertCircle,
  Sparkles,
  X
} from 'lucide-react';
import ConfirmModal from '../../components/common/ConfirmModal';
import { CouponCardSkeleton } from '../../components/common/Skeletons';

/* Coupons and marketing discount promotions management interface */
export default function AdminCouponsPage() {
  const { coupons, isLoadingCoupons, addCoupon, updateCoupon, deleteCoupon, toggleCouponStatus } = useAdmin();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  /* Form state for creating and editing promo codes */
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 10,
    minSpend: 200,
    maxUses: 100,
    expiryDate: '2026-12-31',
    isActive: true
  });

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
    if (searchParams.get('action')) {
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  };

  /* Open modal in create mode */
  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: 10,
      minSpend: 200,
      maxUses: 100,
      expiryDate: '2026-12-31',
      isActive: true
    });
    setIsModalOpen(true);
  };

  // Synchronize modal state with URL searchParams dynamically without needing any page refresh
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      handleOpenCreate();
    }
  }, [searchParams]);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
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
  }, [isModalOpen]);

  /* Open modal in edit mode */
  const handleOpenEdit = (coupon) => {
    setEditingCoupon(coupon);
    const isPercent = (coupon.discountType || coupon.type) === 'percentage';
    const val = coupon.discountValue ?? (isPercent ? coupon.discountPercent : coupon.discountAmount) ?? 10;
    setFormData({
      code: coupon.code,
      discountType: isPercent ? 'percentage' : 'fixed',
      discountValue: val,
      minSpend: coupon.minSpend || 0,
      maxUses: coupon.maxUses ?? coupon.maxUsage ?? 100,
      expiryDate: coupon.expiryDate || coupon.endDate || '2026-12-31',
      isActive: coupon.isActive ?? true
    });
    setIsModalOpen(true);
  };

  /* Submit handler for save coupon */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.code.trim()) return;

    const isPercent = formData.discountType === 'percentage';
    const numVal = Number(formData.discountValue) || 0;

    const payload = {
      ...formData,
      code: formData.code.toUpperCase().trim(),
      discountType: formData.discountType,
      type: formData.discountType,
      discountValue: numVal,
      discountPercent: isPercent ? numVal : 0,
      discountAmount: !isPercent ? numVal : 0,
      minSpend: Number(formData.minSpend) || 0,
      maxUses: Number(formData.maxUses) || 100,
      maxUsage: Number(formData.maxUses) || 100,
      expiryDate: formData.expiryDate || '2026-12-31',
      endDate: formData.expiryDate || '2026-12-31'
    };

    if (editingCoupon) {
      updateCoupon(editingCoupon.id, payload);
    } else {
      addCoupon(payload);
    }

    handleCloseModal();
  };

  /* Copy coupon code to clipboard */
  const handleCopyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-rawaa-border shadow-soft">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-rawaa-primary/10 text-rawaa-primary flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-2xl font-bold font-cairo text-rawaa-dark">كوبونات الخصم والعروض</h1>
              <p className="text-xs text-rawaa-dark/60 mt-0.5">
                إنشاء وإدارة قسائم التخفيض، وتحديد شروط الاستخدام والحدود والتواريخ
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-rawaa-primary text-white rounded-xl text-xs font-bold hover:bg-rawaa-primary/90 transition-all shadow-md shadow-rawaa-primary/20"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء كوبون جديد</span>
        </button>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {isLoadingCoupons ? (
          <>
            <CouponCardSkeleton />
            <CouponCardSkeleton />
            <CouponCardSkeleton />
            <CouponCardSkeleton />
            <CouponCardSkeleton />
            <CouponCardSkeleton />
          </>
        ) : coupons.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-rawaa-border p-6 shadow-soft-xs">
            <Tag className="w-12 h-12 mx-auto mb-3 text-rawaa-primary/30" />
            <h3 className="font-heading font-black text-sm text-rawaa-dark">لا توجد قسائم تخفيض حالياً</h3>
            <p className="text-xs text-rawaa-muted mt-1 max-w-sm mx-auto">
              يمكنك إنشاء كود خصم ترويجي جديد وتحديد نسبة التخفيض أو المبلغ وشروط الاستخدام للعملاء
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-rawaa-primary hover:bg-rawaa-primary-hover text-white text-xs font-bold rounded-2xl transition-all cursor-pointer shadow-soft-xs"
            >
              <Plus size={15} />
              <span>إنشاء أول كوبون</span>
            </button>
          </div>
        ) : (
          (coupons || []).map((coupon) => {
          const expDate = coupon.expiryDate || coupon.endDate;
          const isExpired = expDate ? new Date(expDate) < new Date() : false;
          const maxU = Number(coupon.maxUses ?? coupon.maxUsage) || 0;
          const usedU = Number(coupon.usedCount ?? coupon.usageCount) || 0;
          const usagePercent = maxU > 0 ? Math.min(100, Math.round((usedU / maxU) * 100)) : 0;
          const isPercent = (coupon.discountType || coupon.type) === 'percentage';
          const discountDisplay = coupon.discountValue ?? (isPercent ? coupon.discountPercent : coupon.discountAmount) ?? 0;

          return (
            <div
              key={coupon.id}
              className={`bg-white rounded-2xl border transition-all p-4 sm:p-5 flex flex-col justify-between shadow-soft ${
                !coupon.isActive || isExpired
                  ? 'border-gray-200 opacity-75'
                  : 'border-rawaa-border hover:border-rawaa-primary/40'
              }`}
            >
              <div>
                {/* Card Top */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyCode(coupon.code)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rawaa-soft border border-rawaa-border hover:border-rawaa-primary text-xs font-black font-mono tracking-wider text-rawaa-primary transition-colors cursor-pointer"
                      title="انقر لنسخ الكوبون"
                    >
                      <span>{coupon.code}</span>
                      {copiedCode === coupon.code ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-rawaa-dark/40" />
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleCouponStatus(coupon.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                      coupon.isActive && !isExpired
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}
                  >
                    {isExpired ? 'منتهي الصلاحية' : coupon.isActive ? 'مفعل' : 'معطل'}
                  </button>
                </div>

                {/* Discount Value */}
                <div className="py-2">
                  <div className="text-2xl font-black font-cairo text-rawaa-dark flex items-baseline gap-1">
                    <span>
                      {isPercent
                        ? `%${discountDisplay}`
                        : `${discountDisplay} ج.م`}
                    </span>
                    <span className="text-xs text-rawaa-dark/50 font-normal">خصم مباشر</span>
                  </div>
                  {Number(coupon.minSpend) > 0 && (
                    <p className="text-xs text-rawaa-dark/60 mt-1">
                      للطلبات بقيمة {coupon.minSpend} ج.م فأكثر
                    </p>
                  )}
                </div>

                {/* Usage meter */}
                <div className="my-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-rawaa-dark/70">
                    <span>مرات الاستخدام</span>
                    <span className="font-mono font-bold">
                      {usedU} / {maxU > 0 ? maxU : '∞'}
                    </span>
                  </div>
                  <div className="w-full bg-rawaa-soft h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-rawaa-primary h-full rounded-full transition-all"
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-rawaa-dark/50 font-mono pt-2 border-t border-rawaa-border/50">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>ينتهي في: {expDate || 'غير محدد'}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-2 pt-4 mt-3 border-t border-rawaa-border">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(coupon)}
                  className="flex-1 py-1.5 px-3 bg-rawaa-soft hover:bg-rawaa-dark hover:text-white rounded-xl text-xs font-bold text-rawaa-dark transition-colors flex items-center justify-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>تعديل</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCouponToDelete(coupon)}
                  className="p-1.5 text-rawaa-dark/40 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="حذف الكوبون"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        }))}
      </div>

      {/* Coupon Modal rendered via createPortal */}
      {isModalOpen && createPortal(
        <div
          className="fixed inset-0 z-[99999] overflow-hidden bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
          onClick={handleCloseModal}
        >
          <div
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-rawaa-border max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 bg-rawaa-soft/60 border-b border-rawaa-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-rawaa-primary" />
                <h3 className="font-bold font-cairo text-rawaa-dark">
                  {editingCoupon ? 'تعديل كوبون الخصم' : 'إنشاء قسيمة تخفيض جديدة'}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full hover:bg-white text-rawaa-dark/60 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <div className="p-4 sm:p-6 space-y-4 flex-1 min-h-0 overflow-y-auto custom-modal-scroll">
              <div>
                <label className="block text-xs font-bold text-rawaa-dark mb-1">رمز الكوبون</label>
                <input
                  type="text"
                  placeholder="مثال: BABY20"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-sm font-mono font-bold tracking-wider text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-rawaa-dark mb-1">نوع الخصم</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-xs font-bold text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
                  >
                    <option value="percentage">نسبة مئوية (%)</option>
                    <option value="fixed">مبلغ ثابت (ج.م)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-rawaa-dark mb-1">
                    قيمة الخصم {formData.discountType === 'percentage' ? '(%)' : '(ج.م)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={formData.discountType === 'percentage' ? 100 : 10000}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-sm font-bold text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-rawaa-dark mb-1">
                    الحد الأدنى للطلب (ج.م)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minSpend}
                    onChange={(e) => setFormData({ ...formData, minSpend: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-sm font-bold text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-rawaa-dark mb-1">
                    الحد الأقصى للاستخدام
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-sm font-bold text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-rawaa-dark mb-1">
                  تاريخ انتهاء الصلاحية
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-sm text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-rawaa-primary focus:ring-rawaa-primary border-rawaa-border"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-bold text-rawaa-dark cursor-pointer">
                  تفعيل الكوبون وإتاحته للاستخدام فوراً
                </label>
              </div>

              </div>

              <div className="flex items-center justify-end gap-2 p-4 sm:px-6 py-3 border-t border-rawaa-border shrink-0 bg-white">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-rawaa-border text-rawaa-dark text-xs font-bold rounded-xl hover:bg-rawaa-soft transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rawaa-primary text-white text-xs font-bold rounded-xl hover:bg-rawaa-primary/90 active:scale-[0.99] transition-all shadow-xs cursor-pointer"
                >
                  حفظ الكوبون
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Confirmation modal for coupon deletion */}
      <ConfirmModal
        isOpen={Boolean(couponToDelete)}
        title="تأكيد حذف الكوبون"
        message={`هل أنت متأكد من رغبتك في حذف كوبون الخصم «${couponToDelete?.code || ''}» نهائياً؟`}
        confirmText="تأكيد الحذف"
        cancelText="إلغاء"
        isDestructive={true}
        onConfirm={() => {
          if (couponToDelete) {
            deleteCoupon(couponToDelete.id);
            setCouponToDelete(null);
          }
        }}
        onCancel={() => setCouponToDelete(null)}
      />
    </div>
  );
}
