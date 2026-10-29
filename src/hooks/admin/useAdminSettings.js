import { useState, useCallback } from 'react';
import { initialStoreSettings, initialAdmins } from '../../data/adminData';
import { storeSettingsApi, adminsApi } from '../../services/api';
import { syncBus } from '../../utils/syncBus';

export function useAdminSettings({ addToast, addActivity }) {
  const [storeSettings, setStoreSettings] = useState(initialStoreSettings);
  const [admins, setAdmins] = useState(initialAdmins);

  const updateStoreSettings = useCallback(async (newSettings) => {
    setStoreSettings(newSettings);
    if (addActivity) {
      addActivity('تحديث إعدادات المتجر', 'تم تعديل الإعدادات العامة والتوصيل', 'settings');
    }
    if (addToast) {
      addToast('تم حفظ إعدادات المتجر بنجاح', 'success');
    }
    syncBus.emit('SETTINGS_UPDATED', { settings: newSettings, timestamp: Date.now() });
    try {
      await storeSettingsApi.update(newSettings);
    } catch (e) {
      console.warn('Store settings update API error:', e.message);
    }
  }, [addToast, addActivity]);

  const addAdmin = useCallback(async (adminData) => {
    const newAdmin = {
      ...adminData,
      id: `adm-${Date.now()}`,
      password: adminData.password || null,
      lastLogin: 'لم يسجل دخول بعد',
      status: 'نشط'
    };
    setAdmins((prev) => [...prev, newAdmin]);
    if (addActivity) {
      addActivity('إضافة عضو إداري جديد', `${newAdmin.name} (${newAdmin.role})`, 'admin');
    }
    if (addToast) {
      addToast(`تمت إضافة ${newAdmin.name} إلى فريق الإدارة بنجاح`, 'success');
    }
    syncBus.emit('ADMIN_ADDED', { admin: newAdmin, timestamp: Date.now() });
    try {
      await adminsApi.create(newAdmin);
    } catch (e) {
      console.warn('Admins create API error:', e.message);
    }
  }, [addToast, addActivity]);

  const updateAdmin = useCallback(async (adminId, updatedData) => {
    const targetAdmin = (admins || []).find((a) => a.id === adminId);
    const targetEmail = (updatedData.email || targetAdmin?.email || '').toLowerCase().trim();

    setAdmins((prev) => prev.map((a) => (a.id === adminId ? { ...a, ...updatedData } : a)));
    if (addActivity) {
      addActivity('تحديث بيانات مشرف', `رقم الحساب ${adminId}`, 'admin');
    }
    if (addToast) {
      addToast('تم تحديث بيانات المشرف بنجاح', 'success');
    }
    if (updatedData.status === 'معطل') {
      syncBus.emit('ADMIN_REMOVED', { adminId, email: targetEmail, timestamp: Date.now() });
    } else {
      syncBus.emit('ADMIN_UPDATED', { adminId, updatedData, email: targetEmail, timestamp: Date.now() });
    }
    try {
      await adminsApi.update(adminId, updatedData);
    } catch (e) {
      console.warn('Admins update API error:', e.message);
    }
  }, [admins, addToast, addActivity]);

  const deleteAdmin = useCallback(async (adminId) => {
    if (adminId === 'adm-1') {
      if (addToast) {
        addToast('لا يمكن حذف حساب مدير النظام الرئيسي', 'warning');
      }
      return;
    }
    const targetAdmin = (admins || []).find((a) => a.id === adminId);
    const targetEmail = targetAdmin?.email ? targetAdmin.email.toLowerCase().trim() : null;

    setAdmins((prev) => prev.filter((a) => a.id !== adminId));
    if (addActivity) {
      addActivity('حذف عضو إداري', `رقم الحساب ${adminId}`, 'admin');
    }
    if (addToast) {
      addToast('تم حذف الحساب الإداري وسحب صلاحياته بنجاح', 'info');
    }
    syncBus.emit('ADMIN_REMOVED', {
      adminId,
      email: targetEmail,
      timestamp: Date.now()
    });
    try {
      await adminsApi.delete(adminId);
    } catch (e) {
      console.warn('Admins delete API error:', e.message);
    }
  }, [admins, addToast, addActivity]);

  return {
    storeSettings,
    setStoreSettings,
    admins,
    setAdmins,
    updateStoreSettings,
    addAdmin,
    updateAdmin,
    deleteAdmin
  };
}

