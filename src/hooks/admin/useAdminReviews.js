import { useState, useCallback } from 'react';
import { reviewsApi } from '../../services/api';
import { syncBus } from '../../utils/syncBus';

export function useAdminReviews({ addToast, addActivity }) {
  const [reviews, setReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  const toggleReviewApproval = useCallback(async (reviewId) => {
    let nextState = false;
    let custName = '';
    setReviews((prev) =>
      prev.map((rev) => {
        if (rev.id === reviewId) {
          nextState = !rev.isApproved;
          custName = rev.customerName;
          return { ...rev, isApproved: nextState };
        }
        return rev;
      })
    );
    if (addActivity) {
      addActivity('تحديث مراجعة عميلة', `تم ${nextState ? 'اعتماد' : 'إخفاء'} تقييم ${custName}`, 'review');
    }
    syncBus.emit('REVIEW_UPDATED', { reviewId, isApproved: nextState, timestamp: Date.now() });
    try {
      await reviewsApi.toggleApproval(reviewId, nextState);
    } catch (e) {
      console.warn('Reviews toggle approval API error:', e.message);
    }
  }, [addActivity]);

  const deleteReview = useCallback(async (reviewId) => {
    setReviews((prev) => prev.filter((rev) => rev.id !== reviewId));
    if (addActivity) {
      addActivity('حذف تقييم', `تم حذف تقييم ${reviewId}`, 'review');
    }
    if (addToast) {
      addToast('تم حذف التقييم', 'info');
    }
    syncBus.emit('REVIEW_DELETED', { reviewId, timestamp: Date.now() });
    try {
      await reviewsApi.delete(reviewId);
    } catch (e) {
      console.warn('Reviews delete API error:', e.message);
    }
  }, [addToast, addActivity]);

  return {
    reviews,
    setReviews,
    isLoadingReviews,
    setIsLoadingReviews,
    toggleReviewApproval,
    deleteReview
  };
}

