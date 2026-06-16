import React, { useEffect, useState, useCallback } from "react";
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
  CheckCircle2
} from "lucide-react";
import { api, getApiError } from "../api/http.js";
import ErrorAlert from "./ErrorAlert.jsx";

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

// ── Group form (create / edit) ────────────────────────────────────────────────

function GroupForm({ myStudents, initial, onSave, onCancel }) {
  const [name, setName]         = useState(initial?.name || "");
  const [desc, setDesc]         = useState(initial?.description || "");
  const [color, setColor]       = useState(initial?.color || GROUP_COLORS[0]);
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
      await onSave({ name: name.trim(), description: desc.trim(), color, students: [...picked] });
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

function GroupCard({ group, myStudents, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);

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
                <div key={s._id} className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 px-3 py-2">
                  <Avatar student={s} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{s.name}</p>
                    <p className="text-xs text-slate-400 truncate">{s.studentProfile?.course} · Age {s.studentProfile?.age || "–"}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Add student modal ─────────────────────────────────────────────────────────

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

// ── Main panel ────────────────────────────────────────────────────────────────

export default function TeacherGroupsPanel() {
  const [myStudents, setMyStudents] = useState([]);
  const [groups, setGroups]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [subTab, setSubTab]         = useState("students"); // "students" | "groups"
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showGroupForm, setShowGroupForm]   = useState(false);
  const [editingGroup, setEditingGroup]     = useState(null);
  const [removingId, setRemovingId]         = useState("");
  const [toast, setToast]           = useState({ msg: "", type: "success" });
  const [error, setError]           = useState("");

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
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {myStudents.length === 0 ? "No students yet." : `${myStudents.length} student${myStudents.length > 1 ? "s" : ""} in your class`}
            </p>
            <button
              onClick={() => setShowAddStudent(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-2 text-sm font-bold text-white shadow-sm hover:from-brand-700 hover:to-brand-800 transition-all"
            >
              <UserPlus className="h-4 w-4" /> Add student
            </button>
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
                    {s.studentProfile?.course || "–"} · Age {s.studentProfile?.age || "–"}
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
    </div>
  );
}
