import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  Filter,
  Eye,
  Trash2,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Printer,
  X,
  Phone,
  MapPin,
  CreditCard,
  Package,
  AlertCircle,
  Plus,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useShop } from '../../context/ShopContext';
import ConfirmModal from '../../components/common/ConfirmModal';
import { TableRowSkeleton } from '../../components/common/Skeletons';

const formatOrderDateTime = (dateVal) => {
  if (!dateVal) return 'غير محدد';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'short' });
  } catch {
    return String(dateVal);
  }
};

const formatShortDateTime = (dateVal) => {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleDateString('ar-EG', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return String(dateVal);
  }
};

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus, deleteOrder, addOrder, refreshOrders, isLoadingOrders } = useAdmin();
  const { allProducts } = useShop();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  // Selected order details drawer
  const [activeOrder, setActiveOrder] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Manual new order modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [manualOrder, setManualOrder] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    city: 'القاهرة',
    address: '',
    productId: '',
    quantity: 1,
    paymentMethod: 'الدفع عند الاستلام (COD)',
  });

  // Lock background scroll when any modal is open
  useEffect(() => {
    if (activeOrder || isAddModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeOrder, isAddModalOpen]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const matchQuery =
        ord.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.customerName.includes(searchQuery) ||
        ord.customerPhone.includes(searchQuery);

      const matchStatus = statusFilter === 'all' || ord.deliveryStatus === statusFilter;
      const matchCity = cityFilter === 'all' || ord.city === cityFilter;
      const matchPayment =
        paymentFilter === 'all' ||
        ord.paymentMethod.toLowerCase().includes(paymentFilter.toLowerCase());

      return matchQuery && matchStatus && matchCity && matchPayment;
    });
  }, [orders, searchQuery, statusFilter, cityFilter, paymentFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'تم التسليم':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'مع المندوب':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'قيد التجهيز الطبي':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'تم تأكيد الطلب':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'بانتظار التأكيد':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'ملغي':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCreateManualOrder = async (e) => {
    e.preventDefault();
    const product = allProducts.find((p) => p.id === manualOrder.productId) || allProducts[0];
    const qty = parseInt(manualOrder.quantity, 10) || 1;
    const price = product ? product.price : 0;
    const total = price * qty;

    const orderPayload = {
      customerName: manualOrder.customerName.trim(),
      customerPhone: manualOrder.customerPhone.trim(),
      customerEmail: manualOrder.customerEmail.trim(),
      city: manualOrder.city,
      address: manualOrder.address.trim(),
      total,
      paymentMethod: manualOrder.paymentMethod,
      deliveryStatus: 'بانتظار التأكيد',
      items: [
        {
          id: product ? product.id : 'custom',
          name: product ? product.name : 'منتج بيبي زون',
          price,
          quantity: qty,
          color: 'اللون القياسي',
          image: product ? product.mainImage : ''
        }
      ],
      notes: manualOrder.notes.trim()
    };

    await addOrder(orderPayload);
    setIsAddModalOpen(false);
  };

  const handleConfirmDeleteOrder = () => {
    if (!deleteConfirmId) return;
    deleteOrder(deleteConfirmId);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top title and actions header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-black text-rawaa-dark">الطلبات والمبيعات المباشرة</h2>
          <p className="text-xs text-rawaa-muted">
            إدارة ومتابعة شحنات عملاء بيبي زون في كافة محافظات مصر المتزامنة سحابياً
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={refreshOrders}
            disabled={isLoadingOrders}
            className="flex items-center gap-1.5 bg-white hover:bg-rawaa-soft border border-rawaa-border text-rawaa-dark text-xs font-bold px-3 py-2 rounded-full transition-all cursor-pointer shadow-soft-xs"
            title="تحديث البيانات من السيرفر"
          >
            <RefreshCw size={14} className={isLoadingOrders ? 'animate-spin text-rawaa-primary' : ''} />
            <span>تحديث</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setManualOrder({
                customerName: '',
                customerPhone: '',
                customerEmail: '',
                city: 'القاهرة',
                address: '',
                productId: allProducts[0]?.id || '',
                quantity: 1,
                paymentMethod: 'الدفع عند الاستلام (COD)',
                notes: ''
              });
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 bg-rawaa-primary hover:bg-rawaa-primary-hover active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-full shadow-soft-xs transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>تسجيل طلب هاتف / واتساب</span>
          </button>
        </div>
      </div>

      {/* Quick status counters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
            statusFilter === 'all'
              ? 'bg-rawaa-dark text-white'
              : 'bg-white text-rawaa-muted hover:bg-rawaa-soft border border-rawaa-border'
          }`}
        >
          الكل ({orders.length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('بانتظار التأكيد')}
          className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
            statusFilter === 'بانتظار التأكيد'
              ? 'bg-amber-500 text-white'
              : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
          }`}
        >
          بانتظار التأكيد ({orders.filter((o) => o.deliveryStatus === 'بانتظار التأكيد').length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('تم تأكيد الطلب')}
          className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
            statusFilter === 'تم تأكيد الطلب'
              ? 'bg-teal-600 text-white'
              : 'bg-white text-teal-700 hover:bg-teal-50 border border-teal-200'
          }`}
        >
          تم التأكيد ({orders.filter((o) => o.deliveryStatus === 'تم تأكيد الطلب').length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('مع المندوب')}
          className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
            statusFilter === 'مع المندوب'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-blue-700 hover:bg-blue-50 border border-blue-200'
          }`}
        >
          مع المندوب ({orders.filter((o) => o.deliveryStatus === 'مع المندوب').length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('تم التسليم')}
          className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
            statusFilter === 'تم التسليم'
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
          }`}
        >
          تم التسليم ({orders.filter((o) => o.deliveryStatus === 'تم التسليم').length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('ملغي')}
          className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
            statusFilter === 'ملغي'
              ? 'bg-red-600 text-white'
              : 'bg-white text-red-700 hover:bg-red-50 border border-red-200'
          }`}
        >
          ملغي ({orders.filter((o) => o.deliveryStatus === 'ملغي').length})
        </button>
      </div>

      {/* Search and filters bar */}
      <div className="bg-white rounded-2xl p-4 border border-rawaa-border shadow-soft-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full md:max-w-md">
          <Search size={16} className="text-rawaa-subtle absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ابحث برقم الطلب (EGY-...)، اسم العميل، أو الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl pr-10 pl-4 py-2 text-xs text-rawaa-dark placeholder-rawaa-subtle focus:bg-white focus:border-rawaa-primary outline-none transition-all"
          />
        </div>

        {/* City and Payment filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:flex items-center gap-2 w-full md:w-auto">
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="w-full sm:w-auto bg-rawaa-soft border border-rawaa-border rounded-xl px-3 py-2 text-xs font-medium text-rawaa-dark outline-none cursor-pointer"
          >
            <option value="all">جميع المحافظات</option>
            <option value="القاهرة">القاهرة</option>
            <option value="الجيزة">الجيزة</option>
            <option value="الإسكندرية">الإسكندرية</option>
            <option value="الدقهلية">الدقهلية (المنصورة)</option>
            <option value="الغربية">الغربية (طنطا)</option>
            <option value="أسيوط">أسيوط</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full sm:w-auto bg-rawaa-soft border border-rawaa-border rounded-xl px-3 py-2 text-xs font-medium text-rawaa-dark outline-none cursor-pointer"
          >
            <option value="all">جميع طرق الدفع</option>
            <option value="الدفع عند الاستلام">الدفع عند الاستلام</option>
            <option value="InstaPay">إنستاباي (InstaPay)</option>
            <option value="فودافون كاش">فودافون كاش</option>
            <option value="بطاقة بنكية">بطاقة بنكية</option>
          </select>
        </div>
      </div>

      {/* Orders table & mobile card view */}
      <div className="bg-white rounded-2xl border border-rawaa-border shadow-soft-xs overflow-hidden">
        {/* Desktop / Tablet table view */}
        <div className="hidden md:block overflow-x-auto custom-modal-scroll">
          <table className="w-full text-right text-xs min-w-[820px] border-collapse">
            <thead className="bg-[#FAF7F2] border-b border-rawaa-border text-rawaa-subtle font-bold">
              <tr className="whitespace-nowrap">
                <th className="py-3.5 pr-4 pl-2 min-w-[150px]">رقم الطلب والتاريخ</th>
                <th className="py-3.5 px-3 min-w-[160px]">العميل والهاتف</th>
                <th className="py-3.5 px-3 min-w-[140px]">العنوان والمحافظة</th>
                <th className="py-3.5 px-3">الإجمالي</th>
                <th className="py-3.5 px-3">طريقة وسداد الدفع</th>
                <th className="py-3.5 px-3">حالة الشحنة</th>
                <th className="py-3.5 pl-4 pr-2 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rawaa-border/50">
              {isLoadingOrders ? (
                <>
                  <TableRowSkeleton cols={7} />
                  <TableRowSkeleton cols={7} />
                  <TableRowSkeleton cols={7} />
                  <TableRowSkeleton cols={7} />
                  <TableRowSkeleton cols={7} />
                </>
              ) : (
                (filteredOrders || []).map((ord) => (
                  <tr key={ord.id} className="hover:bg-rawaa-soft/50 transition-colors">
                  <td className="py-3.5 pr-4 pl-2 whitespace-nowrap">
                    <span className="block font-mono font-bold text-rawaa-dark text-xs">#{ord.id}</span>
                    <span className="block text-[10px] text-rawaa-subtle mt-0.5">
                      {formatShortDateTime(ord.date)}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 min-w-[160px]">
                    <span className="block font-bold text-rawaa-dark line-clamp-1">{ord.customerName}</span>
                    <span className="block text-[10px] text-rawaa-muted font-mono whitespace-nowrap" dir="ltr">{ord.customerPhone}</span>
                  </td>

                  <td className="py-3.5 px-3 min-w-[140px]">
                    <span className="block font-bold text-rawaa-dark whitespace-nowrap">{ord.city}</span>
                    <span className="block text-[10px] text-rawaa-subtle truncate max-w-[150px]">{ord.district}</span>
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="font-bold text-rawaa-dark text-xs">
                      {ord.total.toLocaleString('ar-EG')} <span className="text-[10px] text-rawaa-primary">ج.م</span>
                    </div>
                    <span className="text-[10px] text-rawaa-subtle">{ord.items.length} منتجات</span>
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="block text-xs font-medium text-rawaa-dark">{ord.paymentMethod}</span>
                    <span className={`block text-[10px] font-bold mt-0.5 ${ord.paymentStatus === 'مدفوع بالكامل' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {ord.paymentStatus}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${getStatusBadge(ord.deliveryStatus)}`}>
                      {ord.deliveryStatus}
                    </span>
                  </td>

                  <td className="py-3.5 pl-4 pr-2 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setActiveOrder(ord)}
                        className="p-1.5 rounded-lg text-rawaa-primary hover:bg-rawaa-primary-light transition-colors cursor-pointer"
                        title="عرض تفاصيل الطلب والفاتورة"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(ord.id)}
                        className="p-1.5 rounded-lg text-rawaa-muted hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="حذف الطلب"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )))}

              {!isLoadingOrders && filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-16 text-rawaa-muted">
                    <div className="w-16 h-16 rounded-2xl bg-rawaa-primary/10 text-rawaa-primary flex items-center justify-center mx-auto mb-3 shadow-soft-xs">
                      <Package size={30} />
                    </div>
                    <h4 className="font-heading text-sm font-bold text-rawaa-dark mb-1">
                      {orders.length === 0 ? 'لا توجد أي طلبات مسجلة حالياً' : 'لا توجد طلبات مطابقة لخيارات البحث'}
                    </h4>
                    <p className="text-xs text-rawaa-muted max-w-sm mx-auto mb-4 leading-relaxed">
                      {orders.length === 0
                        ? 'سجل الطلبات فارغ تماماً ومجهز لاستقبال أول عملية شراء، أو يمكنك تسجيل طلب هاتفي / واتساب يدوي.'
                        : 'جربي تغيير كلمات البحث أو إعادة ضبط خيارات الفلترة.'}
                    </p>
                    {orders.length === 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setManualOrder({
                            customerName: '',
                            customerPhone: '',
                            customerEmail: '',
                            city: 'القاهرة',
                            address: '',
                            productId: allProducts[0]?.id || '',
                            quantity: 1,
                            paymentMethod: 'الدفع عند الاستلام (COD)',
                            notes: ''
                          });
                          setIsAddModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 bg-rawaa-primary hover:bg-rawaa-primary-hover active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-full transition-all shadow-soft-xs cursor-pointer"
                      >
                        <Plus size={15} />
                        <span>تسجيل أول طلب يدوي</span>
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile card view (Visible on < md screens) */}
        <div className="md:hidden divide-y divide-rawaa-border/60">
          {isLoadingOrders ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse bg-rawaa-soft/60 rounded-xl p-3 h-32" />
              ))}
            </div>
          ) : (!filteredOrders || filteredOrders.length === 0) ? (
            <div className="text-center py-12 px-4 text-rawaa-muted">
              <Package size={32} className="mx-auto text-rawaa-subtle mb-2 opacity-50" />
              <p className="text-xs font-bold">
                {(orders || []).length === 0 ? 'لا توجد أي طلبات مسجلة حالياً' : 'لا توجد طلبات مطابقة لخيارات البحث'}
              </p>
            </div>
          ) : (
            (filteredOrders || []).map((ord) => (
              <div key={ord.id} className="p-3.5 hover:bg-rawaa-soft/30 transition-colors space-y-2.5">
                {/* Header row: Order ID, Date & Status */}
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold text-xs text-rawaa-dark">#{ord.id}</span>
                    <span className="block text-[10px] text-rawaa-subtle mt-0.5">
                      {formatShortDateTime(ord.date)}
                    </span>
                  </div>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${getStatusBadge(ord.deliveryStatus)}`}>
                    {ord.deliveryStatus}
                  </span>
                </div>

                {/* Customer Info row */}
                <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-rawaa-border/60 flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <span className="font-bold text-rawaa-dark block truncate">{ord.customerName}</span>
                    <div className="flex items-center gap-1 text-[10px] text-rawaa-subtle mt-0.5">
                      <MapPin size={11} className="shrink-0 text-rawaa-muted" />
                      <span className="truncate">{ord.city} {ord.district ? `• ${ord.district}` : ''}</span>
                    </div>
                  </div>
                  {ord.customerPhone && (
                    <a
                      href={`tel:${ord.customerPhone}`}
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg shrink-0"
                      dir="ltr"
                    >
                      <Phone size={11} />
                      <span>{ord.customerPhone}</span>
                    </a>
                  )}
                </div>

                {/* Financial & Items summary */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div>
                    <span className="text-[10px] text-rawaa-subtle block">الإجمالي</span>
                    <span className="font-bold text-rawaa-dark">
                      {ord.total.toLocaleString('ar-EG')} <span className="text-[10px] text-rawaa-primary">ج.م</span>
                    </span>
                    <span className="text-[10px] text-rawaa-muted mr-1.5">({ord.items.length} منتجات)</span>
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] text-rawaa-muted block">{ord.paymentMethod}</span>
                    <span className={`text-[10px] font-bold ${ord.paymentStatus === 'مدفوع بالكامل' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {ord.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex items-center gap-2 pt-1 border-t border-dashed border-rawaa-border/60">
                  {ord.deliveryStatus === 'بانتظار التأكيد' && (
                    <button
                      type="button"
                      onClick={() => updateOrderStatus(ord.id, 'تم تأكيد الطلب')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 size={13} />
                      <span>تأكيد الطلب</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveOrder(ord)}
                    className="flex-1 bg-rawaa-soft hover:bg-rawaa-primary hover:text-white text-rawaa-dark font-bold py-1.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Eye size={13} />
                    <span>عرض التفاصيل</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(ord.id)}
                    className="w-8 h-8 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    title="حذف الطلب"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Order Details Drawer / Modal rendered via createPortal */}
      {activeOrder && createPortal(
        (() => {
          const itemsList = Array.isArray(activeOrder.items) ? activeOrder.items : [];
          const itemsSubtotal = itemsList.reduce(
            (acc, it) => acc + (Number(it.price) || 0) * (Number(it.quantity) || 1),
            0
          );
          const totalNum = Number(activeOrder.total) || 0;
          const calculatedShipping = activeOrder.shippingFee !== undefined && activeOrder.shippingFee > 0
            ? Number(activeOrder.shippingFee)
            : Math.max(0, totalNum - itemsSubtotal);

          return (
            <div
              className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto overscroll-contain"
              onClick={() => setActiveOrder(null)}
            >
              <div
                className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-2xl w-full text-right shadow-2xl border border-rawaa-border my-auto sm:my-6 animate-fadeIn max-h-[92vh] flex flex-col print:shadow-none print:border-none print:m-0 print:max-h-none print:w-full"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-rawaa-border shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rawaa-primary-light text-rawaa-primary flex items-center justify-center">
                      <Package size={20} />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-bold text-rawaa-dark">
                        تفاصيل الطلب <span className="font-mono text-rawaa-primary">#{activeOrder.id}</span>
                      </h3>
                      <span className="text-[11px] text-rawaa-muted">
                        تم التسجيل في: {formatOrderDateTime(activeOrder.date)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 print:hidden">
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="flex items-center gap-1.5 bg-rawaa-soft hover:bg-rawaa-border text-rawaa-dark text-xs font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                      title="طباعة بوليصة الشحن والفاتورة"
                    >
                      <Printer size={15} />
                      <span>طباعة</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveOrder(null)}
                      className="p-1.5 rounded-full text-rawaa-muted hover:bg-rawaa-soft cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Content body */}
                <div className="flex-1 overflow-y-auto custom-modal-scroll py-4 space-y-5">
                  {/* Status and quick update selector */}
                  <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-rawaa-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] text-rawaa-subtle font-bold block mb-1">تحديث مسار وحالة الشحنة:</span>
                      <div className="flex items-center gap-2">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(activeOrder.deliveryStatus)}`}>
                          {activeOrder.deliveryStatus || 'بانتظار التأكيد'}
                        </span>
                        <span className="text-xs text-rawaa-muted font-mono">
                          (كود الاستلام: <strong className="text-rawaa-primary">{activeOrder.deliveryPin || '4821'}</strong>)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 print:hidden">
                      <select
                        value={activeOrder.deliveryStatus || 'بانتظار التأكيد'}
                        onChange={(e) => {
                          updateOrderStatus(activeOrder.id, e.target.value);
                          setActiveOrder({ ...activeOrder, deliveryStatus: e.target.value });
                        }}
                        className="bg-white border border-rawaa-border rounded-xl px-3 py-1.5 text-xs font-bold text-rawaa-dark outline-none cursor-pointer focus:border-rawaa-primary"
                      >
                        <option value="بانتظار التأكيد">بانتظار التأكيد</option>
                        <option value="تم تأكيد الطلب">تم تأكيد الطلب</option>
                        <option value="قيد التجهيز الطبي">قيد التجهيز الطبي</option>
                        <option value="مع المندوب">مع المندوب في الطريق</option>
                        <option value="تم التسليم">تم التسليم بنجاح</option>
                        <option value="ملغي">ملغي (تم إلغاء الطلب)</option>
                      </select>
                    </div>
                  </div>

                  {/* Customer and shipping info grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white border border-rawaa-border p-4 rounded-2xl space-y-2">
                      <span className="text-[11px] font-bold text-rawaa-subtle block mb-1">بيانات العميل والتواصل:</span>
                      <div className="space-y-1 text-xs">
                        <strong className="block text-sm font-bold text-rawaa-dark">{activeOrder.customerName || 'عميل بيبي زون'}</strong>
                        <div className="flex items-center gap-1.5 text-rawaa-muted font-mono" dir="ltr">
                          <Phone size={13} className="text-emerald-600" />
                          <span>{activeOrder.customerPhone || 'غير مسجل'}</span>
                        </div>
                        {activeOrder.customerEmail && (
                          <span className="block text-[11px] text-rawaa-subtle">{activeOrder.customerEmail}</span>
                        )}
                      </div>
                    </div>

                    <div className="bg-white border border-rawaa-border p-4 rounded-2xl space-y-2">
                      <span className="text-[11px] font-bold text-rawaa-subtle block mb-1">عنوان التسليم بمصر:</span>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-rawaa-dark font-bold">
                          <MapPin size={13} className="text-rawaa-primary" />
                          <span>{activeOrder.city || 'القاهرة'}{activeOrder.district ? ` — ${activeOrder.district}` : ''}</span>
                        </div>
                        <span className="block text-[11px] text-rawaa-muted leading-relaxed">
                          {activeOrder.address || 'العنوان غير محدد'}
                        </span>
                        {activeOrder.notes && (
                          <span className="block text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded-lg mt-1">
                            ملاحظة: {activeOrder.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Items ordered list */}
                  <div>
                    <span className="text-xs font-bold text-rawaa-dark block mb-2.5">
                      المنتجات المشمولة في هذا الطلب ({itemsList.length})
                    </span>
                    <div className="border border-rawaa-border rounded-2xl overflow-hidden divide-y divide-rawaa-border/60">
                      {(itemsList || []).length > 0 ? (
                        (itemsList || []).map((item, idx) => {
                          const itemQty = Number(item.quantity) || Number(item.qty) || 1;
                          const itemPrice = Number(item.price) || 0;
                          return (
                            <div key={idx} className="p-3 bg-white flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.name || 'منتج بيبي زون'}
                                    className="w-12 h-12 rounded-xl object-cover border border-rawaa-border shrink-0 bg-rawaa-soft"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-xl bg-rawaa-soft border border-rawaa-border flex items-center justify-center text-rawaa-primary shrink-0">
                                    <Package size={20} />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <span className="block text-xs font-bold text-rawaa-dark truncate">{item.name || 'منتج بيبي زون'}</span>
                                  <span className="block text-[11px] text-rawaa-muted">
                                    اللون: {item.color || 'اللون القياسي'} • الكمية: <strong>{itemQty}</strong>
                                  </span>
                                </div>
                              </div>
                              <div className="text-left font-bold text-xs shrink-0">
                                <span className="text-rawaa-dark">{(itemPrice * itemQty).toLocaleString('ar-EG')}</span>
                                <span className="text-[10px] text-rawaa-primary ml-1">ج.م</span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center text-xs text-rawaa-muted bg-white">
                          لا توجد تفاصيل منتجات مسجلة في هذا الطلب
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Totals and payment details */}
                  <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-rawaa-border/70 space-y-2 text-xs">
                    <div className="flex justify-between text-rawaa-muted">
                      <span>المجموع الفرعي للمنتجات:</span>
                      <span className="font-bold text-rawaa-dark">
                        {(itemsSubtotal > 0 ? itemsSubtotal : totalNum).toLocaleString('ar-EG')} ج.م
                      </span>
                    </div>
                    <div className="flex justify-between text-rawaa-muted">
                      <span>رسوم الشحن والتوصيل:</span>
                      <span className="font-bold text-emerald-600">
                        {calculatedShipping === 0 ? 'شحن مجاني' : `${calculatedShipping.toLocaleString('ar-EG')} ج.م`}
                      </span>
                    </div>
                    {Number(activeOrder.discountAmount) > 0 && (
                      <div className="flex justify-between text-red-600 font-bold">
                        <span>خصم الكوبون:</span>
                        <span>-{Number(activeOrder.discountAmount).toLocaleString('ar-EG')} ج.م</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-rawaa-border flex justify-between text-sm font-black text-rawaa-dark">
                      <span>إجمالي الفاتورة المطلوب سداده:</span>
                      <span className="text-rawaa-primary">{totalNum.toLocaleString('ar-EG')} ج.م</span>
                    </div>
                  </div>
                </div>

                {/* Footer actions */}
                <div className="pt-3 border-t border-rawaa-border flex items-center justify-between shrink-0 print:hidden">
                  <span className="text-[11px] text-rawaa-muted">
                    المندوب المسؤول: <strong>{activeOrder.courierName || 'مندوب التوصيل السريع'}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveOrder(null)}
                    className="px-5 py-2 text-xs font-bold text-white bg-rawaa-dark hover:bg-black rounded-xl transition-colors cursor-pointer"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          );
        })(),
        document.body
      )}

      {/* Manual Add Order Modal rendered via createPortal */}
      {isAddModalOpen && createPortal(
        <div
          className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-soft-xl border border-rawaa-border animate-scaleUp my-auto sm:my-8 max-h-[92vh] overflow-y-auto custom-modal-scroll"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-rawaa-border mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rawaa-primary-light text-rawaa-primary flex items-center justify-center">
                  <Plus size={18} />
                </div>
                <h3 className="font-heading text-lg font-bold text-rawaa-dark">تسجيل طلب بيع يدوي (هاتف / واتساب)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 hover:bg-rawaa-soft rounded-full text-rawaa-muted"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateManualOrder} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-rawaa-dark mb-1">اسم العميل *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: سارة محمود"
                    value={manualOrder.customerName}
                    onChange={(e) => setManualOrder({ ...manualOrder, customerName: e.target.value })}
                    className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl px-3 py-2 text-xs text-rawaa-dark outline-none focus:bg-white focus:border-rawaa-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-rawaa-dark mb-1">رقم الهاتف *</label>
                  <input
                    type="tel"
                    required
                    placeholder="مثال: 01012345678"
                    value={manualOrder.customerPhone}
                    onChange={(e) => setManualOrder({ ...manualOrder, customerPhone: e.target.value })}
                    className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl px-3 py-2 text-xs text-rawaa-dark outline-none focus:bg-white focus:border-rawaa-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-rawaa-dark mb-1">المحافظة *</label>
                  <select
                    value={manualOrder.city}
                    onChange={(e) => setManualOrder({ ...manualOrder, city: e.target.value })}
                    className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl px-3 py-2 text-xs text-rawaa-dark outline-none focus:bg-white focus:border-rawaa-primary cursor-pointer"
                  >
                    <option value="القاهرة">القاهرة</option>
                    <option value="الجيزة">الجيزة</option>
                    <option value="الإسكندرية">الإسكندرية</option>
                    <option value="الدقهلية">الدقهلية (المنصورة)</option>
                    <option value="الغربية">الغربية (طنطا)</option>
                    <option value="الشرقية">الشرقية (الزقازيق)</option>
                    <option value="القليوبية">القليوبية</option>
                    <option value="البحيرة">البحيرة</option>
                    <option value="المنوفية">المنوفية</option>
                    <option value="دمياط">دمياط</option>
                    <option value="بورسعيد">بورسعيد</option>
                    <option value="السويس">السويس</option>
                    <option value="الإسماعيلية">الإسماعيلية</option>
                    <option value="بني سويف">بني سويف</option>
                    <option value="الفيوم">الفيوم</option>
                    <option value="المنيا">المنيا</option>
                    <option value="أسيوط">أسيوط</option>
                    <option value="سوهاج">سوهاج</option>
                    <option value="قنا">قنا</option>
                    <option value="الأقصر">الأقصر</option>
                    <option value="أسوان">أسوان</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-rawaa-dark mb-1">العنوان التفصيلي *</label>
                  <input
                    type="text"
                    required
                    placeholder="الشارع، رقم العمارة، الشقة"
                    value={manualOrder.address}
                    onChange={(e) => setManualOrder({ ...manualOrder, address: e.target.value })}
                    className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl px-3 py-2 text-xs text-rawaa-dark outline-none focus:bg-white focus:border-rawaa-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-rawaa-dark mb-1">المنتج المطلوب *</label>
                  <select
                    value={manualOrder.productId}
                    onChange={(e) => setManualOrder({ ...manualOrder, productId: e.target.value })}
                    className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl px-3 py-2 text-xs text-rawaa-dark outline-none focus:bg-white focus:border-rawaa-primary cursor-pointer"
                  >
                    {(allProducts || []).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name.substring(0, 45)}... ({p.price} ج.م)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-rawaa-dark mb-1">الكمية *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={manualOrder.quantity}
                    onChange={(e) => setManualOrder({ ...manualOrder, quantity: e.target.value })}
                    className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl px-3 py-2 text-xs text-rawaa-dark outline-none focus:bg-white focus:border-rawaa-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-rawaa-dark mb-1">طريقة الدفع</label>
                <select
                  value={manualOrder.paymentMethod}
                  onChange={(e) => setManualOrder({ ...manualOrder, paymentMethod: e.target.value })}
                  className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl px-3 py-2 text-xs text-rawaa-dark outline-none focus:bg-white focus:border-rawaa-primary cursor-pointer"
                >
                  <option value="الدفع عند الاستلام (COD)">الدفع عند الاستلام (COD)</option>
                  <option value="فودافون كاش / إنستاباي">فودافون كاش / إنستاباي</option>
                  <option value="فيزا / ماستركارد">فيزا / ماستركارد</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-rawaa-dark mb-1">ملاحظات التوصيل (اختياري)</label>
                <input
                  type="text"
                  placeholder="مثال: يرجى الاتصال قبل الوصول"
                  value={manualOrder.notes}
                  onChange={(e) => setManualOrder({ ...manualOrder, notes: e.target.value })}
                  className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl px-3 py-2 text-xs text-rawaa-dark outline-none focus:bg-white focus:border-rawaa-primary"
                />
              </div>

              <div className="pt-3 border-t border-rawaa-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-rawaa-dark hover:bg-rawaa-soft rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-rawaa-primary hover:bg-rawaa-primary-hover rounded-xl shadow-soft-xs transition-colors cursor-pointer"
                >
                  حفظ وتأكيد الطلب في السيرفر
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Confirmation modal for order deletion */}
      <ConfirmModal
        isOpen={Boolean(deleteConfirmId)}
        title="تأكيد حذف الطلب"
        message={`هل أنت متأكد من رغبتك في حذف الطلب رقم #${deleteConfirmId || ''} نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="تأكيد الحذف"
        cancelText="إلغاء"
        isDestructive={true}
        onConfirm={handleConfirmDeleteOrder}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
