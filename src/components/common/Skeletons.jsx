import React from 'react';

// Reusable skeleton loaders for all API-driven views

export function ProductCardSkeleton({ viewMode = 'grid' }) {
  if (viewMode === 'list') {
    return (
      <div className="bg-white border border-rawaa-border rounded-panel p-4 flex flex-col sm:flex-row gap-4 shadow-soft-xs">
        <div className="w-full sm:w-60 aspect-square rounded-2xl skeleton-shimmer shrink-0" />
        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="w-20 h-4 rounded skeleton-shimmer" />
              <div className="w-16 h-5 rounded-full skeleton-shimmer" />
            </div>
            <div className="w-3/4 h-5 rounded skeleton-shimmer mb-2" />
            <div className="w-1/2 h-4 rounded skeleton-shimmer mb-3" />
            <div className="w-28 h-4 rounded skeleton-shimmer mb-4" />
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-rawaa-border/50">
            <div className="w-24 h-6 rounded skeleton-shimmer" />
            <div className="w-28 h-9 rounded-full skeleton-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-rawaa-border rounded-panel overflow-hidden shadow-soft-xs flex flex-col">
      {/* Product Image placeholder */}
      <div className="w-full aspect-[16/10] sm:aspect-[16/10.5] skeleton-shimmer relative">
        <div className="absolute top-2.5 right-2.5 w-12 h-5 rounded-full bg-white/40" />
        <div className="absolute top-2.5 left-2.5 w-8 h-8 rounded-full bg-white/40" />
      </div>

      {/* Body details */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Brand & age tag */}
          <div className="flex items-center justify-between mb-2">
            <div className="w-16 h-3.5 rounded skeleton-shimmer" />
            <div className="w-14 h-4 rounded-full skeleton-shimmer" />
          </div>

          {/* Title lines */}
          <div className="w-full h-4 rounded skeleton-shimmer mb-1.5" />
          <div className="w-2/3 h-4 rounded skeleton-shimmer mb-3" />

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-12 h-4 rounded skeleton-shimmer" />
            <div className="w-16 h-3.5 rounded skeleton-shimmer" />
          </div>
        </div>

        {/* Price & CTA button */}
        <div className="pt-3 border-t border-rawaa-border/60 flex items-center justify-between gap-2">
          <div>
            <div className="w-10 h-3 rounded skeleton-shimmer mb-1" />
            <div className="w-20 h-5 rounded skeleton-shimmer" />
          </div>
          <div className="w-24 h-9 rounded-full skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="rounded-2xl p-4 border border-rawaa-border bg-white shadow-soft-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="w-24 h-6 rounded-lg skeleton-shimmer" />
          <div className="w-20 h-5 rounded-full skeleton-shimmer" />
        </div>

        <div className="w-32 h-4 rounded skeleton-shimmer mb-3" />

        {/* Items preview thumbnails */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-lg skeleton-shimmer shrink-0" />
          <div className="w-10 h-10 rounded-lg skeleton-shimmer shrink-0" />
          <div className="w-10 h-10 rounded-lg skeleton-shimmer shrink-0" />
        </div>
      </div>

      <div className="pt-3 border-t border-rawaa-border/60 flex items-center justify-between gap-2">
        <div>
          <div className="w-12 h-3 rounded skeleton-shimmer mb-1" />
          <div className="w-20 h-5 rounded skeleton-shimmer" />
        </div>
        <div className="w-24 h-8 rounded-xl skeleton-shimmer" />
      </div>
    </div>
  );
}

export function TrackingResultSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-soft-lg border border-rawaa-border overflow-hidden mb-12 animate-fadeIn">
      {/* Header banner skeleton */}
      <div className="p-6 bg-[#26352E] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-24 h-5 rounded-full bg-white/20" />
            <div className="w-20 h-4 rounded bg-white/20" />
          </div>
          <div className="w-60 h-7 rounded bg-white/30" />
          <div className="w-40 h-4 rounded bg-white/20" />
        </div>
        <div className="w-32 h-12 rounded-xl bg-white/20 shrink-0" />
      </div>

      {/* 4 Step Stepper skeleton */}
      <div className="p-6 sm:p-8 bg-[#FAF7F2] border-b border-rawaa-border">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex sm:flex-col items-center gap-3 p-3 rounded-xl bg-white/70 border border-rawaa-border">
              <div className="w-10 h-10 rounded-full skeleton-shimmer shrink-0" />
              <div className="space-y-1.5 flex-1 sm:text-center w-full">
                <div className="w-20 h-4 rounded skeleton-shimmer mx-auto" />
                <div className="w-28 h-3 rounded skeleton-shimmer mx-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Details grid skeleton */}
      <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          <div className="h-32 rounded-xl skeleton-shimmer" />
          <div className="h-24 rounded-xl skeleton-shimmer" />
        </div>
        <div className="lg:col-span-2">
          <div className="h-60 rounded-xl skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}

export function ReviewSkeleton() {
  return (
    <div className="bg-[#FAF8F5] p-3 rounded-lg border border-rawaa-border/60 text-xs space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full skeleton-shimmer" />
          <div className="w-24 h-3.5 rounded skeleton-shimmer" />
        </div>
        <div className="w-16 h-3 rounded skeleton-shimmer" />
      </div>
      <div className="w-full h-3 rounded skeleton-shimmer" />
      <div className="w-3/4 h-3 rounded skeleton-shimmer" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 7 }) {
  return (
    <tr className="border-b border-rawaa-border/40">
      {[...Array(cols)].map((_, i) => (
        <td key={i} className="py-4 px-3">
          <div
            className="h-4 rounded skeleton-shimmer"
            style={{ width: `${Math.max(45, (85 - (i * 7)) % 90)}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

export function CouponCardSkeleton() {
  return (
    <div className="bg-white border-2 border-dashed border-rawaa-border rounded-2xl p-5 shadow-soft-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="w-28 h-7 rounded-xl skeleton-shimmer" />
        <div className="w-16 h-6 rounded-full skeleton-shimmer" />
      </div>
      <div className="space-y-2">
        <div className="w-3/4 h-4 rounded skeleton-shimmer" />
        <div className="w-1/2 h-3.5 rounded skeleton-shimmer" />
      </div>
      <div className="w-full h-2 rounded-full skeleton-shimmer" />
      <div className="flex items-center justify-between pt-3 border-t border-rawaa-border/60">
        <div className="w-24 h-4 rounded skeleton-shimmer" />
        <div className="flex gap-2">
          <div className="w-7 h-7 rounded-lg skeleton-shimmer" />
          <div className="w-7 h-7 rounded-lg skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-fadeIn space-y-8">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-16 h-4 rounded skeleton-shimmer" />
        <div className="w-4 h-4 rounded skeleton-shimmer" />
        <div className="w-24 h-4 rounded skeleton-shimmer" />
        <div className="w-4 h-4 rounded skeleton-shimmer" />
        <div className="w-36 h-4 rounded skeleton-shimmer" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery column */}
        <div className="space-y-4">
          <div className="w-full aspect-square rounded-3xl skeleton-shimmer shadow-soft-xs" />
          <div className="flex gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-20 aspect-square rounded-2xl skeleton-shimmer shrink-0" />
            ))}
          </div>
        </div>

        {/* Info column */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-20 h-6 rounded-full skeleton-shimmer" />
              <div className="w-24 h-4 rounded skeleton-shimmer" />
            </div>
            <div className="w-3/4 h-8 rounded-xl skeleton-shimmer" />
            <div className="w-1/2 h-8 rounded-xl skeleton-shimmer" />
            <div className="flex items-center gap-2">
              <div className="w-28 h-5 rounded skeleton-shimmer" />
              <div className="w-20 h-4 rounded skeleton-shimmer" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-rawaa-soft/50 border border-rawaa-border space-y-2">
            <div className="w-36 h-7 rounded skeleton-shimmer" />
            <div className="w-24 h-4 rounded skeleton-shimmer" />
          </div>

          <div className="space-y-2">
            <div className="w-full h-4 rounded skeleton-shimmer" />
            <div className="w-5/6 h-4 rounded skeleton-shimmer" />
            <div className="w-4/6 h-4 rounded skeleton-shimmer" />
          </div>

          <div className="pt-4 border-t border-rawaa-border flex items-center gap-4">
            <div className="w-32 h-12 rounded-full skeleton-shimmer" />
            <div className="flex-1 h-12 rounded-full skeleton-shimmer" />
          </div>

          <div className="grid grid-cols-3 gap-3 pt-4">
            <div className="h-20 rounded-2xl skeleton-shimmer" />
            <div className="h-20 rounded-2xl skeleton-shimmer" />
            <div className="h-20 rounded-2xl skeleton-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}

