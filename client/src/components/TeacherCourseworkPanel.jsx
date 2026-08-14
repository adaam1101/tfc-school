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
  Eye
} from "lucide-react";
import { api, getApiError } from "../api/http.js";
import ErrorAlert from "./ErrorAlert.jsx";

export default function TeacherCourseworkPanel() {
  const [items, setItems] = useState([]);
  const [filterType, setFilterType] = useState("all");
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
      const { data } = await api.get("/coursework");
      setItems(data.items || []);
    } catch (err) {
      setError(getApiError(err));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        setError(`File "${file.name}" exceeds 10MB limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const fileData = event.target.result;
        const isImage = file.type.startsWith("image/");
        const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
        const fileType = isImage ? "image" : isPdf ? "pdf" : "file";

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
      };
      reader.readAsDataURL(file);
    });
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
          <div className="flex flex-wrap gap-1 mt-2">
            {LEVEL_PRESETS.map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setForm({ ...form, course: lvl })}
                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border transition-colors ${
                  form.course === lvl
                    ? "bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300"
                    : "bg-slate-100 dark:bg-slate-700/50 text-slate-500 border-slate-200 dark:border-slate-600 hover:bg-indigo-50"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Due Date (For Assignments) */}
        {form.type === "assignment" && (
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-2.5 text-sm font-semibold text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>
        )}

        {/* Details / Instructions Textarea */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
            Lesson Content / Instructions <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            placeholder="Type explanation, homework guidelines, exercises..."
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-3 text-sm text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[100px] resize-y"
          />
        </div>

        {/* File Dropzone & Attachment Previews (Pictures & PDFs) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
              <Paperclip className="h-3.5 w-3.5" /> Attachments ({form.attachments.length})
            </span>
            <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-700 dark:from-indigo-950/60 dark:to-purple-950/60 border border-indigo-200 dark:border-indigo-800 px-3 py-1.5 text-xs font-bold transition-all active:scale-95 shadow-2xs">
              <UploadCloud className="h-4 w-4" />
              <span>📷 Pictures / 📄 PDF</span>
              <input
                type="file"
                accept="image/*,.pdf,.docx,.txt"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
          </div>

          {form.attachments.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-2 mt-2">
              {form.attachments.map((att, idx) => (
                <div key={idx} className="relative flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-2 shadow-2xs group">
                  {att.fileType === "image" ? (
                    <img src={att.fileData} alt={att.fileName} className="h-10 w-10 rounded-lg object-cover border border-slate-200 shrink-0" />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500 text-white font-black text-xs">
                      PDF
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{att.fileName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {att.fileSize ? `${Math.round(att.fileSize / 1024)} KB` : att.fileType.toUpperCase()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(idx)}
                    className="flex h-6 w-6 items-center justify-center rounded-lg bg-white hover:bg-rose-100 hover:text-rose-600 text-slate-400 shadow-2xs transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 py-3 text-sm font-black text-white shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {saving ? "Publishing..." : "Publish to Students"}
        </button>
      </form>

      {/* ── Published Items Feed (Right Column) ────────────────────────────────── */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-md flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              Published Items ({items.length})
            </h2>
            <p className="text-xs text-slate-400">All active lessons, assignments & attachments visible to students</p>
          </div>

          {/* Filter Bar */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900/60 p-1 border border-slate-200/50 dark:border-slate-700/50">
            {[
              { id: "all", label: "All" },
              { id: "lesson", label: "📘 Lessons" },
              { id: "assignment", label: "📝 Assignments" }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterType(f.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterType === f.id
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 py-16 text-center text-slate-400">
            <BookOpen className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3 opacity-60" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No published items found</p>
            <p className="text-xs text-slate-400 mt-1">Use the form on the left to publish your first lesson or assignment.</p>
          </div>
        ) : (
          <div className="space-y-4 overflow-y-auto max-h-[750px] pr-1 scrollbar-thin">
            {filteredItems.map((item) => {
              const isLesson = item.type === "lesson";
              const formattedDate = new Date(item.createdAt).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric"
              });

              return (
                <article
                  key={item._id}
                  className={`relative overflow-hidden rounded-2xl border p-5 transition-all hover:shadow-md ${
                    isLesson
                      ? "border-indigo-150 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/20 dark:from-indigo-950/20 dark:to-slate-800"
                      : "border-rose-150 dark:border-rose-900/60 bg-gradient-to-br from-rose-50/40 via-white to-amber-50/20 dark:from-rose-950/20 dark:to-slate-800"
                  }`}
                >
                  {/* Status Strip */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                      isLesson ? "bg-indigo-500" : "bg-rose-500"
                    }`}
                  />

                  <div className="flex items-start justify-between gap-3 pl-2">
                    <div className="space-y-2 min-w-0 flex-1">
                      {/* Header Pills */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                            isLesson
                              ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                              : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                          }`}
                        >
                          {isLesson ? <BookOpen className="h-3 w-3" /> : <ClipboardList className="h-3 w-3" />}
                          {isLesson ? "Lesson" : "Assignment"}
                        </span>

                        {item.course && (
                          <span className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" /> {item.course}
                          </span>
                        )}

                        {item.dueDate && (
                          <span className="bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 px-2.5 py-0.5 rounded-lg text-[10px] font-black flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> Due: {item.dueDate}
                          </span>
                        )}

                        <span className="text-[10px] text-slate-400 ml-auto">{formattedDate}</span>
                      </div>

                      {/* Title & Body */}
                      <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {item.body}
                      </p>

                      {/* Display Uploaded Attachments (Pictures & PDFs) */}
                      {item.attachments && item.attachments.length > 0 && (
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                            Attached Resources ({item.attachments.length})
                          </span>

                          <div className="grid gap-2 sm:grid-cols-2">
                            {item.attachments.map((att, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900/60 p-2.5 shadow-2xs"
                              >
                                {att.fileType === "image" ? (
                                  <a href={att.fileData} target="_blank" rel="noreferrer" title="Click to view full picture">
                                    <img
                                      src={att.fileData}
                                      alt={att.fileName}
                                      className="h-11 w-11 rounded-lg object-cover border border-slate-200 shrink-0 hover:opacity-90 transition-opacity"
                                    />
                                  </a>
                                ) : (
                                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-rose-500 text-white font-black text-xs shadow-2xs">
                                    PDF
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{att.fileName}</p>
                                  <a
                                    href={att.fileData}
                                    download={att.fileName}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 mt-0.5"
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
  );
}
