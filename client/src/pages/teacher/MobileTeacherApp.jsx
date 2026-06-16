import React, { useEffect, useState, useCallback } from "react";
import {
  LayoutDashboard,
  ClipboardCheck,
  User,
  CheckCircle2,
  XCircle,
  Users,
  LogOut,
  RefreshCcw,
  MessageSquareText,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  BookOpen,
  Clock,
  Wifi,
  WifiOff,
  UserPen
} from "lucide-react";
import ProfileEditModal from "../../components/ProfileEditModal.jsx";
import { api, getApiError } from "../../api/http.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { schoolLogo, schoolInfo } from "../../config/branding.js";
import { useTheme } from "../../hooks/useTheme.js";

// ── helpers ──────────────────────────────────────────────────────────────────

const countStatus = (students, status) =>
  students.filter((s) => s.todayAttendance?.status === status).length;

const initials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";

const TODAY = new Date().toLocaleDateString("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric"
});

// ── sub-components ────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue:  { bg: "bg-brand-50 dark:bg-brand-950/40",   text: "text-brand-700 dark:text-brand-300",   icon: "bg-brand-500",   val: "text-brand-900 dark:text-brand-100" },
    green: { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-300", icon: "bg-emerald-500", val: "text-emerald-900 dark:text-emerald-100" },
    red:   { bg: "bg-rose-50 dark:bg-rose-950/40",     text: "text-rose-700 dark:text-rose-300",     icon: "bg-rose-500",     val: "text-rose-900 dark:text-rose-100"   },
    amber: { bg: "bg-amber-50 dark:bg-amber-950/40",   text: "text-amber-700 dark:text-amber-300",   icon: "bg-amber-500",   val: "text-amber-900 dark:text-amber-100" }
  };
  const c = colors[color] || colors.blue;
  return (
    <div className={`rounded-2xl p-4 ${c.bg}`}>
      <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl ${c.icon}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <p className={`text-2xl font-black ${c.val}`}>{value}</p>
      <p className={`text-xs font-semibold ${c.text}`}>{label}</p>
    </div>
  );
}

function StudentCard({ student, notes, onNote, onMark, savingId }) {
  const [expanded, setExpanded] = useState(false);
  const status = student.todayAttendance?.status;
  const saving = savingId === student._id;

  const borderColor =
    status === "Present" ? "border-emerald-300 dark:border-emerald-700"
    : status === "Absent" ? "border-rose-300 dark:border-rose-700"
    : "border-slate-200 dark:border-slate-700";

  const avatarGradient =
    status === "Present" ? "from-emerald-400 to-teal-500"
    : status === "Absent" ? "from-rose-400 to-red-500"
    : "from-slate-400 to-slate-500";

  return (
    <div className={`rounded-2xl border-2 bg-white dark:bg-slate-800 overflow-hidden shadow-sm ${borderColor}`}>
      {/* Top color strip */}
      <div className={`h-1 w-full ${
        status === "Present" ? "bg-gradient-to-r from-emerald-400 to-teal-500"
        : status === "Absent" ? "bg-gradient-to-r from-rose-400 to-red-500"
        : "bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700"
      }`} />

      <div className="p-4">
        {/* Student info row */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-sm font-black text-white shadow ${avatarGradient}`}>
            {initials(student.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{student.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {student.studentProfile?.course || "—"} · Age {student.studentProfile?.age || "–"}
            </p>
          </div>
          {status && (
            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
              status === "Present" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
              : "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300"
            }`}>
              {status}
            </span>
          )}
        </div>

        {/* Mark buttons — large, thumb-friendly */}
        <div className="flex gap-3 mb-3">
          <button
            type="button"
            disabled={saving}
            onClick={() => onMark(student, "Present")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 text-base font-bold transition-all active:scale-95 disabled:opacity-50 ${
              status === "Present"
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900"
                : "bg-emerald-50 text-emerald-700 border-2 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800"
            }`}
          >
            {saving ? <RefreshCcw className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
            Present
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => onMark(student, "Absent")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 text-base font-bold transition-all active:scale-95 disabled:opacity-50 ${
              status === "Absent"
                ? "bg-rose-500 text-white shadow-lg shadow-rose-200 dark:shadow-rose-900"
                : "bg-rose-50 text-rose-700 border-2 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800"
            }`}
          >
            {saving ? <RefreshCcw className="h-5 w-5 animate-spin" /> : <XCircle className="h-5 w-5" />}
            Absent
          </button>
        </div>

        {/* Expandable note */}
        <button
          type="button"
          className="w-full flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 py-1"
          onClick={() => setExpanded((v) => !v)}
        >
          <span className="flex items-center gap-1.5">
            <MessageSquareText className="h-3.5 w-3.5" />
            {notes[student._id] ? "Note added" : "Add a note (optional)"}
          </span>
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {expanded && (
          <textarea
            className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 p-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none min-h-[72px]"
            placeholder="Reason or reminder…"
            value={notes[student._id] ?? ""}
            onChange={(e) => onNote(student._id, e.target.value)}
          />
        )}

        {/* Parent notification status */}
        {status === "Absent" && (
          <p className="mt-2 text-center text-[10px] text-slate-400 dark:text-slate-500">
            Parent notification:{" "}
            {student.todayAttendance?.parentNotification?.sent
              ? "email sent ✓"
              : student.todayAttendance?.parentNotification?.error || "not sent"}
          </p>
        )}
      </div>
    </div>
  );
}

