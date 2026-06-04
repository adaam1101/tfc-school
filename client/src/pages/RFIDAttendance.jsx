import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2, CreditCard, RefreshCcw, ScanLine, XCircle } from "lucide-react";
import { api, getApiError } from "../api/http.js";
import ErrorAlert from "../components/ErrorAlert.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import AppLayout from "../layouts/AppLayout.jsx";

export default function RFIDAttendance() {
  const inputRef = useRef(null);
  const [cardId, setCardId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [lastStudent, setLastStudent] = useState(null);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const focusScanner = () => {
    inputRef.current?.focus();
  };

  const submitScan = async (value = cardId) => {
    const scannedCard = value.trim();
    if (!scannedCard || loading) return;

    setLoading(true);
    setError("");
    setMessage("");

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
      setMessage(data.message);
      setScans((current) => [scan, ...current].slice(0, 8));
      setCardId("");
    } catch (scanError) {
      const errorMessage = getApiError(scanError);
      setError(errorMessage);
      setScans((current) =>
        [
          {
            id: `${Date.now()}`,
            status: "error",
            message: errorMessage,
            time: new Date().toLocaleTimeString()
          },
          ...current
        ].slice(0, 8)
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

  return (
    <AppLayout
      title="RFID attendance"
      subtitle="Tap a student card with the scanner connected to this computer."
    >
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-md border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-md bg-teal-50 p-3 text-teal-800">
              <ScanLine className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Scanner station</h2>
              <p className="text-sm text-slate-500">Keep the cursor in the field, then tap the RFID card.</p>
            </div>
          </div>

          <ErrorAlert message={error} />
          {message ? (
            <div className="mt-4 flex items-start gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{message}</span>
            </div>
          ) : null}

          <label className="field mt-5">
            RFID card code
            <span className="relative">
              <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                ref={inputRef}
                className="input pl-10 text-lg"
                value={cardId}
                onChange={(event) => setCardId(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tap card or type card code"
                autoComplete="off"
              />
            </span>
          </label>

          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className="btn-primary" onClick={() => submitScan()} disabled={loading}>
              <ScanLine className="h-4 w-4" aria-hidden="true" />
              {loading ? "Scanning" : "Mark present"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setCardId("");
                setError("");
                setMessage("");
                focusScanner();
              }}
            >
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>

          <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-800">Demo test cards</p>
            <p className="mt-2 text-sm text-slate-600">Use these if you do not have a physical reader yet:</p>
            <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
              {["TFC1001", "TFC1002", "TFC1003"].map((demoCard) => (
                <button
                  key={demoCard}
                  type="button"
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 font-medium text-slate-700 hover:border-teal-300 hover:bg-teal-50"
                  onClick={() => submitScan(demoCard)}
                >
                  {demoCard}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6">
          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="text-lg font-semibold">Last scan</h2>
            {lastStudent ? (
              <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xl font-semibold text-slate-950">{lastStudent.name}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {lastStudent.studentProfile?.course || "Course"} | Parent:{" "}
                      {lastStudent.studentProfile?.parentPhone ||
                        lastStudent.studentProfile?.parentEmail ||
                        "No contact"}
                    </p>
                  </div>
                  <StatusBadge value="Present" />
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">No card scanned yet.</p>
            )}
          </div>

          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="text-lg font-semibold">Recent scans</h2>
            <div className="mt-4 grid gap-3">
              {scans.length ? (
                scans.map((scan) => (
                  <div key={scan.id} className="flex items-start gap-3 rounded-md border border-slate-200 p-3">
                    {scan.status === "success" ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
                    ) : (
                      <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-700" aria-hidden="true" />
                    )}
                    <div>
                      <p className="font-medium text-slate-900">
                        {scan.student?.name || scan.message}
                      </p>
                      <p className="text-sm text-slate-500">
                        {scan.time}
                        {scan.student?.studentProfile?.rfidCardLast4
                          ? ` | card ending ${scan.student.studentProfile.rfidCardLast4}`
                          : ""}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">Scans will appear here.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
