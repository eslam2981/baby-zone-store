// Responsive vector charts displaying sales trends and category distributions using real Supabase data
import { useState, useMemo } from 'react';
import { useShop } from '../../context/ShopContext';
import { useAdmin } from '../../context/AdminContext';
import { Info } from 'lucide-react';

export function RevenueTrendChart() {
  const { orders } = useAdmin();
  const [period, setPeriod] = useState('week');

  const totalRev = useMemo(() => {
    return (orders || []).reduce(
      (sum, o) => sum + (o.deliveryStatus !== 'ملغي' ? (Number(o.total) || 0) : 0),
      0
    );
  }, [orders]);

  // Compute daily / weekly points dynamically based strictly on real orders
  const data = useMemo(() => {
    if (period === 'week') {
      const days = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

      // If no orders or zero revenue, flat zero for all 7 days
      if (!orders || orders.length === 0 || totalRev === 0) {
        return days.map((day) => ({
          label: day,
          value: 0
        }));
      }

      // Map real orders to Egyptian week days (starts Saturday)
      // JS getDay(): 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
      const dayIndexMap = { 6: 0, 0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6 };
      const dayTotals = [0, 0, 0, 0, 0, 0, 0];

      (orders || []).forEach((o) => {
        if (o.deliveryStatus === 'ملغي') return;
        const d = new Date(o.date || o.created_at);
        if (!isNaN(d.getTime())) {
          const jsDay = d.getDay();
          const mappedIdx = dayIndexMap[jsDay] ?? 0;
          dayTotals[mappedIdx] += Number(o.total) || 0;
        }
      });

      return days.map((day, idx) => ({
        label: day,
        value: Math.round(dayTotals[idx])
      }));
    } else {
      const weeks = ['الأسبوع 1', 'الأسبوع 2', 'الأسبوع 3', 'الأسبوع 4'];

      // If no orders or zero revenue, flat zero for all 4 weeks
      if (!orders || orders.length === 0 || totalRev === 0) {
        return weeks.map((w) => ({
          label: w,
          value: 0
        }));
      }

      const weekTotals = [0, 0, 0, 0];
      (orders || []).forEach((o) => {
        if (o.deliveryStatus === 'ملغي') return;
        const d = new Date(o.date || o.created_at);
        if (!isNaN(d.getTime())) {
          const dom = d.getDate();
          const weekIdx = Math.min(Math.floor((dom - 1) / 7), 3);
          weekTotals[weekIdx] += Number(o.total) || 0;
        }
      });

      return weeks.map((w, idx) => ({
        label: w,
        value: Math.round(weekTotals[idx])
      }));
    }
  }, [period, orders, totalRev]);

  const safeData = Array.isArray(data) && data.length > 0 ? data : [{ label: '', value: 0 }];
  const maxDataVal = Math.max(...safeData.map((d) => d.value), 0);
  const maxValue = maxDataVal > 0 ? maxDataVal * 1.15 : 1000;

  // Compute SVG polyline points
  const width = 600;
  const height = 180;
  const paddingX = 40;
  const paddingY = 20;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const points = safeData.map((d, index) => {
    const x = paddingX + (safeData.length > 1 ? (index / (safeData.length - 1)) * chartWidth : chartWidth / 2);
    const y = height - paddingY - (d.value / maxValue) * chartHeight;
    return { x, y, value: d.value, label: d.label };
  });

  const svgPath = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  const areaPath = `${svgPath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="bg-white rounded-2xl p-5 border border-rawaa-border shadow-soft-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-xs font-bold text-rawaa-subtle uppercase">إحصائيات الإيرادات المباشرة</span>
          <div className="flex items-center gap-2 mt-0.5">
            <h3 className="font-heading text-lg font-bold text-rawaa-dark">حجم المبيعات والأرباح الحقيقية</h3>
            <span className="text-xs font-black text-rawaa-primary bg-rawaa-primary-light px-2.5 py-0.5 rounded-full font-mono">
              {totalRev.toLocaleString('ar-EG')} ج.م
            </span>
          </div>
        </div>

        {/* Period toggle buttons */}
        <div className="flex bg-rawaa-soft p-1 rounded-full text-xs font-bold self-start">
          <button
            type="button"
            onClick={() => setPeriod('week')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              period === 'week' ? 'bg-white text-rawaa-primary shadow-soft-xs' : 'text-rawaa-muted hover:text-rawaa-dark'
            }`}
          >
            آخر 7 أيام
          </button>
          <button
            type="button"
            onClick={() => setPeriod('month')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              period === 'month' ? 'bg-white text-rawaa-primary shadow-soft-xs' : 'text-rawaa-muted hover:text-rawaa-dark'
            }`}
          >
            هذا الشهر
          </button>
        </div>
      </div>

      {/* Zero sales indicator notice */}
      {totalRev === 0 && (
        <div className="flex items-center gap-2 bg-rawaa-soft/60 border border-rawaa-border/70 px-3.5 py-2 rounded-xl text-xs text-rawaa-muted mb-4">
          <Info size={14} className="text-rawaa-primary shrink-0" />
          <span>المخطط متصفر حالياً (0 ج.م) لعدم وجود أي عمليات بيع مؤكدة حتى الآن</span>
        </div>
      )}

      {/* Responsive SVG Area Chart */}
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C25E3E" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#C25E3E" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {[0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = height - paddingY - ratio * chartHeight;
            return (
              <line
                key={idx}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#E8E2D8"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          {/* Baseline (0 value) */}
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="#E8E2D8"
            strokeWidth="1.5"
          />

          {/* Area fill */}
          {totalRev > 0 && <path d={areaPath} fill="url(#revenueGradient)" />}

          {/* Smooth trend line */}
          <path d={svgPath} fill="none" stroke="#C25E3E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data point dots and labels */}
          {points.map((p, idx) => (
            <g key={idx} className="group cursor-pointer">
              <circle
                cx={p.x}
                cy={p.y}
                r="4.5"
                fill="#FFFFFF"
                stroke="#C25E3E"
                strokeWidth="2.5"
                className="transition-transform group-hover:scale-150"
              />
              {/* Tooltip value */}
              <text
                x={p.x}
                y={p.y - 10}
                textAnchor="middle"
                fontSize="10"
                fontWeight="bold"
                fill="#19211D"
                className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              >
                {p.value.toLocaleString('ar-EG')} ج.م
              </text>
              {/* X Axis Label */}
              <text
                x={p.x}
                y={height - 2}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fill="#84918B"
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

// Color palette for dynamic categories
const CATEGORY_PALETTE = ['#C25E3E', '#2D5A46', '#D97706', '#3B82F6', '#8B5CF6'];

export function CategoryDistributionChart() {
  const { categories, allProducts } = useShop();

  const dynamicData = useMemo(() => {
    if (!categories || categories.length === 0) {
      return [];
    }

    const counts = categories.map((cat, idx) => {
      const prodCount = (allProducts || []).filter((p) => p.category === cat.id).length;
      return {
        id: cat.id,
        name: cat.name,
        count: prodCount,
        color: CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length]
      };
    });

    const totalCount = counts.reduce((sum, c) => sum + c.count, 0) || 1;

    return counts.map((c) => ({
      ...c,
      percent: Math.round((c.count / totalCount) * 100),
      countText: `${c.count} منتجات`
    }));
  }, [categories, allProducts]);

  const totalProducts = allProducts?.length || 0;

  return (
    <div className="bg-white rounded-2xl p-5 border border-rawaa-border shadow-soft-xs overflow-hidden h-full flex flex-col justify-between">
      <div>
        <div className="mb-4">
          <span className="text-xs font-bold text-rawaa-subtle uppercase">توزيع الكتالوج الحقيقي</span>
          <h3 className="font-heading text-lg font-bold text-rawaa-dark">النسبة حسب الأقسام</h3>
        </div>

        <div className="flex flex-col items-center">
          {/* SVG Donut Chart */}
          <div className="relative w-36 h-36 shrink-0 flex items-center justify-center my-2">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 transform">
              {/* Base ring */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#F4EFE6"
                strokeWidth="14"
              />
              {dynamicData.reduce(
                (acc, item) => {
                  const strokeDasharray = `${item.percent * 2.512} ${251.2 - item.percent * 2.512}`;
                  const circle = (
                    <circle
                      key={item.id || item.name}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke={item.color}
                      strokeWidth="14"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={-acc.offset}
                      className="transition-all duration-500"
                    />
                  );
                  return {
                    elements: [...acc.elements, circle],
                    offset: acc.offset + item.percent * 2.512
                  };
                },
                { elements: [], offset: 0 }
              ).elements}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-bold text-rawaa-muted">إجمالي</span>
              <span className="text-sm font-black text-rawaa-dark">{totalProducts} منتج</span>
            </div>
          </div>

          {/* Legend list - completely contained within full card width */}
          <div className="w-full space-y-2.5 pt-4 mt-2 border-t border-rawaa-border/60">
            {dynamicData.map((cat, idx) => (
              <div
                key={idx}
                className="space-y-1.5 py-1.5 border-b border-rawaa-border/25 last:border-b-0"
              >
                <div className="flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span
                      className="font-bold text-rawaa-dark truncate text-xs"
                      title={cat.name}
                    >
                      {cat.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-rawaa-muted bg-rawaa-soft px-2 py-0.5 rounded-md font-medium whitespace-nowrap">
                      {cat.countText || `${cat.count} منتجات`}
                    </span>
                    <span className="font-black text-rawaa-dark font-mono text-xs">
                      %{cat.percent}
                    </span>
                  </div>
                </div>
                {/* Visual proportion progress bar */}
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${cat.percent}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


