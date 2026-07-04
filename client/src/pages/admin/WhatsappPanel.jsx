import React, { useState, useEffect, useCallback } from "react";
import { 
  MessageSquare, 
  QrCode, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  LogOut, 
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { api, getApiError } from "../../api/http.js";
import ErrorAlert from "../../components/ErrorAlert.jsx";

export default function WhatsappPanel() {
  const [statusData, setStatusData] = useState({ status: "DISCONNECTED", qr: null });
  const [loading, setLoading] = useState(true);
  const [initing, setIniting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Test message states
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState(
    `TFC School / مركز TFC:\n\n` +
    `Bonjour,\n` +
    `Nous vous informons que votre enfant était absent(e) aujourd'hui.\n` +
    `📞 Contact: 0561 502 098\n\n` +
    `السلام عليكم،\n` +
    `نحيطكم علماً بأن ابنكم/ابنتكم كان غائباً اليوم.\n` +
    `📞 للتواصل: 0561 502 098`
  );
  const [sendingTest, setSendingTest] = useState(false);

  const fetchStatus = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const { data } = await api.get("/admin/whatsapp/status");
      setStatusData(data);
      setError("");
    } catch (err) {
      setError(getApiError(err));
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  // Poll status every 4 seconds when connecting or waiting for QR scan
  useEffect(() => {
    fetchStatus(true);
    const interval = setInterval(() => {
      fetchStatus(false);
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleInit = async () => {
    setIniting(true);
    setError("");
    try {
      await api.post("/admin/whatsapp/init");
      await fetchStatus(true);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setIniting(false);
    }
  };

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to disconnect WhatsApp and clear the session?")) return;
    setLoggingOut(true);
    setError("");
    try {
      await api.post("/admin/whatsapp/logout");
      await fetchStatus(true);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoggingOut(false);
    }
  };

  const handleSendTest = async (e) => {
    e.preventDefault();
    if (!testPhone.trim() || !testMessage.trim()) return;
    setSendingTest(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/admin/whatsapp/test", {
        phone: testPhone.trim(),
        message: testMessage.trim()
      });
      setSuccess("Test WhatsApp message sent successfully!");
      setTestMessage("");
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSendingTest(false);
    }
  };

  const getStatusColor = () => {
    switch (statusData.status) {
      case "CONNECTED":
        return "bg-emerald-500 text-white";
      case "CONNECTING":
        return "bg-amber-500 text-white";
      default:
        return "bg-slate-400 text-white";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-emerald-600" /> WhatsApp Notifications
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure free automated WhatsApp notifications for student absences.
          </p>
        </div>
        <button
          onClick={() => fetchStatus(true)}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <ErrorAlert message={error} />
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 px-4 py-3 text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> {success}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Status Widget */}
        <div className="md:col-span-2 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm flex flex-col justify-between min-h-[300px]">
          <div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor()}`}>
              {statusData.status === "CONNECTED" ? (
                <>
                  <Wifi className="h-3.5 w-3.5" /> Connected
                </>
              ) : statusData.status === "CONNECTING" ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Connecting
                </>
              ) : (
                <>
                  <WifiOff className="h-3.5 w-3.5" /> Disconnected
                </>
              )}
            </span>

            <div className="mt-4 space-y-2">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                {statusData.status === "CONNECTED" 
                  ? "Notifications are Active" 
                  : statusData.status === "CONNECTING"
                  ? "Connecting to WhatsApp Web..."
                  : "WhatsApp Integration Disabled"}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {statusData.status === "CONNECTED"
                  ? "Your server is linked to a WhatsApp Web instance. Absence alerts will be automatically sent from your number to parents."
                  : statusData.status === "CONNECTING"
                  ? "Retrieving link credentials. Please wait or scan the QR code if visible."
                  : "To enable free alerts, click below to initialize and connect your school's WhatsApp phone number."}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {statusData.status === "DISCONNECTED" ? (
              <button
                onClick={handleInit}
                disabled={initing}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-md hover:from-emerald-700 hover:to-emerald-800 transition-all disabled:opacity-50"
              >
                {initing ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <MessageSquare className="h-4.5 w-4.5" />}
                Connect WhatsApp
              </button>
            ) : (
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 px-5 py-3 text-sm font-bold hover:bg-rose-100 transition-all disabled:opacity-50"
              >
                {loggingOut ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <LogOut className="h-4.5 w-4.5" />}
                Disconnect Account
              </button>
            )}
          </div>
        </div>

        {/* QR Code Scan Panel */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
          {statusData.qr ? (
            <div className="space-y-4 text-center">
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5">
                <QrCode className="h-4 w-4 text-emerald-600" /> Scan QR Code
              </h4>
              <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm inline-block mx-auto">
                <img src={statusData.qr} alt="WhatsApp Web QR Code" className="h-44 w-44" />
              </div>
              <p className="text-xs text-slate-500 max-w-[200px] mx-auto">
                Open WhatsApp on your phone, go to Linked Devices, and scan this code.
              </p>
            </div>
          ) : statusData.status === "CONNECTED" ? (
            <div className="text-center space-y-3">
              <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-950/50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Already Linked</h4>
              <p className="text-xs text-slate-500 max-w-[200px] mx-auto">
                Your device is successfully linked and active. No scan is required.
              </p>
            </div>
          ) : (
            <div className="text-center space-y-3">
              <div className="h-16 w-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center text-slate-400 mx-auto animate-pulse">
                <QrCode className="h-8 w-8" />
              </div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">QR Code Scanner</h4>
              <p className="text-xs text-slate-500 max-w-[200px] mx-auto">
                Initialize the client to generate a connection QR code.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Test Message Console */}
      {statusData.status === "CONNECTED" && (
        <form onSubmit={handleSendTest} className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm space-y-4 max-w-xl">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Send Test WhatsApp Message</h3>
            <p className="text-xs text-slate-500">Verify your connection by sending a quick message manually.</p>
          </div>

          <div className="space-y-3">
            <label className="block">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Recipient Phone Number</span>
              <input
                type="tel"
                required
                placeholder="e.g. 0561502098 or +213561502098"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-slate-200"
              />
            </label>

            <label className="block">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Message Content</span>
              <textarea
                required
                rows="3"
                placeholder="Hello from TFC School portal!"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-slate-200"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={sendingTest || !testPhone.trim() || !testMessage.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50"
          >
            {sendingTest ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send Test
          </button>
        </form>
      )}
    </div>
  );
}
