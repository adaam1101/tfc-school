import React, { useRef } from "react";
import { X, Printer, CreditCard } from "lucide-react";
import { schoolLogo, schoolInfo } from "../config/branding.js";

/**
 * Printable ID card for a student or teacher.
 * `user` is a user doc with name, role, photo, and a profile
 * (studentProfile or teacherProfile) holding course/subject, dateOfBirth, etc.
 */
export default function IDCardModal({ user, student, onClose }) {
  const person = user || student; // backward compatible with old `student` prop
  const cardRef = useRef(null);

  const isTeacher = person?.role === "teacher";
  const profile = (isTeacher ? person?.teacherProfile : person?.studentProfile) || {};
  const initials = person?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
  const idNumber = (person?._id || "").toString().slice(-6).toUpperCase();
  const idPrefix = isTeacher ? "TFC-T" : "TFC-S";
  const roleLabel = isTeacher ? "Staff Identity Card" : "Student Identity Card";
  const courseOrSubject = isTeacher ? profile.subject : profile.course;
  const courseLabel = isTeacher ? "Subject" : "Course";
  const photo = person?.photo;

  const handlePrint = () => {
    const html = cardRef.current?.innerHTML;
    if (!html) return;
    const win = window.open("", "_blank", "width=560,height=380");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>TFC ID — ${person?.name || ""}</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body style="margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#e2e8f0;font-family:system-ui,sans-serif;">
          ${html}
          <script>window.onload = () => { setTimeout(() => { window.print(); }, 500); };</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md animate-fade-slide-up rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <CreditCard className="h-5 w-5 text-brand-600" />
            {isTeacher ? "Teacher ID Card" : "Student ID Card"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* The card itself (this exact markup is what gets printed) */}
        <div ref={cardRef}>
          <div
            style={{ width: "420px", maxWidth: "100%" }}
            className="relative mx-auto overflow-hidden rounded-2xl bg-gradient-to-br from-brand-100 via-brand-50 to-brand-200 shadow-xl"
          >
            {/* Watermark logo */}
            <img
              src={schoolLogo}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 m-auto h-56 w-56 object-contain opacity-[0.07] select-none"
            />

            {/* Top accent bar */}
            <div className="h-2 w-full bg-gradient-to-r from-brand-500 via-brand-700 to-brand-500" />

            {/* Header: logo + school name */}
            <div className="relative flex items-center gap-3 border-b border-brand-200 px-5 py-3">
              <img src={schoolLogo} alt="TFC" className="h-11 w-11 rounded-lg bg-white/80 object-contain shadow-sm ring-1 ring-brand-200" />
              <div>
                <p className="text-sm font-black leading-tight text-brand-900">{schoolInfo.name}</p>
                <p className="text-[10px] uppercase tracking-widest text-brand-600">{roleLabel}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-[9px] uppercase tracking-wider text-brand-500">Official ID</p>
                <p className="font-mono text-[11px] font-bold text-brand-800">{idPrefix}-{idNumber}</p>
              </div>
            </div>

            {/* Body: photo + details */}
            <div className="relative flex items-start gap-4 px-5 py-5">
              {/* Photo */}
              {photo ? (
                <img
                  src={photo}
                  alt={person?.name}
                  className="h-24 w-20 shrink-0 rounded-xl object-cover shadow-md ring-2 ring-brand-300"
                />
              ) : (
                <div className="flex h-24 w-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-3xl font-black text-white shadow-md ring-2 ring-brand-300">
                  {initials}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-black leading-tight text-brand-900">{person?.name}</p>
                <p className="mb-2 text-sm font-medium text-brand-600">{courseOrSubject || "—"}</p>
                <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[11px]">
                  <span className="text-brand-500">Date of birth</span>
                  <span className="font-semibold text-brand-900">{profile.dateOfBirth || "—"}</span>
                  <span className="text-brand-500">{courseLabel}</span>
                  <span className="font-semibold text-brand-900">{courseOrSubject || "—"}</span>
                  {!isTeacher && profile.rfidCardLast4 && (
                    <>
                      <span className="text-brand-500">RFID</span>
                      <span className="font-mono font-semibold text-brand-900">…{profile.rfidCardLast4}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="relative flex items-center justify-between border-t border-brand-200 bg-brand-100/70 px-5 py-2.5 text-[10px] text-brand-600">
              <span>{schoolInfo.address}</span>
              <span>{schoolInfo.phones?.[0]}</span>
            </div>

            {/* Bottom accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-brand-500 via-brand-700 to-brand-500" />
          </div>
        </div>

        <button onClick={handlePrint} className="btn-primary mt-6 w-full justify-center">
          <Printer className="h-4 w-4" />
          Print / Save as PDF
        </button>
      </div>
    </div>
  );
}
