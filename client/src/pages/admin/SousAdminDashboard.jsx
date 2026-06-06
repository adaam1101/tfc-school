import React, { useEffect, useState } from "react";
import { Plus, UserRound, GraduationCap, Pencil, Search, RefreshCcw, Megaphone } from "lucide-react";
import { api, getApiError } from "../../api/http.js";
import AppLayout from "../../layouts/AppLayout.jsx";
import ErrorAlert from "../../components/ErrorAlert.jsx";
import LoadingState from "../../components/LoadingState.jsx";
import AnnouncementsPanel from "./AnnouncementsPanel.jsx";

const TABS = [
  { id: "students", label: "Students", icon: UserRound },
  { id: "teachers", label: "Teachers", icon: GraduationCap },
  { id: "announcements", label: "Announcements", icon: Megaphone },
];

const emptyForm = (role) => ({
  role, name: "", email: "", password: "", phone: "",
  studentProfile: { age: "", course: "", parentName: "", parentEmail: "", parentPhone: "" },
  teacherProfile: { subject: "" },
});

export default function SousAdminDashboard() {
  const [tab, setTab] = useState("students");
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formRole, setFormRole] = useState("student");
  const [form, setForm] = useState(emptyForm("student"));
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [s, t] = await Promise.all([
        api.get("/admin/users?role=student"),
        api.get("/admin/users?role=teacher"),
      ]);
      setStudents(s.data.users);
      setTeachers(t.data.users);
    } catch (err) { setError(getApiError(err)); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = (role) => {
    setFormRole(role); setForm(emptyForm(role));
    setFormError(""); setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setFormError("");
    try {
      const payload = { ...form, role: formRole };
      if (formRole === "student") delete payload.teacherProfile;
      else delete payload.studentProfile;
      await api.post("/admin/users", payload);
      setShowForm(false); load();
    } catch (err) { setFormError(getApiError(err)); }
    finally { setSaving(false); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setProfile = (profileKey, k, v) => setForm(f => ({ ...f, [profileKey]: { ...f[profileKey], [k]: v } }));

  const filtered = (list) => list.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout title="Sous-Admin Dashboard" subtitle="Gérer les étudiants et enseignants">
      <ErrorAlert message={error} />

      {/* Tabs */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              tab === t.id ? "bg-brand-700 text-white shadow" : "bg-white border border-slate-200 text-slate-600 hover:bg-brand-50"
            }`}>
            <t.icon className="h-4 w-4" />{t.label}
          </button>
        ))}
      </div>

      {tab === "announcements" && <AnnouncementsPanel />}

      {(tab === "students" || tab === "teachers") && (
        <>
          <div className="mb-4 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input className="input pl-9" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button onClick={load} className="btn-secondary"><RefreshCcw className="h-4 w-4" /></button>
            {tab === "students" && (
              <button onClick={() => openAdd("student")} className="btn-primary">
                <Plus className="h-4 w-4" /> Add Student
              </button>
            )}
            {tab === "teachers" && (
              <button onClick={() => openAdd("teacher")} className="btn-primary">
                <Plus className="h-4 w-4" /> Add Teacher
              </button>
            )}
          </div>

          {loading ? <LoadingState /> : (
            <div className="grid gap-3">
              {filtered(tab === "students" ? students : teachers).map(u => (
                <div key={u._id} className="card p-4 flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white">
                    {u.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{u.name}</p>
                    <p className="text-xs text-slate-500 truncate">{u.email}</p>
                    {u.studentProfile?.course && <p className="text-xs text-brand-600">{u.studentProfile.course}</p>}
                    {u.teacherProfile?.subject && <p className="text-xs text-brand-600">{u.teacherProfile.subject}</p>}
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${u.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {u.status}
                  </span>
                </div>
              ))}
              {filtered(tab === "students" ? students : teachers).length === 0 && (
                <p className="text-center text-sm text-slate-400 py-8">No results found.</p>
              )}
            </div>
          )}
        </>
      )}

      {/* Add User Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-bold">
              {formRole === "student" ? "Add Student" : "Add Teacher"}
            </h3>
            <ErrorAlert message={formError} />
            <form onSubmit={handleSave} className="grid gap-3">
              <input className="input" placeholder="Full name *" value={form.name} onChange={e => set("name", e.target.value)} required />
              <input className="input" type="email" placeholder="Email *" value={form.email} onChange={e => set("email", e.target.value)} required />
              <input className="input" type="password" placeholder="Password (min 8) *" value={form.password} onChange={e => set("password", e.target.value)} required minLength={8} />
              <input className="input" placeholder="Phone" value={form.phone} onChange={e => set("phone", e.target.value)} />
              {formRole === "student" && <>
                <input className="input" type="number" placeholder="Age *" value={form.studentProfile.age} onChange={e => setProfile("studentProfile", "age", e.target.value)} required />
                <input className="input" placeholder="Course *" value={form.studentProfile.course} onChange={e => setProfile("studentProfile", "course", e.target.value)} required />
                <input className="input" placeholder="Parent name" value={form.studentProfile.parentName} onChange={e => setProfile("studentProfile", "parentName", e.target.value)} />
                <input className="input" type="email" placeholder="Parent email" value={form.studentProfile.parentEmail} onChange={e => setProfile("studentProfile", "parentEmail", e.target.value)} />
                <input className="input" placeholder="Parent phone *" value={form.studentProfile.parentPhone} onChange={e => setProfile("studentProfile", "parentPhone", e.target.value)} />
              </>}
              {formRole === "teacher" && (
                <input className="input" placeholder="Subject *" value={form.teacherProfile.subject} onChange={e => setProfile("teacherProfile", "subject", e.target.value)} required />
              )}
              <div className="flex gap-2 mt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
