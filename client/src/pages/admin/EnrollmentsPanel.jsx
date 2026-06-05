import React, { useEffect, useState } from "react";
import { Check, X, Trash2, Inbox, Phone, Mail, RefreshCcw } from "lucide-react";
import { api, getApiError } from "../../api/http.js";
import ErrorAlert from "../../components/ErrorAlert.jsx";

const statusBadge = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800"
};

export default function EnrollmentsPanel() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.get("/enrollments", { params: filter ? { status: filter } : {} });
      setItems(data.enrollments);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const setStatus = async (id, status) => {
    try {
      await api.patch(`/enrollments/${id}`, { status });
      load();
    } catch (err) { setError(getApiError(err)); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this application?")) return;
    try {
      await api.delete(`/enrollments/${id}`);
      load();
    } catch (err) { setError(getApiError(err)); }
  };

  const pendingCount = items.filter((i) => i.status === "pending").length;

  return (
    <div className="card p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-brand-500 to-emerald-600 p-2.5 shadow-sm">
            <Inbox className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Enrollment applications</h2>
            <p className="text-sm text-slate-500">{pendingCount} pending review</p>
          </div>
        </div>
        <div className="flex gap-2">
          <select className="input" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button className="btn-secondary" onClick={load}><RefreshCcw className="h-4 w-4" /></button>
        </div>
      </div>

      <ErrorAlert message={error} />

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : items.length ? (
        <div className="grid gap-3">
          {items.map((e) => (
            <div key={e._id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900">{e.name}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusBadge[e.status]}`}>
                      {e.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-slate-600">{e.course}{e.age ? ` · age ${e.age}` : ""}</p>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <a href={`tel:${e.phone}`} className="flex items-center gap-1 hover:text-brand-700"><Phone className="h-3 w-3" />{e.phone}</a>
                    {e.email && <a href={`mailto:${e.email}`} className="flex items-center gap-1 hover:text-brand-700"><Mail className="h-3 w-3" />{e.email}</a>}
                    {e.parentName && <span>Parent: {e.parentName} {e.parentPhone}</span>}
                  </div>
                  {e.message && <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">{e.message}</p>}
                </div>
                <div className="flex gap-2">
                  {e.status !== "approved" && (
                    <button onClick={() => setStatus(e._id, "approved")} className="rounded-lg bg-emerald-50 p-2 text-emerald-700 transition hover:bg-emerald-100" title="Approve">
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  {e.status !== "rejected" && (
                    <button onClick={() => setStatus(e._id, "rejected")} className="rounded-lg bg-rose-50 p-2 text-rose-700 transition hover:bg-rose-100" title="Reject">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <button onClick={() => remove(e._id)} className="icon-btn-danger" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-12 text-center">
          <Inbox className="h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-500">No applications {filter ? `(${filter})` : "yet"}</p>
          <p className="mt-1 text-xs text-slate-400">New applications from the website appear here</p>
        </div>
      )}
    </div>
  );
}
