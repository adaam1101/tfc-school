import React, { useState, useEffect } from "react";
import {
  Wallet,
  Check,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Save,
  AlertCircle,
  Receipt
} from "lucide-react";
import { api, getApiError } from "../api/http.js";
import DigitalReceiptModal from "./DigitalReceiptModal.jsx";

/**
 * StudentPaymentRowWidget
 * 
 * Interactive payment widget placed beside each student:
 * - Default Tuition: 7,500 DA
 * - Paid input: blank / amount (e.g. 4,000 DA)
 * - Rest: automatically computed (e.g. 3,500 DA)
 * - Assurance: 800 DA (toggle: paid/unpaid)
 */
export default function StudentPaymentRowWidget({
  student,
  month, // e.g. "2026-08"
  initialPayment,
  compact = false,
  onPaymentUpdated
}) {
  const currentMonth = month || new Date().toISOString().slice(0, 7);

  const defaultTuition = 7500;
  const assuranceFee = 800;

  const [tuitionFee, setTuitionFee] = useState(
    initialPayment?.amount != null ? initialPayment.amount : defaultTuition
  );
  const [paidInput, setPaidInput] = useState(
    initialPayment?.paidAmount != null ? String(initialPayment.paidAmount) : "0"
  );
  const [assurancePaid, setAssurancePaid] = useState(
    Boolean(initialPayment?.assurancePaid)
  );

  const [savedPaymentRecord, setSavedPaymentRecord] = useState(initialPayment || null);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);

  // Sync if initialPayment changes
  useEffect(() => {
    if (initialPayment) {
      setSavedPaymentRecord(initialPayment);
      setTuitionFee(initialPayment.amount != null ? initialPayment.amount : defaultTuition);
      setPaidInput(initialPayment.paidAmount != null ? String(initialPayment.paidAmount) : "0");
      setAssurancePaid(Boolean(initialPayment.assurancePaid));
      setHasChanges(false);
    }
  }, [initialPayment]);

  const numPaid = Math.max(0, parseInt(paidInput, 10) || 0);
  const restAmount = Math.max(0, (Number(tuitionFee) || defaultTuition) - numPaid);

  const handlePaidChange = (val) => {
    const clean = val.replace(/\D/g, "");
    setPaidInput(clean);
    setHasChanges(true);
  };

  const handleAssuranceToggle = () => {
    setAssurancePaid((prev) => !prev);
    setHasChanges(true);
  };

  const savePayment = async () => {
    setSaving(true);
    setError("");
    try {
      const sId = student?._id || student?.id || student;
      if (!sId) return null;

      const payload = {
        studentId: sId,
        month: currentMonth,
        amount: Number(tuitionFee) || defaultTuition,
        paidAmount: numPaid,
        assurancePaid: Boolean(assurancePaid)
      };

      const { data } = await api.post("/payments/quick", payload);
      setSavedPaymentRecord(data.payment);
      setJustSaved(true);
      setHasChanges(false);
      if (onPaymentUpdated) onPaymentUpdated(data.payment);
      setTimeout(() => setJustSaved(false), 2000);
      return data.payment;
    } catch (err) {
      setError(getApiError(err));
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleOpenReceipt = async () => {
    if (hasChanges) {
      await savePayment();
    }
    setShowReceipt(true);
  };

  const isFullyPaid = numPaid >= tuitionFee && tuitionFee > 0;
  const isPartial = numPaid > 0 && numPaid < tuitionFee;

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-2 py-1 border border-slate-200 dark:border-slate-700">
          <span className="text-[10px] font-bold text-slate-400">Paid:</span>
          <input
            type="text"
            value={paidInput}
            onChange={(e) => handlePaidChange(e.target.value)}
            onBlur={() => { if (hasChanges) savePayment(); }}
            className="w-14 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-1.5 py-0.5 text-xs font-bold text-slate-800 dark:text-white text-right focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <span className="text-[10px] font-semibold text-slate-500">DA</span>
        </div>

        <span
          className={`px-2 py-1 rounded-xl text-[11px] font-black ${
            isFullyPaid
              ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
              : isPartial
              ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
              : "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
          }`}
        >
          Rest: {restAmount.toLocaleString()} DA
        </span>

        <button
          type="button"
          onClick={handleAssuranceToggle}
          className={`px-2 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 border transition-all ${
            assurancePaid
              ? "bg-teal-50 border-teal-300 text-teal-700 dark:bg-teal-950/60 dark:border-teal-700 dark:text-teal-300"
              : "bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600 dark:bg-slate-800 dark:border-slate-700"
          }`}
          title="Click to toggle Assurance (800 DA)"
        >
          {assurancePaid ? <ShieldCheck className="h-3 w-3 text-teal-600" /> : <ShieldAlert className="h-3 w-3" />}
          Assurance 800DA
        </button>

        <button
          type="button"
          onClick={handleOpenReceipt}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-700 dark:text-slate-200 shadow-2xs active:scale-95 transition-all"
          title="Afficher et envoyer le reçu numérique"
        >
          <Receipt className="h-3 w-3 text-emerald-600" />
          <span>Reçu</span>
        </button>

        {hasChanges && (
          <button
            type="button"
            onClick={savePayment}
            disabled={saving}
            className="flex items-center gap-1 bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-2 py-1 text-xs font-bold shadow-xs active:scale-95 transition-all"
          >
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            Save
          </button>
        )}

        {justSaved && (
          <span className="text-[10px] font-black text-emerald-600 flex items-center gap-0.5">
            <Check className="h-3 w-3" /> Saved
          </span>
        )}

        {showReceipt && (
          <DigitalReceiptModal
            payment={
              savedPaymentRecord || {
                amount: Number(tuitionFee) || defaultTuition,
                paidAmount: numPaid,
                restAmount,
                assurancePaid: Boolean(assurancePaid),
                assuranceAmount: assuranceFee,
                month: currentMonth,
                paidDate: new Date()
              }
            }
            student={student}
            onClose={() => setShowReceipt(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-900/50 p-2.5 space-y-2 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-bold">
          <Wallet className="h-3.5 w-3.5 text-brand-600" />
          <span>Tuition: <strong className="text-slate-900 dark:text-white font-black">{tuitionFee.toLocaleString()} DA</strong></span>
        </div>

        {/* Assurance Pill */}
        <button
          type="button"
          onClick={handleAssuranceToggle}
          className={`inline-flex items-center gap-1 rounded-xl px-2 py-0.5 text-[10px] font-black border transition-all ${
            assurancePaid
              ? "bg-teal-100 border-teal-300 text-teal-800 dark:bg-teal-950/70 dark:border-teal-700 dark:text-teal-300"
              : "bg-slate-100 border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600 dark:bg-slate-800 dark:border-slate-700"
          }`}
          title="Assurance / Insurance 800 DA (Click to toggle)"
        >
          {assurancePaid ? <ShieldCheck className="h-3 w-3 text-teal-600" /> : <ShieldAlert className="h-3 w-3" />}
          Assurance {assuranceFee} DA {assurancePaid ? "✓" : "✗"}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Paid Input */}
        <div className="flex items-center gap-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Paid:</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={paidInput}
            onChange={(e) => handlePaidChange(e.target.value)}
            onBlur={() => { if (hasChanges) savePayment(); }}
            className="w-16 text-right font-black text-xs text-slate-900 dark:text-white bg-transparent focus:outline-none"
          />
          <span className="text-[10px] font-bold text-slate-400">DA</span>
        </div>

        {/* Calculated Rest */}
        <div
          className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-black shadow-2xs ${
            isFullyPaid
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
              : isPartial
              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
              : "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300"
          }`}
        >
          <span className="text-[10px] font-bold opacity-80 uppercase">Rest:</span>
          <span>{restAmount.toLocaleString()} DA</span>
        </div>

        {/* Digital Receipt Trigger */}
        <button
          type="button"
          onClick={handleOpenReceipt}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 px-2 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-200 shadow-2xs active:scale-95 transition-all"
          title="Afficher et envoyer le reçu numérique"
        >
          <Receipt className="h-3 w-3 text-emerald-600" />
          <span>Reçu</span>
        </button>

        {/* Save button if changed */}
        {hasChanges && (
          <button
            type="button"
            onClick={savePayment}
            disabled={saving}
            className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-3 py-1 text-xs font-bold text-white shadow-xs hover:from-brand-700 hover:to-indigo-700 active:scale-95 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save
          </button>
        )}

        {justSaved && (
          <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-600 animate-fade-in">
            <Check className="h-3.5 w-3.5" /> Saved
          </span>
        )}
      </div>

      {error && (
        <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}

      {showReceipt && (
        <DigitalReceiptModal
          payment={
            savedPaymentRecord || {
              amount: Number(tuitionFee) || defaultTuition,
              paidAmount: numPaid,
              restAmount,
              assurancePaid: Boolean(assurancePaid),
              assuranceAmount: assuranceFee,
              month: currentMonth,
              paidDate: new Date()
            }
          }
          student={student}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
}
