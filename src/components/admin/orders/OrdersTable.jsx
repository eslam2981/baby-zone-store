import {
  Package,
  Eye,
  Trash2,
  CheckCircle2,
  MapPin,
  Phone,
  Plus
} from 'lucide-react';
import { TableRowSkeleton } from '../../common/Skeletons';
import { formatShortDateTime, getStatusBadge } from './orderHelpers';

export default function OrdersTable({
  isLoadingOrders,
  filteredOrders = [],
  allOrdersCount = 0,
  onViewOrder,
  onDeleteOrder,
  onConfirmOrder,
  onOpenManualOrder
}) {
  return (
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
              filteredOrders.map((ord) => {
                const totalNum = Number(ord.total) || 0;
                const itemsCount = Array.isArray(ord.items) ? ord.items.length : 0;

                return (
                  <tr key={ord.id} className="hover:bg-rawaa-soft/50 transition-colors">
                    <td className="py-3.5 pr-4 pl-2 whitespace-nowrap">
                      <span className="block font-mono font-bold text-rawaa-dark text-xs">#{ord.id}</span>
                      <span className="block text-[10px] text-rawaa-subtle mt-0.5">
                        {formatShortDateTime(ord.date)}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 min-w-[160px]">
                      <span className="block font-bold text-rawaa-dark line-clamp-1">{ord.customerName}</span>
                      <span className="block text-[10px] text-rawaa-muted font-mono whitespace-nowrap" dir="ltr">
                        {ord.customerPhone}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 min-w-[140px]">
                      <span className="block font-bold text-rawaa-dark whitespace-nowrap">{ord.city}</span>
                      <span className="block text-[10px] text-rawaa-subtle truncate max-w-[150px]">{ord.district}</span>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-bold text-rawaa-dark text-xs">
                        {totalNum.toLocaleString('ar-EG')} <span className="text-[10px] text-rawaa-primary">ج.م</span>
                      </div>
                      <span className="text-[10px] text-rawaa-subtle">{itemsCount} منتجات</span>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="block text-xs font-medium text-rawaa-dark">{ord.paymentMethod}</span>
                      <span
                        className={`block text-[10px] font-bold mt-0.5 ${
                          ord.paymentStatus === 'مدفوع بالكامل' ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {ord.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${getStatusBadge(
                          ord.deliveryStatus
                        )}`}
                      >
                        {ord.deliveryStatus}
                      </span>
                    </td>

                    <td className="py-3.5 pl-4 pr-2 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onViewOrder(ord)}
                          className="p-1.5 rounded-lg text-rawaa-primary hover:bg-rawaa-primary-light transition-colors cursor-pointer"
                          title="عرض تفاصيل الطلب والفاتورة"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteOrder(ord.id)}
                          className="p-1.5 rounded-lg text-rawaa-muted hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="حذف الطلب"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}

            {!isLoadingOrders && filteredOrders.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-16 text-rawaa-muted">
                  <div className="w-16 h-16 rounded-2xl bg-rawaa-primary/10 text-rawaa-primary flex items-center justify-center mx-auto mb-3 shadow-soft-xs">
                    <Package size={30} />
                  </div>
                  <h4 className="font-heading text-sm font-bold text-rawaa-dark mb-1">
                    {allOrdersCount === 0 ? 'لا توجد أي طلبات مسجلة حالياً' : 'لا توجد طلبات مطابقة لخيارات البحث'}
                  </h4>
                  <p className="text-xs text-rawaa-muted max-w-sm mx-auto mb-4 leading-relaxed">
                    {allOrdersCount === 0
                      ? 'سجل الطلبات فارغ تماماً ومجهز لاستقبال أول عملية شراء، أو يمكنك تسجيل طلب هاتفي / واتساب يدوي.'
                      : 'جربي تغيير كلمات البحث أو إعادة ضبط خيارات الفلترة.'}
                  </p>
                  {allOrdersCount === 0 && (
                    <button
                      type="button"
                      onClick={onOpenManualOrder}
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
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 px-4 text-rawaa-muted">
            <Package size={32} className="mx-auto text-rawaa-subtle mb-2 opacity-50" />
            <p className="text-xs font-bold">
              {allOrdersCount === 0 ? 'لا توجد أي طلبات مسجلة حالياً' : 'لا توجد طلبات مطابقة لخيارات البحث'}
            </p>
          </div>
        ) : (
          filteredOrders.map((ord) => {
            const totalNum = Number(ord.total) || 0;
            const itemsList = Array.isArray(ord.items) ? ord.items : [];

            return (
              <div key={ord.id} className="p-3.5 hover:bg-rawaa-soft/30 transition-colors space-y-2.5">
                {/* Header row: Order ID, Date & Status */}
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold text-xs text-rawaa-dark">#{ord.id}</span>
                    <span className="block text-[10px] text-rawaa-subtle mt-0.5">
                      {formatShortDateTime(ord.date)}
                    </span>
                  </div>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${getStatusBadge(
                      ord.deliveryStatus
                    )}`}
                  >
                    {ord.deliveryStatus}
                  </span>
                </div>

                {/* Customer Info row */}
                <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-rawaa-border/60 flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <span className="font-bold text-rawaa-dark block truncate">{ord.customerName}</span>
                    <div className="flex items-center gap-1 text-[10px] text-rawaa-subtle mt-0.5">
                      <MapPin size={11} className="shrink-0 text-rawaa-muted" />
                      <span className="truncate">
                        {ord.city} {ord.district ? `• ${ord.district}` : ''}
                      </span>
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
                      {totalNum.toLocaleString('ar-EG')} <span className="text-[10px] text-rawaa-primary">ج.م</span>
                    </span>
                    <span className="text-[10px] text-rawaa-muted mr-1.5">({itemsList.length} منتجات)</span>
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] text-rawaa-muted block">{ord.paymentMethod}</span>
                    <span
                      className={`text-[10px] font-bold ${
                        ord.paymentStatus === 'مدفوع بالكامل' ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {ord.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex items-center gap-2 pt-1 border-t border-dashed border-rawaa-border/60">
                  {ord.deliveryStatus === 'بانتظار التأكيد' && (
                    <button
                      type="button"
                      onClick={() => onConfirmOrder(ord.id)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 size={13} />
                      <span>تأكيد الطلب</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onViewOrder(ord)}
                    className="flex-1 bg-rawaa-soft hover:bg-rawaa-primary hover:text-white text-rawaa-dark font-bold py-1.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Eye size={13} />
                    <span>عرض التفاصيل</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteOrder(ord.id)}
                    className="w-8 h-8 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    title="حذف الطلب"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

