import React from "react";
import { CheckCircle2, ClipboardCheck, MessageSquareText, RefreshCcw, Users, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api, getApiError } from "../../api/http.js";
import ErrorAlert from "../../components/ErrorAlert.jsx";
import LoadingState from "../../components/LoadingState.jsx";
import StatTile from "../../components/StatTile.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import AppLayout from "../../layouts/AppLayout.jsx";

const countStatus = (students, status) =>
  students.filter((student) => student.todayAttendance?.status === status).length;

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

  const noteDefaults = useMemo(() => {
    const initial = {};
    students.forEach((student) => {
      initial[student._id] = student.todayAttendance?.note || "";
    });
    return initial;
  }, [students]);

  const loadDashboard = async () => {
    setError("");
    setLoading(true);

    try {
      const { data: response } = await api.get("/teacher/dashboard");
      setData(response);
      const nextNotes = {};
      response.students.forEach((student) => {
        nextNotes[student._id] = student.todayAttendance?.note || "";
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
        const notification = response.attendance.parentNotification;
        setMessage(
          notification?.sent
            ? `Parent email sent for ${student.name}.`
            : `Absent saved for ${student.name}. ${notification?.error || "Notification was not sent."}`
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
        {message ? (
          <div className="rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
            {message}
          </div>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-3">
          <StatTile icon={Users} label="Assigned students" value={students.length} tone="sky" />
          <StatTile icon={CheckCircle2} label="Present today" value={presentCount} tone="teal" />
          <StatTile icon={XCircle} label="Absent today" value={absentCount} tone="rose" />
        </section>

        <section className="rounded-md border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-teal-50 p-2 text-teal-800">
                <ClipboardCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Attendance for {data?.today}</h2>
                <p className="text-sm text-slate-500">
                  Subject: {data?.teacher?.teacherProfile?.subject || "Assigned class"}
                </p>
              </div>
            </div>
            <button type="button" className="btn-secondary" onClick={loadDashboard}>
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
              Refresh
            </button>
          </div>

          <div className="grid gap-3">
            {students.map((student) => (
              <div
                key={student._id}
                className="grid gap-3 rounded-md border border-slate-200 p-4 lg:grid-cols-[1.2fr_1fr_auto]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{student.name}</h3>
                    <StatusBadge value={student.todayAttendance?.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Age {student.studentProfile?.age || "-"} | {student.studentProfile?.course || "Course"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Parent: {student.studentProfile?.parentPhone || student.studentProfile?.parentEmail || "No contact"}
                  </p>
                  {student.todayAttendance?.status === "Absent" ? (
                    <p className="mt-2 text-xs text-slate-500">
                      Notification:{" "}
                      {student.todayAttendance.parentNotification?.sent
                        ? "email sent"
                        : student.todayAttendance.parentNotification?.error || "not sent"}
                    </p>
                  ) : null}
                </div>

                <label className="field">
                  Optional note
                  <span className="relative">
                    <MessageSquareText className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <textarea
                      className="input min-h-[84px] pl-10"
                      value={notes[student._id] ?? noteDefaults[student._id] ?? ""}
                      onChange={(event) =>
                        setNotes((current) => ({ ...current, [student._id]: event.target.value }))
                      }
                      placeholder="Reason or reminder"
                    />
                  </span>
                </label>

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
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
