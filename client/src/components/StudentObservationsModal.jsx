import React, { useEffect, useState, useCallback } from "react";
import {
  X,
  FileText,
  Image as ImageIcon,
  FileCode,
  UploadCloud,
  Trash2,
  Download,
  Loader2,
  Plus,
  Calendar,
  BookOpen,
  Sparkles,
  Paperclip
} from "lucide-react";
import { api, getApiError } from "../api/http.js";
import ErrorAlert from "./ErrorAlert.jsx";

const CATEGORIES = [
  { id: "observation", label: "📝 Observation / Progress", color: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300" },
  { id: "homework",    label: "📚 Homework / Worksheet", color: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300" },
  { id: "resource",    label: "🖼️ Whiteboard / Material", color: "bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300" },
  { id: "general",     label: "💬 General Note",          color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" }
];

export default function StudentObservationsModal({ student, onClose }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [category, setCategory] = useState("observation");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState([]); // [{ fileName, fileType, fileData, fileSize }]
  const [showAddForm, setShowAddForm] = useState(true);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/teacher/students/${student._id}/notes`);
      setNotes(data.notes || []);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [student._id]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Handle local file selection (Images & PDFs)
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      // Check file size limit (max 10MB per file)
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

        setAttachments((prev) => [
          ...prev,
          {
            fileName: file.name,
            fileType,
            fileData,
            fileSize: file.size
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
    // Reset file input
    e.target.value = "";
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim() && !content.trim() && attachments.length === 0) {
      setError("Please enter a note, observation text, or attach a file.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await api.post(`/teacher/students/${student._id}/notes`, {
        category,
        title: title.trim(),
        content: content.trim(),
        attachments
      });

      // Reset form
      setTitle("");
      setContent("");
      setAttachments([]);
      await loadNotes();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Delete this observation and attached files?")) return;
    try {
      await api.delete(`/teacher/notes/${noteId}`);
      await loadNotes();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-800 shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-sm font-bold text-lg">
              📝
            </span>
            <div>
              <h3 className="font-black text-slate-900 dark:text-slate-100 text-base">{student.name}</h3>
              <p className="text-xs text-slate-400 font-semibold">
                Teacher Notes, Observations & Uploaded Resources ({student.studentProfile?.course || "Course"})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin">
          <ErrorAlert message={error} />

          {/* Add Observation / Upload Form */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-black text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                Add Observation or Attach Files (Pictures & PDFs)
              </h4>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              {/* Category Pills */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Category</span>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                        category === cat.id
                          ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Input */}
              <input
                type="text"
                placeholder="Title / Summary (e.g. Lesson 5 Progress Notes or Homework PDF)"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              {/* Observations Content Text Area */}
              <textarea
                placeholder="Write your observation remarks, student feedback, or notes here..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 min-h-[80px] resize-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
              />

              {/* Attachments Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                    <Paperclip className="h-3.5 w-3.5" /> Attachments ({attachments.length})
                  </span>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 px-3 py-1.5 text-xs font-bold transition-all active:scale-95">
                    <UploadCloud className="h-4 w-4" />
                    <span>📷 Picture / 📄 PDF</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </label>
                </div>

                {/* Attachment Previews */}
                {attachments.length > 0 && (
                  <div className="grid gap-2 sm:grid-cols-2 mt-2">
                    {attachments.map((att, idx) => (
                      <div key={idx} className="relative flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 shadow-2xs group">
                        {att.fileType === "image" ? (
                          <img src={att.fileData} alt={att.fileName} className="h-10 w-10 rounded-lg object-cover border border-slate-100 shrink-0" />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600 font-black text-xs">
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
                          className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-400 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {saving ? "Uploading..." : "Save Observation & Files"}
                </button>
              </div>
            </form>
          </div>

          {/* Timeline of Past Observations & Uploaded Files */}
          <div className="space-y-3">
            <h4 className="font-black text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wide flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-purple-500" />
              Observation History & Uploads ({notes.length})
            </h4>

            {loading ? (
              <p className="text-center text-xs text-slate-400 py-8">Loading observations…</p>
            ) : notes.length === 0 ? (
              <div className="text-center py-10 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold">No observations or uploaded files yet.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Use the form above to post teacher notes, pictures, or PDFs.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map((n) => {
                  const catObj = CATEGORIES.find((c) => c.id === n.category) || CATEGORIES[0];
                  const formattedDate = new Date(n.createdAt).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
                  });

                  return (
                    <div key={n._id} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-2xs space-y-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase ${catObj.color}`}>
                              {catObj.label}
                            </span>
                            {n.title && <h5 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{n.title}</h5>}
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium mt-1 flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {formattedDate}
                            {n.teacher?.name && ` · By ${n.teacher.name}`}
                          </p>
                        </div>

                        <button
                          onClick={() => handleDeleteNote(n._id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-rose-50 text-slate-350 hover:text-rose-600 transition-colors"
                          title="Delete note"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {n.content && (
                        <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {n.content}
                        </p>
                      )}

                      {/* Display Uploaded Attachments */}
                      {n.attachments && n.attachments.length > 0 && (
                        <div className="pt-2 grid gap-2 sm:grid-cols-2">
                          {n.attachments.map((att, idx) => (
                            <div key={idx} className="flex items-center gap-2.5 rounded-xl border border-slate-150 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-2.5">
                              {att.fileType === "image" ? (
                                <a href={att.fileData} target="_blank" rel="noreferrer">
                                  <img src={att.fileData} alt={att.fileName} className="h-11 w-11 rounded-lg object-cover border border-slate-200 shrink-0 hover:opacity-90 transition-opacity" />
                                </a>
                              ) : (
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-rose-500 text-white font-black text-xs shadow-xs">
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
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 mt-0.5"
                                >
                                  <Download className="h-3 w-3" /> View / Download
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
