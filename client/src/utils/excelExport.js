import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { schoolInfo } from "../config/branding.js";

// ── Color Palette Constants ──────────────────────────────────────────────────
const COLORS = {
  navyDark:    "0F172A", // 15, 23, 42
  navyMedium:  "1E293B", // 30, 41, 59
  brandBlue:   "085580", // TFC Brand
  indigoHeader:"1E40AF", // 30, 64, 175
  indigoDark:  "172554", // 23, 37, 84
  tealHeader:  "0F766E", // 15, 118, 110
  emeraldFill: "059669", // 5, 150, 105
  emeraldLight:"DCFCE7", // 220, 252, 231
  emeraldDark: "166534", // 22, 101, 52
  amberLight:  "FEF3C7", // 254, 243, 199
  amberDark:   "B45309", // 180, 83, 9
  roseLight:   "FEE2E2", // 254, 226, 226
  roseDark:    "991B1B", // 153, 27, 27
  cyanLight:   "CCFBF1", // 204, 251, 241
  cyanDark:    "0F766E", // 15, 118, 110
  grayZebra:   "F8FAFC", // 248, 250, 252
  grayBorder:  "CBD5E1", // 203, 213, 225
  grayLight:   "F1F5F9", // 241, 245, 249
  white:       "FFFFFF",
};

const BORDER_THIN = {
  top:    { style: "thin", color: { argb: COLORS.grayBorder } },
  left:   { style: "thin", color: { argb: COLORS.grayBorder } },
  bottom: { style: "thin", color: { argb: COLORS.grayBorder } },
  right:  { style: "thin", color: { argb: COLORS.grayBorder } },
};

const BORDER_HEADER = {
  top:    { style: "medium", color: { argb: COLORS.navyDark } },
  left:   { style: "thin",   color: { argb: "3B82F6" } },
  bottom: { style: "medium", color: { argb: COLORS.navyDark } },
  right:  { style: "thin",   color: { argb: "3B82F6" } },
};

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
 * Helper to apply cell fill color
 */
const setCellFill = (cell, argbColor) => {
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: argbColor }
  };
};

/**
 * Helper to style a title banner block
 */
