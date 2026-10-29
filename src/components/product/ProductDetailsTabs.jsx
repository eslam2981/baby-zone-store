import { Check, MessageSquare, User, Star, Send, Lock, Sparkles, Truck, ShieldCheck } from 'lucide-react';
import { ReviewSkeleton } from '../common/Skeletons';
import ModernSelect from '../common/ModernSelect';
import { useShop } from '../../context/ShopContext';

export function ProductDetailsTabs({
  product,
  activeTab,
  setActiveTab,
  productReviews,
  isLoadingReviews,
  newReview,
  setNewReview,
  handleReviewSubmit,
  isSubmittingReview
}) {
  const { user, hasPermission } = useShop();
  const canRateProducts = !user || hasPermission('rate_products');

  return (
    <div className="border-t border-rawaa-border pt-6 mt-auto">
      {/* Horizontal scrollable tab rail on mobile, spacious tab bar on desktop */}
      <div className="flex items-center gap-2 sm:gap-4 border-b border-rawaa-border/60 pb-1 mb-4 text-xs font-bold overflow-x-auto scrollbar-none -mx-1 px-1 sm:mx-0 sm:px-0">
        <button
          type="button"
          onClick={() => setActiveTab('features')}
          className={`pb-2.5 pt-1 px-1.5 sm:px-2 transition-all relative cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 select-none ${
            activeTab === 'features'
              ? 'text-rawaa-primary font-black'
              : 'text-rawaa-muted hover:text-rawaa-dark'
          }`}
        >
          <Sparkles size={13} className={activeTab === 'features' ? 'text-rawaa-primary' : 'text-rawaa-muted'} />
          <span>المميزات والمواصفات</span>
          {activeTab === 'features' && (
            <span className="absolute bottom-0 right-0 left-0 h-0.5 bg-rawaa-primary rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('shipping')}
          className={`pb-2.5 pt-1 px-1.5 sm:px-2 transition-all relative cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 select-none ${
            activeTab === 'shipping'
              ? 'text-rawaa-primary font-black'
              : 'text-rawaa-muted hover:text-rawaa-dark'
          }`}
        >
          <Truck size={14} className={activeTab === 'shipping' ? 'text-rawaa-primary' : 'text-rawaa-muted'} />
          <span>الشحن وسياسة الإرجاع</span>
          {activeTab === 'shipping' && (
            <span className="absolute bottom-0 right-0 left-0 h-0.5 bg-rawaa-primary rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('safety')}
          className={`pb-2.5 pt-1 px-1.5 sm:px-2 transition-all relative cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 select-none ${
            activeTab === 'safety'
              ? 'text-rawaa-primary font-black'
              : 'text-rawaa-muted hover:text-rawaa-dark'
          }`}
        >
          <ShieldCheck size={14} className={activeTab === 'safety' ? 'text-rawaa-primary' : 'text-rawaa-muted'} />
          <span>معايير الأمان والشهادات</span>
          {activeTab === 'safety' && (
            <span className="absolute bottom-0 right-0 left-0 h-0.5 bg-rawaa-primary rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`pb-2.5 pt-1 px-1.5 sm:px-2 transition-all relative flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 select-none ${
            activeTab === 'reviews'
              ? 'text-rawaa-primary font-black'
              : 'text-rawaa-muted hover:text-rawaa-dark'
          }`}
        >
          <MessageSquare size={13} className={activeTab === 'reviews' ? 'text-rawaa-primary' : 'text-rawaa-muted'} />
          <span>التقييمات ({productReviews?.length || 0})</span>
          {activeTab === 'reviews' && (
            <span className="absolute bottom-0 right-0 left-0 h-0.5 bg-rawaa-primary rounded-full" />
          )}
        </button>
      </div>

      {activeTab === 'features' && (
        <ul className="space-y-2 text-xs text-rawaa-muted leading-relaxed">
          {product.features?.map((f, i) => (
            <li key={i} className="flex items-center gap-2">
              <Check size={15} className="text-rawaa-sage shrink-0" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      )}

      {activeTab === 'shipping' && (
        <div className="text-xs text-rawaa-muted space-y-2 leading-relaxed">
          <p>• التوصيل الفوري متاح لكافة المدن الكبرى خلال 24-48 ساعة عبر أسطول سيارات مجهز ومبرد.</p>
          <p>• استرجاع واستبدال مجاني بدون أي رسوم خلال 14 يوماً من استلام الشحنة.</p>
          <p>• التغليف الفاخر وبطاقة الإهداء متوفرة مجاناً لجميع منتجات المواليد.</p>
        </div>
      )}

      {activeTab === 'safety' && (
        <div className="text-xs text-rawaa-muted space-y-2 leading-relaxed">
          <p>• حاصل على شهادة الفحص الطبي وخالٍ تماماً من مادة BPA والفثالات والسموم.</p>
          <p>• مطابق للمعايير الأوروبية المعتمدة (EN 1888 للأمان وحماية الطفل).</p>
          <p>• أقمشة قطنية نقية 100% حاصلة على ترخيص معيار المنسوجات العضوية GOTS.</p>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {/* Reviews list */}
          {isLoadingReviews ? (
            <div className="space-y-2.5">
              <ReviewSkeleton />
              <ReviewSkeleton />
              <ReviewSkeleton />
            </div>
          ) : productReviews.length === 0 ? (
            <div className="py-3 text-center text-xs text-rawaa-muted bg-[#FAF8F5] rounded-lg">
              لا توجد تقييمات مسجلة بعد لهذا المنتج. كوني أول من يقيم!
            </div>
          ) : (
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {productReviews.map((rev) => (
                <div key={rev.id} className="bg-[#FAF8F5] p-3 rounded-lg border border-rawaa-border/60 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-rawaa-dark flex items-center gap-1.5">
                      <User size={12} className="text-rawaa-muted" />
                      {rev.customer_name || rev.customerName}
                    </span>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={11}
                          className={i < (rev.rating || 5) ? 'fill-amber-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-rawaa-muted leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}

          {/* Add review form or permission lock notice */}
          {!canRateProducts ? (
            <div className="pt-3 border-t border-rawaa-border/60">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-center gap-2">
                <Lock size={15} className="text-amber-600 shrink-0" />
                <span>صلاحية كتابة التقييمات والمراجعات معطلة لحسابك من قِبل إدارة المتجر.</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="pt-3 border-t border-rawaa-border/60 space-y-2.5">
              <span className="text-xs font-bold text-rawaa-dark block">أضيفي تقييمك للمنتج:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="الاسم الكريم *"
                  value={newReview.name}
                  onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                  className="text-xs p-2 rounded-lg border border-rawaa-border bg-white focus:outline-none focus:ring-1 focus:ring-rawaa-primary"
                  required
                />
                <ModernSelect
                  value={newReview.rating}
                  onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                  options={[
                    { value: 5, label: '⭐⭐⭐⭐⭐ ممتاز (5 نجوم)' },
                    { value: 4, label: '⭐⭐⭐⭐ جيد جداً (4 نجوم)' },
                    { value: 3, label: '⭐⭐⭐ متوسط (3 نجوم)' },
                    { value: 2, label: '⭐⭐ مقبول (نجمتان)' },
                    { value: 1, label: '⭐ سيء (نجمة واحدة)' }
                  ]}
                  buttonClassName="py-2"
                />
              </div>
              <textarea
                placeholder="اكتبي تجربتك مع المنتج لمساعدة الأمهات الأخريات... *"
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                rows={2}
                className="w-full text-xs p-2 rounded-lg border border-rawaa-border bg-white focus:outline-none focus:ring-1 focus:ring-rawaa-primary resize-none"
                required
              />
              <button
                type="submit"
                disabled={isSubmittingReview}
                className="w-full py-2 bg-rawaa-primary hover:bg-rawaa-primary-hover text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Send size={13} />
                <span>{isSubmittingReview ? 'جارٍ الإرسال...' : 'إرسال التقييم'}</span>
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

