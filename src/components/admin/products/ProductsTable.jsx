import {
  Package,
  Plus,
  Minus,
  Edit,
  Trash2
} from 'lucide-react';
import { TableRowSkeleton } from '../../common/Skeletons';

export default function ProductsTable({
  isLoadingProducts,
  filteredProducts = [],
  categories = [],
  onUpdateStock,
  onEditProduct,
  onDeleteProduct
}) {
  const getCategoryName = (categoryId) => {
    return categories.find((c) => c.id === categoryId)?.name || categoryId;
  };

  return (
    <div className="bg-white rounded-2xl border border-rawaa-border shadow-soft-xs overflow-hidden">
      {/* Desktop / Tablet table view */}
      <div className="hidden md:block overflow-x-auto custom-modal-scroll">
        <table className="w-full text-right text-xs min-w-[820px] border-collapse">
          <thead className="bg-[#FAF7F2] border-b border-rawaa-border text-rawaa-subtle font-bold">
            <tr className="whitespace-nowrap">
              <th className="py-3.5 pr-4 pl-2 min-w-[260px]">المنتج والماركة</th>
              <th className="py-3.5 px-3">القسم</th>
              <th className="py-3.5 px-3">السعر</th>
              <th className="py-3.5 px-3">المخزون الحالي</th>
              <th className="py-3.5 px-3">الشارات</th>
              <th className="py-3.5 pl-4 pr-2 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rawaa-border/50">
            {isLoadingProducts ? (
              <>
                <TableRowSkeleton cols={6} />
                <TableRowSkeleton cols={6} />
                <TableRowSkeleton cols={6} />
                <TableRowSkeleton cols={6} />
                <TableRowSkeleton cols={6} />
                <TableRowSkeleton cols={6} />
              </>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-rawaa-soft/50 transition-colors">
                  <td className="py-3 pr-4 pl-2 min-w-[260px]">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl border border-rawaa-border shrink-0 bg-rawaa-soft overflow-hidden">
                        <img
                          src={p.mainImage || '/logo.png'}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/logo.png';
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="block font-bold text-rawaa-dark truncate max-w-xs sm:max-w-md">
                          {p.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 whitespace-nowrap">
                          <span className="text-[10px] text-rawaa-muted font-bold">{p.brand}</span>
                          <span className="text-[10px] text-rawaa-subtle">•</span>
                          <span className="text-[10px] text-rawaa-subtle">{p.ageGroup}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="inline-block bg-rawaa-soft px-2.5 py-1 rounded-lg text-[11px] font-bold text-rawaa-dark">
                      {getCategoryName(p.category)}
                    </span>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex items-baseline gap-1 font-bold">
                      <span className="text-rawaa-dark font-cairo text-sm">{p.price}</span>
                      <span className="text-[10px] text-rawaa-primary font-bold">ج.م</span>
                    </div>
                    {p.originalPrice > p.price && (
                      <span className="block text-[10px] text-rawaa-subtle line-through">
                        {p.originalPrice} ج.م
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                          p.stockCount <= 0
                            ? 'bg-red-50 text-red-600 border border-red-200'
                            : p.stockCount <= 5
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {p.stockCount <= 0 ? 'نفد' : p.stockCount <= 5 ? `حرج (${p.stockCount})` : `${p.stockCount} قطعة`}
                      </span>
                      {/* Inline quick adjust buttons */}
                      <button
                        type="button"
                        onClick={() => onUpdateStock(p.id, p.stockCount + 1)}
                        className="w-5 h-5 rounded bg-rawaa-soft hover:bg-rawaa-primary hover:text-white flex items-center justify-center font-bold text-[10px] transition-colors cursor-pointer shrink-0"
                        title="إضافة 1 للمخزون"
                      >
                        <Plus size={11} strokeWidth={2.5} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateStock(p.id, p.stockCount - 1)}
                        disabled={p.stockCount <= 0}
                        className="w-5 h-5 rounded bg-rawaa-soft hover:bg-red-500 hover:text-white flex items-center justify-center font-bold text-[10px] transition-colors cursor-pointer disabled:opacity-30 shrink-0"
                        title="خصم 1 من المخزون"
                      >
                        <Minus size={11} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {p.badge && (
                        <span className="bg-rawaa-primary-light text-rawaa-primary text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                          {p.badge}
                        </span>
                      )}
                      {p.discountPercent > 0 && (
                        <span className="bg-red-100 text-red-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">
                          -{p.discountPercent}%
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 pl-4 pr-2 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEditProduct(p)}
                        className="p-1.5 rounded-lg text-rawaa-muted hover:text-rawaa-primary hover:bg-rawaa-soft transition-colors cursor-pointer"
                        title="تعديل المنتج"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteProduct(p.id)}
                        className="p-1.5 rounded-lg text-rawaa-muted hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="حذف المنتج"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}

            {!isLoadingProducts && filteredProducts.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-10 text-rawaa-muted">
                  <Package size={32} className="mx-auto text-rawaa-subtle mb-2 opacity-50" />
                  <p className="text-xs font-bold">لا توجد منتجات مطابقة لخيارات البحث أو الفلاتر</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card view (Visible on < md screens) */}
      <div className="md:hidden divide-y divide-rawaa-border/60">
        {isLoadingProducts ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-rawaa-soft/60 rounded-xl p-3 h-24" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-10 px-4 text-rawaa-muted">
            <Package size={32} className="mx-auto text-rawaa-subtle mb-2 opacity-50" />
            <p className="text-xs font-bold">لا توجد منتجات مطابقة لخيارات البحث أو الفلاتر</p>
          </div>
        ) : (
          filteredProducts.map((p) => (
            <div key={p.id} className="p-3.5 hover:bg-rawaa-soft/30 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-xl border border-rawaa-border shrink-0 bg-rawaa-soft overflow-hidden">
                  <img
                    src={p.mainImage || '/logo.png'}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/logo.png';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-xs text-rawaa-dark line-clamp-1 leading-snug">
                      {p.name}
                    </h4>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => onEditProduct(p)}
                        className="w-8 h-8 rounded-lg text-rawaa-muted hover:text-rawaa-primary hover:bg-rawaa-soft flex items-center justify-center transition-colors cursor-pointer"
                        title="تعديل المنتج"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteProduct(p.id)}
                        className="w-8 h-8 rounded-lg text-rawaa-muted hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                        title="حذف المنتج"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-[11px] text-rawaa-muted">
                    <span>{getCategoryName(p.category)}</span>
                    {p.brand && (
                      <>
                        <span>•</span>
                        <span className="font-medium text-rawaa-dark">{p.brand}</span>
                      </>
                    )}
                  </div>

                  {/* Price and Stock row */}
                  <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-dashed border-rawaa-border/60">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-bold text-rawaa-dark">{p.price} ج.م</span>
                      {p.originalPrice > p.price && (
                        <span className="text-[10px] text-rawaa-subtle line-through">
                          {p.originalPrice} ج.م
                        </span>
                      )}
                      {p.discountPercent > 0 && (
                        <span className="bg-red-100 text-red-700 text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                          -{p.discountPercent}%
                        </span>
                      )}
                    </div>

                    {/* Stock controls */}
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.stockCount <= 0
                            ? 'bg-red-50 text-red-600 border border-red-200'
                            : p.stockCount <= 5
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {p.stockCount <= 0 ? 'نفد' : `${p.stockCount} ق`}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onUpdateStock(p.id, p.stockCount + 1)}
                          className="w-6 h-6 rounded bg-rawaa-soft hover:bg-rawaa-primary hover:text-white flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
                          title="إضافة 1 للمخزون"
                        >
                          <Plus size={11} strokeWidth={2.5} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateStock(p.id, p.stockCount - 1)}
                          disabled={p.stockCount <= 0}
                          className="w-6 h-6 rounded bg-rawaa-soft hover:bg-red-500 hover:text-white flex items-center justify-center font-bold text-xs transition-colors cursor-pointer disabled:opacity-30"
                          title="خصم 1 من المخزون"
                        >
                          <Minus size={11} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

