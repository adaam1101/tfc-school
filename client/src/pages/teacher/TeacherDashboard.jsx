import React from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  MessageSquareText,
  RefreshCcw,
  Users,
  XCircle,
  UserRound
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api, getApiError } from "../../api/http.js";
import ErrorAlert from "../../components/ErrorAlert.jsx";
import LoadingState from "../../components/LoadingState.jsx";
import StatTile from "../../components/StatTile.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import AppLayout from "../../layouts/AppLayout.jsx";
import AnnouncementsCard from "../../components/AnnouncementsCard.jsx";

const countStatus = (students, status) =>
  students.filter((s) => s.todayAttendance?.status === status).length;

export default function TeacherDashboard() {
  const [data, setData] = useState(null);
  const [notes, setNotes] = useState({});
  const [savingId, setSavingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    loadDashboard();
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
          <div className="animate-fade-slide-up rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-800">
            {message}
          </div>
        )}

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-3">
          <StatTile icon={Users}        label="Assigned students" value={students.length} tone="sky"  />
          <StatTile icon={CheckCircle2} label="Present today"     value={presentCount}    tone="teal" />
          <StatTile icon={XCircle}      label="Absent today"      value={absentCount}     tone="rose" />
        </section>

        {/* Attendance section */}
        <section className="card p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 p-2.5 shadow-sm">
                <ClipboardCheck className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Attendance — {data?.today}</h2>
                <p className="text-sm text-slate-500">
                  {data?.teacher?.teacherProfile?.subject || "Assigned class"} &middot;{" "}
                  {unmarkedCount > 0 ? `${unmarkedCount} not yet marked` : "All students marked"}
                </p>
              </div>
            </div>
            <button type="button" className="btn-secondary" onClick={loadDashboard}>
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
              Refresh
            </button>
          </div>

          <div className="grid gap-3">
            {students.map((student) => {
              const status = student.todayAttendance?.status;
              return (
                <div
                  key={student._id}
                  className={`grid gap-4 rounded-2xl border p-4 transition-all duration-200 lg:grid-cols-[1fr_1.1fr_auto] ${
                    status === "Present"
                      ? "border-emerald-200 bg-emerald-50/50"
                      : status === "Absent"
                      ? "border-rose-200 bg-rose-50/50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  {/* Student info */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-400 to-slate-600 text-sm font-bold text-white">
                      {student.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-900">{student.name}</h3>
                        <StatusBadge value={status} />
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Age {student.studentProfile?.age || "–"} &middot; {student.studentProfile?.course || "Course"}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Parent: {student.studentProfile?.parentPhone || student.studentProfile?.parentEmail || "No contact"}
                      </p>
                      {status === "Absent" && (
                        <p className="mt-1 text-xs text-slate-400">
                          Notification:{" "}
                          {student.todayAttendance?.parentNotification?.sent
                            ? "email sent ✓"
                            : student.todayAttendance?.parentNotification?.error || "not sent"}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Note */}
                  <label className="field">
                    <span className="flex items-center gap-1.5 text-xs">
                      <MessageSquareText className="h-3.5 w-3.5 text-slate-400" />
                      Optional note
                    </span>
                    <textarea
                      className="input min-h-[72px] text-xs"
                      value={notes[student._id] ?? ""}
                      onChange={(event) =>
                        setNotes((current) => ({ ...current, [student._id]: event.target.value }))
                      }
                      placeholder="Reason or reminder"
                    />
                  </label>

                  {/* Actions */}
                  <div className="flex items-center gap-2 lg:flex-col lg:items-stretch lg:justify-center">
                    <button
                      type="button"
                      className="btn-success justify-center"
                      disabled={savingId === student._id}
                      onClick={() => markAttendance(student, "Present")}
                    >
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      Present
                    </button>
                    <button
                      type="button"
                      className="btn-danger justify-center"
                      disabled={savingId === student._id}
                      onClick={() => markAttendance(student, "Absent")}
                    >
                      <XCircle className="h-4 w-4" aria-hidden="true" />
                      Absent
                    </button>
                  </div>
                </div>
              );
            })}

            {students.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-12 text-center">
                <UserRound className="h-10 w-10 text-slate-300" />
                <p className="mt-3 text-sm font-medium text-slate-500">No students assigned yet</p>
                <p className="mt-1 text-xs text-slate-400">Ask an admin to assign students to your class</p>
              </div>
            )}
          </div>
        </section>

        <AnnouncementsCard />
      </div>
    </AppLayout>
  );
}
