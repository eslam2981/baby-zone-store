export default function OrderStatusPills({
  orders = [],
  statusFilter,
  onSelectStatus
}) {
  const getCount = (status) => {
    if (status === 'all') return orders.length;
    return orders.filter((o) => o.deliveryStatus === status).length;
  };

  const pillItems = [
    { id: 'all', label: 'الكل', activeClass: 'bg-rawaa-dark text-white', inactiveClass: 'bg-white text-rawaa-muted hover:bg-rawaa-soft border border-rawaa-border' },
    { id: 'بانتظار التأكيد', label: 'بانتظار التأكيد', activeClass: 'bg-amber-500 text-white', inactiveClass: 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200' },
    { id: 'تم تأكيد الطلب', label: 'تم التأكيد', activeClass: 'bg-teal-600 text-white', inactiveClass: 'bg-white text-teal-700 hover:bg-teal-50 border border-teal-200' },
    { id: 'مع المندوب', label: 'مع المندوب', activeClass: 'bg-blue-600 text-white', inactiveClass: 'bg-white text-blue-700 hover:bg-blue-50 border border-blue-200' },
    { id: 'تم التسليم', label: 'تم التسليم', activeClass: 'bg-emerald-600 text-white', inactiveClass: 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200' },
    { id: 'ملغي', label: 'ملغي', activeClass: 'bg-red-600 text-white', inactiveClass: 'bg-white text-red-700 hover:bg-red-50 border border-red-200' }
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
      {pillItems.map((item) => {
        const isActive = statusFilter === item.id;
        const count = getCount(item.id);

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectStatus(item.id)}
            className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
              isActive ? item.activeClass : item.inactiveClass
            }`}
          >
            {item.label} ({count})
          </button>
        );
      })}
    </div>
  );
}

