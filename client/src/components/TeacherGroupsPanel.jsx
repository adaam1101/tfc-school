import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Users,
  Plus,
  Trash2,
  Pencil,
  UserPlus,
  UserMinus,
  X,
  Save,
  Loader2,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle2,
  ClipboardCopy,
  UserRoundPlus,
  CalendarDays,
  Megaphone,
  FileText
} from "lucide-react";
import { api, getApiError } from "../api/http.js";
import { useAuth } from "../context/AuthContext.jsx";
import ErrorAlert from "./ErrorAlert.jsx";
import StudentObservationsModal from "./StudentObservationsModal.jsx";

// ── Register new student modal ────────────────────────────────────────────────

function RegisterStudentModal({ onDone, onClose, teacherSubject }) {
  const subject = teacherSubject?.trim();
  const defaultCourse = subject || "English";
  const [form, setForm] = useState({
    name: "", age: "", course: defaultCourse, phone: "",
    parentName: "", parentPhone: "", parentEmail: "", dateOfBirth: ""
  });
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [result, setResult]   = useState(null); // { email, tempPassword, name }
  const [copied, setCopied]   = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const { data } = await api.post("/teacher/students/register", form);
      setResult(data);
      onDone();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const copyCredentials = () => {
    const text = `Name: ${result.student.name}\nEmail: ${result.credentials.email}\nPassword: ${result.credentials.tempPassword}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-800 shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 z-10">
          <h3 className="font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <UserRoundPlus className="h-5 w-5 text-brand-600" /> Register New Student
          </h3>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Success state */}
        {result ? (
          <div className="p-6 space-y-5">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/40">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h4 className="font-black text-slate-900 dark:text-slate-100 text-lg">{result.student.name} registered!</h4>
              <p className="text-sm text-slate-500">Share these login credentials with the student or their parent.</p>
            </div>

            <div className="rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 p-4 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Username</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                  {result.student.username || result.credentials.email?.split("@")[0]}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Password</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{result.credentials.tempPassword}</span>
              </div>
            </div>

            <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2">
              ⚠️ Save these credentials now — the password won't be shown again.
            </p>

            <div className="flex gap-3">
              <button
                onClick={copyCredentials}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-600 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                <ClipboardCopy className="h-4 w-4" />
                {copied ? "Copied!" : "Copy credentials"}
              </button>
              <button
                onClick={onClose}
                className="flex-1 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 py-2.5 text-sm font-bold text-white hover:from-brand-700 hover:to-brand-800 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <ErrorAlert message={error} />

            {/* Required */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Required info</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Full name <span className="text-rose-500">*</span></span>
                  <input className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400" value={form.name} onChange={e => set("name", e.target.value)} required placeholder="Student full name" />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Age <span className="text-rose-500">*</span></span>
                  <input type="number" min="3" max="80" className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400" value={form.age} onChange={e => set("age", e.target.value)} required placeholder="Age" />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Course <span className="text-rose-500">*</span></span>
                  <input
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400"
                    value={form.course}
                    onChange={e => set("course", e.target.value)}
                    required
                    placeholder="e.g. English"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Phone <span className="text-rose-500">*</span></span>
                  <input className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400" value={form.phone} onChange={e => set("phone", e.target.value)} required placeholder="+213 …" />
                </label>
              </div>
            </div>

            {/* Optional */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Optional info</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Date of birth</span>
                  <input type="date" className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400" value={form.dateOfBirth} onChange={e => set("dateOfBirth", e.target.value)} />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Parent name</span>
                  <input className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400" value={form.parentName} onChange={e => set("parentName", e.target.value)} placeholder="Parent / guardian name" />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Parent phone</span>
                  <input className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400" value={form.parentPhone} onChange={e => set("parentPhone", e.target.value)} placeholder="+213 …" />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Parent email</span>
                  <input type="email" className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400" value={form.parentEmail} onChange={e => set("parentEmail", e.target.value)} placeholder="parent@email.com" />
                </label>
              </div>
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-700/50 rounded-xl px-3 py-2">
              Login credentials (email + temporary password) will be generated automatically and shown after registration.
            </p>

            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-200 dark:border-slate-600 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 py-2.5 text-sm font-bold text-white disabled:opacity-60 transition-all">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserRoundPlus className="h-4 w-4" />}
                {saving ? "Registering…" : "Register student"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const GROUP_COLORS = [
  "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B",
  "#EF4444", "#EC4899", "#06B6D4", "#84CC16"
];

const initials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";

// ── Small helpers ─────────────────────────────────────────────────────────────

function Avatar({ student, size = "sm" }) {
  const sz = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  if (student.photo) {
    return <img src={student.photo} alt={student.name} className={`${sz} rounded-xl object-cover shrink-0`} />;
  }
  return (
    <div className={`${sz} shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 font-bold text-white`}>
      {initials(student.name)}
    </div>
  );
}

function Toast({ msg, type = "success" }) {
  if (!msg) return null;
  return (
    <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
      type === "error"
        ? "border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300"
        : "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
    }`}>
      {msg}
    </div>
  );
}

