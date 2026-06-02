import { BookOpen, CalendarDays, CheckCircle2, Phone, UserRound, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api, getApiError } from "../../api/http.js";
import ErrorAlert from "../../components/ErrorAlert.jsx";
import LoadingState from "../../components/LoadingState.jsx";
import StatTile from "../../components/StatTile.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import AppLayout from "../../layouts/AppLayout.jsx";

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setError("");
      try {
        const { data } = await api.get("/student/profile");
        setProfile(data);
      } catch (profileError) {
        setError(getApiError(profileError));
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const summary = useMemo(() => {
    const history = profile?.attendanceHistory || [];
    return {
      present: history.filter((record) => record.status === "Present").length,
      absent: history.filter((record) => record.status === "Absent").length
    };
  }, [profile]);

  if (loading) {
    return (
      <AppLayout title="Student dashboard" subtitle="Profile and attendance history.">
        <LoadingState label="Loading student profile" />
      </AppLayout>
    );
  }

  const student = profile?.student;
  const details = student?.studentProfile || {};

  return (
    <AppLayout title="Student dashboard" subtitle="Profile and attendance history.">
      <div className="grid gap-6">
        <ErrorAlert message={error} />

        <section className="grid gap-4 sm:grid-cols-3">
          <StatTile icon={CheckCircle2} label="Present records" value={summary.present} tone="teal" />
          <StatTile icon={XCircle} label="Absent records" value={summary.absent} tone="rose" />
          <StatTile icon={BookOpen} label="Current mark" value={details.mark || "-"} tone="amber" />
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-soft">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-md bg-sky-50 p-2 text-sky-800">
                <UserRound className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{student?.name}</h2>
                <p className="text-sm text-slate-500">{student?.email}</p>
              </div>
            </div>

            <dl className="grid gap-4 text-sm">
              <div className="grid grid-cols-[120px_1fr] gap-3">
                <dt className="text-slate-500">Age</dt>
                <dd className="font-medium">{details.age || "-"}</dd>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-3">
                <dt className="text-slate-500">Course</dt>
                <dd className="font-medium">{details.course || "-"}</dd>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-3">
                <dt className="text-slate-500">Teacher</dt>
                <dd className="font-medium">{profile?.teacher?.name || "Not assigned"}</dd>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-3">
                <dt className="text-slate-500">Parent</dt>
                <dd className="font-medium">{details.parentName || "-"}</dd>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-3">
                <dt className="text-slate-500">Contact</dt>
                <dd className="font-medium">
                  <span className="inline-flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-400" aria-hidden="true" />
                    {details.parentPhone || details.parentEmail || "-"}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-soft">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-md bg-teal-50 p-2 text-teal-800">
                <CalendarDays className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Attendance history</h2>
                <p className="text-sm text-slate-500">Most recent 90 records.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-3 font-semibold">Date</th>
                    <th className="px-3 py-3 font-semibold">Status</th>
                    <th className="px-3 py-3 font-semibold">Teacher</th>
                    <th className="px-3 py-3 font-semibold">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {profile?.attendanceHistory?.length ? (
                    profile.attendanceHistory.map((record) => (
                      <tr key={record._id}>
                        <td className="px-3 py-3">{record.date}</td>
                        <td className="px-3 py-3">
                          <StatusBadge value={record.status} />
                        </td>
                        <td className="px-3 py-3">{record.teacher?.name || "Teacher"}</td>
                        <td className="px-3 py-3 text-slate-600">{record.note || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-3 py-6 text-center text-slate-500" colSpan="4">
                        No attendance records yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
