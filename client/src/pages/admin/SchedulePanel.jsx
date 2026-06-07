import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  Plus,
  Pencil,
  Trash2,
  RefreshCcw,
  X
} from "lucide-react";
import { api, getApiError } from "../../api/http.js";
import ErrorAlert from "../../components/ErrorAlert.jsx";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const HOURS = Array.from({ length: 14 }, (_, i) => {
  const h = i + 7;
  return `${String(h).padStart(2, "0")}:00`;
}); // 07:00 – 20:00

const PRESET_COLORS = [
  "#04436E", "#0ea5e9", "#10b981", "#f59e0b",
  "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6",
  "#f97316", "#6366f1"
];

const emptyForm = {
  day: "Monday",
  startTime: "08:00",
  endTime: "09:30",
  subject: "",
  teacher: "",
  course: "",
  room: "",
  color: "#04436E"
};

const timeToMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
};

const slotStart = timeToMinutes("07:00");
const slotSpan  = 60; // minutes per row
const totalRows = HOURS.length;

function getGridPosition(startTime, endTime) {
  const startMin = timeToMinutes(startTime) - slotStart;
  const endMin   = timeToMinutes(endTime)   - slotStart;
  const rowStart = Math.floor(startMin / slotSpan) + 1;
  const rowSpan  = Math.max(1, Math.ceil((endMin - startMin) / slotSpan));
  return { rowStart, rowSpan };
}

