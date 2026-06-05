import React from "react";

export default function LoadingState({ label = "Loading" }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 text-sm text-slate-500">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-slate-100 border-t-sky-600" />
      </div>
      <p className="font-medium text-slate-600">{label}…</p>
    </div>
  );
}
