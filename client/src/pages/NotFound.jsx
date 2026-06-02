import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="rounded-md border border-slate-200 bg-white p-6 text-center shadow-soft">
        <h1 className="text-2xl font-semibold text-slate-950">Page not found</h1>
        <p className="mt-2 text-sm text-slate-500">The requested TFC School page does not exist.</p>
        <Link to="/admin/login" className="btn-primary mt-6">
          Back to login
        </Link>
      </div>
    </div>
  );
}
