export default function StatusBadge({ value }) {
  const classes =
    value === "Present"
      ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
      : value === "Absent"
        ? "bg-rose-50 text-rose-800 ring-rose-200"
        : "bg-slate-50 text-slate-700 ring-slate-200";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${classes}`}>
      {value || "Not marked"}
    </span>
  );
}
