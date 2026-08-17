import React, { useState } from "react";
import {
  X,
  UploadCloud,
  FileText,
  Trash2,
  Loader2,
  CheckCircle2,
  Sparkles,
  Paperclip,
  GraduationCap
} from "lucide-react";
import { api, getApiError } from "../api/http.js";
import ErrorAlert from "./ErrorAlert.jsx";

export default function StudentSubmissionModal({
  coursework,
  existingSubmission,
  onSuccess,
  onClose
}) {
  const [comment, setComment] = useState(existingSubmission?.comment || "");
  const [attachments, setAttachments] = useState(existingSubmission?.attachments || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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
    e.target.value = "";
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() && attachments.length === 0) {
      setError("Please write your answer or attach files (photos/PDF) before submitting.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        courseworkId: coursework?._id,
        assignmentTitle: coursework?.title || "Homework Submission",
        comment: comment.trim(),
        attachments
      };

      const { data } = await api.post("/submissions", payload);
      setSuccessMsg(data.message || "Submitted successfully!");
      if (onSuccess) onSuccess(data.submission);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setError(getApiError(err));
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-150 dark:border-slate-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-emerald-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-inner">
              <UploadCloud className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Submit Your Work</h3>
              <p className="text-xs text-indigo-100 font-medium">
                {coursework ? coursework.title : "Submit Homework / Assignment to Teacher"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <ErrorAlert message={error} />

          {successMsg && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-emerald-800 dark:text-emerald-200 flex items-center gap-3 text-sm font-bold animate-fade-in">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              {successMsg}
            </div>
          )}

          {coursework && (
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3.5 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300">
              <p className="font-bold text-slate-900 dark:text-white">{coursework.title}</p>
              <p className="mt-1 line-clamp-2 text-slate-500 dark:text-slate-400">{coursework.body}</p>
              {coursework.dueDate && (
                <p className="mt-1 font-bold text-rose-600 dark:text-rose-400">Due: {coursework.dueDate}</p>
              )}
            </div>
          )}

          {existingSubmission && existingSubmission.grade && (
            <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 p-4 border border-emerald-200 dark:border-emerald-800/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4" /> Teacher Review & Grade
                </span>
                <span className="rounded-xl bg-emerald-600 text-white font-black px-3 py-1 text-sm shadow-xs">
                  {existingSubmission.grade}
                </span>
              </div>
              {existingSubmission.feedback && (
                <p className="mt-2 text-xs text-emerald-900 dark:text-emerald-200 bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                  {existingSubmission.feedback}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Your Answer / Comments
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your answer, explanations, or notes for the teacher..."
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* File attachments dropzone */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Attach Work (Photos of notebook / PDFs / Documents)
            </label>
            <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 p-5 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition cursor-pointer group">
              <UploadCloud className="h-8 w-8 text-brand-500 group-hover:scale-110 transition-transform mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Click to upload photos or PDF files
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, PDF (Up to 10MB each)</p>
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>

            {/* Attached files preview list */}
            {attachments.length > 0 && (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 shadow-2xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {att.fileType === "image" ? (
                        <img
                          src={att.fileData}
                          alt={att.fileName}
                          className="h-8 w-8 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500 text-white font-black text-[10px]">
                          PDF
                        </div>
                      )}
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                        {att.fileName}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Remove file"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:from-brand-700 hover:to-emerald-700 transition active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <UploadCloud className="h-4 w-4" />{" "}
                  {existingSubmission ? "Update Submission" : "Submit Work"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
