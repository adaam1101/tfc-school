import React, { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  RefreshCcw,
  ScanLine,
  Wifi,
  XCircle,
  UserRound,
  Clock
} from "lucide-react";
import { api, getApiError } from "../api/http.js";
import AppLayout from "../layouts/AppLayout.jsx";

/* scan status: 'idle' | 'scanning' | 'success' | 'error' */

export default function RFIDAttendance() {
  const inputRef = useRef(null);
  const [cardId, setCardId] = useState("");
  const [scanStatus, setScanStatus] = useState("idle");  // idle | scanning | success | error
  const [lastStudent, setLastStudent] = useState(null);
  const [resultMessage, setResultMessage] = useState("");
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(false);

  const focusScanner = () => inputRef.current?.focus();

  useEffect(() => {
    focusScanner();
  }, []);

  /* Auto-reset idle state after 4s */
  useEffect(() => {
    if (scanStatus === "success" || scanStatus === "error") {
      const timer = setTimeout(() => setScanStatus("idle"), 4000);
      return () => clearTimeout(timer);
    }
  }, [scanStatus]);

  const submitScan = async (value = cardId) => {
    const scannedCard = value.trim();
    if (!scannedCard || loading) return;

    setLoading(true);
    setScanStatus("scanning");
    setResultMessage("");

    try {
      const { data } = await api.post("/rfid/scan", { cardId: scannedCard });
      const scan = {
        id: `${Date.now()}`,
        status: "success",
        student: data.student,
        message: data.message,
        time: new Date().toLocaleTimeString()
      };

      setLastStudent(data.student);
      setResultMessage(data.message);
      setScanStatus("success");
      setScans((current) => [scan, ...current].slice(0, 10));
      setCardId("");
    } catch (scanError) {
      const errorMessage = getApiError(scanError);
      setResultMessage(errorMessage);
      setScanStatus("error");
      setScans((current) =>
        [
          {
            id: `${Date.now()}`,
            status: "error",
            message: errorMessage,
            time: new Date().toLocaleTimeString()
          },
          ...current
        ].slice(0, 10)
      );
    } finally {
      setLoading(false);
      setTimeout(focusScanner, 50);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submitScan(event.currentTarget.value);
    }
  };

  const reset = () => {
    setCardId("");
    setResultMessage("");
    setScanStatus("idle");
    focusScanner();
  };

  /* Ring + icon styles by status */
  const zoneConfig = {
    idle: {
      ring: "border-sky-300/60",
      bg: "bg-sky-50/60",
      icon: "text-sky-500",
      label: "Ready to scan",
      sub: "Hold RFID card near reader",
      ringClass: "scan-ring-1 border-sky-400/50 bg-sky-400/10",
      ringClass2: "scan-ring-2 border-sky-400/30 bg-transparent",
      ringClass3: "scan-ring-3 border-sky-400/20 bg-transparent"
    },
    scanning: {
      ring: "border-sky-400",
      bg: "bg-sky-50",
      icon: "text-sky-500 animate-spin-slow",
      label: "Scanning…",
      sub: "Reading card data",
      ringClass: "scan-ring-fast-1 border-sky-400/60 bg-sky-400/10",
      ringClass2: "scan-ring-fast-2 border-sky-400/40 bg-transparent",
      ringClass3: "scan-ring-fast-3 border-sky-400/20 bg-transparent"
    },
    success: {
      ring: "border-emerald-400",
      bg: "bg-emerald-50",
      icon: "text-emerald-500",
      label: "Card accepted!",
      sub: "Attendance marked present",
      ringClass: "scan-ring-1 border-emerald-400/50 bg-emerald-400/10",
      ringClass2: "scan-ring-2 border-emerald-400/30 bg-transparent",
      ringClass3: "scan-ring-3 border-emerald-400/20 bg-transparent"
    },
    error: {
      ring: "border-rose-400",
      bg: "bg-rose-50",
      icon: "text-rose-500",
      label: "Scan failed",
      sub: resultMessage,
      ringClass: "scan-ring-1 border-rose-400/50 bg-rose-400/10",
      ringClass2: "scan-ring-2 border-rose-400/30 bg-transparent",
      ringClass3: "scan-ring-3 border-rose-400/20 bg-transparent"
    }
  };

  const z = zoneConfig[scanStatus];

  return (
    <AppLayout
      title="RFID Attendance"
      subtitle="Tap a student card on the reader connected to this computer."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">

        {/* ── Left: Scan Station ── */}
        <section className="card p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-sky-500 to-emerald-600 p-2.5 shadow-sm">
              <ScanLine className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Scanner Station</h2>
              <p className="text-sm text-slate-500">Keep focus here, then tap the RFID card.</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Wifi className="h-3 w-3" />
              Live
            </div>
          </div>

          {/* Animated scan zone */}
          <div
            className="relative mx-auto flex h-56 w-56 cursor-pointer items-center justify-center"
            onClick={focusScanner}
          >
            {/* Animated rings */}
            <span
              className={`absolute inset-0 rounded-full border-2 ${z.ringClass}`}
              style={{ animationDuration: scanStatus === "scanning" ? "0.8s" : "1.6s" }}
            />
            <span
              className={`absolute inset-0 rounded-full border-2 ${z.ringClass2}`}
              style={{ animationDuration: scanStatus === "scanning" ? "0.8s" : "1.6s" }}
            />
            <span
              className={`absolute inset-0 rounded-full border-2 ${z.ringClass3}`}
              style={{ animationDuration: scanStatus === "scanning" ? "0.8s" : "1.6s" }}
            />

            {/* Core circle */}
            <div
              className={`relative flex h-40 w-40 flex-col items-center justify-center rounded-full border-4 ${z.ring} ${z.bg} transition-all duration-500`}
            >
              {scanStatus === "success" ? (
                <CheckCircle2 className={`h-14 w-14 ${z.icon} animate-success-pop`} />
              ) : scanStatus === "error" ? (
                <XCircle className={`h-14 w-14 ${z.icon}`} />
              ) : (
                <CreditCard className={`h-14 w-14 ${z.icon} transition-all duration-300`} />
              )}
            </div>
          </div>

          {/* Status text */}
          <div className="mt-5 text-center">
            <p className={`text-lg font-bold transition-all duration-300 ${
              scanStatus === "success" ? "text-emerald-700"
              : scanStatus === "error" ? "text-rose-700"
              : scanStatus === "scanning" ? "text-sky-700"
              : "text-slate-700"
            }`}>
              {z.label}
            </p>
            {z.sub && (
              <p className="mt-1 text-sm text-slate-500 max-w-xs mx-auto">{z.sub}</p>
            )}
          </div>

          {/* Hidden keyboard-wedge input */}
          <input
            ref={inputRef}
            className="sr-only"
            value={cardId}
            onChange={(event) => setCardId(event.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            aria-label="RFID card input"
          />

          {/* Manual input fallback */}
          <div className="mt-6">
            <label className="field">
              <span className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-slate-400" />
                Manual card code (if no physical reader)
              </span>
              <div className="flex gap-2">
                <input
                  className="input"
                  value={cardId}
                  onChange={(event) => setCardId(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type card code and press Enter"
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="btn-primary shrink-0"
                  onClick={() => submitScan()}
                  disabled={loading || !cardId.trim()}
                >
                  <ScanLine className="h-4 w-4" />
                  {loading ? "…" : "Scan"}
                </button>
              </div>
            </label>
          </div>

          {/* Reset */}
          {scanStatus !== "idle" && (
            <button
              type="button"
              className="btn-secondary mt-3 w-full justify-center"
              onClick={reset}
            >
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
              Reset scanner
            </button>
          )}

          {/* Demo cards */}
          <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Demo test cards</p>
            <p className="mt-1.5 text-xs text-slate-500">No physical reader? Use these:</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {["TFC1001", "TFC1002", "TFC1003"].map((demoCard) => (
                <button
                  key={demoCard}
                  type="button"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 hover:shadow-md"
                  onClick={() => submitScan(demoCard)}
                  disabled={loading}
                >
                  {demoCard}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Right: Results ── */}
        <section className="grid gap-5 content-start">

          {/* Last scan result */}
          <div className="card p-6">
            <h2 className="mb-4 text-lg font-bold flex items-center gap-2">
              <UserRound className="h-5 w-5 text-slate-400" />
              Last scan result
            </h2>

            {lastStudent && scanStatus !== "error" ? (
              <div className="animate-success-pop rounded-2xl bg-gradient-to-br from-emerald-50 to-sky-50 border border-emerald-200 p-5">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-600 text-2xl font-bold text-white shadow-md">
                    {lastStudent.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-xl font-bold text-slate-900">{lastStudent.name}</p>
                    <p className="mt-0.5 text-sm text-slate-600">
                      {lastStudent.studentProfile?.course || "Course"}
                    </p>
                    {lastStudent.studentProfile?.rfidCardLast4 && (
                      <p className="mt-0.5 text-xs text-slate-500">
                        Card ending …{lastStudent.studentProfile.rfidCardLast4}
                      </p>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Present
                  </span>
                </div>

                {lastStudent.studentProfile?.parentPhone || lastStudent.studentProfile?.parentEmail ? (
                  <div className="mt-4 rounded-xl border border-emerald-200 bg-white/60 px-4 py-2.5 text-sm text-slate-600">
                    Parent contact:{" "}
                    <span className="font-medium">
                      {lastStudent.studentProfile.parentPhone || lastStudent.studentProfile.parentEmail}
                    </span>
                  </div>
                ) : null}
              </div>
            ) : scanStatus === "error" ? (
              <div className="animate-fade-in rounded-2xl border border-rose-200 bg-rose-50 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100">
                    <XCircle className="h-6 w-6 text-rose-600" />
                  </div>
                  <div>
                    <p className="font-bold text-rose-800">Scan failed</p>
                    <p className="mt-0.5 text-sm text-rose-600">{resultMessage}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-10 text-center">
                <CreditCard className="h-10 w-10 text-slate-300" />
                <p className="mt-3 text-sm font-medium text-slate-500">No card scanned yet</p>
                <p className="mt-1 text-xs text-slate-400">Tap a card to see the result here</p>
              </div>
            )}
          </div>

          {/* Recent scans */}
          <div className="card p-6">
            <h2 className="mb-4 text-lg font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-slate-400" />
              Recent scans
              {scans.length > 0 && (
                <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                  {scans.length}
                </span>
              )}
            </h2>

            <div className="grid gap-2">
              {scans.length ? (
                scans.map((scan, i) => (
                  <div
                    key={scan.id}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all duration-200 ${
                      scan.status === "success"
                        ? "border-emerald-100 bg-emerald-50"
                        : "border-rose-100 bg-rose-50"
                    }`}
                    style={{ animationDelay: `${i * 0.03}s` }}
                  >
                    {scan.status === "success" ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                    ) : (
                      <XCircle className="h-5 w-5 shrink-0 text-rose-600" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold truncate ${scan.status === "success" ? "text-emerald-900" : "text-rose-900"}`}>
                        {scan.student?.name || scan.message}
                      </p>
                      {scan.student?.studentProfile?.course && (
                        <p className="text-xs text-slate-500">{scan.student.studentProfile.course}</p>
                      )}
                    </div>
                    <span className="shrink-0 text-xs text-slate-400 font-mono">{scan.time}</span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-8 text-center">
                  <ScanLine className="h-8 w-8 text-slate-300" />
                  <p className="mt-2 text-sm text-slate-500">Scans will appear here</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
