import React, { useEffect, useState } from "react";
import { Megaphone, Plus, Trash2, Pin, RefreshCcw } from "lucide-react";
import { api, getApiError } from "../../api/http.js";
import ErrorAlert from "../../components/ErrorAlert.jsx";

const audienceBadge = {
  all: "bg-slate-100 text-slate-600",
  students: "bg-brand-100 text-brand-700",
  teachers: "bg-brand-100 text-brand-700"
};

const emptyForm = { title: "", body: "", audience: "all", pinned: false };

export default function AnnouncementsPanel() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.get("/announcements");
      setItems(data.announcements);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/announcements", form);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await api.delete(`/announcements/${id}`);
      load();
    } catch (err) { setError(getApiError(err)); }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
      {/* Compose */}
      <div className="card p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 p-2.5 shadow-sm">
            <Megaphone className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Post announcement</h2>
            <p className="text-sm text-slate-500">Broadcast news to the school</p>
          </div>
        </div>

        <ErrorAlert message={error} />

        <form className="grid gap-4" onSubmit={submit}>
          <label className="field">
            Title
            <input className="input" value={form.title} onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))} maxLength={140} required />
          </label>
          <label className="field">
            Message
            <textarea className="input min-h-[120px]" value={form.body} onChange={(e) => setForm((c) => ({ ...c, body: e.target.value }))} maxLength={2000} required />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="field">
              Audience
              <select className="input" value={form.audience} onChange={(e) => setForm((c) => ({ ...c, audience: e.target.value }))}>
                <option value="all">Everyone</option>
                <option value="students">Students only</option>
                <option value="teachers">Teachers only</option>
              </select>
            </label>
            <label className="flex items-center gap-2 self-end pb-2.5 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={form.pinned} onChange={(e) => setForm((c) => ({ ...c, pinned: e.target.checked }))} className="h-4 w-4 rounded" />
              <Pin className="h-4 w-4 text-amber-500" /> Pin to top
            </label>
          </div>
          <button className="btn-primary justify-center" type="submit" disabled={saving}>
            <Plus className="h-4 w-4" />
            {saving ? "Posting…" : "Publish"}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="card p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold">Published ({items.length})</h2>
          <button className="btn-secondary" onClick={load}><RefreshCcw className="h-4 w-4" /></button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : items.length ? (
          <div className="grid gap-3">
            {items.map((a) => (
              <div key={a._id} className={`rounded-xl border p-4 ${a.pinned ? "border-amber-200 bg-amber-50/60" : "border-slate-100"}`}>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="flex items-center gap-1.5 font-bold text-slate-900">
                    {a.pinned && <Pin className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />}
                    {a.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${audienceBadge[a.audience]}`}>{a.audience}</span>
                    <button onClick={() => remove(a._id)} className="icon-btn-danger"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <p className="mt-1.5 whitespace-pre-line text-sm text-slate-600">{a.body}</p>
                <p className="mt-2 text-xs text-slate-400">
                  {new Date(a.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-12 text-center">
            <Megaphone className="h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-500">No announcements yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
