import { createPortal } from 'react-dom';
import { Boxes, X, Plus, Minus } from 'lucide-react';

export default function StockAdjustmentModal({
  product,
  onClose,
  adjustmentType,
  setAdjustmentType,
  adjustmentAmount,
  setAdjustmentAmount,
  onSubmit
}) {
  if (!product) return null;

  const currentStock = Number(product.stockCount ?? product.stock ?? 0);
  const projectedStock =
    adjustmentType === 'add'
      ? currentStock + Number(adjustmentAmount || 0)
      : Math.max(0, currentStock - Number(adjustmentAmount || 0));

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] overflow-hidden bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-rawaa-border max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 bg-rawaa-soft/60 border-b border-rawaa-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Boxes className="w-5 h-5 text-rawaa-primary" />
            <h3 className="font-bold font-cairo text-rawaa-dark">تسوية مخزون المنتج</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white text-rawaa-dark/60 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="p-4 sm:p-6 space-y-4 flex-1 min-h-0 overflow-y-auto custom-modal-scroll">
            <div className="flex items-center gap-3 p-3 bg-rawaa-soft/40 rounded-xl border border-rawaa-border">
              <div className="w-12 h-12 rounded-lg border border-rawaa-border overflow-hidden shrink-0 bg-white">
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
                <div className="font-bold text-sm text-rawaa-dark line-clamp-1">
                  {product.name}
                </div>
                <div className="text-xs text-rawaa-dark/60 mt-0.5 whitespace-nowrap">
                  الرصيد الحالي بالمستودع{' '}
                  <span className="font-bold text-rawaa-primary font-mono">
                    {currentStock} قطعة
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
                {projectedStock} قطعة
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 p-4 sm:px-6 py-3 border-t border-rawaa-border shrink-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-rawaa-border text-rawaa-dark text-xs font-bold rounded-xl hover:bg-rawaa-soft transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rawaa-primary text-white text-xs font-bold rounded-xl hover:bg-rawaa-primary/90 active:scale-[0.99] transition-all shadow-xs cursor-pointer"
            >
              تأكيد تحديث الرصيد
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

