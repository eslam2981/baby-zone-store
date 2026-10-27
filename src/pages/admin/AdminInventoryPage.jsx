import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useShop } from '../../context/ShopContext';
import {
  Boxes,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  Minus,
  TrendingUp,
  Package,
  Layers,
  Sparkles,
  ArrowUpDown,
  RefreshCw,
  X
} from 'lucide-react';

import { TableRowSkeleton } from '../../components/common/Skeletons';

/* Inventory management page provides stock level audits and instant replenishment tools */
export default function AdminInventoryPage() {
  const { allProducts, isLoadingProducts, updateProductStock, categories } = useShop();
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState(10);
  const [adjustmentType, setAdjustmentType] = useState('add');

  // Lock background scroll when modal is open
  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedProduct]);

  /* Calculate inventory health indicators */
  const metrics = useMemo(() => {
    const totalItems = allProducts.length;
    const totalUnits = allProducts.reduce((sum, p) => sum + (Number(p.stockCount ?? p.stock) || 0), 0);
    const lowStockCount = allProducts.filter((p) => {
      const s = Number(p.stockCount ?? p.stock ?? 0);
      return s > 0 && s <= 5;
    }).length;
    const outOfStockCount = allProducts.filter((p) => Number(p.stockCount ?? p.stock ?? 0) === 0).length;
    const totalValuation = allProducts.reduce(
      (sum, p) => sum + (Number(p.price) || 0) * (Number(p.stockCount ?? p.stock) || 0),
      0
    );

    return { totalItems, totalUnits, lowStockCount, outOfStockCount, totalValuation };
  }, [allProducts]);

  /* Filter items according to search and status criteria */
  const filteredProducts = useMemo(() => {
    return allProducts.filter((p) => {
      const matchSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(p.id).includes(searchQuery);

      const matchCategory = categoryFilter === 'all' || p.category === categoryFilter;

      const stock = Number(p.stockCount ?? p.stock ?? 0);
      let matchStock = true;
      if (stockFilter === 'out') {
        matchStock = stock === 0;
      } else if (stockFilter === 'low') {
        matchStock = stock > 0 && stock <= 5;
      } else if (stockFilter === 'normal') {
        matchStock = stock > 5;
      }

      return matchSearch && matchCategory && matchStock;
    });
  }, [allProducts, searchQuery, categoryFilter, stockFilter]);

  /* Apply stock adjustment to target product */
  const handleApplyAdjustment = (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const amount = Number(adjustmentAmount);
    if (isNaN(amount) || amount <= 0) return;

    const currentStock = Number(selectedProduct.stockCount ?? selectedProduct.stock ?? 0);
    const newStock =
      adjustmentType === 'add'
        ? currentStock + amount
        : Math.max(0, currentStock - amount);

    updateProductStock(selectedProduct.id, newStock);
    setSelectedProduct(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-rawaa-border shadow-soft">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-rawaa-sage/10 text-rawaa-sage flex items-center justify-center shrink-0">
              <Boxes className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-cairo text-rawaa-dark">إدارة المخزون والمستودع</h1>
              <p className="text-xs text-rawaa-dark/60 mt-0.5">
                تتبع كميات المنتجات ومستويات التوريد والتنبيه عند نفاد المخزون
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3.5 py-2 bg-rawaa-soft rounded-xl text-xs font-bold text-rawaa-dark flex items-center gap-2 whitespace-nowrap">
            <Package className="w-4 h-4 text-rawaa-primary shrink-0" />
            <span>{metrics.totalUnits.toLocaleString()} قطعة بالمستودع</span>
          </div>
        </div>
      </div>

      {/* Inventory KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-rawaa-border shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rawaa-dark/60">إجمالي الوحدات</span>
            <span className="w-8 h-8 rounded-lg bg-rawaa-soft text-rawaa-dark flex items-center justify-center shrink-0">
              <Boxes className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-cairo text-rawaa-dark">
            {metrics.totalUnits.toLocaleString()}
          </div>
          <div className="text-[11px] text-rawaa-dark/50 mt-1 whitespace-nowrap">
            موزعة على {metrics.totalItems} صنفاً
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-rawaa-border shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rawaa-dark/60">القيمة التقديرية</span>
            <span className="w-8 h-8 rounded-lg bg-rawaa-sage/10 text-rawaa-sage flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-cairo text-rawaa-sage whitespace-nowrap">
            {metrics.totalValuation.toLocaleString()} <span className="text-xs font-normal">ج.م</span>
          </div>
          <div className="text-[11px] text-rawaa-dark/50 mt-1 whitespace-nowrap">بسعر البيع الحالي</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-rawaa-border shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rawaa-dark/60">مخزون منخفض (5 فأقل)</span>
            <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-cairo text-amber-600">
            {metrics.lowStockCount}
          </div>
          <div className="text-[11px] text-rawaa-dark/50 mt-1 whitespace-nowrap">تحتاج طلب توريد عاجل</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-rawaa-border shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rawaa-dark/60">نفد من المخزون</span>
            <span className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <XCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-cairo text-rose-600">
            {metrics.outOfStockCount}
          </div>
          <div className="text-[11px] text-rawaa-dark/50 mt-1 whitespace-nowrap">منتجات غير متوفرة للشراء</div>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-white p-4 rounded-2xl border border-rawaa-border shadow-soft space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-rawaa-dark/40" />
            <input
              type="text"
              placeholder="البحث باسم المنتج أو رقم الكود..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-xs sm:text-sm focus:outline-none focus:border-rawaa-primary focus:bg-white transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <div className="flex items-center gap-1 bg-rawaa-soft/60 p-1 rounded-xl border border-rawaa-border text-xs shrink-0">
              <button
                type="button"
                onClick={() => setStockFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap ${
                  stockFilter === 'all'
                    ? 'bg-rawaa-dark text-white shadow-xs'
                    : 'text-rawaa-dark/70 hover:text-rawaa-dark'
                }`}
              >
                الكل ({allProducts.length})
              </button>
              <button
                type="button"
                onClick={() => setStockFilter('low')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap ${
                  stockFilter === 'low'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-rawaa-dark/70 hover:text-rawaa-dark'
                }`}
              >
                منخفض ({metrics.lowStockCount})
              </button>
              <button
                type="button"
                onClick={() => setStockFilter('out')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap ${
                  stockFilter === 'out'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-rawaa-dark/70 hover:text-rawaa-dark'
                }`}
              >
                نفد ({metrics.outOfStockCount})
              </button>
              <button
                type="button"
                onClick={() => setStockFilter('normal')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap ${
                  stockFilter === 'normal'
                    ? 'bg-rawaa-sage text-white shadow-xs'
                    : 'text-rawaa-dark/70 hover:text-rawaa-dark'
                }`}
              >
                مستقر
              </button>
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-xs font-bold text-rawaa-dark focus:outline-none focus:border-rawaa-primary whitespace-nowrap cursor-pointer shrink-0"
            >
              <option value="all">كل الأقسام</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-rawaa-dark/60 pt-1 border-t border-rawaa-border/50">
          <span className="whitespace-nowrap">يتم عرض {filteredProducts.length} منتج</span>
          {(searchQuery || stockFilter !== 'all' || categoryFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStockFilter('all');
                setCategoryFilter('all');
              }}
              className="text-rawaa-primary font-bold hover:underline whitespace-nowrap cursor-pointer"
            >
              إعادة ضبط الفلاتر
            </button>
          )}
        </div>
      </div>

      {/* Inventory Table & Mobile Card View */}
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
                          {categories.find((c) => c.id === product.category)?.name || product.category}
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
                            onClick={() => updateProductStock(product.id, Math.max(0, stock - 1))}
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
                            onClick={() => updateProductStock(product.id, stock + 1)}
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
                          onClick={() => setSelectedProduct(product)}
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
              const totalVal = stock * price;

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
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                          stock === 0
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : stock <= 5
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {stock === 0 ? 'نفد' : stock <= 5 ? `حرج (${stock})` : `${stock} متوفر`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-rawaa-dark/50">
                        <span>{categories.find((c) => c.id === product.category)?.name || product.category}</span>
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
                        onClick={() => updateProductStock(product.id, Math.max(0, stock - 1))}
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
                        onClick={() => updateProductStock(product.id, stock + 1)}
                        title="إضافة قطعة واحدة"
                        className="w-7 h-7 rounded-lg bg-rawaa-soft hover:bg-emerald-100 hover:text-emerald-700 text-rawaa-dark flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProduct(product);
                        setAdjustmentAmount(10);
                        setAdjustmentType('add');
                      }}
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

      {/* Stock Adjustment Modal rendered via createPortal */}
      {selectedProduct && createPortal(
        <div
          className="fixed inset-0 z-[99999] overflow-y-auto overscroll-contain bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-rawaa-border overflow-hidden my-auto sm:my-8 max-h-[92vh] overflow-y-auto custom-modal-scroll animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 bg-rawaa-soft/60 border-b border-rawaa-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Boxes className="w-5 h-5 text-rawaa-primary" />
                <h3 className="font-bold font-cairo text-rawaa-dark">تسوية مخزون المنتج</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="w-8 h-8 rounded-full hover:bg-white text-rawaa-dark/60 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplyAdjustment} className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-rawaa-soft/40 rounded-xl border border-rawaa-border">
                <div className="w-12 h-12 rounded-lg border border-rawaa-border overflow-hidden shrink-0 bg-white">
                  <img
                    src={selectedProduct.mainImage || selectedProduct.image || '/logo.png'}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/logo.png';
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-rawaa-dark line-clamp-1">
                    {selectedProduct.name}
                  </div>
                  <div className="text-xs text-rawaa-dark/60 mt-0.5 whitespace-nowrap">
                    الرصيد الحالي بالمستودع{' '}
                    <span className="font-bold text-rawaa-primary font-mono">
                      {selectedProduct.stockCount ?? selectedProduct.stock ?? 0} قطعة
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-rawaa-dark mb-1.5">نوع العملية</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustmentType('add')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      adjustmentType === 'add'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white border-rawaa-border text-rawaa-dark hover:bg-rawaa-soft'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5 shrink-0" />
                    <span>توريد وارد (+)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustmentType('subtract')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      adjustmentType === 'subtract'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-white border-rawaa-border text-rawaa-dark hover:bg-rawaa-soft'
                    }`}
                  >
                    <Minus className="w-3.5 h-3.5 shrink-0" />
                    <span>صرف / تلفيات (-)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-rawaa-dark mb-1">الكمية المراد تسويتها</label>
                <input
                  type="number"
                  min="1"
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-sm font-bold text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
                  required
                />
              </div>

              <div className="p-3 bg-rawaa-soft/60 rounded-xl text-xs text-rawaa-dark/70 flex items-center justify-between">
                <span className="whitespace-nowrap">الرصيد الجديد المتوقع</span>
                <span className="font-bold text-sm text-rawaa-dark font-mono whitespace-nowrap">
                  {adjustmentType === 'add'
                    ? Number(selectedProduct.stockCount ?? selectedProduct.stock ?? 0) + Number(adjustmentAmount || 0)
                    : Math.max(0, Number(selectedProduct.stockCount ?? selectedProduct.stock ?? 0) - Number(adjustmentAmount || 0))}{' '}
                  قطعة
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 border border-rawaa-border text-rawaa-dark text-xs font-bold rounded-xl hover:bg-rawaa-soft transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rawaa-primary text-white text-xs font-bold rounded-xl hover:bg-rawaa-primary/90 transition-colors shadow-xs cursor-pointer"
                >
                  تأكيد تحديث الرصيد
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
