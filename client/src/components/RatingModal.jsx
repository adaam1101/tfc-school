import React, { useEffect, useState } from "react";
import { X, MessageSquareText, Send } from "lucide-react";
import { api, getApiError } from "../api/http.js";
import StarRating from "./StarRating.jsx";

export default function RatingModal({ onClose }) {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/ratings/mine").then(({ data }) => {
      if (data.rating) { setStars(data.rating.stars); setComment(data.rating.comment || ""); }
    }).catch(() => {});
  }, []);

  const submit = async () => {
    if (!stars) return;
    setLoading(true); setError("");
    try {
      await api.post("/ratings", { stars, comment });
      setDone(true);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md animate-success-pop rounded-2xl bg-white p-8 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Rate TFC School</h2>
            <p className="mt-0.5 text-sm text-slate-500">Your feedback helps us improve</p>
          </div>
          <button onClick={onClose} className="rounded-xl border border-slate-200 p-2 text-slate-400 transition hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        {done ? (
          <div className="mt-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100"><span className="text-3xl">🎉</span></div>
            <p className="mt-4 text-lg font-bold text-slate-900">Thank you!</p>
            <p className="mt-1 text-sm text-slate-500">Your rating has been saved.</p>
            <button onClick={onClose} className="btn-primary mt-6 w-full justify-center">Close</button>
          </div>
        ) : (
          <>
            <div className="mt-8 flex flex-col items-center gap-3">
              <StarRating value={stars} onChange={setStars} size="xl" />
              <p className="text-sm font-medium text-slate-600">{["", "Poor", "Fair", "Good", "Very good", "Excellent!"][stars] || "Tap to rate"}</p>
            </div>
            <label className="field mt-6">
              <span className="flex items-center gap-2"><MessageSquareText className="h-4 w-4 text-slate-400" />Comment (optional)</span>
              <textarea className="input min-h-[90px] resize-none" value={comment} onChange={(e) => setComment(e.target.value.slice(0, 300))} placeholder="Share your experience with TFC…" maxLength={300} />
              <span className="text-right text-xs text-slate-400">{comment.length}/300</span>
            </label>
            {error && <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">{error}</p>}
            <button onClick={submit} disabled={!stars || loading} className="btn-primary mt-6 w-full justify-center">
              <Send className="h-4 w-4" />{loading ? "Submitting…" : "Submit rating"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
