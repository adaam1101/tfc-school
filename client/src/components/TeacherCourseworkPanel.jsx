import React, { useEffect, useState } from "react";
import {
  BookOpen,
  ClipboardList,
  Loader2,
  Trash2,
  UploadCloud,
  X,
  FileText,
  Calendar,
  Sparkles,
  Paperclip,
  Download,
  GraduationCap,
  PlusCircle,
  Eye,
  Inbox
} from "lucide-react";
import { api, getApiError } from "../api/http.js";
import ErrorAlert from "./ErrorAlert.jsx";
import TeacherSubmissionsPanel from "./TeacherSubmissionsPanel.jsx";
import { compressImageFile } from "../utils/fileUpload.js";

export default function TeacherCourseworkPanel() {
  const [items, setItems] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [panelTab, setPanelTab] = useState("materials"); // "materials" | "submissions"
  const [pendingSubmissionsCount, setPendingSubmissionsCount] = useState(0);
  const [form, setForm] = useState({
    type: "lesson",
    title: "",
    body: "",
    dueDate: "",
    course: "",
    attachments: []
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const LEVEL_PRESETS = ["A1", "A2", "B1", "B2", "C1", "C2"];

  const load = async () => {
    try {
      const [courseworkRes, submissionsRes] = await Promise.all([
        api.get("/coursework"),
        api.get("/submissions/teacher").catch(() => ({ data: {} }))
      ]);
      setItems(courseworkRes.data.items || []);
      setPendingSubmissionsCount(submissionsRes.data.pendingCount || 0);
    } catch (err) {
      setError(getApiError(err));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      if (file.size > 15 * 1024 * 1024) {
        setError(`File "${file.name}" exceeds 15MB limit.`);
        continue;
      }

      const isImage = file.type.startsWith("image/");
      const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
      const fileType = isImage ? "image" : isPdf ? "pdf" : "file";

      try {
        const fileData = await compressImageFile(file, 1280, 1280, 0.82);
        setForm((prev) => ({
          ...prev,
          attachments: [
            ...prev.attachments,
            {
              fileName: file.name,
              fileType,
              fileData,
              fileSize: file.size
            }
          ]
        }));
      } catch (err) {
        console.error("File read error:", err);
      }
    }
    e.target.value = "";
  };

  const removeAttachment = (index) => {
    setForm((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      setError("Please provide a title and details.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await api.post("/coursework", form);
      setForm({ type: "lesson", title: "", body: "", dueDate: "", course: "", attachments: [] });
      await load();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this published lesson / assignment?")) return;
    try {
      await api.delete("/coursework/" + id);
      setItems((current) => current.filter((item) => item._id !== id));
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const filteredItems = items.filter((item) => {
    if (filterType === "all") return true;
    return item.type === filterType;
  });

  return (
    <div className="space-y-5">
      {/* Subtab switcher */}
      <div className="flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={() => setPanelTab("materials")}
          className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold transition-all ${
            panelTab === "materials"
              ? "bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md"
              : "border border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          <BookOpen className="h-4 w-4" /> Lessons & Materials ({items.length})
        </button>

        <button
          type="button"
          onClick={() => setPanelTab("submissions")}
          className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold transition-all ${
            panelTab === "submissions"
              ? "bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md"
              : "border border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          <Inbox className="h-4 w-4" /> Student Submissions
          {pendingSubmissionsCount > 0 && (
            <span className="rounded-full bg-amber-500 text-white px-2 py-0.5 text-[10px] font-black animate-pulse shadow-xs">
              {pendingSubmissionsCount} new
            </span>
          )}
        </button>
      </div>

      {panelTab === "submissions" ? (
        <TeacherSubmissionsPanel />
      ) : (
        <section className="grid gap-6 lg:grid-cols-[400px_1fr]">
          {/* ── Publish Form (Left Column) ─────────────────────────────────────── */}
          <form onSubmit={submit} className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-md space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm font-bold">
                <PlusCircle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">Publish for Students</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Share lessons, homework, pictures & PDFs</p>
              </div>
            </div>

            <ErrorAlert message={error} />

            {/* Type Switch Pills */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Type</span>
              <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-900/60 p-1 border border-slate-200/50 dark:border-slate-700/50 select-none">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: "lesson" })}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black transition-all ${
                    form.type === "lesson"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" /> Lesson
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: "assignment" })}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black transition-all ${
                    form.type === "assignment"
                      ? "bg-rose-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <ClipboardList className="h-3.5 w-3.5" /> Assignment
                </button>
              </div>
            </div>

            {/* Title Input */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                Title <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Unit 3 Vocabulary & Reading Notes"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-2.5 text-sm font-semibold text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Course / Level Filter & Quick Presets */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Target Course / Level
                </label>
                <span className="text-[10px] text-slate-400">Blank = All students</span>
              </div>
              <input
                type="text"
                placeholder="e.g. A1, A2, or English B1"
                value={form.course}
                onChange={(e) => setForm({ ...form, course: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-2.5 text-sm font-semibold text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />

              {/* Quick level pills */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[10px] font-bold text-slate-400">Quick:</span>
                {LEVEL_PRESETS.map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setForm({ ...form, course: form.course === lvl ? "" : lvl })}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                      form.course === lvl
                        ? "bg-indigo-600 text-white shadow-2xs"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date (Optional for assignments) */}
            {form.type === "assignment" && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Due Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            )}

            {/* Body / Description */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                Content / Instructions <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="Explain the lesson highlights, homework questions, or instructions..."
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 p-4 text-sm font-medium text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed"
              />
            </div>

            {/* Attachments Upload (Pictures & PDFs) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                Attach Files (Pictures / PDFs)
              </label>

              <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-900/30 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer group">
                <UploadCloud className="h-6 w-6 text-indigo-500 group-hover:scale-110 transition-transform mb-1.5" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Click or drag pictures / PDFs here
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, PDF (Up to 10MB)</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>

              {/* Selected Attachments list */}
              {form.attachments.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {form.attachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 p-2 border border-slate-200 dark:border-slate-700/60"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {att.fileType === "image" ? (
                          <img
                            src={att.fileData}
                            alt={att.fileName}
                            className="h-8 w-8 rounded-lg object-cover border shrink-0"
                          />
                        ) : (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500 text-white font-black text-[10px]">
                            PDF
                          </div>
                        )}
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                          {att.fileName}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(idx)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Remove attachment"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-brand-600 to-purple-600 p-3.5 text-sm font-bold text-white shadow-md hover:from-indigo-700 hover:to-purple-700 transition active:scale-98 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Publishing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Publish {form.type === "lesson" ? "Lesson" : "Assignment"}
                </>
              )}
            </button>
          </form>

          {/* ── Published Feed (Right Column) ─────────────────────────────────── */}
          <div className="space-y-4">
            {/* Filter Buttons */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200/50 dark:border-slate-700/50">
                {[
                  { id: "all", label: `All (${items.length})` },
                  { id: "lesson", label: "Lessons" },
                  { id: "assignment", label: "Assignments" }
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setFilterType(id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      filterType === id
                        ? "bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-300 shadow-xs"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 py-16 text-center">
                <BookOpen className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No coursework published yet</p>
                <p className="text-xs text-slate-400 mt-1">Use the form on the left to publish lessons and assignments.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredItems.map((item) => {
                  const isLesson = item.type === "lesson";
                  return (
                    <article
                      key={item._id}
                      className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-xs hover:shadow-md transition-all relative overflow-hidden"
                    >
                      <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${isLesson ? "bg-indigo-500" : "bg-rose-500"}`} />

                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                                isLesson
                                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                                  : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                              }`}
                            >
                              {item.type}
                            </span>
                            {item.course && (
                              <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                🎓 {item.course}
                              </span>
                            )}
                            {item.dueDate && (
                              <span className="rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 px-2.5 py-0.5 text-[10px] font-bold">
                                ⏰ Due {item.dueDate}
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-black text-slate-900 dark:text-white">{item.title}</h3>
                          <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {item.body}
                          </p>

                          {/* Render Attached Files */}
                          {item.attachments && item.attachments.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">
                                📎 Attached Resources ({item.attachments.length})
                              </p>
                              <div className="grid gap-2 sm:grid-cols-2">
                                {item.attachments.map((att, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-2 rounded-2xl bg-slate-50 dark:bg-slate-900/50 p-2.5 border border-slate-200 dark:border-slate-700/50 shadow-2xs"
                                  >
                                    {att.fileType === "image" ? (
                                      <a href={att.fileData} target="_blank" rel="noreferrer">
                                        <img
                                          src={att.fileData}
                                          alt={att.fileName}
                                          className="h-10 w-10 rounded-xl object-cover border shrink-0 hover:scale-105 transition-transform"
                                        />
                                      </a>
                                    ) : (
                                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500 text-white font-black text-[11px]">
                                        PDF
                                      </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                        {att.fileName}
                                      </p>
                                      <a
                                        href={att.fileData}
                                        download={att.fileName}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                                      >
                                        <Download className="h-3 w-3" /> View / Download
                                      </a>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => remove(item._id)}
                          className="shrink-0 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-400 transition-colors"
                          title="Delete published item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
