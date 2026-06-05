import React, { useEffect, useState } from "react";
import { History, RefreshCcw, ShieldCheck } from "lucide-react";
import { api, getApiError } from "../../api/http.js";
import ErrorAlert from "../../components/ErrorAlert.jsx";

const actionColor = {
  create: "bg-emerald-100 text-emerald-700",
  update: "bg-sky-100 text-sky-700",
  delete: "bg-rose-100 text-rose-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700"
};

const roleColor = {
  admin: "from-violet-500 to-purple-600",
  teacher: "from-sky-500 to-blue-600",
  student: "from-teal-500 to-emerald-600"
};

export default function AuditPanel() {
  const [logs, setLogs] = useState([]);
  const [entityFilter, setEntityFilter] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.get("/audit", { params: entityFilter ? { entity: entityFilter } : {} });
      setLogs(data.logs);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [entityFilter]);

  return (
    <div className="card p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 p-2.5 shadow-sm">
            <History className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Activity log</h2>
            <p className="text-sm text-slate-500">Who did what, and when</p>
          </div>
        </div>
        <div className="flex gap-2">
          <select className="input" value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)}>
            <option value="">All activity</option>
            <option value="user">Users</option>
            <option value="payment">Payments</option>
            <option value="announcement">Announcements</option>
            <option value="enrollment">Enrollments</option>
          </select>
          <button className="btn-secondary" onClick={load}><RefreshCcw className="h-4 w-4" /></button>
        </div>
      </div>

      <ErrorAlert message={error} />

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : logs.length ? (
        <div className="grid gap-2">
          {logs.map((log) => (
            <div key={log._id} className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-2.5 hover:bg-slate-50">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${roleColor[log.actorRole] || "from-slate-400 to-slate-600"} text-[10px] font-black text-white`}>
                {log.actorName?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-700">
                  <span className="font-bold">{log.actorName || "System"}</span>{" "}
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${actionColor[log.action] || "bg-slate-100 text-slate-600"}`}>
                    {log.action}
                  </span>{" "}
                  <span className="text-slate-500">{log.entity}</span>
                  {log.entityLabel && <span className="font-medium text-slate-800"> · {log.entityLabel}</span>}
                  {log.details && <span className="text-slate-400"> ({log.details})</span>}
                </p>
              </div>
              <span className="shrink-0 text-xs text-slate-400">
                {new Date(log.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-12 text-center">
          <ShieldCheck className="h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-500">No activity recorded yet</p>
          <p className="mt-1 text-xs text-slate-400">Actions like creating users or payments will appear here</p>
        </div>
      )}
    </div>
  );
}
