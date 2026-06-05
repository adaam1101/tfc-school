import React, { useEffect, useState } from "react";
import { Megaphone, Pin } from "lucide-react";
import { api } from "../api/http.js";

const audienceBadge = {
  all: "bg-slate-100 text-slate-600",
  students: "bg-sky-100 text-sky-700",
  teachers: "bg-sky-100 text-sky-700"
};

export default function AnnouncementsCard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/announcements")
      .then(({ data }) => setItems(data.announcements || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="card p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 p-2.5 shadow-sm">
          <Megaphone className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Announcements</h2>
          <p className="text-sm text-slate-500">Latest news from TFC</p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : items.length ? (
        <div className="grid gap-3">
          {items.map((a) => (
            <div
              key={a._id}
              className={`rounded-xl border p-4 ${
                a.pinned ? "border-amber-200 bg-amber-50/60" : "border-slate-100 bg-slate-50/60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="flex items-center gap-1.5 font-bold text-slate-900">
                  {a.pinned && <Pin className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />}
                  {a.title}
                </h3>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${audienceBadge[a.audience] || audienceBadge.all}`}>
                  {a.audience}
                </span>
              </div>
              <p className="mt-1.5 whitespace-pre-line text-sm text-slate-600 leading-relaxed">{a.body}</p>
              <p className="mt-2 text-xs text-slate-400">
                {a.authorName ? `${a.authorName} · ` : ""}
                {new Date(a.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-8 text-center">
          <Megaphone className="h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm text-slate-500">No announcements yet</p>
        </div>
      )}
    </div>
  );
}
