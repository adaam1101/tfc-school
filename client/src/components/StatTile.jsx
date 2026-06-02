export default function StatTile({ icon: Icon, label, value, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-50 text-slate-700",
    teal: "bg-teal-50 text-teal-800",
    sky: "bg-sky-50 text-sky-800",
    rose: "bg-rose-50 text-rose-800",
    amber: "bg-amber-50 text-amber-900"
  };

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
        </div>
        {Icon ? (
          <div className={`rounded-md p-2 ${tones[tone] || tones.slate}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