function createBanner(ws, title, subtitle, meta, colCount = 13) {
  // Row 1: Title
  ws.mergeCells(1, 1, 1, colCount);
  const r1 = ws.getCell(1, 1);
  r1.value = `🎓  ${title}`;
  r1.font = { name: "Calibri", size: 16, bold: true, color: { argb: COLORS.white } };
  r1.alignment = { vertical: "middle", horizontal: "center" };
  setCellFill(r1, COLORS.navyDark);
  ws.getRow(1).height = 42;

  // Row 2: Subtitle
  ws.mergeCells(2, 1, 2, colCount);
  const r2 = ws.getCell(2, 1);
  r2.value = subtitle;
  r2.font = { name: "Calibri", size: 11, bold: true, color: { argb: "93C5FD" } }; // Light blue text
  r2.alignment = { vertical: "middle", horizontal: "center" };
  setCellFill(r2, COLORS.navyMedium);
  ws.getRow(2).height = 24;

  // Row 3: Meta bar
  ws.mergeCells(3, 1, 3, colCount);
  const r3 = ws.getCell(3, 1);
  r3.value = meta;
  r3.font = { name: "Calibri", size: 10, bold: true, color: { argb: "334155" } };
  r3.alignment = { vertical: "middle", horizontal: "center" };
  setCellFill(r3, COLORS.grayLight);
  ws.getRow(3).height = 24;

  // Row 4: Spacer
  ws.getRow(4).height = 10;
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. EXPORT STUDENTS ROSTER TO EXCEL (Full Color & Professional Organization)
 * ─────────────────────────────────────────────────────────────────────────────
 */
export async function exportStudentsToExcel({
  students = [],
  groupName = "All Groups",
  teacherName = "Ameyoud Adam",
  fileName
}) {
  const wb = new ExcelJS.Workbook();
  wb.creator = `${schoolInfo.short} School Management`;
  wb.created = new Date();

  const ws = wb.addWorksheet("Students Roster", {
    views: [{ showGridLines: true }]
  });

  const bannerTitle = `${schoolInfo.short.toUpperCase()} SCHOOL — OFFICIAL STUDENT ROSTER`;
  const bannerSub = `${schoolInfo.name} · ${schoolInfo.city} · ${schoolInfo.phones[0] || "+213 561 502 098"}`;
  const bannerMeta = `👨‍🏫 Teacher: ${teacherName}   |   📁 Group: ${groupName}   |   📅 Export Date: ${nowFormatted()}   |   👥 Total: ${students.length} Students`;

  createBanner(ws, bannerTitle, bannerSub, bannerMeta, 13);

  // Table Headers
  const headers = [
    "N°",
    "Student Full Name (الاسم واللقب)",
    "Group / Level",
    "Student Phone",
    "Parent Phone",
    "Sessions Studied",
    "Absences",
    "Tuition Fee (DA)",
    "Paid Amount (DA)",
    "Remaining Rest (DA)",
    "800 DA Assurance",
    "Payment Status",
    "Student Status"
  ];

  const headerRow = ws.getRow(5);
  headerRow.values = headers;
  headerRow.height = 32;

  headerRow.eachCell((cell) => {
    setCellFill(cell, COLORS.indigoHeader);
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: COLORS.white } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = BORDER_HEADER;
  });

  // Sort students by Group Name first, then Student Name for clean organization
  const sortedStudents = [...students].sort((a, b) => {
    const grpA = (a.groupName || a.studentProfile?.course || "").toLowerCase();
    const grpB = (b.groupName || b.studentProfile?.course || "").toLowerCase();
    if (grpA !== grpB) return grpA.localeCompare(grpB);
    return (a.name || "").localeCompare(b.name || "");
  });

  let totalTuition = 0;
  let totalPaid = 0;
  let totalRest = 0;
  let totalSessions = 0;
  let totalAbsences = 0;
  let assurancePaidCount = 0;

  let currentRowIdx = 6;
  let lastGroup = null;

  sortedStudents.forEach((s, idx) => {
    const payment = s.currentPayment || {};
    const tuition = payment.amount ?? 7500;
    const paid = payment.paidAmount ?? 0;
    const rest = Math.max(0, tuition - paid);
    const hasAssurance = Boolean(payment.assurancePaid);
    const sessions = s.sessionsAttended ?? s.studentProfile?.sessionsAttended ?? 0;
    const absences = s.absencesCount ?? s.studentProfile?.absencesCount ?? 0;
    const isStopped = s.studentProfile?.isStopped || s.status === "stopped";
    const currentGroup = s.groupName || s.studentProfile?.course || "General";

    totalTuition += tuition;
    totalPaid += paid;
    totalRest += rest;
    totalSessions += sessions;
    totalAbsences += absences;
    if (hasAssurance) assurancePaidCount += 1;

    // Optional Group Header Separator if group changes
    if (groupName === "All Groups" || groupName === "All My Students") {
      if (lastGroup !== currentGroup) {
        lastGroup = currentGroup;
        const grpRow = ws.getRow(currentRowIdx);
        ws.mergeCells(currentRowIdx, 1, currentRowIdx, 13);
        const grpCell = ws.getCell(currentRowIdx, 1);
        grpCell.value = `📁 GROUP: ${currentGroup.toUpperCase()}`;
        grpCell.font = { name: "Calibri", size: 11, bold: true, color: { argb: COLORS.indigoDark } };
        grpCell.alignment = { vertical: "middle", indent: 1 };
        setCellFill(grpCell, "E0E7FF"); // Soft Indigo fill
        grpRow.height = 24;
        currentRowIdx++;
      }
    }

    const row = ws.getRow(currentRowIdx);
    const isEven = (idx % 2 === 0);
    const rowBg = isEven ? COLORS.white : COLORS.grayZebra;

    let payStatusText = "Unpaid / Non Payé";
    let payStatusBg = COLORS.roseLight;
    let payStatusColor = COLORS.roseDark;

    if (paid >= tuition) {
      payStatusText = "Paid / Payé 100% ✓";
      payStatusBg = COLORS.emeraldLight;
      payStatusColor = COLORS.emeraldDark;
    } else if (paid > 0) {
      payStatusText = `Partial / Partiel (${paid.toLocaleString()} DA)`;
      payStatusBg = COLORS.amberLight;
      payStatusColor = COLORS.amberDark;
    }

    row.values = [
      idx + 1,
      s.name || "—",
      currentGroup,
      s.phone || s.studentProfile?.phone || "—",
      s.studentProfile?.parentPhone || "—",
      `${sessions} / ${s.targetSessions || 12}`,
      absences,
      tuition,
      paid,
      rest,
      hasAssurance ? "Paid (800 DA) ✓" : "Unpaid",
      payStatusText,
      isStopped ? "Stopped / Arrêté ⛔" : "Active / Actif 🟢"
    ];

    row.height = 26;

    // Style each cell in the row
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.font = { name: "Calibri", size: 10, color: { argb: "1E293B" } };
      cell.border = BORDER_THIN;
      setCellFill(cell, rowBg);
      cell.alignment = { vertical: "middle", horizontal: "center" };

      // Left-align name and group
      if (colNumber === 2) {
        cell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
        cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "0F172A" } };
      }
      if (colNumber === 3) {
        cell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
      }

      // Money columns
      if (colNumber === 8 || colNumber === 9 || colNumber === 10) {
        cell.numFmt = '#,##0 "DA"';
        cell.alignment = { vertical: "middle", horizontal: "right" };
        if (colNumber === 9 && paid > 0) {
          cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: COLORS.emeraldDark } };
        }
        if (colNumber === 10 && rest > 0) {
          cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: COLORS.roseDark } };
        }
      }

      // Absences highlight
      if (colNumber === 7 && absences > 2) {
        setCellFill(cell, COLORS.roseLight);
        cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: COLORS.roseDark } };
      }

      // Assurance badge column (11)
      if (colNumber === 11) {
        if (hasAssurance) {
          setCellFill(cell, COLORS.cyanLight);
          cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: COLORS.cyanDark } };
        } else {
          cell.font = { name: "Calibri", size: 10, color: { argb: "94A3B8" } };
        }
      }

      // Payment status badge column (12)
      if (colNumber === 12) {
        setCellFill(cell, payStatusBg);
        cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: payStatusColor } };
      }

      // Active/Stopped column (13)
      if (colNumber === 13) {
        if (isStopped) {
          setCellFill(cell, COLORS.roseLight);
          cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: COLORS.roseDark } };
        } else {
          setCellFill(cell, COLORS.emeraldLight);
          cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: COLORS.emeraldDark } };
        }
      }
    });

    currentRowIdx++;
  });

  // Spacer
  currentRowIdx++;

  // Bottom Grand Totals Row
  const totalRow = ws.getRow(currentRowIdx);
  totalRow.values = [
    "TOTALS",
    `${students.length} Total Students`,
    "",
    "",
    "",
    `${totalSessions} Sessions`,
    `${totalAbsences} Absences`,
    totalTuition,
    totalPaid,
    totalRest,
    `${assurancePaidCount} Paid (${(assurancePaidCount * 800).toLocaleString()} DA)`,
    totalRest === 0 ? "All Paid 100% ✓" : `Total Rest: ${totalRest.toLocaleString()} DA`,
    ""
  ];

  totalRow.height = 32;
  totalRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    setCellFill(cell, COLORS.navyDark);
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: COLORS.white } };
    cell.border = BORDER_HEADER;
    cell.alignment = { vertical: "middle", horizontal: "center" };

    if (colNumber === 8 || colNumber === 9 || colNumber === 10) {
      cell.numFmt = '#,##0 "DA"';
      cell.alignment = { vertical: "middle", horizontal: "right" };
    }
  });

  // Set explicit column widths
  ws.columns = [
    { width: 7 },   // N°
    { width: 30 },  // Student Full Name
    { width: 22 },  // Group / Level
    { width: 16 },  // Phone
    { width: 16 },  // Parent Phone
    { width: 18 },  // Sessions Studied
    { width: 12 },  // Absences
    { width: 18 },  // Tuition Fee
    { width: 18 },  // Paid Amount
    { width: 18 },  // Remaining Rest
    { width: 24 },  // Assurance
    { width: 22 },  // Payment Status
    { width: 18 }   // Student Status
  ];

  const buffer = await wb.xlsx.writeBuffer();
  const exportFileName = fileName || `${schoolInfo.short}_Students_${groupName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), exportFileName);
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 2. EXPORT MONTHLY FINANCIAL RAPPORT TO EXCEL (Styled Multi-Sheet Report)
 * ─────────────────────────────────────────────────────────────────────────────
 */
export async function exportMonthlyFinancialRapportToExcel({
  month = "2026-08",
  periodName = "August 2026",
  teacher = { name: "Ameyoud Adam" },
  summary = {},
  teacherCompensation = {},
  students = [],
  commissionMode = "tiered",
  fileName
}) {
  const wb = new ExcelJS.Workbook();
  wb.creator = `${schoolInfo.short} Financial Center`;
  wb.created = new Date();

  // ═════════════════════════════════════════════════════════════════════════════
  // SHEET 1: SYNTHÈSE FINANCIÈRE & RÉPARTITION
  // ═════════════════════════════════════════════════════════════════════════════
  const ws1 = wb.addWorksheet("Synthèse Financière", {
    views: [{ showGridLines: true }]
  });

  const title1 = `${schoolInfo.short.toUpperCase()} SCHOOL — RAPPORT FINANCIER MENSUEL`;
  const sub1 = `${schoolInfo.name} · ${schoolInfo.city} · ${schoolInfo.address}`;
  const meta1 = `Période: ${periodName} (${month})   |   Enseignant: ${teacher?.name || "Ameyoud Adam"}   |   Généré le: ${nowFormatted()}`;

  createBanner(ws1, title1, sub1, meta1, 4);

  // Section 1: KPI Metrics Header
  ws1.mergeCells(5, 1, 5, 4);
  const kpiTitle = ws1.getCell(5, 1);
  kpiTitle.value = "📊  SYNTHÈSE DES REVENUS DU MOIS (COLLECTED REVENUE SUMMARY)";
  kpiTitle.font = { name: "Calibri", size: 12, bold: true, color: { argb: COLORS.white } };
  kpiTitle.alignment = { vertical: "middle", indent: 1 };
  setCellFill(kpiTitle, COLORS.indigoHeader);
  ws1.getRow(5).height = 28;

  const kpis = [
    { label: "Effectif Total d'Élèves Inscrits", val: summary.totalStudents || students.length, note: "Élèves actifs ce mois", fmt: "num" },
    { label: "Total Frais de Scolarité Prévus", val: summary.totalTuition || 0, note: "Scolarité théorique", fmt: "da" },
    { label: "Total Scolarité Encaissée (Collected Tuition)", val: summary.totalCollectedTuition || 0, note: "Espèces perçues en caisse", fmt: "da", highlight: "emerald" },
    { label: "Reste à Recouvrer (Remaining Tuition Rest)", val: summary.totalRest || 0, note: "Impayés / En attente", fmt: "da", highlight: "rose" },
    { label: "Taux Global de Recouvrement", val: `${summary.collectionRate || 0}%`, note: "Paiements perçus vs prévus", fmt: "str" },
    { label: "Droits d'Assurance Encaissés (800 DA)", val: summary.totalAssuranceCollected || 0, note: `${summary.assurancePaidCount || 0} assurances payées`, fmt: "da", highlight: "cyan" },
    { label: "TOTAL GÉNÉRAL ESPÈCES COLLECTÉES (GRAND TOTAL CASH)", val: summary.totalGrandCollected || 0, note: "Scolarité + Droits d'assurance", fmt: "da", highlight: "navy" },
  ];

  let rIdx = 6;
  kpis.forEach((k, i) => {
    const row = ws1.getRow(rIdx);
    row.values = [k.label, k.val, "", k.note];
    ws1.mergeCells(rIdx, 2, rIdx, 3);
    row.height = 26;

    const bg = i % 2 === 0 ? COLORS.white : COLORS.grayZebra;

    row.eachCell({ includeEmpty: true }, (cell, colNum) => {
      cell.border = BORDER_THIN;
      setCellFill(cell, bg);
      cell.font = { name: "Calibri", size: 10, color: { argb: "1E293B" } };
      cell.alignment = { vertical: "middle" };

      if (colNum === 1) {
        cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "0F172A" } };
      }
      if (colNum === 2) {
        cell.alignment = { vertical: "middle", horizontal: "right" };
        if (k.fmt === "da") {
          cell.numFmt = '#,##0 "DA"';
        }
        if (k.highlight === "emerald") {
          setCellFill(cell, COLORS.emeraldLight);
          cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: COLORS.emeraldDark } };
        } else if (k.highlight === "rose") {
          setCellFill(cell, COLORS.roseLight);
          cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: COLORS.roseDark } };
        } else if (k.highlight === "cyan") {
          setCellFill(cell, COLORS.cyanLight);
          cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: COLORS.cyanDark } };
        } else if (k.highlight === "navy") {
          setCellFill(cell, "E0E7FF");
          cell.font = { name: "Calibri", size: 12, bold: true, color: { argb: COLORS.indigoDark } };
        }
      }
      if (colNum === 4) {
        cell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
        cell.font = { name: "Calibri", size: 9, italic: true, color: { argb: "64748B" } };
      }
    });

    rIdx++;
  });

  // Section 2: Revenue Split Section
  rIdx++;
  ws1.mergeCells(rIdx, 1, rIdx, 4);
  const splitTitle = ws1.getCell(rIdx, 1);
  splitTitle.value = `💰  PARTAGE DES REVENUS (MODE: ${commissionMode.toUpperCase()})`;
  splitTitle.font = { name: "Calibri", size: 12, bold: true, color: { argb: COLORS.white } };
  splitTitle.alignment = { vertical: "middle", indent: 1 };
  setCellFill(splitTitle, COLORS.emeraldFill);
  ws1.getRow(rIdx).height = 28;
  rIdx++;

  // Teacher Share Box
  const teacherRow = ws1.getRow(rIdx);
  teacherRow.values = [
    "🧑‍🏫 Net Payout Enseignant / Teacher Compensation",
    teacherCompensation?.totalTeacherNet || 0,
    "",
    `Calculé selon les groupes actifs (Mode: ${commissionMode})`
  ];
  ws1.mergeCells(rIdx, 2, rIdx, 3);
  teacherRow.height = 30;
  teacherRow.eachCell({ includeEmpty: true }, (cell, colNum) => {
    cell.border = BORDER_THIN;
    setCellFill(cell, "EDE9FE"); // Soft purple
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "4C1D95" } };
    cell.alignment = { vertical: "middle" };
    if (colNum === 2) {
      cell.numFmt = '#,##0 "DA"';
      cell.alignment = { vertical: "middle", horizontal: "right" };
    }
  });
  rIdx++;

  // School Net Box
  const schoolRow = ws1.getRow(rIdx);
  schoolRow.values = [
    "🏫 Part Nette Centre / School Net Retained",
    teacherCompensation?.totalSchoolNet || 0,
    "",
    "Total Grand Cash − Part Enseignant"
  ];
  ws1.mergeCells(rIdx, 2, rIdx, 3);
  schoolRow.height = 30;
  schoolRow.eachCell({ includeEmpty: true }, (cell, colNum) => {
    cell.border = BORDER_THIN;
    setCellFill(cell, COLORS.emeraldLight);
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: COLORS.emeraldDark } };
    cell.alignment = { vertical: "middle" };
    if (colNum === 2) {
      cell.numFmt = '#,##0 "DA"';
      cell.alignment = { vertical: "middle", horizontal: "right" };
    }
  });
  rIdx++;

  // Section 3: Group Breakdowns Table
  rIdx++;
  ws1.mergeCells(rIdx, 1, rIdx, 9);
  const grpTitle = ws1.getCell(rIdx, 1);
  grpTitle.value = "📁  RÉPARTITION DÉTAILLÉE PAR GROUPE (GROUP PAYMENT DETAILS)";
  grpTitle.font = { name: "Calibri", size: 12, bold: true, color: { argb: COLORS.white } };
  grpTitle.alignment = { vertical: "middle", indent: 1 };
  setCellFill(grpTitle, COLORS.navyDark);
  ws1.getRow(rIdx).height = 28;
  rIdx++;

  const grpHeaderRow = ws1.getRow(rIdx);
  grpHeaderRow.values = [
    "Nom du Groupe / Formation",
    "Effectif",
    "Frais Prévus (DA)",
    "Scolarité Encaissée (DA)",
    "Reste à Payer (DA)",
    "Assurance 800 DA",
    "Total Caisse (DA)",
    "Part Enseignant (DA)",
    "Part Centre (DA)"
  ];
  grpHeaderRow.height = 28;
  grpHeaderRow.eachCell((cell) => {
    setCellFill(cell, COLORS.indigoHeader);
    cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: COLORS.white } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = BORDER_HEADER;
  });
  rIdx++;

  (teacherCompensation?.groupBreakdowns || []).forEach((gb, i) => {
    const row = ws1.getRow(rIdx);
    row.values = [
      gb.groupName || "General",
      `${gb.totalCount || gb.studentCount || 0} Élèves`,
      gb.expectedTuition || (gb.totalCount ? gb.totalCount * 7500 : 0),
      gb.collectedTuition || 0,
      gb.restTuition || 0,
      gb.assuranceCollected || (gb.assuranceCount ? gb.assuranceCount * 800 : 0),
      gb.totalGroupCash || ((gb.collectedTuition || 0) + (gb.assuranceCollected || 0)),
      gb.teacherPayout || gb.teacherNet || 0,
      gb.schoolNet || Math.max(0, (gb.totalGroupCash || gb.collectedTuition || 0) - (gb.teacherPayout || gb.teacherNet || 0))
    ];
    row.height = 25;

    const bg = i % 2 === 0 ? COLORS.white : COLORS.grayZebra;
    row.eachCell({ includeEmpty: true }, (cell, colNum) => {
      cell.border = BORDER_THIN;
      setCellFill(cell, bg);
      cell.font = { name: "Calibri", size: 10, color: { argb: "1E293B" } };
      cell.alignment = { vertical: "middle", horizontal: "center" };

      if (colNum === 1) {
        cell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
        cell.font = { name: "Calibri", size: 10, bold: true };
      }
      if (colNum >= 3 && colNum <= 9) {
        cell.numFmt = '#,##0 "DA"';
        cell.alignment = { vertical: "middle", horizontal: "right" };
      }
      if (colNum === 4 && (gb.collectedTuition || 0) > 0) {
        cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: COLORS.emeraldDark } };
      }
      if (colNum === 5 && (gb.restTuition || 0) > 0) {
        setCellFill(cell, COLORS.roseLight);
        cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: COLORS.roseDark } };
      }
      if (colNum === 8) {
        setCellFill(cell, "EDE9FE");
        cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "4C1D95" } };
      }
      if (colNum === 9) {
        setCellFill(cell, COLORS.emeraldLight);
        cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: COLORS.emeraldDark } };
      }
    });

    rIdx++;
  });

  ws1.columns = [
    { width: 32 }, // Group
    { width: 14 }, // Count
    { width: 20 }, // Expected
    { width: 22 }, // Collected
    { width: 20 }, // Rest
    { width: 20 }, // Assurance
    { width: 22 }, // Total Cash
    { width: 22 }, // Teacher Net
    { width: 22 }  // School Net
  ];

  // ═════════════════════════════════════════════════════════════════════════════
  // SHEET 2: DÉTAIL DES PAIEMENTS PAR ÉLÈVE
  // ═════════════════════════════════════════════════════════════════════════════
  const ws2 = wb.addWorksheet("Détail des Paiements", {
    views: [{ showGridLines: true }]
  });

  const title2 = `${schoolInfo.short.toUpperCase()} SCHOOL — DÉTAIL DES PAIEMENTS PAR ÉLÈVE`;
  const sub2 = `Mois: ${periodName}   |   Enseignant: ${teacher?.name || "Ameyoud Adam"}`;
  const meta2 = `Total Élèves: ${students.length}   |   Export: ${nowFormatted()}`;

  createBanner(ws2, title2, sub2, meta2, 11);

  const studentTableCols = [
    "N°",
    "Nom et Prénom de l'Élève",
    "Groupe / Formation",
    "Téléphone Parent",
    "Frais Scolarité (DA)",
    "Montant Payé (DA)",
    "Reste à Payer (DA)",
    "Assurance (800 DA)",
    "État Paiement",
    "Statut Élève",
    "Observations"
  ];

  const stHeadRow = ws2.getRow(5);
  stHeadRow.values = studentTableCols;
  stHeadRow.height = 32;
  stHeadRow.eachCell((cell) => {
    setCellFill(cell, COLORS.indigoHeader);
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: COLORS.white } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = BORDER_HEADER;
  });

  let sumTuition = 0;
  let sumPaid = 0;
  let sumRest = 0;
  let sumAssurance = 0;

  let stRowIdx = 6;

  students.forEach((s, idx) => {
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

    let payStatusText = "Unpaid / Non Payé";
    let payStatusBg = COLORS.roseLight;
    let payStatusColor = COLORS.roseDark;

    if (paid >= tuition) {
      payStatusText = "Paid / Payé 100% ✓";
      payStatusBg = COLORS.emeraldLight;
      payStatusColor = COLORS.emeraldDark;
    } else if (paid > 0) {
      payStatusText = `Partial (${paid.toLocaleString()} DA)`;
      payStatusBg = COLORS.amberLight;
      payStatusColor = COLORS.amberDark;
    }

    const row = ws2.getRow(stRowIdx);
    row.values = [
      idx + 1,
      s.name || "—",
      s.groupName || s.studentProfile?.course || "General",
      s.studentProfile?.parentPhone || s.phone || "—",
      tuition,
      paid,
      rest,
      hasAssurance ? "Paid (800 DA) ✓" : "Unpaid",
      payStatusText,
      isStopped ? "Stopped ⛔" : "Active 🟢",
      payment.notes || s.notes || ""
    ];

    row.height = 26;
    const isEven = idx % 2 === 0;
    const rowBg = isEven ? COLORS.white : COLORS.grayZebra;

    row.eachCell({ includeEmpty: true }, (cell, colNum) => {
      cell.border = BORDER_THIN;
      setCellFill(cell, rowBg);
      cell.font = { name: "Calibri", size: 10, color: { argb: "1E293B" } };
      cell.alignment = { vertical: "middle", horizontal: "center" };

      if (colNum === 2) {
        cell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
        cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "0F172A" } };
      }
      if (colNum === 3) {
        cell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
      }
      if (colNum === 5 || colNum === 6 || colNum === 7) {
        cell.numFmt = '#,##0 "DA"';
        cell.alignment = { vertical: "middle", horizontal: "right" };
        if (colNum === 6 && paid > 0) {
          cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: COLORS.emeraldDark } };
        }
        if (colNum === 7 && rest > 0) {
          cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: COLORS.roseDark } };
        }
      }
      if (colNum === 8) {
        if (hasAssurance) {
          setCellFill(cell, COLORS.cyanLight);
          cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: COLORS.cyanDark } };
        }
      }
      if (colNum === 9) {
        setCellFill(cell, payStatusBg);
        cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: payStatusColor } };
      }
      if (colNum === 10) {
        if (isStopped) {
          setCellFill(cell, COLORS.roseLight);
          cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: COLORS.roseDark } };
        } else {
          setCellFill(cell, COLORS.emeraldLight);
          cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: COLORS.emeraldDark } };
        }
      }
    });

    stRowIdx++;
  });

  // Totals Row
  stRowIdx++;
  const totalRow = ws2.getRow(stRowIdx);
  totalRow.values = [
    "TOTALS",
    `${students.length} Élèves Total`,
    "",
    "",
    sumTuition,
    sumPaid,
    sumRest,
    `${sumAssurance.toLocaleString()} DA`,
    sumRest === 0 ? "Complet 100% ✓" : `Reste: ${sumRest.toLocaleString()} DA`,
    "",
    ""
  ];

  totalRow.height = 32;
  totalRow.eachCell({ includeEmpty: true }, (cell, colNum) => {
    setCellFill(cell, COLORS.navyDark);
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: COLORS.white } };
    cell.border = BORDER_HEADER;
    cell.alignment = { vertical: "middle", horizontal: "center" };

    if (colNum === 5 || colNum === 6 || colNum === 7) {
      cell.numFmt = '#,##0 "DA"';
      cell.alignment = { vertical: "middle", horizontal: "right" };
    }
  });

  ws2.columns = [
    { width: 7 },   // N°
    { width: 30 },  // Name
    { width: 22 },  // Group
    { width: 16 },  // Phone
    { width: 18 },  // Tuition
    { width: 18 },  // Paid
    { width: 18 },  // Rest
    { width: 20 },  // Assurance
    { width: 22 },  // Status
    { width: 16 },  // Student Status
    { width: 24 }   // Notes
  ];

  const buffer = await wb.xlsx.writeBuffer();
  const exportFileName = fileName || `${schoolInfo.short}_Rapport_Financier_${month}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), exportFileName);
}
