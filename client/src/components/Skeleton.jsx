import React from "react";

export function SkeletonLine({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-700 ${className}`} />;
}

export function SkeletonAvatar({ className = "h-9 w-9" }) {
  return <div className={`animate-pulse shrink-0 rounded-xl bg-slate-200 dark:bg-slate-700 ${className}`} />;
}

export function SkeletonTableRow({ cols = 5 }) {
  return (
    <tr>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <SkeletonAvatar />
          <div className="flex-1 space-y-1.5">
            <SkeletonLine className="h-3.5 w-28" />
            <SkeletonLine className="h-3 w-20" />
          </div>
        </div>
      </td>
      {Array.from({ length: cols - 1 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <SkeletonLine className="h-3.5 w-16" />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-slate-100 dark:bg-slate-800 p-5">
      <div className="animate-pulse h-14 w-14 shrink-0 rounded-2xl bg-slate-200 dark:bg-slate-700" />
      <div className="flex-1 space-y-2">
        <SkeletonLine className="h-3 w-20" />
        <SkeletonLine className="h-8 w-12" />
        <SkeletonLine className="h-3 w-16" />
      </div>
    </div>
  );
}

export function SkeletonListCard() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-700 px-4 py-3">
      <SkeletonAvatar className="h-9 w-9" />
      <div className="flex-1 space-y-1.5">
        <SkeletonLine className="h-3.5 w-40" />
        <SkeletonLine className="h-3 w-24" />
      </div>
      <SkeletonLine className="h-3 w-12" />
    </div>
  );
}

export function SkeletonCard({ rows = 3 }) {
  return (
    <div className="card p-5 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonListCard key={i} />
      ))}
    </div>
  );
}
