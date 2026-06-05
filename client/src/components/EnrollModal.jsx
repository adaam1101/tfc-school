import React, { useState } from "react";
import { X, GraduationCap, CheckCircle2 } from "lucide-react";
import { api, getApiError } from "../api/http.js";
import { schoolInfo } from "../config/branding.js";

const initial = {
  name: "",
  phone: "",
  email: "",
  age: "",
  course: "",
  parentName: "",
  parentPhone: "",
  message: ""
};

export default function EnrollModal({ onClose }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (key) => (e) => setForm((c) => ({ ...c, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/enrollments", { ...form, age: form.age ? Number(form.age) : undefined });
      setDone(true);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg animate-fade-slide-up overflow-y-auto rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between bg-gradient-to-r from-teal-600 to-emerald-700 px-6 py-4 text-white">
          <h2 className="flex items-center gap-2 text-lg font-black">
            <GraduationCap className="h-5 w-5" />
            Apply to TFC
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 transition hover:bg-white/20">
            <X className="h-5 w-5" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 animate-success-pop" />
            <h3 className="mt-4 text-xl font-black text-slate-900">Application sent! 🎉</h3>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              Thank you for your interest in TFC. Our team will contact you soon at the number you provided.
            </p>
            <button onClick={onClose} className="btn-primary mt-6">Done</button>
          </div>
        ) : (
          <form className="grid gap-4 p-6" onSubmit={submit}>
            <p className="text-sm text-slate-500">
              Fill in the form and the TFC team will reach out. Fields marked * are required.
            </p>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700">
                {error}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="field">
                Full name *
                <input className="input" value={form.name} onChange={set("name")} required />
              </label>
              <label className="field">
                Phone *
                <input className="input" value={form.phone} onChange={set("phone")} required />
              </label>
              <label className="field">
                Email
                <input className="input" type="email" value={form.email} onChange={set("email")} />
              </label>
              <label className="field">
                Age
                <input className="input" type="number" min="3" max="80" value={form.age} onChange={set("age")} />
              </label>
              <label className="field sm:col-span-2">
                Course of interest *
                <input className="input" value={form.course} onChange={set("course")} placeholder="English, Computer skills…" required />
              </label>
              <label className="field">
                Parent name
                <input className="input" value={form.parentName} onChange={set("parentName")} />
              </label>
              <label className="field">
                Parent phone
                <input className="input" value={form.parentPhone} onChange={set("parentPhone")} />
              </label>
              <label className="field sm:col-span-2">
                Message (optional)
                <textarea className="input min-h-[80px]" value={form.message} onChange={set("message")} maxLength={600} placeholder="Anything you'd like us to know" />
              </label>
            </div>

            <button type="submit" className="btn-primary justify-center" disabled={loading}>
              <GraduationCap className="h-4 w-4" />
              {loading ? "Sending…" : "Submit application"}
            </button>

            <p className="text-center text-xs text-slate-400">
              Questions? Call {schoolInfo.phones[0]} or email {schoolInfo.email}
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
