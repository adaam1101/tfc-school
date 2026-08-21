import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  UserPen,
  Phone,
  ShieldCheck,
  ShieldAlert,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Wallet
} from "lucide-react";
import ProfileEditModal from "../../components/ProfileEditModal.jsx";
import { api, getApiError } from "../../api/http.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { schoolLogo, schoolInfo } from "../../config/branding.js";
import { useTheme } from "../../hooks/useTheme.js";

// -- helpers ------------------------------------------------------------------

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

// -- sub-components ------------------------------------------------------------

function StatCard({ icon: Icon, label, value, type = "default" }) {
  const styles = {
    blue: {
      bg: "bg-slate-900 dark:bg-slate-800 text-white",
      iconBg: "bg-white/10 text-white",
      labelColor: "text-slate-300",
      numColor: "text-white"
    },
    green: {
      bg: "bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/50",
      iconBg: "bg-emerald-500 text-white",
      labelColor: "text-emerald-700 dark:text-emerald-300",
      numColor: "text-emerald-950 dark:text-emerald-100"
    },
    red: {
      bg: "bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/50",
      iconBg: "bg-rose-500 text-white",
      labelColor: "text-rose-700 dark:text-rose-300",
      numColor: "text-rose-950 dark:text-rose-100"
    },
    amber: {
      bg: "bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/50",
      iconBg: "bg-amber-500 text-white",
      labelColor: "text-amber-700 dark:text-amber-300",
      numColor: "text-amber-950 dark:text-amber-100"
    }
  };

  const s = styles[type] || styles.blue;

  return (
    <div className={`rounded-3xl p-4 shadow-sm transition-all ${s.bg}`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-bold uppercase tracking-wider ${s.labelColor}`}>{label}</span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${s.iconBg}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className={`text-3xl font-black tracking-tight ${s.numColor}`}>{value}</p>
    </div>
  );
}

function StudentCard({ student, notes, onNote, onMark, savingId }) {
  const [expanded, setExpanded] = useState(false);
  const status = student.todayAttendance?.status;
  const saving = savingId === student._id;

  const attended = student.sessionsAttended ?? student.studentProfile?.sessionsAttended ?? 0;
  const targetSessions = student.targetSessions || 12;
  const absences = student.absencesCount ?? student.studentProfile?.absencesCount ?? 0;
  const isReady = attended >= 11;
  const progressPct = Math.min(100, Math.round((attended / targetSessions) * 100));

  const payment = student.currentPayment || {};
  const tuition = payment.amount ?? 7500;
  const paid = payment.paidAmount ?? 0;
  const rest = Math.max(0, tuition - paid);
  const hasAssurance = Boolean(payment.assurancePaid);

  return (
    <div className={`rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-150 shadow-sm ${
      status === "Present"
        ? "border-emerald-400 dark:border-emerald-600 ring-2 ring-emerald-500/10"
        : status === "Absent"
        ? "border-rose-400 dark:border-rose-600 ring-2 ring-rose-500/10"
        : "border-slate-200/90 dark:border-slate-800"
    }`}>
      <div className="p-4 sm:p-5 space-y-4">
        {/* Header: Avatar, Name, Level, Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-black text-sm text-white shadow-sm ${
              status === "Present" ? "bg-emerald-600"
              : status === "Absent" ? "bg-rose-600"
              : "bg-slate-900 dark:bg-slate-700"
            }`}>
              {initials(student.name)}
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-slate-900 dark:text-slate-100 text-base leading-tight truncate">
                {student.name}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                  <GraduationCap className="h-3 w-3 text-brand-600" />
                  {student.studentProfile?.course || student.course || "General"}
                </span>
                {student.studentProfile?.age && (
                  <span>· Age {student.studentProfile.age}</span>
                )}
                {absences > 0 && (
                  <span className="font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-lg">
                    {absences} Absent
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Attendance Status Badge */}
          {status && (
            <span className={`shrink-0 inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold ${
              status === "Present"
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
            }`}>
              {status === "Present" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
              {status}
            </span>
          )}
        </div>

        {/* Level Test Progress & Badge */}
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-brand-600" />
              <span>Sessions: <strong>{attended} / {targetSessions}</strong></span>
            </span>
            {isReady ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full animate-pulse">
                <Sparkles className="h-3 w-3" /> Ready for Test!
              </span>
            ) : attended >= 8 ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/80 px-2 py-0.5 rounded-full">
                ? Test Soon ({targetSessions - attended} left)
              </span>
            ) : (
              <span className="text-[11px] font-medium text-slate-400">
                {targetSessions - attended} to test
              </span>
            )}
          </div>
          <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isReady ? "bg-emerald-500" : attended >= 8 ? "bg-blue-600" : "bg-brand-500"
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Payment Summary Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
          <div className="flex items-center gap-2">
            <Wallet className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-500 dark:text-slate-400">Paid:</span>
            <span className="font-black text-slate-900 dark:text-slate-100">{paid.toLocaleString()} DA</span>
            {rest > 0 ? (
              <span className="font-bold text-rose-600 dark:text-rose-400">(Rest: {rest.toLocaleString()} DA)</span>
            ) : (
              <span className="font-bold text-emerald-600 dark:text-emerald-400">? Complete</span>
            )}
          </div>

          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold ${
            hasAssurance
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
          }`}>
            {hasAssurance ? <ShieldCheck className="h-3 w-3 text-emerald-600" /> : <ShieldAlert className="h-3 w-3" />}
            {hasAssurance ? "800 DA Assurance Paid" : "Assurance Unpaid"}
          </span>
        </div>

        {/* Large Ergonomic Thumb Attendance Buttons (48px height) */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            disabled={saving}
            onClick={() => onMark(student, "Present")}
            className={`min-h-[48px] flex items-center justify-center gap-2 rounded-2xl font-black text-sm transition-all duration-150 active:scale-[0.97] disabled:opacity-50 ${
              status === "Present"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 border border-slate-200/80 dark:border-slate-700"
            }`}
          >
            {saving ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4.5 w-4.5" />}
            <span>Present</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => onMark(student, "Absent")}
            className={`min-h-[48px] flex items-center justify-center gap-2 rounded-2xl font-black text-sm transition-all duration-150 active:scale-[0.97] disabled:opacity-50 ${
              status === "Absent"
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 border border-slate-200/80 dark:border-slate-700"
            }`}
          >
            {saving ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <XCircle className="h-4.5 w-4.5" />}
            <span>Absent</span>
          </button>
        </div>

        {/* Expandable Notes & Parent Contact */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <button
            type="button"
            className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200 transition"
            onClick={() => setExpanded((v) => !v)}
          >
            <MessageSquareText className="h-3.5 w-3.5" />
            <span>{notes[student._id] ? "Note added ?" : "Add session note"}</span>
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          {student.studentProfile?.parentPhone && (
            <a
              href={`tel:${student.studentProfile.parentPhone}`}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition font-semibold"
            >
              <Phone className="h-3 w-3" /> Call Parent
            </a>
          )}
        </div>

        {expanded && (
          <textarea
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 resize-none min-h-[64px]"
            placeholder="Write session observation or note..."
            value={notes[student._id] ?? ""}
            onChange={(e) => onNote(student._id, e.target.value)}
          />
        )}
      </div>
    </div>
  );
}

// -- screens -------------------------------------------------------------------

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
    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24 space-y-4">
      {/* Teacher Profile Card */}
      <div className="rounded-3xl bg-slate-900 dark:bg-slate-800 p-5 text-white shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-lg font-black text-white shadow-inner">
              {initials(teacher?.name || "Teacher")}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Teacher Portal</p>
              <h2 className="text-lg font-black tracking-tight mt-0.5">{teacher?.name || "Teacher Adam"}</h2>
              <p className="text-xs text-brand-300 font-medium">{teacher?.teacherProfile?.subject || "English Academy"}</p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all"
          >
            <RefreshCcw className={`h-4 w-4 text-white ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-slate-300 border-t border-white/10 pt-3">
          <CalendarDays className="h-3.5 w-3.5 text-brand-400" />
          <span>{TODAY}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Users}        label="Students"    value={students.length} type="blue"  />
        <StatCard icon={CheckCircle2} label="Present"     value={presentCount}    type="green" />
        <StatCard icon={XCircle}      label="Absent"      value={absentCount}     type="red"   />
        <StatCard icon={Clock}        label="Unmarked"    value={unmarkedCount}   type="amber" />
      </div>

      {/* Completion Progress Bar */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Daily Completion</span>
          <span className="text-xs font-black text-slate-900 dark:text-slate-100">{completionPct}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          {presentCount + absentCount} of {students.length} recorded
        </p>
      </div>

      {/* Recent Absences */}
      {absentCount > 0 && (
        <div className="rounded-3xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/50 p-4 space-y-2.5">
          <p className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
            <XCircle className="h-3.5 w-3.5 text-rose-600" /> Absent Today ({absentCount})
          </p>
          <div className="space-y-2">
            {students.filter((s) => s.todayAttendance?.status === "Absent").map((s) => (
              <div key={s._id} className="flex items-center justify-between text-xs text-rose-900 dark:text-rose-200 bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-2xl border border-rose-100 dark:border-rose-900/40">
                <span className="font-bold">{s.name}</span>
                {s.studentProfile?.parentPhone && (
                  <a
                    href={`tel:${s.studentProfile.parentPhone}`}
                    className="text-[11px] font-black text-rose-600 dark:text-rose-400 flex items-center gap-1"
                  >
                    <Phone className="h-3 w-3" /> Call
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AttendanceScreen({ data, onMark, savingId, notes, onNote, onRefresh, loading, toast }) {
  const students = data?.students || [];
  const [selectedGroup, setSelectedGroup] = useState("all");

  // Extract unique group names or course levels
  const groups = useMemo(() => {
    const set = new Set();
    students.forEach((s) => {
      const g = s.groupName || s.studentProfile?.course || s.course;
      if (g) set.add(g);
    });
    return Array.from(set);
  }, [students]);

  const filteredStudents = useMemo(() => {
    if (selectedGroup === "all") return students;
    return students.filter((s) => {
      const g = s.groupName || s.studentProfile?.course || s.course;
      return g === selectedGroup;
    });
  }, [students, selectedGroup]);

  const unmarkedCount = filteredStudents.filter((s) => !s.todayAttendance?.status).length;

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      {/* Header & Date */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-4 pt-4 pb-3 sticky top-0 z-10 backdrop-blur-md bg-white/90 dark:bg-slate-900/90">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-slate-900 dark:text-white font-black text-lg">Mark Attendance</h2>
            <p className="text-slate-400 text-xs">{data?.today || TODAY} · {filteredStudents.length} Students</p>
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 active:scale-95 transition"
          >
            <RefreshCcw className={`h-4 w-4 text-slate-600 dark:text-slate-300 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Horizontal Group Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedGroup("all")}
            className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              selectedGroup === "all"
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            All ({students.length})
          </button>
          {groups.map((g) => {
            const count = students.filter((s) => (s.groupName || s.studentProfile?.course || s.course) === g).length;
            return (
              <button
                key={g}
                onClick={() => setSelectedGroup(g)}
                className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  selectedGroup === g
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                {g} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Toast alert */}
      {toast && (
        <div className="mx-4 mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/50 px-4 py-3 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-sm">
          {toast}
        </div>
      )}

      {/* Student list */}
      <div className="px-4 mt-4 space-y-3.5">
        {filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-3" />
            <p className="font-bold text-slate-500 dark:text-slate-400">No students match this filter</p>
          </div>
        ) : (
          filteredStudents.map((student) => (
            <StudentCard
              key={student._id}
              student={student}
              notes={notes}
              onNote={onNote}
              onMark={onMark}
              savingId={savingId}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ProfileScreen({ user, onLogout }) {
  const { dark, toggle } = useTheme();
  const [showEdit, setShowEdit] = useState(false);
  const teacher = user?.teacherProfile;

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24 space-y-4">
      {showEdit && <ProfileEditModal onClose={() => setShowEdit(false)} />}

      {/* Profile Card */}
      <div className="rounded-3xl bg-slate-900 dark:bg-slate-800 p-6 text-white text-center shadow-sm">
        {user?.photo ? (
          <img src={user.photo} alt={user.name} className="mx-auto h-20 w-20 rounded-3xl object-cover ring-4 ring-white/10 shadow-md mb-3" />
        ) : (
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 text-2xl font-black text-white shadow-inner mb-3">
            {initials(user?.name)}
          </div>
        )}
        <h2 className="text-xl font-black">{user?.name}</h2>
        <p className="text-slate-400 text-xs mt-0.5">{teacher?.subject || "Teacher"}</p>
        <button
          onClick={() => setShowEdit(true)}
          className="mt-4 inline-flex items-center gap-1.5 rounded-2xl bg-white/10 hover:bg-white/20 px-4 py-2 text-xs font-bold text-white transition active:scale-95"
        >
          <UserPen className="h-3.5 w-3.5" /> Edit Profile
        </button>
      </div>

      {/* Details List */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 shadow-sm overflow-hidden">
        {[
          { label: "Email",   value: user?.email },
          { label: "Phone",   value: teacher?.contactInfo || user?.phone || "—" },
          { label: "Subject", value: teacher?.subject || "—" },
          { label: "Status",  value: user?.status || "active" }
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between px-4 py-3.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 text-right max-w-[60%] truncate">{value}</span>
          </div>
        ))}
      </div>

      {/* Dark mode toggle */}
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-4 py-3.5 shadow-sm"
      >
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
          {dark ? "Light Mode" : "Dark Mode"}
        </span>
        <div className={`relative h-6 w-11 rounded-full transition-colors ${dark ? "bg-slate-700" : "bg-slate-200"}`}>
          <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${dark ? "translate-x-5" : "translate-x-0.5"}`} />
        </div>
      </button>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 py-3.5 text-rose-600 dark:text-rose-400 font-bold text-xs active:scale-98 transition"
      >
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </div>
  );
}

// -- main component ------------------------------------------------------------

export default function MobileTeacherApp() {
  const { user, logout } = useAuth();
  const [screen, setScreen] = useState("attendance");
  const [data, setData] = useState(null);
  const [notes, setNotes] = useState({});
  const [savingId, setSavingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/teacher/dashboard");
      setData(res.data);
    } catch {
      // ignore silently on mobile retry
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMark = async (student, status) => {
    setSavingId(student._id);
    setToast("");
    try {
      await api.post("/teacher/attendance", {
        studentId: student._id,
        status,
        note: notes[student._id] || ""
      });

      setData((prev) => ({
        ...prev,
        students: (prev?.students || []).map((s) =>
          s._id === student._id
            ? { ...s, todayAttendance: { status, updatedAt: new Date() } }
            : s
        )
      }));

      setToast(`${student.name} marked ${status} ?`);
      setTimeout(() => setToast(""), 2500);
    } catch (err) {
      setToast(getApiError(err));
    } finally {
      setSavingId("");
    }
  };

  const handleNote = (studentId, note) => {
    setNotes((prev) => ({ ...prev, [studentId]: note }));
  };

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-950 font-sans max-w-md mx-auto relative overflow-hidden shadow-2xl">
      {/* Offline banner */}
      {!online && (
        <div className="bg-amber-500 px-4 py-1.5 text-center text-xs font-bold text-white flex items-center justify-center gap-1.5">
          <WifiOff className="h-3.5 w-3.5" /> Offline Mode
        </div>
      )}

      {/* Active Screen View */}
      {screen === "dashboard" && (
        <DashboardScreen data={data} onRefresh={loadData} loading={loading} />
      )}
      {screen === "attendance" && (
        <AttendanceScreen
          data={data}
          onMark={handleMark}
          savingId={savingId}
          notes={notes}
          onNote={handleNote}
          onRefresh={loadData}
          loading={loading}
          toast={toast}
        />
      )}
      {screen === "profile" && (
        <ProfileScreen user={user} onLogout={logout} />
      )}

      {/* Floating Bottom Nav Dock (Frosted Glass) */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 z-20">
        <div className="grid grid-cols-3 gap-1 max-w-xs mx-auto">
          {[
            { id: "attendance", label: "Attendance", icon: ClipboardCheck },
            { id: "dashboard",  label: "Stats",      icon: LayoutDashboard },
            { id: "profile",    label: "Profile",    icon: User }
          ].map(({ id, label, icon: Icon }) => {
            const active = screen === id;
            return (
              <button
                key={id}
                onClick={() => setScreen(id)}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all ${
                  active
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black shadow-sm scale-100"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold"
                }`}
              >
                <Icon className="h-4.5 w-4.5 mb-0.5" />
                <span className="text-[10px] tracking-wide">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