// ── screens ───────────────────────────────────────────────────────────────────

function DashboardScreen({ data, onRefresh, loading }) {
  const students = data?.students || [];
  const presentCount = countStatus(students, "Present");
  const absentCount = countStatus(students, "Absent");
  const unmarkedCount = students.length - presentCount - absentCount;
  const teacher = data?.teacher;

  const completionPct = students.length > 0
    ? Math.round(((presentCount + absentCount) / students.length) * 100)
    : 0;

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-5 pb-8 space-y-5">
      {/* Greeting */}
      <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-5 text-white shadow-lg shadow-brand-200/40 dark:shadow-brand-900/40">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-brand-200 text-sm font-medium">Good day,</p>
            <h2 className="text-xl font-black mt-0.5 leading-tight">{teacher?.name || "Teacher"}</h2>
            <p className="text-brand-200 text-xs mt-1">{teacher?.teacherProfile?.subject || "Class teacher"}</p>
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur active:bg-white/30 transition-all"
          >
            <RefreshCcw className={`h-5 w-5 text-white ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-brand-200">
          <CalendarDays className="h-3.5 w-3.5" />
          {TODAY}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Users}        label="Total students" value={students.length} color="blue"  />
        <StatCard icon={CheckCircle2} label="Present today"   value={presentCount}    color="green" />
        <StatCard icon={XCircle}      label="Absent today"    value={absentCount}     color="red"   />
        <StatCard icon={Clock}        label="Not marked"      value={unmarkedCount}   color="amber" />
      </div>

      {/* Completion bar */}
      <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Attendance progress</span>
          <span className="text-sm font-black text-brand-600 dark:text-brand-400">{completionPct}%</span>
        </div>
        <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-500 transition-all duration-700"
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
          {presentCount + absentCount} of {students.length} students marked
        </p>
      </div>

      {/* Recent absences */}
      {absentCount > 0 && (
        <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900 p-4">
          <p className="text-sm font-bold text-rose-700 dark:text-rose-300 mb-3 flex items-center gap-2">
            <XCircle className="h-4 w-4" /> Absent today
          </p>
          <div className="space-y-2">
            {students.filter((s) => s.todayAttendance?.status === "Absent").map((s) => (
              <div key={s._id} className="flex items-center gap-2 text-sm text-rose-800 dark:text-rose-300">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white">
                  {initials(s.name)}
                </div>
                <span className="font-medium">{s.name}</span>
                {s.studentProfile?.parentPhone && (
                  <a
                    href={`tel:${s.studentProfile.parentPhone}`}
                    className="ml-auto text-xs text-rose-500 dark:text-rose-400 underline"
                  >
                    Call parent
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Week stats */}
      {data?.weekStats && (
        <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 shadow-sm">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-brand-500" /> This week
          </p>
          <div className="flex gap-4 text-center">
            <div className="flex-1">
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{data.weekStats.present ?? "–"}</p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Present</p>
            </div>
            <div className="w-px bg-slate-100 dark:bg-slate-700" />
            <div className="flex-1">
              <p className="text-2xl font-black text-rose-500 dark:text-rose-400">{data.weekStats.absent ?? "–"}</p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Absent</p>
            </div>
            <div className="w-px bg-slate-100 dark:bg-slate-700" />
            <div className="flex-1">
              <p className="text-2xl font-black text-brand-600 dark:text-brand-400">{data.weekStats.total ?? "–"}</p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Total</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AttendanceScreen({ data, onMark, savingId, notes, onNote, onRefresh, loading, toast }) {
  const students = data?.students || [];
  const unmarkedCount = students.filter((s) => !s.todayAttendance?.status).length;

  return (
    <div className="flex-1 overflow-y-auto pb-8">
      {/* Sub-header */}
      <div className="bg-gradient-to-r from-brand-600 to-emerald-700 px-4 pt-5 pb-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-white font-black text-lg">Mark Attendance</h2>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 active:bg-white/30 transition-all"
          >
            <RefreshCcw className={`h-4 w-4 text-white ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
        <p className="text-emerald-100 text-xs">{data?.today} · {students.length} students</p>
        {unmarkedCount > 0 && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-amber-900">
            <Clock className="h-3 w-3" /> {unmarkedCount} not yet marked
          </div>
        )}
        {unmarkedCount === 0 && students.length > 0 && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">
            <CheckCircle2 className="h-3 w-3" /> All students marked ✓
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="mx-4 mt-4 rounded-2xl border border-brand-200 bg-brand-50 dark:border-brand-800 dark:bg-brand-950/50 px-4 py-3 text-sm font-medium text-brand-800 dark:text-brand-300 shadow-sm">
          {toast}
        </div>
      )}

      {/* Student list */}
      <div className="px-4 mt-4 space-y-4">
        {students.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users className="h-14 w-14 text-slate-200 dark:text-slate-700 mb-3" />
            <p className="font-bold text-slate-500 dark:text-slate-400">No students assigned</p>
            <p className="text-xs text-slate-400 mt-1">Ask an admin to assign students to your class</p>
          </div>
        )}
        {students.map((student) => (
          <StudentCard
            key={student._id}
            student={student}
            notes={notes}
            onNote={onNote}
            onMark={onMark}
            savingId={savingId}
          />
        ))}
      </div>
    </div>
  );
}

