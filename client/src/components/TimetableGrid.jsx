import React, { useMemo } from "react";
import { Clock } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const HOURS = Array.from({ length: 14 }, (_, i) => {
  const h = i + 7;
  return `${String(h).padStart(2, "0")}:00`;
});

const timeToMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
};

const slotStart = timeToMinutes("07:00");
const slotSpan  = 60;

export default function TimetableGrid({ schedules = [] }) {
  const byDay = useMemo(() => {
    const map = {};
    DAYS.forEach((d) => { map[d] = []; });
    schedules.forEach((s) => {
      if (map[s.day]) map[s.day].push(s);
    });
    return map;
  }, [schedules]);

  if (schedules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
        <Clock className="h-10 w-10 text-slate-300" />
        <p className="mt-3 text-sm font-medium text-slate-500">No schedule entries found</p>
        <p className="mt-1 text-xs text-slate-400">Classes will appear here once they are added</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `64px repeat(${DAYS.length}, minmax(110px, 1fr))`,
          minWidth: "680px"
        }}
      >
        {/* Header row */}
        <div className="bg-slate-50 p-3 text-xs font-bold text-slate-400 border-b border-r border-slate-100">
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
            <div className="border-b border-r border-slate-100 bg-white px-2 py-1 text-right text-[10px] font-mono text-slate-400">
              {hour}
            </div>
            {DAYS.map((day) => {
              const entries = byDay[day].filter((s) => {
                const startMin = timeToMinutes(s.startTime) - slotStart;
                return Math.floor(startMin / slotSpan) === rowIdx;
              });
              return (
                <div
                  key={`${day}-${hour}`}
                  className="relative border-b border-l border-slate-100 bg-white"
                  style={{ minHeight: "52px" }}
                >
                  {entries.map((s) => {
                    const startMin = timeToMinutes(s.startTime) - slotStart;
                    const endMin   = timeToMinutes(s.endTime)   - slotStart;
                    const rowSpan  = Math.max(1, Math.ceil((endMin - startMin) / slotSpan));
                    return (
                      <div
                        key={s._id}
                        className="absolute inset-x-1 top-1 z-10 overflow-hidden rounded-lg px-2 py-1 text-white shadow-sm"
                        style={{
                          backgroundColor: s.color || "#04436E",
                          height: `calc(${rowSpan * 52}px - 8px)`
                        }}
                        title={`${s.subject} ${s.startTime}–${s.endTime}${s.room ? " · " + s.room : ""}`}
                      >
                        <p className="truncate text-[11px] font-bold leading-tight">{s.subject}</p>
                        {s.teacher?.name && (
                          <p className="truncate text-[10px] opacity-85">{s.teacher.name}</p>
                        )}
                        {s.room && <p className="truncate text-[10px] opacity-75">{s.room}</p>}
                        <p className="text-[10px] opacity-75">{s.startTime}–{s.endTime}</p>
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
  );
}
