export const formatOrderDateTime = (dateVal) => {
  if (!dateVal) return 'غير محدد';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'short' });
  } catch {
    return String(dateVal);
  }
};

export const formatShortDateTime = (dateVal) => {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleDateString('ar-EG', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return String(dateVal);
  }
};

export const getStatusBadge = (status) => {
  switch (status) {
    case 'تم التسليم':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'مع المندوب':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'قيد التجهيز الطبي':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'تم تأكيد الطلب':
      return 'bg-teal-50 text-teal-700 border-teal-200';
    case 'بانتظار التأكيد':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'ملغي':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

