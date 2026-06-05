import React, { useRef } from "react";
import { X, Printer, CreditCard } from "lucide-react";
import { schoolLogo, schoolInfo } from "../config/branding.js";

/**
 * Printable student ID card. `student` is a user doc with name, email,
 * and studentProfile (course, rfidCardLast4, age, enrollmentDate).
 */
export default function IDCardModal({ student, onClose }) {
  const cardRef = useRef(null);
  const profile = student?.studentProfile || {};
  const initials = student?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
  const idNumber = (student?._id || "").toString().slice(-6).toUpperCase();

  const handlePrint = () => {
    const html = cardRef.current?.innerHTML;
    if (!html) return;
    const win = window.open("", "_blank", "width=560,height=380");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>TFC Student ID — ${student?.name || ""}</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body style="margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#e2e8f0;font-family:system-ui,sans-serif;">
          ${html}
          <script>window.onload = () => { setTimeout(() => { window.print(); }, 400); };</script>
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
            <CreditCard className="h-5 w-5 text-teal-600" />
            Student ID Card
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* The card itself (this exact markup is what gets printed) */}
        <div ref={cardRef}>
          <div
            style={{ width: "420px", maxWidth: "100%" }}
            className="mx-auto overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a1628] via-[#0f1f35] to-[#1a3a5c] text-white shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/10 px-5 py-3">
              <img src={schoolLogo} alt="TFC" className="h-10 w-10 rounded-lg bg-white/10 object-contain" />
              <div>
                <p className="text-sm font-black leading-tight">Training Formation Center</p>
                <p className="text-[10px] uppercase tracking-widest text-blue-300">Student Identity Card</p>
              </div>
            </div>

            {/* Body */}
            <div className="flex items-center gap-4 px-5 py-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-3xl font-black shadow-lg">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xl font-black">{student?.name}</p>
                <p className="text-sm text-blue-200">{profile.course || "—"}</p>
                <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-blue-200/80">
                  <span className="text-blue-400">ID No.</span>
                  <span className="font-mono font-bold text-white">TFC-{idNumber}</span>
                  <span className="text-blue-400">Age</span>
                  <span className="font-semibold text-white">{profile.age || "—"}</span>
                  {profile.rfidCardLast4 && (
                    <>
                      <span className="text-blue-400">RFID</span>
                      <span className="font-mono font-semibold text-white">…{profile.rfidCardLast4}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between bg-white/5 px-5 py-2.5 text-[10px] text-blue-300">
              <span>{schoolInfo.address}</span>
              <span>{schoolInfo.phones[0]}</span>
            </div>
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
