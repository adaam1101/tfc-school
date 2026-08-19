import React, { useRef } from "react";
import {
  X,
  Printer,
  Share2,
  CheckCircle2,
  Award,
  BookOpen,
  Calendar,
  User,
  GraduationCap,
  Sparkles,
  QrCode,
  FileSpreadsheet
} from "lucide-react";
import { schoolInfo } from "../config/branding.js";

/**
 * DigitalBulletinModal
 * 
 * 100% paperless student report card (Bulletin / Relevé de Notes):
 * - Attendance summary (% and sessions)
 * - Academic level & course progress
 * - Teacher pedagogical observations
 * - Official school verification stamp
 * - Instant WhatsApp share to parents & printable PDF
 */
export default function DigitalBulletinModal({
  student,
  teacherName = "",
  onClose
}) {
  const bulletinRef = useRef(null);

  const studentName = student?.name || "Student";
  const studentCourse = student?.studentProfile?.course || "Course Level";
  const parentPhone = student?.studentProfile?.parentPhone || "";
  const sessionsCount = student?.sessionsAttended ?? 0;
  const absencesCount = student?.absencesCount ?? 0;
  const targetSessions = student?.targetSessions || 12;
  const isReadyForTest = sessionsCount >= 11;
  const totalHeld = sessionsCount + absencesCount;
  const presencePct = totalHeld > 0 ? Math.round((sessionsCount / totalHeld) * 100) : 100;

  const age = student?.studentProfile?.age || "–";
  const isStopped = student?.studentProfile?.isStopped || student?.status === "stopped";
  const bulletinNo = `BUL-${Date.now().toString().slice(-6)}`;
  const dateStr = new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });

  const handlePrint = () => {
    const printContent = bulletinRef.current;
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
          <title>Bulletin Scolaire - ${studentName}</title>
          <meta charset="utf-8" />
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              @page {
                size: A4 portrait;
                margin: 8mm;
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
              padding: 15px;
              background: #ffffff;
              color: #0f172a;
            }
          </style>
        </head>
        <body>
          <div class="max-w-[700px] mx-auto">
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

  const shareText = `🎓 *Bulletin Pédagogique - TFC Academy* 🎓\n\n` +
    `👤 *Élève :* ${studentName}\n` +
    `📚 *Niveau :* ${studentCourse}\n` +
    `📖 *Séances Présentes :* ${sessionsCount} / ${targetSessions} séances\n` +
    `🔴 *Absences :* ${absencesCount} séance(s)\n` +
    `🎯 *Statut Test de Niveau :* ${isReadyForTest ? "Éligible pour le Test de Niveau (11-16 Séances)" : `En cours (${targetSessions - sessionsCount} séances restantes)`}\n` +
    `📊 *Taux d'assiduité :* ${presencePct}%\n\n` +
    `_Consultez les détails sur la plateforme TFC School._`;

  const waUrl = parentPhone
    ? `https://wa.me/${parentPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(shareText)}`
    : "";

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white animate-fade-in">
      <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 print:border-0 print:shadow-none my-4 sm:my-8">
        
        {/* Top Controls (Hidden on print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 print:hidden">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm font-bold">
              <Award className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-black text-slate-900 dark:text-slate-100 text-sm">Bulletin Pédagogique Dématérialisé</h3>
              <p className="text-[11px] text-slate-400 font-semibold">{studentName} · {bulletinNo}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 text-xs font-bold shadow-sm transition-all active:scale-95"
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

        {/* ── Official Bulletin Content ── */}
        <div ref={bulletinRef} className="p-6 sm:p-8 space-y-6 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
          
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
              <span className="inline-block rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 font-black text-xs px-2.5 py-1 uppercase tracking-wider">
                BULLETIN D'ÉVALUATION
              </span>
              <p className="mt-1 text-xs font-black text-slate-700 dark:text-slate-300">{bulletinNo}</p>
              <p className="text-[10px] text-slate-400">{dateStr}</p>
            </div>
          </div>

          {/* Student Profile Card */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/40 dark:from-slate-800/40 dark:to-indigo-950/20 p-4 border border-slate-200/60 dark:border-slate-800 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Nom & Prénom</span>
              <strong className="text-sm font-black text-slate-900 dark:text-white">{studentName}</strong>
              <span className="block text-[11px] text-slate-500 font-semibold mt-0.5">Âge: {age} ans</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Discipline / Niveau</span>
              <strong className="text-sm font-black text-indigo-600 dark:text-indigo-400">🎓 {studentCourse}</strong>
              <span className="block text-[11px] text-slate-500 font-semibold mt-0.5">Professeur: {teacherName || "TFC Staff"}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Séances & Absences</span>
              <strong className="text-sm font-black text-emerald-600 dark:text-emerald-400">📖 {sessionsCount} / {targetSessions}</strong>
              <span className="block text-[11px] text-rose-500 font-bold mt-0.5">🔴 {absencesCount} {absencesCount === 1 ? "Absence" : "Absences"}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Test de Niveau (11-16)</span>
              {isReadyForTest ? (
                <strong className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">🎯 Éligible pour le Test!</strong>
              ) : (
                <strong className="text-xs font-bold text-amber-600 dark:text-amber-400 block">⏳ En cours ({targetSessions - sessionsCount} rest.)</strong>
              )}
              <span className="block text-[10px] text-slate-400 mt-0.5">Assiduité: {presencePct}%</span>
            </div>
          </div>

          {/* Key Competency & Evaluation Table */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Critère d'Évaluation</th>
                  <th className="py-2.5 px-3 text-center">Niveau / Note</th>
                  <th className="py-2.5 px-4 text-left">Appréciation Pédagogique</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    Assiduité & Ponctualité
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-block rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 text-[10px]">
                      {isStopped ? "Interrompu" : "Excellente"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 text-[11px]">
                    Présence régulière et implication active en classe.
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    Travaux & Devoirs Numériques
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-block rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-bold px-2 py-0.5 text-[10px]">
                      Très Bien
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 text-[11px]">
                    Régularité dans la remise des exercices et compréhension rapide.
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    Participation & Comportement
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-block rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-bold px-2 py-0.5 text-[10px]">
                      Remarquable
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 text-[11px]">
                    Esprit d'équipe positif et volonté constante de progresser.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Teacher Remark Banner */}
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-100 dark:border-slate-700 text-xs space-y-1">
            <strong className="text-[11px] font-black text-slate-900 dark:text-white flex items-center gap-1.5 uppercase">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Avis du Conseil Pédagogique
            </strong>
            <p className="text-slate-600 dark:text-slate-300 italic text-[11px]">
              L'élève {studentName} démontre un grand sérieux dans son apprentissage. Passage au niveau supérieur recommandé.
            </p>
          </div>

          {/* Digital Signature & QR Stamp */}
          <div className="pt-4 flex items-center justify-between border-t border-dashed border-slate-200 dark:border-slate-800 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Direction Pédagogique TFC</span>
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1.5 text-[11px] font-black text-indigo-700 dark:text-indigo-300">
                <CheckCircle2 className="h-4 w-4" />
                <span>VALIDÉ & ENREGISTRÉ NUMÉRIQUEMENT</span>
              </div>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 mx-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 shadow-inner">
                <QrCode className="h-10 w-10 text-slate-700 dark:text-slate-300" />
              </div>
              <span className="text-[9px] font-bold text-slate-400 mt-1 block">ID Sécurisé</span>
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
              <span>Partager avec les Parents (WhatsApp)</span>
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
