import React from "react";

const toneMap = {
  slate: { icon: "bg-slate-100 text-slate-600",  border: "border-slate-100", num: "text-slate-900" },
  teal:  { icon: "bg-gradient-to-br from-brand-500 to-emerald-600 text-white",  border: "border-brand-100",  num: "text-brand-900"  },
  sky:   { icon: "bg-gradient-to-br from-brand-500 to-brand-700 text-white",   border: "border-brand-100",   num: "text-brand-900"   },
  rose:  { icon: "bg-gradient-to-br from-rose-500 to-red-600 text-white",  border: "border-rose-100",  num: "text-rose-900"  },
  amber: { icon: "bg-gradient-to-br from-amber-500 to-orange-500 text-white", border: "border-amber-100", num: "text-amber-900" }
};

export default function StatTile({ icon: Icon, label, value, tone = "slate" }) {
  const t = toneMap[tone] || toneMap.slate;
  return (
    <div className={`card-hover border p-5 ${t.border}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className={`mt-2 text-3xl font-bold tracking-tight ${t.num}`}>{value}</p>
        </div>
        {Icon && (
          <div className={`rounded-xl p-2.5 shadow-sm ${t.icon}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  );
}
