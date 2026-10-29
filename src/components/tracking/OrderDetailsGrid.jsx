import { Link } from 'react-router-dom';
import { MapPin, Truck, Package } from 'lucide-react';

export function OrderDetailsGrid({ activeOrder, formatPrice }) {
  return (
    <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Delivery and recipient information */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-[#FAF7F2] rounded-xl p-4 border border-rawaa-border">
          <h4 className="font-heading text-xs font-bold text-rawaa-dark mb-3 flex items-center gap-2">
            <MapPin size={15} className="text-rawaa-primary" />
            <span>عنوان الاستلام ومعلومات المستلم</span>
          </h4>
          <div className="text-xs space-y-2 text-rawaa-muted">
            <div><strong>الاسم:</strong> {activeOrder.customerName}</div>
            <div><strong>المدينة:</strong> {activeOrder.city}</div>
            <div><strong>العنوان:</strong> {activeOrder.district}</div>
            <div><strong>الهاتف:</strong> <span dir="ltr">{activeOrder.phone}</span></div>
            <div><strong>طريقة السداد:</strong> {activeOrder.paymentMethod}</div>
          </div>
        </div>

        {/* Courier info card */}
        {activeOrder.courierName ? (
          <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-200/60">
            <h4 className="font-heading text-xs font-bold text-emerald-900 mb-2 flex items-center gap-2">
              <Truck size={15} className="text-emerald-700" />
              <span>كابتن التوصيل المعين</span>
            </h4>
            <div className="text-xs text-emerald-800 space-y-1">
              <div className="font-bold">{activeOrder.courierName}</div>
              {activeOrder.courierPhone && (
                <div className="font-mono text-xs text-emerald-700" dir="ltr">📞 {activeOrder.courierPhone}</div>
              )}
              <div className="text-emerald-700 font-medium">سيارة مجهزة لنقل مستلزمات الأطفال</div>
            </div>
          </div>
        ) : (
          <div className="bg-[#FAF7F2] rounded-xl p-4 border border-rawaa-border">
            <h4 className="font-heading text-xs font-bold text-rawaa-dark mb-1.5 flex items-center gap-2">
              <Truck size={15} className="text-rawaa-primary" />
              <span>بيانات شركة الشحن والمندوب</span>
            </h4>
            <p className="text-xs text-rawaa-muted leading-relaxed">
              {activeOrder.currentStep >= 3
                ? 'الشحنة مع مندوب التوصيل السريع إلى عنوانكم'
                : 'يتم تعيين المندوب وتوفير رقم التواصل فور الانتهاء من التجهيز وتأكيد الشحن.'}
            </p>
          </div>
        )}
      </div>

      {/* Package items list */}
      <div className="lg:col-span-2">
        <h4 className="font-heading text-xs font-bold text-rawaa-dark mb-3 flex items-center gap-2">
          <Package size={15} className="text-rawaa-primary" />
          <span>محتويات الطرد ({activeOrder.items?.length || 0} منتجات)</span>
        </h4>

        <div className="space-y-3">
          {activeOrder.items?.map((item, idx) => {
            const itemQty = item.quantity || item.qty || 1;
            return (
              <div key={item.id || idx} className="flex items-center justify-between gap-4 p-3 bg-[#FAF7F2] rounded-xl border border-rawaa-border">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 rounded-lg object-cover border border-rawaa-border bg-white"
                  />
                  <div>
                    <Link to={`/product/${item.id}`} className="font-heading text-xs font-bold text-rawaa-dark hover:text-rawaa-primary transition-colors line-clamp-1">
                      {item.name}
                    </Link>
                    <div className="text-[11px] text-rawaa-muted mt-0.5">
                      اللون: {item.color} | الكمية: {itemQty}
                    </div>
                  </div>
                </div>
                <div className="font-heading text-xs font-bold text-rawaa-primary shrink-0">
                  {formatPrice(item.price * itemQty)}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-rawaa-border flex items-center justify-between text-sm">
          <span className="font-heading font-bold text-rawaa-dark">إجمالي الشحنة (شامل الضريبة ومصاريف الشحن):</span>
          <span className="font-heading text-base font-extrabold text-rawaa-primary">{formatPrice(activeOrder.total)}</span>
        </div>
      </div>
    </div>
  );
}