// ── Group attendance panel ────────────────────────────────────────────────────

function GroupAttendancePanel({ group, onClose }) {
  const today = new Date().toISOString().slice(0, 10);
  const label = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  const [statuses, setStatuses]   = useState({}); // studentId -> "Present"|"Absent"
  const [saving, setSaving]       = useState("");
  const [done, setDone]           = useState({});  // studentId -> true when saved
  const [error, setError]         = useState("");

  const mark = async (student, status) => {
    setSaving(student._id); setError("");
    try {
      await api.post("/teacher/attendance", { studentId: student._id, status, date: today });
      setStatuses(s => ({ ...s, [student._id]: status }));
      setDone(d => ({ ...d, [student._id]: true }));
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSaving("");
    }
  };

  const students = group.students || [];
  const marked = Object.keys(done).length;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-lg max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-800 shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="shrink-0 px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: group.color }} />
              {group.name}
            </h3>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700">
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>
          <p className="text-xs text-slate-400">{label} · {marked}/{students.length} marked</p>
          {error && <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-slate-100 dark:bg-slate-700 shrink-0">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 transition-all duration-500"
            style={{ width: students.length ? `${(marked / students.length) * 100}%` : "0%" }}
          />
        </div>

        {/* Student list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {students.length === 0 && (
            <p className="text-center text-sm text-slate-400 py-10">No students in this group.</p>
          )}
          {students.map((s) => {
            const status = statuses[s._id];
            const isSaving = saving === s._id;
            return (
              <div
                key={s._id}
                className={`flex items-center gap-3 rounded-2xl border-2 px-3 py-3 transition-all ${
                  status === "Present" ? "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30"
                  : status === "Absent" ? "border-rose-300 bg-rose-50 dark:border-rose-700 dark:bg-rose-950/30"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                }`}
              >
                <Avatar student={s} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">{s.name}</p>
                  <p className="text-xs text-slate-400 truncate">{s.studentProfile?.course} · Age {s.studentProfile?.age || "–"}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    disabled={isSaving}
                    onClick={() => mark(s, "Present")}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold transition-all active:scale-95 disabled:opacity-50 ${
                      status === "Present"
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                    }`}
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    <span className="hidden sm:inline">Present</span>
                  </button>
                  <button
                    disabled={isSaving}
                    onClick={() => mark(s, "Absent")}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold transition-all active:scale-95 disabled:opacity-50 ${
                      status === "Absent"
                        ? "bg-rose-500 text-white shadow-sm"
                        : "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-500 hover:text-white dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-400"
                    }`}
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                    <span className="hidden sm:inline">Absent</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {marked === students.length && students.length > 0 && (
          <div className="shrink-0 px-5 py-4 border-t border-slate-100 dark:border-slate-700 bg-emerald-50 dark:bg-emerald-950/30">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">All students marked ✓</p>
              <button onClick={onClose} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-600 transition-all">Done</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Group form (create / edit) ────────────────────────────────────────────────

function GroupForm({ myStudents, initial, onSave, onCancel }) {
  const [name, setName]         = useState(initial?.name || "");
  const [desc, setDesc]         = useState(initial?.description || "");
  const [color, setColor]       = useState(initial?.color || GROUP_COLORS[0]);
  const [days, setDays]         = useState(initial?.days || []);
  const [picked, setPicked]     = useState(
    new Set((initial?.students || []).map((s) => s._id || s))
  );
  const [search, setSearch]     = useState("");
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  const filtered = myStudents.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.studentProfile?.course || "").toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id) =>
    setPicked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError("Group name is required."); return; }
    setSaving(true); setError("");
    try {
      await onSave({ name: name.trim(), description: desc.trim(), color, students: [...picked], days });
    } catch (err) {
      setError(getApiError(err));
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 space-y-4 shadow-sm">
      <h3 className="font-black text-slate-900 dark:text-slate-100">
        {initial ? "Edit group" : "New group"}
      </h3>

      <ErrorAlert message={error} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Group name *</span>
          <input
            className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='e.g. Group 1 (9-11 years)'
            required
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Description</span>
          <input
            className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Age range, level…"
          />
        </label>
      </div>

      {/* Color picker */}
      <div>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">Color</span>
        <div className="flex gap-2 flex-wrap">
          {GROUP_COLORS.map((c) => (
            <button
              key={c} type="button"
              onClick={() => setColor(c)}
              className={`h-7 w-7 rounded-full transition-all ${color === c ? "ring-2 ring-offset-2 ring-slate-400 scale-110" : "hover:scale-105"}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Weekly Days Picker */}
      <div>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">Weekly Schedule Days</span>
        <div className="flex gap-2 flex-wrap">
          {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => {
            const active = days.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => {
                  setDays(prev =>
                    prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
                  );
                }}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all border ${
                  active
                    ? "bg-gradient-to-r from-brand-600 to-brand-700 text-white border-brand-600 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-350 dark:hover:bg-slate-700"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Student picker */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Add students ({picked.size} selected)
          </span>
          {picked.size > 0 && (
            <button type="button" onClick={() => setPicked(new Set())} className="text-xs text-rose-500 hover:underline">
              Clear all
            </button>
          )}
        </div>

        {myStudents.length === 0 ? (
          <p className="text-xs text-slate-400 italic">Add students to your class first.</p>
        ) : (
          <>
            <div className="relative mb-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 pl-9 pr-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400"
                placeholder="Search students…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="max-h-52 overflow-y-auto space-y-1.5 rounded-xl border border-slate-100 dark:border-slate-700 p-2">
              {filtered.map((s) => {
                const sel = picked.has(s._id);
                return (
                  <button
                    key={s._id} type="button"
                    onClick={() => toggle(s._id)}
                    className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition-all ${
                      sel
                        ? "bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800"
                        : "hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    <Avatar student={s} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{s.name}</p>
                      <p className="text-xs text-slate-400 truncate">{s.studentProfile?.course} · Age {s.studentProfile?.age || "–"}</p>
                    </div>
                    {sel && <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-500" />}
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <p className="text-center text-xs text-slate-400 py-4">No students match.</p>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel} className="flex-1 rounded-xl border border-slate-200 dark:border-slate-600 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 py-2 text-sm font-bold text-white disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving…" : "Save group"}
        </button>
      </div>
    </form>
  );
}

// ── Group card ────────────────────────────────────────────────────────────────

function GroupCard({ group, myStudents, onEdit, onDelete, onTrackStudent, onMoveStudent, onRemoveFromGroup, onOpenNotes }) {
  const [open, setOpen]             = useState(false);
  const [showAttendance, setShowAtt] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-sm">
      {/* Color bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: group.color }} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white font-black text-sm shadow-sm" style={{ backgroundColor: group.color }}>
              {group.students?.length || 0}
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-slate-900 dark:text-slate-100 truncate">{group.name}</h3>
              {group.description && (
                <p className="text-xs text-slate-500 truncate">{group.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setShowBroadcast(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:from-teal-600 hover:to-indigo-700 transition-all"
              title="Broadcast WhatsApp message to this group"
            >
              <Megaphone className="h-3.5 w-3.5" /> Broadcast
            </button>
            <button
              onClick={() => setShowAtt(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:from-brand-700 hover:to-emerald-700 transition-all"
              title="Mark attendance for this group"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Attendance
            </button>
            <button onClick={() => onEdit(group)} className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-brand-600 transition-colors">
              <Pencil className="h-4 w-4" />
            </button>
            <button onClick={() => onDelete(group)} className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors">
              <Trash2 className="h-4 w-4" />
            </button>
            <button onClick={() => setOpen(v => !v)} className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
              {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="mt-4 space-y-2">
            {(group.students || []).length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-3">No students in this group yet.</p>
            ) : (
              group.students.map((s) => (
                <div key={s._id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 px-3 py-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar student={s} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{s.name}</p>
                      <p className="text-xs text-slate-400 truncate">
                        {s.studentProfile?.course} · Age {s.studentProfile?.age || "–"} · <span className="font-bold text-emerald-600 dark:text-emerald-400">📖 {s.sessionsAttended ?? 0} Sessions</span>
                        {(s.studentProfile?.isStopped || s.status === "stopped") && (
                          <span className="ml-1.5 font-bold text-rose-500">⛔ Stopped</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => onOpenNotes && onOpenNotes(s)}
                      className="inline-flex items-center gap-1 rounded-lg border border-purple-200 hover:border-purple-300 bg-purple-50 hover:bg-purple-100 px-2 py-1 text-xs font-bold text-purple-700 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300 transition-all active:scale-95"
                      title="Upload pictures, PDF files or write observations"
                    >
                      <FileText className="h-3.5 w-3.5" /> Notes & Files
                    </button>
                    <button
                      onClick={() => onTrackStudent(s, group)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 hover:border-brand-300 bg-white hover:bg-brand-50 px-2 py-1 text-xs font-bold text-slate-600 hover:text-brand-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-350 dark:hover:bg-slate-700 transition-all active:scale-95"
                    >
                      <CalendarDays className="h-3.5 w-3.5" /> Track
                    </button>
                    <button
                      onClick={() => onMoveStudent && onMoveStudent(s, group)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 hover:border-indigo-300 bg-white hover:bg-indigo-50 px-2 py-1 text-xs font-bold text-slate-600 hover:text-indigo-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-350 dark:hover:bg-slate-700 transition-all active:scale-95"
                      title={`Move ${s.name} to another group`}
                    >
                      Move
                    </button>
                    <button
                      onClick={() => onRemoveFromGroup && onRemoveFromGroup(s, group)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 bg-white text-rose-500 hover:bg-rose-50 dark:border-rose-900 dark:bg-slate-800"
                      title={`Remove ${s.name} from this group only`}
                    >
                      <UserMinus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {showAttendance && (
        <GroupAttendancePanel group={group} onClose={() => setShowAtt(false)} />
      )}
      {showBroadcast && (
        <GroupBroadcastModal group={group} onClose={() => setShowBroadcast(false)} />
      )}
    </div>
  );
}

// ── Add student modal ─────────────────────────────────────────────────────────

function MoveStudentModal({ student, sourceGroup, groups, onMove, onClose }) {
  const destinations = groups.filter((group) => group._id !== sourceGroup._id);
  const [targetGroupId, setTargetGroupId] = useState(destinations[0]?._id || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!targetGroupId) {
      setError("Create another group before moving this student.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onMove(targetGroupId);
    } catch (err) {
      setError(getApiError(err));
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-800">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-black text-slate-900 dark:text-slate-100">Move student</h3>
            <p className="mt-1 text-sm text-slate-500">Move <strong>{student.name}</strong> from {sourceGroup.name}. Their account and attendance history stay unchanged.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <ErrorAlert message={error} />
        <label className="mt-5 block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Destination group</span>
          <select value={targetGroupId} onChange={(event) => setTargetGroupId(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200" disabled={destinations.length === 0 || saving}>
            {destinations.map((group) => <option key={group._id} value={group._id}>{group.name}</option>)}
          </select>
        </label>
        {destinations.length === 0 && <p className="mt-2 text-xs text-rose-600">Create a second group first.</p>}
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300">Cancel</button>
          <button type="submit" disabled={saving || destinations.length === 0} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Move student
          </button>
        </div>
      </form>
    </div>
  );
}

function AddStudentModal({ myStudents, onAdd, onClose }) {
  const [all, setAll]     = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding]   = useState("");
  const [error, setError]     = useState("");

  useEffect(() => {
    api.get("/teacher/available-students")
      .then(({ data }) => setAll(data.students))
      .catch((err) => setError(getApiError(err)))
      .finally(() => setLoading(false));
  }, []);

  const myIds = new Set(myStudents.map((s) => s._id));
  const available = all.filter(
    (s) => !myIds.has(s._id) &&
      (s.name.toLowerCase().includes(search.toLowerCase()) ||
       (s.studentProfile?.course || "").toLowerCase().includes(search.toLowerCase()))
  );

  const handleAdd = async (student) => {
    setAdding(student._id); setError("");
    try {
      await onAdd(student._id);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setAdding("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-800 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-black text-slate-900 dark:text-slate-100">Add student to class</h3>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <ErrorAlert message={error} />
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 text-slate-800 dark:text-slate-200"
              placeholder="Search by name or course…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-80 overflow-y-auto space-y-2">
            {loading && <p className="text-center text-sm text-slate-400 py-6">Loading…</p>}
            {!loading && available.length === 0 && (
              <p className="text-center text-sm text-slate-400 py-6">
                {all.length === 0 ? "No students in the system yet." : "All students are already in your class."}
              </p>
            )}
            {available.map((s) => (
              <div key={s._id} className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 px-3 py-2.5">
                <Avatar student={s} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{s.name}</p>
                  <p className="text-xs text-slate-400 truncate">
                    {s.studentProfile?.course || "–"} · Age {s.studentProfile?.age || "–"}
                    {s.studentProfile?.teacher ? " · Already assigned" : ""}
                  </p>
                </div>
                <button
                  onClick={() => handleAdd(s)}
                  disabled={adding === s._id}
                  className="shrink-0 flex items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-60 transition-all"
                >
                  {adding === s._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Student tracking modal ──────────────────────────────────────────────

function StudentTrackingModal({ student, group, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingDate, setSavingDate] = useState("");

  const loadHistory = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const { data } = await api.get(`/teacher/students/${student._id}/attendance`);
      setHistory(data.attendanceHistory || []);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [student._id]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const groupDays = group.days || [];

  // Generate course days for the last 60 days
  const scheduledDates = useMemo(() => {
    if (groupDays.length === 0) return [];
    const dates = [];
    const today = new Date();
    // Go back 60 days
    for (let i = 0; i <= 60; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      
      const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
      if (groupDays.includes(weekday)) {
        // Format as YYYY-MM-DD local time
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const formattedDate = `${yyyy}-${mm}-${dd}`;
        
        const label = d.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "short" });
        dates.push({ date: formattedDate, label, weekday });
      }
    }
    return dates;
  }, [groupDays]);

  const markDateAttendance = async (dateStr, status) => {
    setSavingDate(dateStr); setError("");
    try {
      await api.post("/teacher/attendance", {
        studentId: student._id,
        status,
        date: dateStr
      });
      // reload history after saving
      const { data } = await api.get(`/teacher/students/${student._id}/attendance`);
      setHistory(data.attendanceHistory || []);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSavingDate("");
    }
  };

  const getStatusForDate = (dateStr) => {
    const record = history.find(r => r.date === dateStr);
    return record ? record.status : "Unmarked";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700 shrink-0">
          <div>
            <h3 className="font-black text-slate-900 dark:text-slate-100">{student.name}</h3>
            <p className="text-xs text-slate-400">Attendance tracking for group: {group.name}</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          <ErrorAlert message={error} />

          {groupDays.length === 0 ? (
            <div className="text-center py-6 text-slate-500">
              <p className="text-sm font-semibold">No schedule days selected for this group.</p>
              <p className="text-xs text-slate-400 mt-1">Edit the group to select lesson days (e.g. Sunday, Monday).</p>
            </div>
          ) : loading ? (
            <p className="text-center text-sm text-slate-400 py-6">Loading history…</p>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Scheduled days: {groupDays.join(", ")}</p>
              <div className="space-y-2">
                {scheduledDates.map((item) => {
                  const status = getStatusForDate(item.date);
                  const isSaving = savingDate === item.date;
                  return (
                    <div key={item.date} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-150 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-700/30 px-3.5 py-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.label}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{item.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          disabled={isSaving}
                          onClick={() => markDateAttendance(item.date, "Present")}
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                            status === "Present"
                              ? "bg-emerald-500 text-white shadow-sm"
                              : "border border-emerald-250 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-500 hover:text-white dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-450"
                          }`}
                        >
                          Present
                        </button>
                        <button
                          disabled={isSaving}
                          onClick={() => markDateAttendance(item.date, "Absent")}
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                            status === "Absent"
                              ? "bg-rose-500 text-white shadow-sm"
                              : "border border-rose-250 bg-rose-50/50 text-rose-700 hover:bg-rose-500 hover:text-white dark:border-rose-800 dark:bg-rose-950/20 dark:text-rose-455"
                          }`}
                        >
                          Absent
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export default function TeacherGroupsPanel() {
  const { user } = useAuth();
  const teacherSubject = user?.teacherProfile?.subject || "";
  const [myStudents, setMyStudents] = useState([]);
  const [groups, setGroups]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [subTab, setSubTab]         = useState("students"); // "students" | "groups"
  const [showAddStudent, setShowAddStudent]       = useState(false);
  const [showGroupForm, setShowGroupForm]   = useState(false);
  const [editingGroup, setEditingGroup]     = useState(null);
  const [removingId, setRemovingId]         = useState("");
  const [toast, setToast]           = useState({ msg: "", type: "success" });
  const [error, setError]           = useState("");
  const [trackingStudent, setTrackingStudent] = useState(null);
  const [movingStudent, setMovingStudent] = useState(null);
  const [observationsStudent, setObservationsStudent] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, groupsRes] = await Promise.all([
        api.get("/teacher/dashboard"),
        api.get("/teacher/groups")
      ]);
      setMyStudents(dashRes.data.students || []);
      setGroups(groupsRes.data.groups || []);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Student actions ──────────────────────────────────────────────────────────

  const handleAddStudent = async (studentId) => {
    await api.post("/teacher/students/add", { studentId });
    await load();
    setShowAddStudent(false);
    showToast("Student added to your class.");
  };

  const handleRemoveStudent = async (student) => {
    if (!window.confirm(`Remove ${student.name} from your class?`)) return;
    setRemovingId(student._id);
    try {
      await api.delete(`/teacher/students/${student._id}`);
      await load();
      showToast(`${student.name} removed.`);
    } catch (err) {
      showToast(getApiError(err), "error");
    } finally {
      setRemovingId("");
    }
  };

  // ── Group actions ────────────────────────────────────────────────────────────

  const handleSaveGroup = async (payload) => {
    if (editingGroup) {
      const { data } = await api.put(`/teacher/groups/${editingGroup._id}`, payload);
      setGroups((prev) => prev.map((g) => g._id === data.group._id ? data.group : g));
      showToast("Group updated.");
    } else {
      const { data } = await api.post("/teacher/groups", payload);
      setGroups((prev) => [...prev, data.group]);
      showToast("Group created.");
    }
    setShowGroupForm(false);
    setEditingGroup(null);
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setShowGroupForm(true);
  };

  const handleDeleteGroup = async (group) => {
    if (!window.confirm(`Delete group "${group.name}"?`)) return;
    try {
      await api.delete(`/teacher/groups/${group._id}`);
      setGroups((prev) => prev.filter((g) => g._id !== group._id));
      showToast("Group deleted.");
    } catch (err) {
      showToast(getApiError(err), "error");
    }
  };

  const handleRemoveFromGroup = async (student, group) => {
    if (!window.confirm("Remove " + student.name + " from " + group.name + "? Their account, attendance, and class assignment will remain.")) return;
    try {
      await api.delete("/teacher/groups/" + group._id + "/students/" + student._id);
      setGroups((prev) => prev.map((item) => (
        item._id === group._id
          ? { ...item, students: item.students.filter((member) => member._id !== student._id) }
          : item
      )));
      showToast(student.name + " removed from " + group.name + ".");
    } catch (err) {
      showToast(getApiError(err), "error");
    }
  };

  const handleMoveStudent = async (targetGroupId) => {
    const { student, group } = movingStudent;
    await api.post("/teacher/groups/" + group._id + "/students/" + student._id + "/move", { targetGroupId });
    setMovingStudent(null);
    await load();
    showToast(student.name + " moved to the new group.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ErrorAlert message={error} />
      <Toast msg={toast.msg} type={toast.type} />

      {/* Sub-tabs */}
      <div className="flex gap-2">
        {[
          { id: "students", label: `My Students (${myStudents.length})`, icon: Users },
          { id: "groups",   label: `Groups (${groups.length})`,          icon: Users }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSubTab(id)}
            className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold transition-all ${
              subTab === id
                ? "bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-md"
                : "border border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {/* ── Students tab ──────────────────────────────────────────────────────── */}
      {subTab === "students" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {myStudents.length === 0 ? "No students yet." : `${myStudents.length} student${myStudents.length > 1 ? "s" : ""} in your class`}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddStudent(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-2 text-sm font-bold text-white shadow-sm hover:from-brand-700 hover:to-brand-800 transition-all"
              >
                <UserPlus className="h-4 w-4" /> Add existing
              </button>
            </div>
          </div>

          {myStudents.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 py-14 text-center">
              <Users className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
              <p className="font-bold text-slate-500 dark:text-slate-400">No students in your class</p>
              <p className="text-xs text-slate-400 mt-1">Click "Add student" to assign students to your class.</p>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {myStudents.map((s) => (
              <div key={s._id} className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 shadow-sm">
                <Avatar student={s} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{s.name}</p>
                  <p className="text-xs text-slate-400 truncate">
                    {s.studentProfile?.course || "–"} · Age {s.studentProfile?.age || "–"} · <span className="font-bold text-emerald-600 dark:text-emerald-400">📖 {s.sessionsAttended ?? 0} Sessions</span>
                    {(s.studentProfile?.isStopped || s.status === "stopped") && (
                      <span className="ml-1.5 font-bold text-rose-500 font-black">⛔ Stopped</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveStudent(s)}
                  disabled={removingId === s._id}
                  className="shrink-0 flex h-8 w-8 items-center justify-center rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors disabled:opacity-50"
                  title="Remove from class"
                >
                  {removingId === s._id
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <UserMinus className="h-4 w-4" />
                  }
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Groups tab ────────────────────────────────────────────────────────── */}
      {subTab === "groups" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {groups.length === 0 ? "No groups yet." : `${groups.length} group${groups.length > 1 ? "s" : ""}`}
            </p>
            {!showGroupForm && (
              <button
                onClick={() => { setEditingGroup(null); setShowGroupForm(true); }}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-2 text-sm font-bold text-white shadow-sm hover:from-brand-700 hover:to-brand-800 transition-all"
              >
                <Plus className="h-4 w-4" /> New group
              </button>
            )}
          </div>

          {showGroupForm && (
            <GroupForm
              myStudents={myStudents}
              initial={editingGroup}
              onSave={handleSaveGroup}
              onCancel={() => { setShowGroupForm(false); setEditingGroup(null); }}
            />
          )}

          {groups.length === 0 && !showGroupForm && (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 py-14 text-center">
              <Users className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
              <p className="font-bold text-slate-500 dark:text-slate-400">No groups yet</p>
              <p className="text-xs text-slate-400 mt-1">Create groups to organise your students by age or level.</p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {groups.map((g) => (
              <GroupCard
                key={g._id}
                group={g}
                myStudents={myStudents}
                onEdit={handleEditGroup}
                onDelete={handleDeleteGroup}
                onTrackStudent={(student, group) => setTrackingStudent({ student, group })}
                onMoveStudent={(student, group) => setMovingStudent({ student, group })}
                onRemoveFromGroup={handleRemoveFromGroup}
                onOpenNotes={(student) => setObservationsStudent(student)}
              />
            ))}
          </div>
        </div>
      )}

      {showAddStudent && (
        <AddStudentModal
          myStudents={myStudents}
          onAdd={handleAddStudent}
          onClose={() => setShowAddStudent(false)}
        />
      )}


      {trackingStudent && (
        <StudentTrackingModal
          student={trackingStudent.student}
          group={trackingStudent.group}
          onClose={() => setTrackingStudent(null)}
        />
      )}
      {movingStudent && (
        <MoveStudentModal
          student={movingStudent.student}
          sourceGroup={movingStudent.group}
          groups={groups}
          onMove={handleMoveStudent}
          onClose={() => setMovingStudent(null)}
        />
      )}

      {observationsStudent && (
        <StudentObservationsModal
          student={observationsStudent}
          onClose={() => setObservationsStudent(null)}
        />
      )}
    </div>
  );
}

// ── Group Broadcast Modal ───────────────────────────────────────────────────

export function GroupBroadcastModal({ group, onClose }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);
    setError("");
    setSuccess("");
    setSummary(null);
    setLogs([]);

    try {
      const { data } = await api.post(`/teacher/groups/${group._id}/broadcast`, {
        message: message.trim()
      });
      setSuccess(data.message || "Broadcast completed successfully!");
      setSummary(data.summary);
      setLogs(data.logs || []);
      setMessage("");
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-800 shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-indigo-500 text-white shadow-sm">
              <Megaphone className="h-4.5 w-4.5" />
            </span>
            <div>
              <h3 className="font-black text-slate-900 dark:text-slate-100 text-sm">Broadcast to {group.name}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Group WhatsApp Bulletin</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <ErrorAlert message={error} />
          {success && (
            <div className="mb-4 rounded-2xl border border-emerald-150 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20 text-xs">
              <p className="font-black text-emerald-800 dark:text-emerald-400">{success}</p>
              {summary && (
                <div className="mt-2 flex gap-4 text-emerald-700 dark:text-emerald-500 font-bold">
                  <span>Delivered: {summary.successCount}</span>
                  {summary.failedCount > 0 && <span className="text-rose-600 dark:text-rose-450">Failed: {summary.failedCount}</span>}
                </div>
              )}
            </div>
          )}

          {!success && (
            <form onSubmit={handleSend} className="space-y-4">
              <div className="rounded-2xl border border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/30 p-3.5 text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-semibold">
                This message will be sent automatically to the WhatsApp numbers of all students in this group (parents for minors under 15, and directly to older students).
              </div>

              <label className="block">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 block">Message text</span>
                <textarea
                  required
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-850 dark:text-slate-205 focus:outline-none focus:ring-2 focus:ring-brand-500/20 min-h-[120px] resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your group announcement or homework reminder here..."
                  disabled={sending}
                />
              </label>

              <button
                type="submit"
                disabled={sending || !message.trim()}
                className="w-full rounded-2xl bg-gradient-to-r from-teal-500 to-indigo-655 py-3 text-sm font-bold text-white shadow-md hover:from-teal-600 hover:to-indigo-755 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Broadcasting...
                  </>
                ) : (
                  <>
                    Send Bulletin
                  </>
                )}
              </button>
            </form>
          )}

          {success && logs.length > 0 && (
            <div className="space-y-2 max-h-[160px] overflow-y-auto mt-4 pr-1 scrollbar-thin">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Delivery logs</p>
              {logs.map((log, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 dark:border-slate-750/30">
                  <span className="font-semibold text-slate-750 dark:text-slate-305">{log.studentName}</span>
                  <span className={`font-bold ${log.status === "Sent" ? "text-emerald-600" : log.status === "Skipped" ? "text-slate-455" : "text-rose-500"}`}>
                    {log.status} {log.error && `(${log.error})`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
