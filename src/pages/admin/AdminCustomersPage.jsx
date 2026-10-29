import { useState, useMemo, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useShop } from '../../context/ShopContext';
import {
  validateEmail,
  validateEgyptianPhone,
  validatePersonName,
  normalizeEgyptianPhone,
  sanitizeText
} from '../../utils/validators';
import ConfirmModal from '../../components/common/ConfirmModal';
import CustomersHeader from '../../components/admin/customers/CustomersHeader';
import CustomersStatsGrid from '../../components/admin/customers/CustomersStatsGrid';
import CustomersFilterBar from '../../components/admin/customers/CustomersFilterBar';
import CustomersTable from '../../components/admin/customers/CustomersTable';
import CustomerDrawer from '../../components/admin/customers/CustomerDrawer';
import AddCustomerModal from '../../components/admin/customers/AddCustomerModal';
import { DEFAULT_CUSTOMER_PERMISSIONS } from '../../constants/permissions';

const INITIAL_CUSTOMER_FORM = {
  name: '',
  email: '',
  phone: '',
  city: 'القاهرة',
  address: '',
  role: 'customer',
  isVip: false,
  status: 'نشط',
  permissions: [...DEFAULT_CUSTOMER_PERMISSIONS],
  notes: ''
};

export default function AdminCustomersPage() {
  const {
    customers,
    orders,
    isLoadingCustomers,
    updateCustomer,
    addCustomer,
    deleteCustomer,
    isRealtimeConnected,
    isSyncing,
    refreshAllRealtimeData
  } = useAdmin();
  const { addToast } = useShop();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');

  // Customer drawer and edit modal states
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isSavingOnServer, setIsSavingOnServer] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Add customer modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState(INITIAL_CUSTOMER_FORM);

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

  // Filter customers based on search query status and city
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

      const matchCity = selectedCity === 'all' || c.city === selectedCity;

      return matchSearch && matchStatus && matchCity;
    });
  }, [customers, searchQuery, selectedStatus, selectedCity]);

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
      setSelectedCustomer((prev) => ({
        ...prev,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone
      }));
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
    setNewCustomerForm(INITIAL_CUSTOMER_FORM);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <CustomersHeader
        isRealtimeConnected={isRealtimeConnected}
        isSyncing={isSyncing}
        onRefresh={() => refreshAllRealtimeData()}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* KPI Stats Cards */}
      <CustomersStatsGrid stats={stats} />

      {/* Filter and Search Bar */}
      <CustomersFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        cities={cities}
        totalCount={customers.length}
        filteredCount={filteredCustomers.length}
        onReset={() => {
          setSearchQuery('');
          setSelectedStatus('all');
          setSelectedCity('all');
        }}
      />

      {/* Customers Table & Mobile Cards */}
      <CustomersTable
        isLoadingCustomers={isLoadingCustomers}
        filteredCustomers={filteredCustomers}
        onSelectCustomer={setSelectedCustomer}
        onDeleteCustomer={setDeleteConfirmId}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* Customer Profile & Permissions Drawer */}
      <CustomerDrawer
        customer={selectedCustomer}
        customerOrders={customerOrders}
        isSaving={isSavingOnServer}
        onClose={() => setSelectedCustomer(null)}
        onChangeField={handleDrawerFieldChange}
        onTogglePermission={handleTogglePermission}
        onSave={handleSaveCustomerToServer}
        onDelete={() => setDeleteConfirmId(selectedCustomer?.id)}
      />

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setNewCustomerForm(INITIAL_CUSTOMER_FORM);
        }}
        form={newCustomerForm}
        onChangeForm={(updates) => setNewCustomerForm((prev) => ({ ...prev, ...updates }))}
        onSubmit={handleCreateCustomerSubmit}
      />

      {/* Delete Customer Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteConfirmId)}
        title="تأكيد حذف العميل وسجل مشترياته نهائياً؟"
        message="هل أنت متأكد من رغبتك في حذف هذا العميل من قاعدة بيانات بيبي زون السحابية؟ سيتم إزالة حسابه، وسجل كافة مشترياته وطلباته، وتقييماته، وصلاحياته نهائياً وإنهاء جلسته."
        confirmText="نعم، حذف العميل وسجل طلباته نهائياً"
        cancelText="تراجع"
        isDestructive={true}
        onConfirm={async () => {
          if (deleteConfirmId) {
            const idToDelete = deleteConfirmId;
            const targetCustomer = (customers || []).find((c) => String(c.id) === String(idToDelete));
            setDeleteConfirmId(null);
            if (selectedCustomer && String(selectedCustomer.id) === String(idToDelete)) {
              setSelectedCustomer(null);
            }
            await deleteCustomer(idToDelete, targetCustomer?.email, targetCustomer?.phone);
          }
        }}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