export default function SchedulePanel({ teachers = [] }) {
  const [schedules, setSchedules] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setError("");
    try {
      const { data } = await api.get("/schedules");
      setSchedules(data.schedules || []);
    } catch (err) {
      setError(getApiError(err));
    }
  };

  useEffect(() => { load(); }, []);

  const set = (key) => (e) => setForm((c) => ({ ...c, [key]: e.target.value }));

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const openEdit = (s) => {
    setEditingId(s._id);
    setForm({
      day: s.day,
      startTime: s.startTime,
      endTime: s.endTime,
      subject: s.subject,
      teacher: s.teacher?._id || s.teacher || "",
      course: s.course || "",
      room: s.room || "",
      color: s.color || "#04436E"
    });
    setShowForm(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        teacher: form.teacher || undefined
      };
      if (editingId) {
        await api.put(`/schedules/${editingId}`, payload);
      } else {
        await api.post("/schedules", payload);
      }
      resetForm();
      load();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this schedule entry?")) return;
    try {
      await api.delete(`/schedules/${id}`);
      load();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  // Group schedules by day for the grid
  const byDay = useMemo(() => {
    const map = {};
    DAYS.forEach((d) => { map[d] = []; });
    schedules.forEach((s) => {
      if (map[s.day]) map[s.day].push(s);
    });
    return map;
  }, [schedules]);

  return (
    <div className="grid gap-6">
      <ErrorAlert message={error} />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 p-2.5 shadow-sm">
            <CalendarDays className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Weekly Timetable</h2>
            <p className="text-sm text-slate-500">{schedules.length} scheduled entries</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={load}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
          <button className="btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="h-4 w-4" />
            Add Entry
          </button>
        </div>
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <div className="card p-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`rounded-xl p-2.5 shadow-sm ${editingId ? "bg-gradient-to-br from-amber-500 to-orange-500" : "bg-gradient-to-br from-brand-500 to-brand-700"}`}>
                {editingId ? <Pencil className="h-5 w-5 text-white" /> : <Plus className="h-5 w-5 text-white" />}
              </div>
              <h3 className="text-base font-bold">{editingId ? "Edit schedule entry" : "New schedule entry"}</h3>
            </div>
            <button type="button" className="icon-btn" onClick={resetForm}>
              <X className="h-4 w-4" />
            </button>
          </div>

          <form className="grid gap-4" onSubmit={submit}>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="field">
                Day
                <select className="input" value={form.day} onChange={set("day")} required>
                  {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </label>
              <label className="field">
                Start time
                <input className="input" type="time" value={form.startTime} onChange={set("startTime")} required />
              </label>
              <label className="field">
                End time
                <input className="input" type="time" value={form.endTime} onChange={set("endTime")} required />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="field">
                Subject
                <input className="input" value={form.subject} onChange={set("subject")} required placeholder="e.g. Mathematics" />
              </label>
              <label className="field">
                Room
                <input className="input" value={form.room} onChange={set("room")} placeholder="e.g. Room 101" />
              </label>
              <label className="field">
                Teacher
                <select className="input" value={form.teacher} onChange={set("teacher")}>
                  <option value="">No teacher assigned</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>{t.name} — {t.teacherProfile?.subject || "Teacher"}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                Course (student group)
                <input className="input" value={form.course} onChange={set("course")} placeholder="e.g. English, Informatique" />
              </label>
            </div>

            <div className="field">
              Color
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, color: c }))}
                    className="h-8 w-8 rounded-lg border-2 transition-all"
                    style={{
                      backgroundColor: c,
                      borderColor: form.color === c ? "#fff" : c,
                      boxShadow: form.color === c ? `0 0 0 3px ${c}` : "none"
                    }}
                    title={c}
                  />
                ))}
                <label className="flex items-center gap-2 text-xs text-slate-500">
                  Custom
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                    className="h-8 w-12 cursor-pointer rounded border border-slate-200"
                  />
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="btn-primary" type="submit" disabled={saving}>
                {editingId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {saving ? "Saving…" : editingId ? "Update" : "Add entry"}
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Timetable grid */}
      <div className="card overflow-x-auto p-0">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `64px repeat(${DAYS.length}, minmax(120px, 1fr))`,
            minWidth: "700px"
          }}
        >
          {/* Header row */}
          <div className="sticky left-0 z-10 bg-slate-50 p-3 text-xs font-bold text-slate-400 border-b border-r border-slate-100">
            <Clock className="h-4 w-4" />
          </div>
          {DAYS.map((day) => (
            <div key={day} className="border-b border-l border-slate-100 bg-slate-50 p-3 text-center text-xs font-bold uppercase tracking-wider text-slate-600">
              {day.slice(0, 3)}
            </div>
          ))}

          {/* Time rows */}
          {HOURS.map((hour, rowIdx) => (
            <React.Fragment key={hour}>
              {/* Time label */}
              <div className="sticky left-0 z-10 border-b border-r border-slate-100 bg-white px-2 py-1 text-right text-[10px] font-mono text-slate-400">
                {hour}
              </div>
              {/* Day cells */}
              {DAYS.map((day) => {
                // Find schedules that START in this hour slot
                const entries = byDay[day].filter((s) => {
                  const startMin = timeToMinutes(s.startTime) - slotStart;
                  return Math.floor(startMin / slotSpan) === rowIdx;
                });
                return (
                  <div
                    key={`${day}-${hour}`}
                    className="relative border-b border-l border-slate-100 bg-white"
                    style={{ minHeight: "56px" }}
                  >
                    {entries.map((s) => {
                      const { rowSpan } = getGridPosition(s.startTime, s.endTime);
                      return (
                        <div
                          key={s._id}
                          className="absolute inset-x-1 top-1 z-10 overflow-hidden rounded-lg px-2 py-1 text-white shadow-sm"
                          style={{
                            backgroundColor: s.color || "#04436E",
                            height: `calc(${rowSpan * 56}px - 8px)`
                          }}
                          title={`${s.subject} ${s.startTime}–${s.endTime}`}
                        >
                          <p className="truncate text-[11px] font-bold leading-tight">{s.subject}</p>
                          {s.course && <p className="truncate text-[10px] opacity-80">{s.course}</p>}
                          {s.teacher?.name && <p className="truncate text-[10px] opacity-80">{s.teacher.name}</p>}
                          <p className="text-[10px] opacity-75">{s.startTime}–{s.endTime}</p>
                          <div className="absolute right-1 top-1 flex gap-0.5">
                            <button
                              type="button"
                              onClick={() => openEdit(s)}
                              className="flex h-5 w-5 items-center justify-center rounded bg-white/20 hover:bg-white/40"
                              title="Edit"
                            >
                              <Pencil className="h-2.5 w-2.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => remove(s._id)}
                              className="flex h-5 w-5 items-center justify-center rounded bg-white/20 hover:bg-red-400/60"
                              title="Delete"
                            >
                              <Trash2 className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
