export default function LoadingState({ label = "Loading" }) {
  return (
    <div className="flex min-h-[220px] items-center justify-center text-sm text-slate-500">
      <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-teal-700" />
      {label}
    </div>
  );
}
