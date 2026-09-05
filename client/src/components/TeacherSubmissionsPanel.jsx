import React, { useEffect, useState } from "react";
import {
  Inbox,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  GraduationCap,
  Loader2,
  MessageSquare,
  Search,
  Sparkles,
  User,
  X
} from "lucide-react";
import { api, getApiError } from "../api/http.js";
import ErrorAlert from "./ErrorAlert.jsx";

export default function TeacherSubmissionsPanel() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reviewingItem, setReviewingItem] = useState(null);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [savingReview, setSavingReview] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const loadSubmissions = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/submissions/teacher?status=${statusFilter}`);
      setSubmissions(data.submissions || []);
    } catch (err) {
      setError(getApiError(err) || "Could not load submissions. Please click Refresh to try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [statusFilter]);

  const openReviewModal = (item) => {
    setReviewingItem(item);
    setGrade(item.grade || "");
    setFeedback(item.feedback || "");
  };

  const handleSaveReview = async (e) => {
    e.preventDefault();
    if (!reviewingItem) return;

    setSavingReview(true);
    try {
      const { data } = await api.put(`/submissions/${reviewingItem._id}/review`, {
        grade: grade.trim(),
        feedback: feedback.trim(),
        status: "reviewed"
      });

      setSubmissions((prev) =>
        prev.map((s) => (s._id === reviewingItem._id ? data.submission : s))
      );
      showToast(`Review and grade saved for ${reviewingItem.student?.name}!`);
      setReviewingItem(null);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSavingReview(false);
    }
  };

  const filtered = submissions.filter((s) => {
    const studentName = s.student?.name?.toLowerCase() || "";
    const title = (s.assignmentTitle || s.coursework?.title || "").toLowerCase();
    const query = search.toLowerCase();
    return studentName.includes(query) || title.includes(query);
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <ErrorAlert message={error} />

      {toast && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-emerald-800 dark:text-emerald-200 flex items-center gap-3 text-sm font-bold animate-fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          {toast}
        </div>
      )}

      {/* Header controls & filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name or assignment..."
            className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {["all", "submitted", "reviewed"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold capitalize transition-all ${
                statusFilter === status
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
              }`}
            >
              {status === "all" ? "All Submissions" : status === "submitted" ? "🟡 Pending Review" : "🟢 Reviewed"}
            </button>
          ))}
          <button
            type="button"
            onClick={loadSubmissions}
            className="rounded-xl px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500 mb-2" />
          <p className="text-xs text-slate-400 font-bold">Loading submissions...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 py-16 text-center">
          <Inbox className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No student work submitted yet</p>
          <p className="text-xs text-slate-400 mt-1">
            When students submit assignments or photos of their homework, they will appear here for your review!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => {
            const isReviewed = item.status === "reviewed";
            const submissionDate = new Date(item.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit"
            });

            return (
              <div
                key={item._id}
                className="flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/90 p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${
                    isReviewed ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />

                <div className="space-y-3">
                  {/* Student & Status header */}
                  <div className="flex items-start justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.student?.photo ? (
                        <img
                          src={item.student.photo}
                          alt={item.student.name}
                          className="h-10 w-10 rounded-2xl object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white font-black text-sm shadow-xs">
                          {item.student?.name?.[0]?.toUpperCase() || "S"}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                          {item.student?.name || "Student"}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {item.student?.studentProfile?.course || "Course"} · {submissionDate}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                        isReviewed
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 animate-pulse"
                      }`}
                    >
                      {isReviewed ? "Reviewed" : "Pending"}
                    </span>
                  </div>

                  {/* Assignment Title */}
                  <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/50 p-3 border border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-brand-600 dark:text-brand-400">
                      📝 {item.assignmentTitle || item.coursework?.title || "Homework Submission"}
                    </p>
                    {item.comment && (
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {item.comment}
                      </p>
                    )}
                  </div>

                  {/* Attachments preview */}
                  {item.attachments && item.attachments.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        📎 Attached Files ({item.attachments.length})
                      </p>
                      <div className="grid gap-2 grid-cols-2">
                        {item.attachments.map((att, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 p-2 border border-slate-200 dark:border-slate-700/60"
                          >
                            {att.fileType === "image" ? (
                              <a href={att.fileData} target="_blank" rel="noreferrer">
                                <img
                                  src={att.fileData}
                                  alt={att.fileName}
                                  className="h-8 w-8 rounded-lg object-cover border shrink-0 hover:scale-105 transition-transform"
                                />
                              </a>
                            ) : (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500 text-white font-black text-[10px]">
                                PDF
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                                {att.fileName}
                              </p>
                              <a
                                href={att.fileData}
                                download={att.fileName}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:underline"
                              >
                                <Download className="h-3 w-3" /> View / Save
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Teacher Feedback / Grade if already reviewed */}
                  {item.grade && (
                    <div className="rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/25 p-3 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase">
                          Grade & Feedback
                        </p>
                        <p className="text-xs text-emerald-900 dark:text-emerald-200 truncate">
                          {item.feedback || "Marked as reviewed"}
                        </p>
                      </div>
                      <span className="rounded-xl bg-emerald-600 text-white font-black px-2.5 py-1 text-xs shrink-0 shadow-2xs">
                        {item.grade}
                      </span>
                    </div>
                  )}
                </div>

                {/* Review action button */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {item.attachments?.length || 0} file(s)
                  </span>
                  <button
                    type="button"
                    onClick={() => openReviewModal(item)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:from-brand-700 hover:to-indigo-700 transition active:scale-95"
                  >
                    <GraduationCap className="h-3.5 w-3.5" />
                    {isReviewed ? "Edit Grade / Feedback" : "Grade & Review"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-150 dark:border-slate-800">
            <div className="bg-gradient-to-r from-brand-600 to-indigo-600 px-6 py-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-base">Grade & Feedback</h3>
                  <p className="text-xs text-indigo-100">
                    Reviewing work by {reviewingItem.student?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReviewingItem(null)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-3.5 border border-slate-200 dark:border-slate-700 text-xs">
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {reviewingItem.assignmentTitle || reviewingItem.coursework?.title}
                </p>
                {reviewingItem.comment && (
                  <p className="mt-1 text-slate-600 dark:text-slate-400 italic">
                    "{reviewingItem.comment}"
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Grade / Mark (e.g. 19/20, Excellent, A+)
                </label>
                <input
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="e.g. 18/20, A+, Excellent..."
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Teacher Observations / Feedback
                </label>
                <textarea
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Write constructive feedback, corrections, or praise for the student..."
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReviewingItem(null)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingReview}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:from-emerald-700 hover:to-teal-700 transition active:scale-95 disabled:opacity-50"
                >
                  {savingReview ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Save Grade & Feedback
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