function ProfileScreen({ user, onLogout }) {
  const { dark, toggle } = useTheme();
  const [showEdit, setShowEdit] = useState(false);
  const teacher = user?.teacherProfile;

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-5 pb-8 space-y-5">
      {showEdit && <ProfileEditModal onClose={() => setShowEdit(false)} />}

      {/* Avatar card */}
      <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white shadow-lg">
        <div className="flex flex-col items-center text-center">
          {user?.photo ? (
            <img src={user.photo} alt={user.name} className="h-20 w-20 rounded-3xl object-cover ring-4 ring-white/30 shadow-lg mb-3" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 text-2xl font-black text-white shadow-inner mb-3">
              {initials(user?.name)}
            </div>
          )}
          <h2 className="text-xl font-black">{user?.name}</h2>
          <p className="text-brand-200 text-sm mt-0.5">{teacher?.subject || "Teacher"}</p>
          <span className="mt-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold capitalize">
            {user?.role}
          </span>
          <button
            onClick={() => setShowEdit(true)}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-bold text-white hover:bg-white/30 active:scale-95 transition-all"
          >
            <UserPen className="h-4 w-4" /> Edit Profile
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700 shadow-sm overflow-hidden">
        {[
          { label: "Email",   value: user?.email },
          { label: "Phone",   value: teacher?.contactInfo || user?.phone || "—" },
          { label: "Subject", value: teacher?.subject || "—" },
          { label: "Status",  value: user?.status || "active" }
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between px-4 py-3.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200 text-right max-w-[60%] truncate">{value}</span>
          </div>
        ))}
      </div>

      {/* Dark mode toggle */}
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-4 py-3.5 shadow-sm"
      >
        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
          {dark ? "Light mode" : "Dark mode"}
        </span>
        <div className={`relative h-6 w-11 rounded-full transition-colors ${dark ? "bg-brand-500" : "bg-slate-200 dark:bg-slate-600"}`}>
          <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${dark ? "translate-x-5" : "translate-x-0.5"}`} />
        </div>
      </button>

      {/* School info */}
      <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 p-4 flex items-center gap-3">
        <img src={schoolLogo} alt={schoolInfo.short} className="h-10 w-auto object-contain" />
        <div>
          <p className="text-sm font-black text-slate-800 dark:text-slate-100">{schoolInfo.short} School</p>
          <p className="text-xs text-slate-400">{schoolInfo.city}</p>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full flex items-center justify-center gap-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900 py-4 text-rose-600 dark:text-rose-400 font-bold text-sm active:scale-95 transition-all"
      >
        <LogOut className="h-5 w-5" />
        Sign out
      </button>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function MobileTeacherApp() {
  const { user, logout } = useAuth();
  const [screen, setScreen] = useState("dashboard");
  const [data, setData] = useState(null);
  const [notes, setNotes] = useState({});
  const [savingId, setSavingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [online, setOnline] = useState(navigator.onLine);

  // Online / offline detection
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get("/teacher/dashboard");
      setData(res);
      const nextNotes = {};
      res.students.forEach((s) => { nextNotes[s._id] = s.todayAttendance?.note || ""; });
      setNotes(nextNotes);
    } catch (err) {
      showToast(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const markAttendance = async (student, status) => {
    setSavingId(student._id);
    try {
      const { data: res } = await api.post("/teacher/attendance", {
        studentId: student._id,
        status,
        note: notes[student._id] || ""
      });
      setData((cur) => ({
        ...cur,
        students: cur.students.map((item) =>
          item._id === student._id ? { ...item, todayAttendance: res.attendance } : item
        )
      }));
      if (status === "Absent") {
        const n = res.attendance.parentNotification;
        showToast(n?.sent ? `Parent email sent for ${student.name}.` : `Absent saved — ${n?.error || "notification not sent."}`);
      } else {
        showToast(`${student.name} marked present ✓`);
      }
    } catch (err) {
      showToast(getApiError(err));
    } finally {
      setSavingId("");
    }
  };

  const setNote = (id, val) => setNotes((cur) => ({ ...cur, [id]: val }));

  const students = data?.students || [];
  const unmarkedCount = students.filter((s) => !s.todayAttendance?.status).length;

  // ── nav items ────────────────────────────────────────────────────────────────
  const NAV = [
    { id: "dashboard",  label: "Dashboard",  icon: LayoutDashboard },
    { id: "attendance", label: "Attendance", icon: ClipboardCheck,  badge: unmarkedCount },
    { id: "profile",    label: "Profile",    icon: User }
  ];

  return (
    <div className="fixed inset-0 flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 overscroll-none">

      {/* Status bar accent (mobile browser address bar area) */}
      <div className="safe-top bg-white dark:bg-slate-900" />

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <img src={schoolLogo} alt={schoolInfo.short} className="h-8 w-auto object-contain" />
          <span className="text-sm font-black text-slate-800 dark:text-slate-100">{schoolInfo.short}</span>
          <span className="text-xs text-slate-400 hidden sm:inline">Teacher App</span>
        </div>
        <div className="flex items-center gap-2">
          {!online && (
            <span className="flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
              <WifiOff className="h-3 w-3" /> Offline
            </span>
          )}
          {online && (
            <span className="flex items-center gap-1 text-[10px] text-slate-300 dark:text-slate-600">
              <Wifi className="h-3 w-3" />
            </span>
          )}
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 text-xs font-black text-white">
            {initials(user?.name)}
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {loading && !data && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" />
          <p className="text-sm text-slate-400">Loading students…</p>
        </div>
      )}

      {/* Screen content */}
      {(!loading || data) && (
        <>
          {screen === "dashboard" && (
            <DashboardScreen data={data} onRefresh={loadDashboard} loading={loading} />
          )}
          {screen === "attendance" && (
            <AttendanceScreen
              data={data}
              onMark={markAttendance}
              savingId={savingId}
              notes={notes}
              onNote={setNote}
              onRefresh={loadDashboard}
              loading={loading}
              toast={toast}
            />
          )}
          {screen === "profile" && (
            <ProfileScreen user={user} onLogout={logout} />
          )}
        </>
      )}

      {/* Toast notification (for dashboard / profile screens) */}
      {toast && screen !== "attendance" && (
        <div className="absolute bottom-24 left-4 right-4 z-50 animate-fade-slide-up">
          <div className="rounded-2xl bg-slate-900 dark:bg-white px-4 py-3 text-sm font-medium text-white dark:text-slate-900 shadow-xl text-center">
            {toast}
          </div>
        </div>
      )}

      {/* Bottom navigation */}
      <div className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-2 pt-2 pb-safe safe-bottom">
        <div className="flex justify-around">
          {NAV.map(({ id, label, icon: Icon, badge }) => {
            const active = screen === id;
            return (
              <button
                key={id}
                onClick={() => setScreen(id)}
                className={`relative flex flex-col items-center gap-1 px-5 py-2 rounded-2xl transition-all active:scale-95 ${
                  active
                    ? "text-brand-600 dark:text-brand-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {active && (
                  <span className="absolute inset-0 rounded-2xl bg-brand-50 dark:bg-brand-950/50" />
                )}
                <span className="relative">
                  <Icon className={`h-6 w-6 ${active ? "stroke-[2.5]" : "stroke-[1.5]"}`} />
                  {badge > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[9px] font-black text-amber-900">
                      {badge > 9 ? "9+" : badge}
                    </span>
                  )}
                </span>
                <span className={`relative text-[10px] font-bold ${active ? "text-brand-600 dark:text-brand-400" : ""}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
