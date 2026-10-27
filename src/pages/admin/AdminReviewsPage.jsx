import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  Star,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Trash2,
  Eye,
  MessageSquare,
  ThumbsUp,
  AlertCircle
} from 'lucide-react';
import ConfirmModal from '../../components/common/ConfirmModal';

/* Reviews and customer ratings moderation page */
export default function AdminReviewsPage() {
  const { reviews, isLoadingReviews, toggleReviewApproval, deleteReview } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [reviewToDelete, setReviewToDelete] = useState(null);

  /* Calculate rating statistics */
  const stats = useMemo(() => {
    const total = reviews.length;
    const approvedCount = reviews.filter((r) => r.isApproved).length;
    const averageRating =
      total > 0
        ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / total).toFixed(1)
        : '5.0';

    return { total, approvedCount, averageRating };
  }, [reviews]);

  /* Filter reviews by search status and rating */
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchSearch =
        !searchQuery.trim() ||
        r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.comment.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'approved' && r.isApproved) ||
        (statusFilter === 'pending' && !r.isApproved);

      const matchRating = ratingFilter === 'all' || r.rating === Number(ratingFilter);

      return matchSearch && matchStatus && matchRating;
    });
  }, [reviews, searchQuery, statusFilter, ratingFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-rawaa-border shadow-soft">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-500" />
            </span>
            <div>
              <h1 className="text-2xl font-bold font-cairo text-rawaa-dark">إدارة تقييمات وآراء العملاء</h1>
              <p className="text-xs text-rawaa-dark/60 mt-0.5">
                مراجعة واعتماد تجارب الأمهات والآباء الحقيقية مع منتجات بيبي زون
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-rawaa-soft rounded-xl text-xs font-bold text-rawaa-dark flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>متوسط التقييم العام {stats.averageRating} من 5</span>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-rawaa-border shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-rawaa-dark/60">إجمالي التقييمات</span>
            <div className="text-2xl font-black font-cairo text-rawaa-dark mt-1">{stats.total}</div>
          </div>
          <span className="w-10 h-10 rounded-xl bg-rawaa-soft text-rawaa-dark flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rawaa-border shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-rawaa-dark/60">التقييمات المعتمدة المعروضة</span>
            <div className="text-2xl font-black font-cairo text-rawaa-sage mt-1">
              {stats.approvedCount}
            </div>
          </div>
          <span className="w-10 h-10 rounded-xl bg-rawaa-sage/10 text-rawaa-sage flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rawaa-border shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-rawaa-dark/60">بانتظار المراجعة</span>
            <div className="text-2xl font-black font-cairo text-amber-600 mt-1">
              {stats.total - stats.approvedCount}
            </div>
          </div>
          <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </span>
        </div>
      </div>

      {/* Filters and search */}
      <div className="bg-white p-4 rounded-2xl border border-rawaa-border shadow-soft space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-rawaa-dark/40" />
            <input
              type="text"
              placeholder="البحث باسم العميل أو المنتج أو نص الرأي..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-sm focus:outline-none focus:border-rawaa-primary focus:bg-white transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <div className="flex items-center gap-1 bg-rawaa-soft/60 p-1 rounded-xl border border-rawaa-border text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-rawaa-dark text-white'
                    : 'text-rawaa-dark/70 hover:text-rawaa-dark'
                }`}
              >
                الكل
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('approved')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  statusFilter === 'approved'
                    ? 'bg-rawaa-sage text-white'
                    : 'text-rawaa-dark/70 hover:text-rawaa-dark'
                }`}
              >
                معتمد
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  statusFilter === 'pending'
                    ? 'bg-amber-600 text-white'
                    : 'text-rawaa-dark/70 hover:text-rawaa-dark'
                }`}
              >
                قيد المراجعة
              </button>
            </div>

            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-3 py-2 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-xs font-bold text-rawaa-dark focus:outline-none focus:border-rawaa-primary cursor-pointer"
            >
              <option value="all">جميع التقييمات</option>
              <option value="5">5 نجوم (ممتاز)</option>
              <option value="4">4 نجوم (جيد جداً)</option>
              <option value="3">3 نجوم (جيد)</option>
              <option value="2">نجمتان (مقبول)</option>
              <option value="1">نجمة واحدة (ضعيف)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {isLoadingReviews ? (
          [...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-rawaa-border shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2.5 flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-24 h-4 rounded skeleton-shimmer" />
                  <div className="w-20 h-4 rounded skeleton-shimmer" />
                  <div className="w-32 h-4 rounded skeleton-shimmer" />
                </div>
                <div className="w-full max-w-xl h-4 rounded skeleton-shimmer" />
                <div className="w-2/3 h-3.5 rounded skeleton-shimmer" />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-24 h-8 rounded-xl skeleton-shimmer" />
                <div className="w-8 h-8 rounded-xl skeleton-shimmer" />
              </div>
            </div>
          ))
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-rawaa-border text-center text-rawaa-dark/50">
            <Star className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="font-bold">لا توجد تقييمات مطابقة</p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-rawaa-border shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center text-amber-500">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-4 h-4 ${
                          idx < (review.rating || 5)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-rawaa-dark">{review.customerName}</span>
                  <span className="text-xs text-rawaa-dark/40">•</span>
                  <span className="text-xs text-rawaa-dark/60 font-mono">{review.date}</span>
                  <span className="text-xs text-rawaa-dark/40">•</span>
                  <span className="text-xs font-medium text-rawaa-primary">
                    عن منتج: {review.productName}
                  </span>
                </div>

                <p className="text-sm text-rawaa-dark/80 leading-relaxed pr-1">{review.comment}</p>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => toggleReviewApproval(review.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
                    review.isApproved
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                      : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  {review.isApproved ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>معتمد بالمتجر</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>اعتماد ونشر</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setReviewToDelete(review)}
                  className="p-2 rounded-xl text-rawaa-dark/40 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                  title="حذف التقييم"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirmation modal for review deletion */}
      <ConfirmModal
        isOpen={Boolean(reviewToDelete)}
        title="تأكيد حذف التقييم"
        message={`هل أنت متأكد من رغبتك في حذف تقييم العميل «${reviewToDelete?.customerName || ''}» عن منتج «${reviewToDelete?.productName || ''}»؟`}
        confirmText="تأكيد الحذف"
        cancelText="إلغاء"
        isDestructive={true}
        onConfirm={() => {
          if (reviewToDelete) {
            deleteReview(reviewToDelete.id);
            setReviewToDelete(null);
          }
        }}
        onCancel={() => setReviewToDelete(null)}
      />
    </div>
  );
}
