import React, { useRef } from "react";
import {
  X,
  Printer,
  Share2,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Wallet,
  Calendar,
  User,
  BookOpen,
  Phone,
  QrCode,
  Download,
  Receipt
} from "lucide-react";
import { schoolInfo } from "../config/branding.js";

/**
 * DigitalReceiptModal
 * 
 * 100% paperless payment receipt:
 * - Tuition: 7,500 DA
 * - Paid: e.g. 4,000 DA
 * - Rest: e.g. 3,500 DA
 * - Assurance: 800 DA
 * - Instant WhatsApp receipt message to parent
 * - Printable / PDF export with official school stamp & QR
 */
export default function DigitalReceiptModal({
  payment,
  student,
  teacherName = "",
  onClose
}) {
  const receiptRef = useRef(null);

  const studentName = student?.name || payment?.student?.name || "Student";
  const studentCourse = student?.studentProfile?.course || payment?.student?.studentProfile?.course || "Standard Course";
  const parentPhone = student?.studentProfile?.parentPhone || payment?.student?.studentProfile?.parentPhone || "";
  const month = payment?.month || new Date().toISOString().slice(0, 7);
  const tuitionAmount = payment?.amount ?? 7500;
  const paidAmount = payment?.paidAmount ?? 0;
  const restAmount = payment?.restAmount ?? Math.max(0, tuitionAmount - paidAmount);
  const assurancePaid = Boolean(payment?.assurancePaid);
  const assuranceAmount = payment?.assuranceAmount ?? 800;
  const grandTotalPaid = paidAmount + (assurancePaid ? assuranceAmount : 0);
  const receiptNo = payment?._id ? `REC-${String(payment._id).slice(-6).toUpperCase()}` : `REC-${Date.now().toString().slice(-6)}`;
  const dateStr = payment?.paidDate ? new Date(payment.paidDate).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" }) : new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;

    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reçu de Paiement - ${studentName}</title>
          <meta charset="utf-8" />
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              @page {
                size: A5 portrait;
                margin: 6mm;
              }
              body {
                background: white !important;
                color: #0f172a !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
            body {
              font-family: system-ui, -apple-system, sans-serif;
              padding: 10px;
              background: #ffffff;
              color: #0f172a;
            }
          </style>
        </head>
        <body>
          <div class="max-w-[550px] mx-auto">
            ${printContent.innerHTML}
          </div>
          <script>
            window.onload = function() {
              window.focus();
              window.print();
              setTimeout(function() {
                if (window.frameElement && window.frameElement.parentNode) {
                  window.frameElement.parentNode.removeChild(window.frameElement);
                }
              }, 1000);
            };
          </script>
        </body>
      </html>
    `);
    doc.close();
  };

  // WhatsApp share link to parent
  const buildWhatsAppUrl = () => {
    if (!parentPhone) return null;
    const cleanPhone = parentPhone.replace(/[^0-9]/g, "");
    const msg = `*🧾 REÇU DE PAIEMENT NUMÉRIQUE - ${schoolInfo.name || "TFC SCHOOL"}*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📄 *N° Reçu:* ${receiptNo}\n` +
      `👤 *Élève:* ${studentName}\n` +
      `🎓 *Niveau/Cours:* ${studentCourse}\n` +
      `📅 *Mois:* ${month}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `💰 *Frais de Scolarité:* ${tuitionAmount.toLocaleString()} DA\n` +
      `✅ *Montant Payé:* ${paidAmount.toLocaleString()} DA\n` +
      `⏳ *Reste à Payer:* ${restAmount.toLocaleString()} DA\n` +
      `🛡️ *Assurance (800 DA):* ${assurancePaid ? "PAYÉE (800 DA) ✓" : "NON PAYÉE ✗"}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `💎 *TOTAL VERSÉ:* ${grandTotalPaid.toLocaleString()} DA\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `_Merci pour votre confiance. Ce reçu numérique a valeur officielle._`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  const waUrl = buildWhatsAppUrl();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white animate-fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 print:border-0 print:shadow-none my-auto">
        
        {/* Top Controls (Hidden on print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 print:hidden">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm font-bold">
              <Receipt className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-black text-slate-900 dark:text-slate-100 text-sm">Reçu de Paiement Numérique</h3>
              <p className="text-[11px] text-slate-400 font-semibold">{receiptNo}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 text-xs font-bold shadow-sm transition-all active:scale-95"
                title="Send receipt to parent via WhatsApp"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>WhatsApp</span>
              </a>
            )}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-black text-white px-3 py-1.5 text-xs font-bold shadow-sm dark:bg-white dark:text-slate-900 transition-all active:scale-95"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Imprimer</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ── Official Printable Receipt Card ── */}
        <div ref={receiptRef} className="p-6 sm:p-8 space-y-6 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
          
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-100 dark:border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <img
                src={schoolInfo.logo || "/tfc-logo.png"}
                alt="Logo"
                className="h-14 w-14 object-contain rounded-2xl border border-slate-200 dark:border-slate-700 p-1 bg-white shadow-xs"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                  {schoolInfo.name || "TFC Academy"}
                </h1>
                <p className="text-[11px] text-slate-500 font-semibold">{schoolInfo.address || "Centre de Formation & Langues"}</p>
                <p className="text-[11px] text-slate-400">Tél: {schoolInfo.phone || "+213 550 00 00 00"}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-black text-xs px-2.5 py-1 uppercase tracking-wider">
                REÇU OFFICIEL
              </span>
              <p className="mt-1 text-xs font-black text-slate-700 dark:text-slate-300">{receiptNo}</p>
              <p className="text-[10px] text-slate-400">{dateStr}</p>
            </div>
          </div>

          {/* Student Info Box */}
          <div className="grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Nom de l'Élève</span>
              <strong className="text-sm font-black text-slate-900 dark:text-white">{studentName}</strong>
              <span className="block text-[11px] text-slate-500 font-semibold mt-0.5">🎓 {studentCourse}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Mois concerné</span>
              <strong className="text-sm font-black text-brand-600 dark:text-brand-400">{month}</strong>
              {parentPhone && (
                <span className="block text-[11px] text-slate-500 font-semibold mt-0.5">📞 {parentPhone}</span>
              )}
            </div>
          </div>

          {/* Detailed Financial Breakdown Table */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Désignation</th>
                  <th className="py-2.5 px-3 text-right">Tarif</th>
                  <th className="py-2.5 px-3 text-right">Versé</th>
                  <th className="py-2.5 px-4 text-right">Reste</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                <tr>
                  <td className="py-3 px-4">
                    <strong className="text-slate-900 dark:text-white">Frais de Scolarité Mensuelle</strong>
                    <p className="text-[10px] text-slate-400 font-normal">Mois de {month}</p>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-700 dark:text-slate-300">
                    {tuitionAmount.toLocaleString()} DA
                  </td>
                  <td className="py-3 px-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                    {paidAmount.toLocaleString()} DA
                  </td>
                  <td className="py-3 px-4 text-right font-black text-rose-600 dark:text-rose-400">
                    {restAmount.toLocaleString()} DA
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-4">
                    <strong className="text-slate-900 dark:text-white">Assurance Scolaire Annuelle</strong>
                    <p className="text-[10px] text-slate-400 font-normal">Couverture annuelle obligatoire</p>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-700 dark:text-slate-300">
                    800 DA
                  </td>
                  <td className="py-3 px-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                    {assurancePaid ? "800 DA" : "0 DA"}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-slate-500">
                    {assurancePaid ? "0 DA" : "800 DA"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Grand Totals Box */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 space-y-2 shadow-md">
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span>Total Versé (Aujourd'hui) :</span>
              <strong className="text-base font-black text-emerald-400">{grandTotalPaid.toLocaleString()} DA</strong>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-300 pt-1 border-t border-slate-700">
              <span>Reste Total à Régulariser :</span>
              <strong className={`text-sm font-black ${restAmount > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                {restAmount.toLocaleString()} DA
              </strong>
            </div>
          </div>

          {/* Official Verification Seal & Signature */}
          <div className="pt-4 flex items-center justify-between border-t border-dashed border-slate-200 dark:border-slate-800 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Cachet & Signature Électronique</span>
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 text-[11px] font-black text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                <span>CERTIFIÉ CONFORME PAR L'ADMINISTRATION</span>
              </div>
              <p className="text-[9px] text-slate-400 italic">Document dématérialisé généré par TFC Cloud System</p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 mx-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 shadow-inner">
                <QrCode className="h-10 w-10 text-slate-700 dark:text-slate-300" />
              </div>
              <span className="text-[9px] font-bold text-slate-400 mt-1 block">Vérification QR</span>
            </div>
          </div>

        </div>

        {/* Bottom footer button (Hidden on print) */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex gap-2 print:hidden">
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-xs font-black shadow-md transition-all active:scale-95"
            >
              <Share2 className="h-4 w-4" />
              <span>Envoyer Reçu au Parent (WhatsApp)</span>
            </a>
          )}
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 py-3 text-xs font-black shadow-md transition-all active:scale-95"
          >
            <Printer className="h-4 w-4" />
            <span>Imprimer / PDF</span>
          </button>
        </div>

      </div>
    </div>
  );
}
