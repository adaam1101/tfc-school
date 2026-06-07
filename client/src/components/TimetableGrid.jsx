import React, { useMemo } from "react";
import { Clock, MapPin, User } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT = { Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu", Friday: "Fri", Saturday: "Sat" };

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 07:00 → 19:00
const GRID_START = 7 * 60;
const CELL_H = 60; // px per hour row

const timeToMin = (t) => {
  const [h, m] = (t || "0:0").split(":").map(Number);
  return h * 60 + (m || 0);
};

const GRADIENTS = [
  "from-brand-500 to-brand-700",
  "from-violet-500 to-purple-700",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-500",
  "from-sky-500 to-blue-600",
  "from-indigo-500 to-indigo-700",
  "from-fuchsia-500 to-purple-600",
];

function pickGradient(str = "") {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return GRADIENTS[Math.abs(h) % GRADIENTS.length];
}

function getWeekDates() {
  const now = new Date();
  const dow = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));
  return DAYS.map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function getTodayName() {
  return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date().getDay()];
}

function getNowMin() {
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes();
}

export default function TimetableGrid({ schedules = [] }) {
  const byDay = useMemo(() => {
    const map = {};
    DAYS.forEach((d) => { map[d] = []; });
    schedules.forEach((s) => { if (map[s.day]) map[s.day].push(s); });
    return map;
  }, [schedules]);

  const weekDates = useMemo(getWeekDates, []);
  const today = getTodayName();
  const nowMin = getNowMin();
  const showNow = DAYS.includes(today) && nowMin >= GRID_START && nowMin < GRID_START + 13 * 60;
  const nowOffsetPx = ((nowMin - GRID_START) / 60) * CELL_H;

  if (schedules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900 dark:to-brand-800">
          <Clock className="h-8 w-8 text-brand-500" />
        </div>
        <p className="mt-4 text-base font-bold text-slate-600 dark:text-slate-400">No classes scheduled yet</p>
        <p className="mt-1 text-sm text-slate-400">Classes will appear here once added</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900">
      <div style={{ minWidth: "680px" }}>

        {/* ── Day header row ── */}
        <div className="grid border-b border-slate-200 dark:border-slate-700"
          style={{ gridTemplateColumns: `52px repeat(${DAYS.length}, 1fr)` }}>
          <div className="flex items-center justify-center border-r border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-4">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
          </div>
          {DAYS.map((day, i) => {
            const date = weekDates[i];
            const isToday = day === today;
            return (
              <div key={day} className={`flex flex-col items-center py-3 border-l border-slate-100 dark:border-slate-800 ${isToday ? "bg-brand-50 dark:bg-brand-950/30" : "bg-slate-50 dark:bg-slate-800"}`}>
                <span className={`text-[10px] font-extrabold uppercase tracking-widest ${isToday ? "text-brand-500" : "text-slate-400"}`}>
                  {DAY_SHORT[day]}
                </span>
                <span className={`mt-1 flex h-7 w-7 items-center justify-center rounded-full text-sm font-black ${isToday ? "bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm" : "text-slate-600 dark:text-slate-300"}`}>
                  {date.getDate()}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── Time grid body ── */}
        <div className="relative">
          {/* Background rows */}
          <div className="grid" style={{ gridTemplateColumns: `52px repeat(${DAYS.length}, 1fr)` }}>
            {HOURS.map((h) => (
              <React.Fragment key={h}>
                {/* Time label */}
                <div
                  className="border-r border-slate-100 dark:border-slate-800 flex items-start justify-end pr-2 pt-1"
                  style={{ height: `${CELL_H}px` }}
                >
                  <span className="text-[10px] font-mono font-semibold text-slate-400 dark:text-slate-600 select-none">
                    {String(h).padStart(2, "0")}:00
                  </span>
                </div>
                {/* Day cells */}
                {DAYS.map((day) => (
                  <div
                    key={`${day}-${h}`}
                    className={`border-l border-t border-slate-100 dark:border-slate-800 ${day === today ? "bg-brand-50/20 dark:bg-brand-950/10" : ""}`}
                    style={{ height: `${CELL_H}px` }}
                  />
                ))}
              </React.Fragment>
            ))}
          </div>

          {/* ── Now indicator ── */}
          {showNow && (
            <div
              className="pointer-events-none absolute left-[52px] right-0 z-30 flex items-center"
              style={{ top: `${nowOffsetPx}px` }}
            >
              <div className="h-3 w-3 rounded-full bg-rose-500 shadow shadow-rose-300 dark:shadow-rose-900 -ml-1.5 shrink-0 animate-pulse" />
              <div className="h-px flex-1 bg-gradient-to-r from-rose-400 to-rose-300 dark:from-rose-500 dark:to-rose-700" />
            </div>
          )}

          {/* ── Events overlay ── */}
          <div
            className="absolute inset-0 grid pointer-events-none"
            style={{ gridTemplateColumns: `52px repeat(${DAYS.length}, 1fr)` }}
          >
            {/* spacer for time column */}
            <div />

            {DAYS.map((day) => (
              <div key={day} className="relative">
                {byDay[day].map((s) => {
                  const startMin = timeToMin(s.startTime);
                  const endMin   = timeToMin(s.endTime);
                  const top      = ((startMin - GRID_START) / 60) * CELL_H;
                  const height   = Math.max(28, ((endMin - startMin) / 60) * CELL_H - 4);
                  const duration = endMin - startMin;
                  const gradient = pickGradient(s.subject);

                  return (
                    <div
                      key={s._id}
                      className="pointer-events-auto absolute inset-x-1 z-10"
                      style={{ top: `${top + 2}px`, height: `${height}px` }}
                    >
                      <div
                        className={`h-full w-full overflow-hidden rounded-xl bg-gradient-to-br ${gradient} px-2.5 py-1.5 text-white shadow-md transition-all hover:shadow-lg hover:scale-[1.02] cursor-default`}
                        title={`${s.subject} · ${s.startTime}–${s.endTime}${s.room ? " · " + s.room : ""}`}
                      >
                        <p className="truncate text-[11px] font-black leading-snug">{s.subject}</p>

                        {duration >= 40 && (
                          <div className="mt-0.5 flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5 shrink-0 opacity-80" />
                            <span className="text-[9px] font-bold opacity-90">{s.startTime}–{s.endTime}</span>
                          </div>
                        )}

                        {s.teacher?.name && duration >= 60 && (
                          <div className="mt-0.5 flex items-center gap-1 opacity-85">
                            <User className="h-2.5 w-2.5 shrink-0" />
                            <span className="truncate text-[9px] font-semibold">{s.teacher.name}</span>
                          </div>
                        )}

                        {s.room && duration >= 80 && (
                          <div className="mt-0.5 flex items-center gap-1 opacity-70">
                            <MapPin className="h-2.5 w-2.5 shrink-0" />
                            <span className="truncate text-[9px]">{s.room}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
