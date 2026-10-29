import {
  Boxes,
  Minus,
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowUpDown
} from 'lucide-react';
import { TableRowSkeleton } from '../../common/Skeletons';

export default function InventoryTable({
  isLoadingProducts,
  filteredProducts = [],
  categories = [],
  onUpdateStock,
  onOpenAdjustment
}) {
  const getCategoryName = (categoryId) => {
    return categories.find((c) => c.id === categoryId)?.name || categoryId;
  };

  return (
    <div className="bg-white rounded-2xl border border-rawaa-border shadow-soft overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto custom-modal-scroll">
        <table className="w-full text-right text-xs min-w-[880px] border-collapse">
          <thead className="bg-[#FAF7F2] border-b border-rawaa-border text-xs font-bold text-rawaa-dark/70">
            <tr className="whitespace-nowrap">
              <th className="px-5 py-3.5 min-w-[280px]">المنتج</th>
              <th className="px-4 py-3.5">القسم</th>
              <th className="px-4 py-3.5">سعر الوحدة</th>
              <th className="px-4 py-3.5">الكمية الحالية</th>
              <th className="px-4 py-3.5">حالة المخزون</th>
              <th className="px-4 py-3.5">إجمالي القيمة</th>
              <th className="px-5 py-3.5 text-center">تعديل سريع</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rawaa-border/60">
            {isLoadingProducts ? (
              <>
                <TableRowSkeleton cols={7} />
                <TableRowSkeleton cols={7} />
                <TableRowSkeleton cols={7} />
                <TableRowSkeleton cols={7} />
                <TableRowSkeleton cols={7} />
              </>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-rawaa-dark/50">
                  <Boxes className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="font-bold">لا توجد منتجات تطابق معايير الفلترة</p>
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const stock = Number(product.stockCount ?? product.stock ?? 0);
                const price = Number(product.price) || 0;
                const totalVal = stock * price;

                let statusBadge = (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>متوفر ({stock})</span>
                  </span>
                );

                if (stock === 0) {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap">
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>نفد المخزون</span>
                    </span>
                  );
                } else if (stock <= 5) {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>مخزون منخفض ({stock})</span>
                    </span>
                  );
                }

                return (
                  <tr key={product.id} className="hover:bg-rawaa-soft/30 transition-colors">
                    <td className="px-5 py-3.5 min-w-[280px]">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl border border-rawaa-border overflow-hidden shrink-0 bg-rawaa-soft">
                          <img
                            src={product.mainImage || product.image || '/logo.png'}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/logo.png';
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-rawaa-dark line-clamp-1 text-xs">
                            {product.name}
                          </div>
                          <div className="text-[11px] text-rawaa-dark/50 font-mono mt-0.5 whitespace-nowrap">
                            ID: #{product.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-rawaa-soft text-xs text-rawaa-dark font-medium">
                        {getCategoryName(product.category)}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-bold text-rawaa-dark font-cairo text-sm">
                        {price.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-rawaa-dark/50 mr-1">ج.م</span>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onUpdateStock(product.id, Math.max(0, stock - 1))}
                          disabled={stock === 0}
                          title="خصم قطعة واحدة"
                          className="w-7 h-7 rounded-lg bg-rawaa-soft hover:bg-rose-100 hover:text-rose-700 text-rawaa-dark flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer shrink-0"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span
                          className={`w-9 text-center font-bold font-mono text-sm ${
                            stock === 0
                              ? 'text-rose-600 font-black'
                              : stock <= 5
                              ? 'text-amber-600'
                              : 'text-rawaa-dark'
                          }`}
                        >
                          {stock}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateStock(product.id, stock + 1)}
                          title="إضافة قطعة واحدة"
                          className="w-7 h-7 rounded-lg bg-rawaa-soft hover:bg-emerald-100 hover:text-emerald-700 text-rawaa-dark flex items-center justify-center transition-colors cursor-pointer shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">{statusBadge}</td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-bold text-rawaa-sage font-cairo text-sm">
                        {totalVal.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-rawaa-dark/50 mr-1">ج.م</span>
                    </td>

                    <td className="px-5 py-3.5 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onOpenAdjustment(product)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rawaa-soft hover:bg-rawaa-primary hover:text-white rounded-xl text-xs font-bold text-rawaa-dark transition-colors cursor-pointer whitespace-nowrap shadow-2xs"
                      >
                        <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                        <span>توريد / تسوية</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (Visible on < md screens) */}
      <div className="md:hidden divide-y divide-rawaa-border/60">
        {isLoadingProducts ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-rawaa-soft/60 rounded-xl p-3 h-28" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-12 px-4 text-center text-rawaa-dark/50">
            <Boxes className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="font-bold text-xs">لا توجد منتجات تطابق معايير الفلترة</p>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const stock = Number(product.stockCount ?? product.stock ?? 0);
            const price = Number(product.price) || 0;

            return (
              <div key={product.id} className="p-3.5 hover:bg-rawaa-soft/30 transition-colors space-y-2.5">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl border border-rawaa-border overflow-hidden shrink-0 bg-rawaa-soft">
                    <img
                      src={product.mainImage || product.image || '/logo.png'}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/logo.png';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-xs text-rawaa-dark line-clamp-1 leading-snug">
                        {product.name}
                      </h4>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                          stock === 0
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : stock <= 5
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {stock === 0 ? 'نفد' : stock <= 5 ? `حرج (${stock})` : `${stock} متوفر`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-rawaa-dark/50">
                      <span>{getCategoryName(product.category)}</span>
                      <span>•</span>
                      <span className="font-bold text-rawaa-dark">{price.toLocaleString()} ج.م</span>
                    </div>
                  </div>
                </div>

                {/* Stock control row and replenishment action */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-dashed border-rawaa-border/60">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onUpdateStock(product.id, Math.max(0, stock - 1))}
                      disabled={stock === 0}
                      title="خصم قطعة واحدة"
                      className="w-7 h-7 rounded-lg bg-rawaa-soft hover:bg-rose-100 hover:text-rose-700 text-rawaa-dark flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer shrink-0"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span
                      className={`w-9 text-center font-bold font-mono text-sm ${
                        stock === 0
                          ? 'text-rose-600 font-black'
                          : stock <= 5
                          ? 'text-amber-600'
                          : 'text-rawaa-dark'
                      }`}
                    >
                      {stock}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateStock(product.id, stock + 1)}
                      title="إضافة قطعة واحدة"
                      className="w-7 h-7 rounded-lg bg-rawaa-soft hover:bg-emerald-100 hover:text-emerald-700 text-rawaa-dark flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenAdjustment(product)}
                    className="px-3 py-1.5 rounded-xl bg-rawaa-soft hover:bg-rawaa-dark hover:text-white text-rawaa-dark font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-rawaa-primary" />
                    <span>توريد / تسوية</span>
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

