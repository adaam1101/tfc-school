import React, { useEffect, useState } from "react";
import { BookOpen, ClipboardList, Loader2, Trash2 } from "lucide-react";
import { api, getApiError } from "../api/http.js";
import ErrorAlert from "./ErrorAlert.jsx";

export default function TeacherCourseworkPanel() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ type: "lesson", title: "", body: "", dueDate: "", course: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const { data } = await api.get("/coursework");
      setItems(data.items || []);
    } catch (err) { setError(getApiError(err)); }
  };
  useEffect(() => { load(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true); setError("");
    try {
      await api.post("/coursework", form);
      setForm({ type: "lesson", title: "", body: "", dueDate: "", course: "" });
      await load();
    } catch (err) { setError(getApiError(err)); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!window.confirm("Remove this published item?")) return;
    try { await api.delete("/coursework/" + id); setItems((current) => current.filter((item) => item._id !== id)); }
    catch (err) { setError(getApiError(err)); }
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <form onSubmit={submit} className="card p-6 space-y-4">
        <div><h2 className="text-lg font-black text-slate-900 dark:text-white">Publish for students</h2><p className="text-sm text-slate-500">Lessons and assignments appear directly in each assigned student’s account.</p></div>
        <ErrorAlert message={error} />
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input w-full"><option value="lesson">Lesson</option><option value="assignment">Assignment</option></select>
        <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input w-full" />
        <input placeholder="Course / level (leave blank for all your students)" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} className="input w-full" />
        {form.type === "assignment" && <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="input w-full" />}
        <textarea required placeholder="Lesson content or assignment instructions" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className="input min-h-32 w-full" />
        <button disabled={saving} className="btn-primary w-full justify-center">{saving && <Loader2 className="h-4 w-4 animate-spin" />} Publish</button>
      </form>
      <div className="card p-6">
        <h2 className="mb-4 text-lg font-black text-slate-900 dark:text-white">Published items</h2>
        <div className="space-y-3">{items.length ? items.map((item) => <article key={item._id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"><div className="flex justify-between gap-3"><div><p className="font-bold text-slate-900 dark:text-white">{item.type === "lesson" ? <BookOpen className="mr-1 inline h-4 w-4" /> : <ClipboardList className="mr-1 inline h-4 w-4" />}{item.title}</p><p className="mt-1 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{item.body}</p><p className="mt-2 text-xs text-slate-400">{item.course || "All courses"}{item.dueDate ? " · Due " + item.dueDate : ""}</p></div><button onClick={() => remove(item._id)} className="text-rose-500"><Trash2 className="h-4 w-4" /></button></div></article>) : <p className="py-10 text-center text-sm text-slate-400">No lessons or assignments published yet.</p>}</div>
      </div>
    </section>
  );
}
