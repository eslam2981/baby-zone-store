import {
  Users,
  Plus,
  Crown,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Building2,
  Shield,
  Key,
  Ban,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { TableRowSkeleton } from '../../common/Skeletons';

export default function CustomersTable({
  isLoadingCustomers,
  filteredCustomers = [],
  onSelectCustomer,
  onDeleteCustomer,
  onOpenAddModal
}) {
  return (
    <div className="bg-white rounded-3xl border border-rawaa-border shadow-soft overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto custom-modal-scroll">
        <table className="w-full text-right text-xs min-w-[880px] border-collapse">
          <thead className="bg-[#FAF7F2] border-b border-rawaa-border text-xs font-bold text-rawaa-muted">
            <tr className="whitespace-nowrap">
              <th className="px-5 py-4 min-w-[220px]">العميل</th>
              <th className="px-4 py-4 min-w-[170px]">بيانات التواصل</th>
              <th className="px-4 py-4">المحافظة</th>
              <th className="px-4 py-4">الرتبة</th>
              <th className="px-4 py-4">الصلاحيات</th>
              <th className="px-4 py-4">الطلبات والمشتريات</th>
              <th className="px-4 py-4">الحالة</th>
              <th className="px-5 py-4 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rawaa-border/60">
            {isLoadingCustomers ? (
              <>
                <TableRowSkeleton cols={8} />
                <TableRowSkeleton cols={8} />
                <TableRowSkeleton cols={8} />
                <TableRowSkeleton cols={8} />
                <TableRowSkeleton cols={8} />
              </>
            ) : filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-14 text-center text-rawaa-muted">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30 text-rawaa-primary" />
                  <p className="font-heading font-black text-sm text-rawaa-dark">لا يوجد عملاء مسجلين حالياً</p>
                  <p className="text-xs text-rawaa-muted mt-1 max-w-sm mx-auto leading-relaxed">
                    يتم توثيق وحفظ العملاء وصلاحياتهم آلياً بقاعدة البيانات فور قيام أي عميلة بالتسجيل أو الشراء، أو يمكنك إضافة عميل يدوياً
                  </p>
                  <button
                    type="button"
                    onClick={onOpenAddModal}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-rawaa-primary hover:bg-rawaa-primary-hover text-white text-xs font-bold rounded-2xl transition-all cursor-pointer shadow-soft-xs"
                  >
                    <Plus size={15} />
                    <span>إضافة عميل جديد</span>
                  </button>
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => {
                const permCount = Array.isArray(customer.permissions) ? customer.permissions.length : 5;
                const isBlocked = customer.status === 'محظور';

                return (
                  <tr key={customer.id} className="hover:bg-rawaa-soft/30 transition-colors">
                    <td className="px-5 py-4 min-w-[220px]">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-2xl font-bold flex items-center justify-center text-sm shrink-0 shadow-soft-xs ${
                            customer.isVip
                              ? 'bg-amber-100 text-amber-700 border border-amber-200'
                              : isBlocked
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : 'bg-rawaa-primary/10 text-rawaa-primary border border-rawaa-primary/20'
                          }`}
                        >
                          {customer.name?.charAt(0) || 'ع'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-rawaa-dark flex items-center gap-1.5 line-clamp-1">
                            <span>{customer.name}</span>
                            {customer.isVip && (
                              <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                            )}
                          </div>
                          <div className="text-[11px] text-rawaa-muted flex items-center gap-1 mt-0.5 whitespace-nowrap">
                            <Calendar className="w-3 h-3 shrink-0" />
                            <span>انضم {customer.joinedDate || '2026'}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 min-w-[170px]">
                      <div className="space-y-0.5 text-xs">
                        <div className="flex items-center gap-1.5 text-rawaa-dark font-mono whitespace-nowrap" dir="ltr">
                          <Phone className="w-3 h-3 text-rawaa-muted shrink-0" />
                          <span>{customer.phone || 'غير مسجل'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-rawaa-muted text-[11px] truncate max-w-[170px]">
                          <Mail className="w-3 h-3 text-rawaa-muted shrink-0" />
                          <span>{customer.email || 'بدون إيميل'}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rawaa-soft text-xs text-rawaa-dark font-medium whitespace-nowrap">
                        <MapPin className="w-3 h-3 text-rawaa-primary shrink-0" />
                        <span>{customer.city || 'القاهرة'}</span>
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      {customer.role === 'vip_customer' || customer.isVip ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Crown className="w-3 h-3" />
                          عميلة VIP
                        </span>
                      ) : customer.role === 'wholesaler' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <Building2 className="w-3 h-3" />
                          تاجر / جملة
                        </span>
                      ) : customer.role === 'supervisor' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          <Shield className="w-3 h-3" />
                          مشرفة دعم
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                          عميلة مسجلة
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rawaa-primary/5 text-rawaa-primary font-bold text-[11px] border border-rawaa-primary/15">
                        <Key size={13} />
                        <span>{permCount} صلاحيات نشطة</span>
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-bold text-rawaa-dark">
                        <span>{customer.ordersCount || 0} طلب</span>
                        <span className="text-rawaa-muted mx-1">·</span>
                        <span className="text-rawaa-primary font-heading">
                          {(customer.totalSpent || 0).toLocaleString()} ج.م
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      {isBlocked ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <Ban className="w-3 h-3" />
                          محظور
                        </span>
                      ) : customer.status === 'نشط' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          نشط
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                          غير نشط
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectCustomer(customer)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rawaa-soft hover:bg-rawaa-primary hover:text-white rounded-xl text-xs font-bold text-rawaa-dark transition-all cursor-pointer whitespace-nowrap"
                          title="تعديل الصلاحيات والبيانات"
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>الصلاحيات</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteCustomer(customer.id)}
                          className="p-1.5 text-rawaa-muted hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          title="حذف العميل"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card view (Visible on < md screens) */}
      <div className="md:hidden divide-y divide-rawaa-border/60">
        {isLoadingCustomers ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-rawaa-soft/60 rounded-2xl p-4 h-28" />
            ))}
          </div>
        ) : (!filteredCustomers || filteredCustomers.length === 0) ? (
          <div className="py-12 px-4 text-center text-rawaa-muted">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30 text-rawaa-primary" />
            <p className="font-heading font-black text-sm text-rawaa-dark">لا يوجد عملاء مسجلين حالياً</p>
          </div>
        ) : (
          filteredCustomers.map((customer) => {
            const permCount = Array.isArray(customer.permissions) ? customer.permissions.length : 5;
            const isBlocked = customer.status === 'محظور';

            return (
              <div key={customer.id} className="p-4 hover:bg-rawaa-soft/30 transition-colors space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-2xl font-bold flex items-center justify-center text-sm shrink-0 shadow-soft-xs ${
                        customer.isVip
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : isBlocked
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-rawaa-primary/10 text-rawaa-primary border border-rawaa-primary/20'
                      }`}
                    >
                      {customer.name?.charAt(0) || 'ع'}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-rawaa-dark flex items-center gap-1.5 truncate">
                        <span>{customer.name}</span>
                        {customer.isVip && (
                          <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                        )}
                      </div>
                      <div className="text-[10px] text-rawaa-muted flex items-center gap-1.5 mt-0.5">
                        <span>{customer.city || 'مصر'}</span>
                        <span>•</span>
                        <span>انضم {customer.joinedDate || '2026'}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                      isBlocked
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : customer.status === 'نشط'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}
                  >
                    {customer.status}
                  </span>
                </div>

                {/* Contact & financial stats row */}
                <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-rawaa-border/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    {customer.phone && (
                      <a
                        href={`tel:${customer.phone}`}
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg"
                        dir="ltr"
                      >
                        <Phone size={11} />
                        <span>{customer.phone}</span>
                      </a>
                    )}
                    <span className="text-[11px] text-rawaa-muted">
                      {customer.ordersCount || customer.orderCount || 0} طلبات
                    </span>
                  </div>

                  <div className="text-[11px] font-bold text-rawaa-dark">
                    {(customer.totalSpent || 0).toLocaleString()} <span className="text-[9px] text-rawaa-primary font-normal">ج.م</span>
                  </div>
                </div>

                {/* Permissions & action buttons */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-dashed border-rawaa-border/60">
                  <span className="text-[10px] text-rawaa-muted font-medium">
                    الصلاحيات: <strong className="text-rawaa-dark">{permCount}</strong> / 8
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectCustomer(customer)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rawaa-soft hover:bg-rawaa-primary hover:text-white rounded-xl text-xs font-bold text-rawaa-dark transition-all cursor-pointer"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>الصلاحيات والملف</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteCustomer(customer.id)}
                      className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      title="حذف العميل"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

