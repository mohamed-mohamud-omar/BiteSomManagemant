import React from 'react';

export const SkeletonLine = ({ className = 'h-4 w-full' }) => {
  return (
    <div className={`animate-shimmer rounded bg-slate-200 dark:bg-slate-800 ${className}`}></div>
  );
};

export const SkeletonCircle = ({ className = 'h-12 w-12' }) => {
  return (
    <div className={`animate-shimmer rounded-full bg-slate-200 dark:bg-slate-800 ${className}`}></div>
  );
};

export const FoodCardSkeleton = () => {
  return (
    <div className="glass-card overflow-hidden">
      <div className="h-48 w-full animate-shimmer bg-slate-200 dark:bg-slate-800"></div>
      <div className="p-5 space-y-4">
        <SkeletonLine className="h-6 w-3/4" />
        <SkeletonLine className="h-4 w-full" />
        <SkeletonLine className="h-4 w-2/3" />
        <div className="flex justify-between items-center pt-2">
          <SkeletonLine className="h-6 w-1/4" />
          <SkeletonLine className="h-8 w-1/3 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export const DashboardCardSkeleton = () => {
  return (
    <div className="glass-card p-6 flex items-center justify-between">
      <div className="space-y-3 w-2/3">
        <SkeletonLine className="h-4 w-1/2" />
        <SkeletonLine className="h-8 w-3/4" />
      </div>
      <SkeletonCircle className="h-12 w-12" />
    </div>
  );
};
