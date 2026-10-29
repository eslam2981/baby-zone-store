import { createPortal } from 'react-dom';
import {
  Package,
  Printer,
  X,
  Phone,
  MapPin
} from 'lucide-react';
import { formatOrderDateTime, getStatusBadge } from './orderHelpers';
import ModernSelect from '../../common/ModernSelect';

export default function OrderDetailsModal({
  order,
  onClose,
  onUpdateStatus
}) {
  if (!order) return null;

  const itemsList = Array.isArray(order.items) ? order.items : [];
  const itemsSubtotal = itemsList.reduce(
    (acc, it) => acc + (Number(it.price) || 0) * (Number(it.quantity) || Number(it.qty) || 1),
    0
  );
  const totalNum = Number(order.total) || 0;
  const calculatedShipping =
    order.shippingFee !== undefined && order.shippingFee > 0
      ? Number(order.shippingFee)
      : Math.max(0, totalNum - itemsSubtotal);

  const handlePrint = () => {
    window.print();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-hidden"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full text-right shadow-2xl border border-rawaa-border animate-scaleUp max-h-[90vh] flex flex-col overflow-hidden print:shadow-none print:border-none print:m-0 print:max-h-none print:w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-rawaa-border shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rawaa-primary-light text-rawaa-primary flex items-center justify-center">
              <Package size={20} />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-rawaa-dark">
                تفاصيل الطلب <span className="font-mono text-rawaa-primary">#{order.id}</span>
              </h3>
              <span className="text-[11px] text-rawaa-muted">
                تم التسجيل في: {formatOrderDateTime(order.date)}
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
              onClick={onClose}
              className="p-1.5 rounded-full text-rawaa-muted hover:bg-rawaa-soft cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-modal-scroll p-4 sm:p-6 py-4 space-y-5">
          {/* Status and quick update selector */}
          <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-rawaa-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] text-rawaa-subtle font-bold block mb-1">تحديث مسار وحالة الشحنة:</span>
              <div className="flex items-center gap-2">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(order.deliveryStatus)}`}>
                  {order.deliveryStatus || 'بانتظار التأكيد'}
                </span>
                <span className="text-xs text-rawaa-muted font-mono">
                  (كود الاستلام: <strong className="text-rawaa-primary">{order.deliveryPin || '4821'}</strong>)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 print:hidden w-48">
              <ModernSelect
                value={order.deliveryStatus || 'بانتظار التأكيد'}
                onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                options={[
                  { value: 'بانتظار التأكيد', label: 'بانتظار التأكيد', badge: 'جديد', badgeColor: 'bg-amber-100 text-amber-800' },
                  { value: 'تم تأكيد الطلب', label: 'تم تأكيد الطلب', badge: 'مؤكد', badgeColor: 'bg-blue-100 text-blue-800' },
                  { value: 'قيد التجهيز الطبي', label: 'قيد التجهيز الطبي', badge: 'تجهيز', badgeColor: 'bg-indigo-100 text-indigo-800' },
                  { value: 'مع المندوب', label: 'مع المندوب في الطريق', badge: 'شحن', badgeColor: 'bg-purple-100 text-purple-800' },
                  { value: 'تم التسليم', label: 'تم التسليم بنجاح', badge: 'مكتمل', badgeColor: 'bg-emerald-100 text-emerald-800' },
                  { value: 'ملغي', label: 'ملغي (تم إلغاء الطلب)', badge: 'ملغي', badgeColor: 'bg-rose-100 text-rose-800' }
                ]}
                buttonClassName="bg-white py-1.5"
              />
            </div>
          </div>

          {/* Customer and shipping info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-rawaa-border p-4 rounded-2xl space-y-2">
              <span className="text-[11px] font-bold text-rawaa-subtle block mb-1">بيانات العميل والتواصل:</span>
              <div className="space-y-1 text-xs">
                <strong className="block text-sm font-bold text-rawaa-dark">{order.customerName || 'عميل بيبي زون'}</strong>
                <div className="flex items-center gap-1.5 text-rawaa-muted font-mono" dir="ltr">
                  <Phone size={13} className="text-emerald-600" />
                  <span>{order.customerPhone || 'غير مسجل'}</span>
                </div>
                {order.customerEmail && (
                  <span className="block text-[11px] text-rawaa-subtle">{order.customerEmail}</span>
                )}
              </div>
            </div>

            <div className="bg-white border border-rawaa-border p-4 rounded-2xl space-y-2">
              <span className="text-[11px] font-bold text-rawaa-subtle block mb-1">عنوان التسليم بمصر:</span>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-rawaa-dark font-bold">
                  <MapPin size={13} className="text-rawaa-primary" />
                  <span>{order.city || 'القاهرة'}{order.district ? ` — ${order.district}` : ''}</span>
                </div>
                <span className="block text-[11px] text-rawaa-muted leading-relaxed">
                  {order.address || 'العنوان غير محدد'}
                </span>
                {order.notes && (
                  <span className="block text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded-lg mt-1">
                    ملاحظة: {order.notes}
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
              {itemsList.length > 0 ? (
                itemsList.map((item, idx) => {
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
            {Number(order.discountAmount) > 0 && (
              <div className="flex justify-between text-red-600 font-bold">
                <span>خصم الكوبون:</span>
                <span>-{Number(order.discountAmount).toLocaleString('ar-EG')} ج.م</span>
              </div>
            )}
            <div className="pt-2 border-t border-rawaa-border flex justify-between text-sm font-black text-rawaa-dark">
              <span>إجمالي الفاتورة المطلوب سداده:</span>
              <span className="text-rawaa-primary">{totalNum.toLocaleString('ar-EG')} ج.م</span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:px-6 py-3 border-t border-rawaa-border flex items-center justify-between shrink-0 bg-white print:hidden">
          <span className="text-[11px] text-rawaa-muted">
            المندوب المسؤول: <strong>{order.courierName || 'مندوب التوصيل السريع'}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-rawaa-dark hover:bg-black rounded-xl transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

