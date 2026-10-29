import { useState, useCallback } from 'react';
import { couponsApi } from '../../services/api';
import { syncBus } from '../../utils/syncBus';

export function useAdminCoupons({ addToast, addActivity }) {
  const [coupons, setCoupons] = useState([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(true);

  const addCoupon = useCallback(async (newCoupon) => {
    const couponObj = {
      ...newCoupon,
      id: `cp-${Date.now()}`,
      code: newCoupon.code.trim().toUpperCase(),
      usageCount: 0,
      isActive: true
    };
    setCoupons((prev) => [couponObj, ...prev]);
    if (addActivity) {
      addActivity('إنشاء كوبون ترويجي', `كود الكوبون: ${couponObj.code}`, 'coupon');
    }
    if (addToast) {
      addToast(`تم إنشاء كوبون الخصم ${couponObj.code} بنجاح`, 'success');
    }
    try {
      await couponsApi.create(couponObj);
      syncBus.emit('COUPON_ADDED', { coupon: couponObj, timestamp: Date.now() });
    } catch (e) {
      console.warn('Coupons create API error:', e.message);
    }
  }, [addToast, addActivity]);

  const toggleCouponStatus = useCallback(async (couponId) => {
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
    if (addActivity) {
      addActivity('تغيير حالة كوبون', `${couponCode || couponId} أصبحت ${nextState ? 'نشط' : 'معطل'}`, 'coupon');
    }
    syncBus.emit('COUPON_UPDATED', { couponId, isActive: nextState, timestamp: Date.now() });
    try {
      await couponsApi.toggleStatus(couponId, nextState);
    } catch (e) {
      console.warn('Coupons toggle status API error:', e.message);
    }
  }, [addActivity]);

  const updateCoupon = useCallback(async (couponId, updatedData) => {
    setCoupons((prev) =>
      prev.map((cp) => (cp.id === couponId ? { ...cp, ...updatedData } : cp))
    );
    if (addActivity) {
      addActivity('تعديل كوبون', `كود الكوبون: ${updatedData.code || couponId}`, 'coupon');
    }
    if (addToast) {
      addToast('تم تحديث بيانات الكوبون بنجاح', 'success');
    }
    syncBus.emit('COUPON_UPDATED', { couponId, updatedData, timestamp: Date.now() });
    try {
      await couponsApi.update(couponId, updatedData);
    } catch (e) {
      console.warn('Coupons update API error:', e.message);
    }
  }, [addToast, addActivity]);

  const deleteCoupon = useCallback(async (couponId) => {
    setCoupons((prev) => prev.filter((cp) => cp.id !== couponId));
    if (addActivity) {
      addActivity('حذف كوبون', `كود الكوبون ${couponId}`, 'coupon');
    }
    if (addToast) {
      addToast('تم حذف الكوبون بنجاح', 'info');
    }
    syncBus.emit('COUPON_DELETED', { couponId, timestamp: Date.now() });
    try {
      await couponsApi.delete(couponId);
    } catch (e) {
      console.warn('Coupons delete API error:', e.message);
    }
  }, [addToast, addActivity]);

  return {
    coupons,
    setCoupons,
    isLoadingCoupons,
    setIsLoadingCoupons,
    addCoupon,
    toggleCouponStatus,
    updateCoupon,
    deleteCoupon
  };
}

