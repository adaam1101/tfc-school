import React from "react";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  MessageSquareText,
  RefreshCcw,
  Users,
  XCircle,
  UserRound,
  IdCard,
  Clock
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api, getApiError } from "../../api/http.js";
import ErrorAlert from "../../components/ErrorAlert.jsx";
import LoadingState from "../../components/LoadingState.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import AppLayout from "../../layouts/AppLayout.jsx";
import AnnouncementsCard from "../../components/AnnouncementsCard.jsx";
import IDCardModal from "../../components/IDCardModal.jsx";
import TimetableGrid from "../../components/TimetableGrid.jsx";

const TABS = [
  { id: "attendance", label: "Attendance", icon: ClipboardCheck },
  { id: "timetable",  label: "Timetable",  icon: CalendarDays }
];

const countStatus = (students, status) =>
  students.filter((s) => s.todayAttendance?.status === status).length;

export default function TeacherDashboard() {
  const [data, setData] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [notes, setNotes] = useState({});
  const [savingId, setSavingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showIdCard, setShowIdCard] = useState(false);
  const [tab, setTab] = useState("attendance");

  const students = data?.students || [];
  const presentCount = countStatus(students, "Present");
  const absentCount = countStatus(students, "Absent");
  const unmarkedCount = students.length - presentCount - absentCount;

  const loadDashboard = async () => {
    setError("");
    setLoading(true);
    try {
      const { data: response } = await api.get("/teacher/dashboard");
      setData(response);
      const nextNotes = {};
      response.students.forEach((s) => {
        nextNotes[s._id] = s.todayAttendance?.note || "";
      });
      setNotes(nextNotes);
    } catch (loadError) {
      setError(getApiError(loadError));
    } finally {
      setLoading(false);
    }
  };

  const loadSchedules = async () => {
    try {
      const { data: res } = await api.get("/schedules");
      setSchedules(res.schedules || []);
    } catch {
      // silently ignore timetable load errors
    }
  };

  useEffect(() => {
    loadDashboard();
    loadSchedules();
  }, []);

  const markAttendance = async (student, status) => {
    setSavingId(student._id);
    setMessage("");
    setError("");
    try {
      const { data: response } = await api.post("/teacher/attendance", {
        studentId: student._id,
        status,
        note: notes[student._id] || ""
      });

      setData((current) => ({
        ...current,
        students: current.students.map((item) =>
          item._id === student._id ? { ...item, todayAttendance: response.attendance } : item
        )
      }));

      if (status === "Absent") {
        const n = response.attendance.parentNotification;
        setMessage(
          n?.sent
            ? `Parent email sent for ${student.name}.`
            : `Absent saved for ${student.name}. ${n?.error || "Notification not sent."}`
        );
      } else {
        setMessage(`${student.name} marked present.`);
      }
    } catch (markError) {
      setError(getApiError(markError));
    } finally {
      setSavingId("");
    }
  };

  if (loading) {
    return (
      <AppLayout title="Teacher dashboard" subtitle="Assigned students and daily attendance.">
        <LoadingState label="Loading assigned students" />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Teacher dashboard" subtitle="Assigned students and daily attendance.">
      <div className="grid gap-6">
        <ErrorAlert message={error} />

        {message && (
          <div className="animate-fade-slide-up rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800 dark:border-brand-800 dark:bg-brand-950/50 dark:text-brand-300">
            {message}
          </div>
        )}

        {/* Stats row */}
        <section className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: Users,        label: "Assigned",      value: students.length, gradient: "from-brand-500 to-brand-700",     border: "border-brand-100 dark:border-brand-900",   num: "text-brand-900 dark:text-brand-200"   },
            { icon: CheckCircle2, label: "Present today",  value: presentCount,    gradient: "from-emerald-500 to-teal-600",    border: "border-emerald-100 dark:border-emerald-900", num: "text-emerald-900 dark:text-emerald-200" },
            { icon: XCircle,      label: "Absent today",   value: absentCount,     gradient: "from-rose-500 to-red-600",        border: "border-rose-100 dark:border-rose-900",      num: "text-rose-900 dark:text-rose-200"     }
          ].map(({ icon: Icon, label, value, gradient, border, num }) => (
            <div key={label} className={`card-hover border p-5 ${border}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
                  <p className={`mt-2 text-4xl font-black tracking-tight ${num}`}>{value}</p>
                </div>
                <div className={`rounded-2xl bg-gradient-to-br p-3 shadow-sm ${gradient}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Pill tabs */}
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2.5 rounded-2xl px-6 py-3 text-sm font-bold transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-md shadow-brand-200 dark:shadow-brand-900"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-brand-600 dark:hover:bg-slate-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
                {t.id === "attendance" && unmarkedCount > 0 && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${active ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"}`}>
                    {unmarkedCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Timetable tab ── */}
        {tab === "timetable" && (
          <section>
            <div className="card overflow-hidden">
              {/* Timetable header card */}
              <div className="bg-gradient-to-r from-brand-600 to-brand-800 px-6 py-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-inner">
                      <CalendarDays className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">My Timetable</h2>
                      <p className="text-sm text-brand-200">
                        {data?.teacher?.teacherProfile?.subject || "Your scheduled classes"} · weekly view
                      </p>
                    </div>
                  </div>
                  <button className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/25" onClick={loadSchedules}>
                    <RefreshCcw className="h-4 w-4" />
                    Refresh
                  </button>
                </div>
              </div>
              <div className="p-6">
                <TimetableGrid schedules={schedules} />
              </div>
            </div>
          </section>
        )}

        {/* ── Attendance tab ── */}
        {tab === "attendance" && (
          <section>
            {/* Section header */}
            <div className="card overflow-hidden mb-4">
              <div className="bg-gradient-to-r from-brand-600 to-emerald-700 px-6 py-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-inner">
                      <ClipboardCheck className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Attendance — {data?.today}</h2>
                      <p className="text-sm text-emerald-100">
                        {data?.teacher?.teacherProfile?.subject || "Assigned class"} ·{" "}
                        {unmarkedCount > 0 ? `${unmarkedCount} not yet marked` : "All students marked ✓"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/25" onClick={() => setShowIdCard(true)}>
                      <IdCard className="h-4 w-4" />
                      My ID
                    </button>
                    <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/25" onClick={loadDashboard}>
                      <RefreshCcw className="h-4 w-4" />
                      Refresh
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Student cards grid */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {students.map((student) => {
                const status = student.todayAttendance?.status;
                const initials = student.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
                const avatarGradient =
                  status === "Present" ? "from-emerald-400 to-teal-500"
                  : status === "Absent" ? "from-rose-400 to-red-500"
                  : "from-slate-400 to-slate-500";

                return (
                  <div
                    key={student._id}
                    className={`card overflow-hidden transition-all duration-200 ${
                      status === "Present"
                        ? "border-emerald-200 dark:border-emerald-800"
                        : status === "Absent"
                        ? "border-rose-200 dark:border-rose-800"
                        : ""
                    }`}
                  >
                    {/* Card top strip */}
                    <div className={`h-1 w-full ${
                      status === "Present" ? "bg-gradient-to-r from-emerald-400 to-teal-500"
                      : status === "Absent" ? "bg-gradient-to-r from-rose-400 to-red-500"
                      : "bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600"
                    }`} />

                    <div className="p-4">
                      {/* Student info */}
                      <div className="mb-3 flex items-center gap-3">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-sm font-black text-white shadow-sm ${avatarGradient}`}>
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate">{student.name}</h3>
                            <StatusBadge value={status} />
                          </div>
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 truncate">
                            {student.studentProfile?.course || "Course"} · Age {student.studentProfile?.age || "–"}
                          </p>
                          {student.studentProfile?.parentPhone && (
                            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500 truncate">
                              Parent: {student.studentProfile.parentPhone}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Note */}
                      <label className="field mb-3">
                        <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <MessageSquareText className="h-3.5 w-3.5" />
                          Optional note
                        </span>
                        <textarea
                          className="input min-h-[64px] text-xs resize-none"
                          value={notes[student._id] ?? ""}
                          onChange={(event) =>
                            setNotes((current) => ({ ...current, [student._id]: event.target.value }))
                          }
                          placeholder="Reason or reminder..."
                        />
                      </label>

                      {/* Action pill buttons */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={savingId === student._id}
                          onClick={() => markAttendance(student, "Present")}
                          className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold transition-all duration-200 disabled:opacity-60 ${
                            status === "Present"
                              ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200 dark:shadow-emerald-900"
                              : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 dark:hover:bg-emerald-600 dark:hover:text-white"
                          }`}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Present
                        </button>
                        <button
                          type="button"
                          disabled={savingId === student._id}
                          onClick={() => markAttendance(student, "Absent")}
                          className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold transition-all duration-200 disabled:opacity-60 ${
                            status === "Absent"
                              ? "bg-rose-500 text-white shadow-sm shadow-rose-200 dark:shadow-rose-900"
                              : "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-500 hover:text-white hover:border-rose-500 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-400 dark:hover:bg-rose-600 dark:hover:text-white"
                          }`}
                        >
                          <XCircle className="h-4 w-4" />
                          Absent
                        </button>
                      </div>

                      {/* Notification status */}
                      {status === "Absent" && (
                        <p className="mt-2 text-center text-[10px] text-slate-400 dark:text-slate-500">
                          Notification:{" "}
                          {student.todayAttendance?.parentNotification?.sent
                            ? "email sent ✓"
                            : student.todayAttendance?.parentNotification?.error || "not sent"}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

              {students.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center dark:border-slate-700">
                  <UserRound className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                  <p className="mt-3 text-sm font-bold text-slate-500 dark:text-slate-400">No students assigned yet</p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Ask an admin to assign students to your class</p>
                </div>
              )}
            </div>
          </section>
        )}

        <AnnouncementsCard />
      </div>

      {showIdCard && data?.teacher && <IDCardModal user={data.teacher} onClose={() => setShowIdCard(false)} />}
    </AppLayout>
  );
}
