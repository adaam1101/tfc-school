import React, { useEffect, useState } from "react";
import { Plus, Inbox, Check, X, RefreshCcw, UserRound } from "lucide-react";
import { api, getApiError } from "../../api/http.js";
import AppLayout from "../../layouts/AppLayout.jsx";
import ErrorAlert from "../../components/ErrorAlert.jsx";

const statusColor = {
  pending:  "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
};

const emptyStudentForm = {
  role: "student", name: "", email: "", password: "", phone: "",
  studentProfile: { age: "", course: "", parentName: "", parentEmail: "", parentPhone: "" },
};

export default function ModeratorDashboard() {
  const [enrollments, setEnrollments] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyStudentForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const { data } = await api.get("/enrollments", { params: filter ? { status: filter } : {} });
      setEnrollments(data.enrollments);
    } catch (err) { setError(getApiError(err)); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const setStatus = async (id, status) => {
    try { await api.patch(`/enrollments/${id}`, { status }); load(); }
    catch (err) { setError(getApiError(err)); }
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setFormError("");
    try {
      await api.post("/admin/users", form);
      setShowForm(false); setForm(emptyStudentForm);
    } catch (err) { setFormError(getApiError(err)); }
    finally { setSaving(false); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setP = (k, v) => setForm(f => ({ ...f, studentProfile: { ...f.studentProfile, [k]: v } }));

  const pendingCount = enrollments.filter(e => e.status === "pending").length;

  return (
    <AppLayout title="Moderator Dashboard" subtitle="Gestion des inscriptions">
      <ErrorAlert message={error} />

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 p-2.5 shadow-sm">
            <Inbox className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Enrollment Applications</h2>
            <p className="text-sm text-slate-500">{pendingCount} pending review</p>
          </div>
        </div>
        <div className="flex gap-2">
          <select className="input" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button className="btn-secondary" onClick={load}><RefreshCcw className="h-4 w-4" /></button>
          <button className="btn-primary" onClick={() => { setShowForm(true); setFormError(""); }}>
            <Plus className="h-4 w-4" /> Add Student
          </button>
        </div>
      </div>

      {/* Enrollment list */}
      {loading ? (
        <p className="text-sm text-slate-400 py-8 text-center">Loading…</p>
      ) : enrollments.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <Inbox className="h-10 w-10 text-slate-300 mb-3" />
          <p className="text-sm text-slate-500">No applications found.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {enrollments.map(e => (
            <div key={e._id} className="card p-4 flex flex-wrap items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white">
                {e.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">{e.name}</p>
                <p className="text-xs text-slate-500">{e.course}</p>
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-400">
                  {e.phone && <span>📞 {e.phone}</span>}
                  {e.email && <span>✉️ {e.email}</span>}
                  {e.age && <span>Age: {e.age}</span>}
                </div>
                {e.message && <p className="mt-1 text-xs text-slate-500 italic">"{e.message}"</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor[e.status]}`}>
                  {e.status}
                </span>
                {e.status === "pending" && <>
                  <button onClick={() => setStatus(e._id, "approved")}
                    className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition">
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button onClick={() => setStatus(e._id, "rejected")}
                    className="flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition">
                    <X className="h-3.5 w-3.5" /> Reject
                  </button>
                </>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Student Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <UserRound className="h-5 w-5 text-brand-600" /> Add Student
            </h3>
            <ErrorAlert message={formError} />
            <form onSubmit={handleSave} className="grid gap-3">
              <input className="input" placeholder="Full name *" value={form.name} onChange={e => set("name", e.target.value)} required />
              <input className="input" type="email" placeholder="Email *" value={form.email} onChange={e => set("email", e.target.value)} required />
              <input className="input" type="password" placeholder="Password (min 8) *" value={form.password} onChange={e => set("password", e.target.value)} required minLength={8} />
              <input className="input" placeholder="Phone" value={form.phone} onChange={e => set("phone", e.target.value)} />
              <input className="input" type="number" placeholder="Age *" value={form.studentProfile.age} onChange={e => setP("age", e.target.value)} required />
              <input className="input" placeholder="Course *" value={form.studentProfile.course} onChange={e => setP("course", e.target.value)} required />
              <input className="input" placeholder="Parent name" value={form.studentProfile.parentName} onChange={e => setP("parentName", e.target.value)} />
              <input className="input" type="email" placeholder="Parent email" value={form.studentProfile.parentEmail} onChange={e => setP("parentEmail", e.target.value)} />
              <input className="input" placeholder="Parent phone *" value={form.studentProfile.parentPhone} onChange={e => setP("parentPhone", e.target.value)} />
              <div className="flex gap-2 mt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                  {saving ? "Saving…" : "Save Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
