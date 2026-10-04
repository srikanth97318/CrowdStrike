import React from 'react';

export const Skeleton: React.FC<{
  className?: string;
}> = ({ className = 'h-4 w-full' }) => (
  <div className={`animate-pulse bg-command-surface/80 rounded-md border border-command-border/40 ${className}`} />
);

export const SkeletonCard: React.FC<{ rows?: number }> = ({ rows = 3 }) => (
  <div className="bg-command-card rounded-xl border border-command-border p-5 space-y-4">
    <div className="flex justify-between items-center">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className={`h-4 w-${i % 2 === 0 ? 'full' : '3/4'}`} />
    ))}
  </div>
);

export const SkeletonVideo: React.FC = () => (
  <div className="relative aspect-video w-full rounded-xl bg-command-surface border border-command-border overflow-hidden flex flex-col items-center justify-center">
    <div className="animate-spin text-cyan-500/50 mb-3">
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
    <Skeleton className="h-4 w-48 mb-2" />
    <Skeleton className="h-3 w-32" />
  </div>
);
