import { useState, useEffect } from 'react';
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
import ConfirmModal from '../../components/common/ConfirmModal';
import AdminsHeader from '../../components/admin/admins/AdminsHeader';
import AdminCard from '../../components/admin/admins/AdminCard';
import AddAdminModal from '../../components/admin/admins/AddAdminModal';
import EditAdminPasswordModal from '../../components/admin/admins/EditAdminPasswordModal';

const INITIAL_ADMIN_FORM = {
  name: '',
  email: '',
  password: '',
  role: 'مشرف طلبات',
  phone: '',
  status: 'نشط',
  permissions: ['orders', 'products']
};

/* Administrator team members management and role based access control */
export default function AdminAdminsPage() {
  const { admins, addAdmin, updateAdmin, deleteAdmin, currentAdmin, isSyncing, refreshAllRealtimeData } = useAdmin();
  const { addToast } = useShop();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [editingAdminPassword, setEditingAdminPassword] = useState(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [formData, setFormData] = useState(INITIAL_ADMIN_FORM);

  // Lock background scroll when modal is open
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
    setFormData(INITIAL_ADMIN_FORM);
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

  const handleToggleAllPermissions = () => {
    if (formData.permissions.includes('all')) {
      setFormData({ ...formData, permissions: ['orders', 'products'] });
    } else {
      setFormData({ ...formData, permissions: ['all'] });
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

  const handleOpenEditPassword = (admin) => {
    setEditingAdminPassword(admin);
    setNewPasswordValue(admin.password || '');
  };

  const handleToggleAdminStatus = (admin) => {
    updateAdmin(admin.id, {
      status: admin.status === 'نشط' ? 'معطل' : 'نشط'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminsHeader
        isSyncing={isSyncing}
        onRefresh={() => refreshAllRealtimeData && refreshAllRealtimeData()}
        onOpenAdd={() => setIsModalOpen(true)}
      />

      {/* Admins Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {(admins || []).map((admin) => (
          <AdminCard
            key={admin.id}
            admin={admin}
            isCurrentUser={currentAdmin?.email === admin.email}
            onEditPassword={handleOpenEditPassword}
            onToggleStatus={handleToggleAdminStatus}
            onDelete={setAdminToDelete}
          />
        ))}
      </div>

      {/* Add Admin Modal */}
      <AddAdminModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData(INITIAL_ADMIN_FORM);
        }}
        formData={formData}
        onChangeForm={(updates) => setFormData((prev) => ({ ...prev, ...updates }))}
        onTogglePermission={handleTogglePermission}
        onToggleAllPermissions={handleToggleAllPermissions}
        onSubmit={handleSubmit}
      />

      {/* Password update modal */}
      <EditAdminPasswordModal
        admin={editingAdminPassword}
        onClose={() => {
          setEditingAdminPassword(null);
          setNewPasswordValue('');
        }}
        newPassword={newPasswordValue}
        onChangePassword={setNewPasswordValue}
        onSubmit={handleSavePassword}
      />

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
