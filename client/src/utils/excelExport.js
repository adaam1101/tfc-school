import * as XLSX from "xlsx";
import { schoolInfo } from "../config/branding.js";

/**
 * Format timestamp for report headers
 */
const nowFormatted = () => {
  const d = new Date();
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

/**
 * Export Student Roster with School Identity
 */
export function exportStudentsToExcel({
  students = [],
  groupName = "All Groups",
  teacherName = "Ameyoud Adam",
  fileName
}) {
  const wb = XLSX.utils.book_new();

  const titleHeader = [
    [`${schoolInfo.short.toUpperCase()} SCHOOL — OFFICIAL STUDENT ROSTER / LISTE OFFICIELLE DES ÉLÈVES`],
    [`${schoolInfo.name} · ${schoolInfo.city} · Tel: ${schoolInfo.phones[0] || "+213 561 502 098"}`],
    [`Enseignant / Teacher: ${teacherName} | Groupe: ${groupName} | Date d'export: ${nowFormatted()}`],
    [] // blank row
  ];

  const tableHeaders = [
    "N°",
    "Nom et Prénom / Full Name",
    "Groupe / Niveau",
    "Téléphone / Phone",
    "Téléphone Parent",
    "Séances Étudiées",
    "Absences",
    "Frais Scolarité (DA)",
    "Montant Payé (DA)",
    "Reste à Payer (DA)",
    "Assurance (800 DA)",
    "État Paiement",
    "Statut"
  ];

  let totalTuition = 0;
  let totalPaid = 0;
  let totalRest = 0;
  let totalSessions = 0;
  let totalAbsences = 0;
  let assurancePaidCount = 0;

  const dataRows = students.map((s, idx) => {
    const payment = s.currentPayment || {};
    const tuition = payment.amount ?? 7500;
    const paid = payment.paidAmount ?? 0;
    const rest = Math.max(0, tuition - paid);
    const hasAssurance = Boolean(payment.assurancePaid);
    const sessions = s.sessionsAttended ?? s.studentProfile?.sessionsAttended ?? 0;
    const absences = s.absencesCount ?? s.studentProfile?.absencesCount ?? 0;
    const isStopped = s.studentProfile?.isStopped || s.status === "stopped";

    totalTuition += tuition;
    totalPaid += paid;
    totalRest += rest;
    totalSessions += sessions;
    totalAbsences += absences;
    if (hasAssurance) assurancePaidCount += 1;

    const groupLabel = s.groupName || s.studentProfile?.course || s.course || "General";
    const paymentStatus = paid >= tuition ? "Payé / Paid ✓" : paid > 0 ? "Partiel / Partial" : "Non payé / Unpaid";

    return [
      idx + 1,
      s.name || "—",
      groupLabel,
      s.phone || s.studentProfile?.phone || "—",
      s.studentProfile?.parentPhone || "—",
      `${sessions} / ${s.targetSessions || 12}`,
      absences,
      tuition,
      paid,
      rest,
      hasAssurance ? "Payée (800 DA) ✓" : "Non payée",
      paymentStatus,
      isStopped ? "Arrêté / Stopped ⛔" : "Actif / Active 🟢"
    ];
  });

  const totalsRow = [
    "TOTAL",
    `${students.length} Élèves / Students`,
    "",
    "",
    "",
    `${totalSessions} Sessions`,
    `${totalAbsences} Absences`,
    totalTuition,
    totalPaid,
    totalRest,
    `${assurancePaidCount} Payées (${(assurancePaidCount * 800).toLocaleString()} DA)`,
    totalRest === 0 ? "Complet 100% ✓" : `Reste total: ${totalRest.toLocaleString()} DA`,
    ""
  ];

  const fullSheetData = [
    ...titleHeader,
    tableHeaders,
    ...dataRows,
    [],
    totalsRow
  ];

  const ws = XLSX.utils.aoa_to_sheet(fullSheetData);

  // Set column widths
  ws["!cols"] = [
    { wch: 6 },   // N°
    { wch: 28 },  // Full Name
    { wch: 20 },  // Group
    { wch: 16 },  // Phone
    { wch: 16 },  // Parent Phone
    { wch: 18 },  // Sessions
    { wch: 12 },  // Absences
    { wch: 20 },  // Tuition Fee
    { wch: 20 },  // Paid Amount
    { wch: 20 },  // Rest
    { wch: 22 },  // Assurance
    { wch: 18 },  // Payment Status
    { wch: 18 }   // Status
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Élèves & Inscriptions");

  const exportFileName = fileName || `${schoolInfo.short}_Roster_${groupName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, exportFileName);
}

/**
 * Export Monthly Financial Rapport with Full School Identity & Payout Breakdown
 */
export function exportMonthlyFinancialRapportToExcel({
  month = "2026-08",
  periodName = "August 2026",
  teacher = { name: "Ameyoud Adam" },
  summary = {},
  teacherCompensation = {},
  students = [],
  commissionMode = "tiered",
  fileName
}) {
  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Financial Summary & Teacher Payout ──────────────────────────────
  const summaryHeader = [
    [`${schoolInfo.short.toUpperCase()} SCHOOL — RAPPORT FINANCIER MENSUEL / MONTHLY FINANCIAL REPORT`],
    [`${schoolInfo.name} · ${schoolInfo.city} · ${schoolInfo.address}`],
    [`Période / Period: ${periodName} (${month}) | Enseignant / Teacher: ${teacher?.name || "Ameyoud Adam"}`],
    [`Généré le / Exported on: ${nowFormatted()}`],
    [] // blank
  ];

  const kpiSection = [
    ["INDICATEURS FINANCIERS CLÉS / FINANCIAL SUMMARY", "VALEUR (DA)", "NOTES / DÉTAILS"],
    ["Nombre Total d'Élèves Inscrits / Total Students", summary.totalStudents || students.length, "Élèves actifs dans le rapport"],
    ["Total Frais de Scolarité Prévus / Total Expected Fees", (summary.totalTuition || 0), "Total théorique des formations"],
    ["Total Frais de Scolarité Encaissés / Tuition Collected", (summary.totalCollectedTuition || 0), "Espèces collectées scolarité"],
    ["Reste Global à Recouvrer / Remaining Tuition Due", (summary.totalRest || 0), "Impayés / En attente de règlement"],
    ["Taux de Recouvrement / Collection Rate", `${summary.collectionRate || 0}%`, "Pourcentage des frais perçus"],
    ["Total Droits d'Assurance Encaissés (800 DA)", (summary.totalAssuranceCollected || 0), `${summary.assurancePaidCount || 0} assurances payées`],
    ["TOTAL GÉNÉRAL ESPÈCES COLLECTÉES / GRAND TOTAL CASH", (summary.totalGrandCollected || 0), "Scolarité + Assurances enregistrées"],
    [],
    ["PARTAGE DES REVENUS / REVENUE SPLIT", "MONTANT (DA)", "MODE DE CALCUL"],
    ["🧑‍🏫 Net Payout Enseignant / Teacher Compensation", (teacherCompensation?.totalTeacherNet || 0), `Calculé via: ${commissionMode}`],
    ["🏫 Part Nette Centre / School Net Retained", (teacherCompensation?.totalSchoolNet || 0), "Total Grand Cash − Part Enseignant"]
  ];

  const groupBreakdownHeader = [
    [],
    ["DÉTAIL PAR GROUPE / GROUP BREAKDOWN"],
    ["Nom du Groupe / Group", "Effectif Actif", "Scolarité Encaissée (DA)", "Part Enseignant (DA)", "Reste Groupe (DA)"]
  ];

  const groupBreakdownRows = (teacherCompensation?.groupBreakdowns || []).map((gb) => [
    gb.groupName,
    gb.studentCount,
    gb.collectedTuition,
    gb.teacherNet,
    gb.restTuition
  ]);

  const summarySheetData = [
    ...summaryHeader,
    ...kpiSection,
    ...groupBreakdownHeader,
    ...groupBreakdownRows
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summarySheetData);
  wsSummary["!cols"] = [
    { wch: 45 },
    { wch: 22 },
    { wch: 35 },
    { wch: 22 },
    { wch: 22 }
  ];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Synthèse Financière");

  // ── Sheet 2: Student-by-Student Payment Ledger ────────────────────────────────
  const studentHeader = [
    [`${schoolInfo.short.toUpperCase()} SCHOOL — DÉTAIL DES PAIEMENTS PAR ÉLÈVE (${periodName})`],
    [`Enseignant: ${teacher?.name || "Ameyoud Adam"} | Mois: ${month}`],
    []
  ];

  const studentTableCols = [
    "N°",
    "Nom de l'Élève / Student Name",
    "Groupe / Formation",
    "Téléphone Parent",
    "Scolarité (DA)",
    "Payé (DA)",
    "Reste (DA)",
    "Assurance (800 DA)",
    "Statut Paiement",
    "Statut Élève",
    "Observations / Notes"
  ];

  let sumTuition = 0;
  let sumPaid = 0;
  let sumRest = 0;
  let sumAssurance = 0;

  const studentRows = students.map((s, idx) => {
    const payment = s.currentPayment || {};
    const tuition = payment.amount ?? 7500;
    const paid = payment.paidAmount ?? 0;
    const rest = Math.max(0, tuition - paid);
    const hasAssurance = Boolean(payment.assurancePaid);
    const isStopped = s.studentProfile?.isStopped || s.status === "stopped";

    sumTuition += tuition;
    sumPaid += paid;
    sumRest += rest;
    if (hasAssurance) sumAssurance += 800;

    return [
      idx + 1,
      s.name,
      s.groupName || s.studentProfile?.course || "General",
      s.studentProfile?.parentPhone || s.phone || "—",
      tuition,
      paid,
      rest,
      hasAssurance ? "Payée (800 DA) ✓" : "Non payée",
      paid >= tuition ? "Payé / Full ✓" : paid > 0 ? "Partiel" : "Non payé",
      isStopped ? "Arrêté ⛔" : "Actif 🟢",
      payment.notes || s.notes || ""
    ];
  });

  const studentTotalsRow = [
    "TOTAL",
    `${students.length} Élèves`,
    "",
    "",
    sumTuition,
    sumPaid,
    sumRest,
    `${sumAssurance.toLocaleString()} DA (${sumAssurance / 800} élèves)`,
    sumRest === 0 ? "Complet ✓" : `Reste: ${sumRest.toLocaleString()} DA`,
    "",
    ""
  ];

  const studentSheetData = [
    ...studentHeader,
    studentTableCols,
    ...studentRows,
    [],
    studentTotalsRow
  ];

  const wsStudents = XLSX.utils.aoa_to_sheet(studentSheetData);
  wsStudents["!cols"] = [
    { wch: 6 },
    { wch: 28 },
    { wch: 22 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 22 },
    { wch: 18 },
    { wch: 16 },
    { wch: 30 }
  ];
  XLSX.utils.book_append_sheet(wb, wsStudents, "Détail des Paiements");

  const exportFileName = fileName || `${schoolInfo.short}_Rapport_Financier_${month}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, exportFileName);
}
