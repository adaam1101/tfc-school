import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { schoolInfo } from "../config/branding.js";

// ── Color Palette Constants ──────────────────────────────────────────────────
const COLORS = {
  navyDark:     "0F172A", // Deep Navy Blue
  navySlate:    "1E293B", // Dark Slate
  brandBlue:    "1D4ED8", // Brand Blue
  indigoHeader: "1E40AF", // Rich Header Indigo
  emeraldHeader:"047857", // Deep Emerald
  emeraldLight: "DCFCE7", // Mint Green
  emeraldDark:  "15803D", // Forest Green
  amberLight:   "FEF3C7", // Soft Amber
  amberDark:    "B45309", // Warm Amber
  roseLight:    "FEE2E2", // Soft Rose
  roseDark:     "B91C1C", // Dark Crimson
  cyanLight:    "CCFBF1", // Soft Cyan
  cyanDark:     "0F766E", // Teal
  purpleLight:  "EDE9FE", // Soft Purple
  purpleDark:   "6D28D9", // Deep Purple
  grayZebra:    "F8FAFC", // Off-white zebra
  grayBorder:   "CBD5E1", // Soft Gray border
  grayLight:    "F1F5F9", // Card fill
  white:        "FFFFFF",
};

const BORDER_THIN = {
  top:    { style: "thin", color: { argb: COLORS.grayBorder } },
  left:   { style: "thin", color: { argb: COLORS.grayBorder } },
  bottom: { style: "thin", color: { argb: COLORS.grayBorder } },
  right:  { style: "thin", color: { argb: COLORS.grayBorder } },
};

const BORDER_HEADER = {
  top:    { style: "medium", color: { argb: COLORS.navyDark } },
  left:   { style: "thin",   color: { argb: "94A3B8" } },
  bottom: { style: "medium", color: { argb: COLORS.navyDark } },
  right:  { style: "thin",   color: { argb: "94A3B8" } },
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

const setCellFill = (cell, argbColor) => {
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: argbColor }
  };
};

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. EXPORT STUDENTS ROSTER TO EXCEL (Clean, Useful, Filterable, Formatted)
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

  const ws = wb.addWorksheet("Liste des Élèves", {
    views: [{ state: "frozen", xSplit: 0, ySplit: 8, showGridLines: true }]
  });

  const totalCols = 13;

  // ── 1. Top Header Banner ──────────────────────────────────────────────────
  ws.mergeCells(1, 1, 1, totalCols);
  const r1 = ws.getCell(1, 1);
  r1.value = `🎓  ${schoolInfo.short.toUpperCase()} SCHOOL — LISTE OFFICIELLE DES ÉLÈVES / STUDENT ROSTER`;
  r1.font = { name: "Calibri", size: 15, bold: true, color: { argb: COLORS.white } };
  r1.alignment = { vertical: "middle", horizontal: "center" };
  setCellFill(r1, COLORS.navyDark);
  ws.getRow(1).height = 36;

  ws.mergeCells(2, 1, 2, totalCols);
  const r2 = ws.getCell(2, 1);
  r2.value = `${schoolInfo.name} · ${schoolInfo.city} · Tél: ${schoolInfo.phones[0] || "+213 561 502 098"}   |   Enseignant: ${teacherName}   |   Groupe: ${groupName}   |   Exporté le: ${nowFormatted()}`;
  r2.font = { name: "Calibri", size: 10, bold: true, color: { argb: "93C5FD" } };
  r2.alignment = { vertical: "middle", horizontal: "center" };
  setCellFill(r2, COLORS.navySlate);
  ws.getRow(2).height = 22;

  // Row 3: Spacer
  ws.getRow(3).height = 8;

  // ── 2. KPI Summary Cards (Rows 4-5) ───────────────────────────────────────
  let totalTuition = 0;
  let totalPaid = 0;
  let totalRest = 0;
  let totalAssuranceCount = 0;

  students.forEach((s) => {
    const payment = s.currentPayment || {};
    const tuition = payment.amount ?? 7500;
    const paid = payment.paidAmount ?? 0;
    const rest = Math.max(0, tuition - paid);
    totalTuition += tuition;
    totalPaid += paid;
    totalRest += rest;
    if (payment.assurancePaid) totalAssuranceCount += 1;
  });

  const kpiCards = [
    { title: "EFFECTIF TOTAL", val: `${students.length} Élèves`, bg: "EFF6FF", text: "1E40AF", border: "BFDBFE", startCol: 1, endCol: 3 },
    { title: "SCOLARITÉ ENCAISSÉE", val: `${totalPaid.toLocaleString()} DA`, bg: COLORS.emeraldLight, text: COLORS.emeraldDark, border: "A7F3D0", startCol: 4, endCol: 6 },
    { title: "RESTE GLOBAL DÛ", val: `${totalRest.toLocaleString()} DA`, bg: COLORS.roseLight, text: COLORS.roseDark, border: "FECDD3", startCol: 7, endCol: 9 },
    { title: "ASSURANCES (800 DA)", val: `${totalAssuranceCount} Payées (${(totalAssuranceCount * 800).toLocaleString()} DA)`, bg: COLORS.cyanLight, text: COLORS.cyanDark, border: "A5F3FC", startCol: 10, endCol: 13 }
  ];

  kpiCards.forEach((c) => {
    ws.mergeCells(4, c.startCol, 4, c.endCol);
    const tCell = ws.getCell(4, c.startCol);
    tCell.value = c.title;
    tCell.font = { name: "Calibri", size: 9, bold: true, color: { argb: "64748B" } };
    tCell.alignment = { vertical: "middle", horizontal: "center" };
    setCellFill(tCell, c.bg);

    ws.mergeCells(5, c.startCol, 5, c.endCol);
    const vCell = ws.getCell(5, c.startCol);
    vCell.value = c.val;
    vCell.font = { name: "Calibri", size: 13, bold: true, color: { argb: c.text } };
    vCell.alignment = { vertical: "middle", horizontal: "center" };
    setCellFill(vCell, c.bg);

    for (let col = c.startCol; col <= c.endCol; col++) {
      ws.getCell(4, col).border = { top: { style: "thin", color: { argb: c.border } }, left: { style: "thin", color: { argb: c.border } }, right: { style: "thin", color: { argb: c.border } } };
      ws.getCell(5, col).border = { bottom: { style: "thin", color: { argb: c.border } }, left: { style: "thin", color: { argb: c.border } }, right: { style: "thin", color: { argb: c.border } } };
    }
  });

  ws.getRow(4).height = 18;
  ws.getRow(5).height = 24;
  ws.getRow(6).height = 10; // Spacer

  // ── 3. Table Headers (Row 8) ──────────────────────────────────────────────
  const headers = [
    "N°",
    "Nom et Prénom de l'Élève",
    "Groupe / Niveau",
    "Téléphone Élève",
    "Téléphone Parent",
    "Séances",
    "Absences",
    "Frais Scolarité (DA)",
    "Montant Payé (DA)",
    "Reste à Payer (DA)",
    "Assurance (800 DA)",
    "État Paiement",
    "Statut"
  ];

  const headerRow = ws.getRow(8);
  headerRow.values = headers;
  headerRow.height = 30;

  headerRow.eachCell((cell) => {
    setCellFill(cell, COLORS.indigoHeader);
    cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: COLORS.white } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = BORDER_HEADER;
  });

  // Enable AutoFilter on Table Headers
  ws.autoFilter = {
    from: { row: 8, column: 1 },
    to:   { row: 8, column: totalCols }
  };

  // Sort students by group name first, then student name
  const sortedStudents = [...students].sort((a, b) => {
    const grpA = (a.groupName || a.studentProfile?.course || "").toLowerCase();
    const grpB = (b.groupName || b.studentProfile?.course || "").toLowerCase();
    if (grpA !== grpB) return grpA.localeCompare(grpB);
    return (a.name || "").localeCompare(b.name || "");
  });

  let rowIdx = 9;
  const startDataRow = rowIdx;

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

    let payStatusText = "Unpaid";
    let payStatusBg = COLORS.roseLight;
    let payStatusColor = COLORS.roseDark;

    if (paid >= tuition) {
      payStatusText = "Paid 100% ✓";
      payStatusBg = COLORS.emeraldLight;
      payStatusColor = COLORS.emeraldDark;
    } else if (paid > 0) {
      payStatusText = "Partial";
      payStatusBg = COLORS.amberLight;
      payStatusColor = COLORS.amberDark;
    }

    const row = ws.getRow(rowIdx);
    row.values = [
      idx + 1,
      s.name || "—",
      currentGroup,
      s.phone || s.studentProfile?.phone || "—",
      s.studentProfile?.parentPhone || "—",
      `${sessions}/${s.targetSessions || 12}`,
      absences,
      tuition,
      paid,
      rest,
      hasAssurance ? "Paid ✓" : "Unpaid",
      payStatusText,
      isStopped ? "Stopped ⛔" : "Active 🟢"
    ];

    row.height = 24;
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
      if (colNum === 8 || colNum === 9 || colNum === 10) {
        cell.numFmt = '#,##0 "DA"';
        cell.alignment = { vertical: "middle", horizontal: "right" };
        if (colNum === 9 && paid > 0) {
          cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: COLORS.emeraldDark } };
        }
        if (colNum === 10 && rest > 0) {
          setCellFill(cell, COLORS.roseLight);
          cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: COLORS.roseDark } };
        }
      }
      if (colNum === 7 && absences > 2) {
        setCellFill(cell, COLORS.roseLight);
        cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: COLORS.roseDark } };
      }
      if (colNum === 11) {
        if (hasAssurance) {
          setCellFill(cell, COLORS.cyanLight);
          cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: COLORS.cyanDark } };
        }
      }
      if (colNum === 12) {
        setCellFill(cell, payStatusBg);
        cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: payStatusColor } };
      }
      if (colNum === 13) {
        if (isStopped) {
          setCellFill(cell, COLORS.roseLight);
          cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: COLORS.roseDark } };
        } else {
          setCellFill(cell, COLORS.emeraldLight);
          cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: COLORS.emeraldDark } };
        }
      }
    });

    rowIdx++;
  });

  const endDataRow = rowIdx - 1;

  // ── 4. Grand Totals Row with Formulas ──────────────────────────────────────
  const totalRow = ws.getRow(rowIdx);
  totalRow.values = [
    "TOTALS",
    `${students.length} Élèves Total`,
    "",
    "",
    "",
    "",
    "",
    { formula: `SUM(H${startDataRow}:H${endDataRow})` },
    { formula: `SUM(I${startDataRow}:I${endDataRow})` },
    { formula: `SUM(J${startDataRow}:J${endDataRow})` },
    `${totalAssuranceCount} Payées`,
    totalRest === 0 ? "Complet 100% ✓" : `Reste: ${totalRest.toLocaleString()} DA`,
    ""
  ];

  totalRow.height = 30;
  totalRow.eachCell({ includeEmpty: true }, (cell, colNum) => {
    setCellFill(cell, COLORS.navyDark);
    cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: COLORS.white } };
    cell.border = BORDER_HEADER;
    cell.alignment = { vertical: "middle", horizontal: "center" };

    if (colNum === 8 || colNum === 9 || colNum === 10) {
      cell.numFmt = '#,##0 "DA"';
      cell.alignment = { vertical: "middle", horizontal: "right" };
    }
  });

  ws.columns = [
    { width: 7 },   // N°
    { width: 28 },  // Nom
    { width: 20 },  // Groupe
    { width: 16 },  // Tél
    { width: 16 },  // Tél Parent
    { width: 12 },  // Séances
    { width: 12 },  // Absences
    { width: 18 },  // Scolarité
    { width: 18 },  // Payé
    { width: 18 },  // Reste
    { width: 18 },  // Assurance
    { width: 16 },  // État
    { width: 16 }   // Statut
  ];

  const buffer = await wb.xlsx.writeBuffer();
  const exportFileName = fileName || `${schoolInfo.short}_Students_${groupName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), exportFileName);
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 2. EXPORT MONTHLY FINANCIAL RAPPORT (Executive Dashboard & Complete Ledger)
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
  // SHEET 1: RAPPORT FINANCIER & COMPTABILITÉ (One Comprehensive Sheet)
  // ═════════════════════════════════════════════════════════════════════════════
  const ws = wb.addWorksheet("Rapport Financier", {
    views: [{ state: "frozen", xSplit: 0, ySplit: 18, showGridLines: true }]
  });

  const totalCols = 11;

  // ── 1. Top Header Banner ──────────────────────────────────────────────────
  ws.mergeCells(1, 1, 1, totalCols);
  const r1 = ws.getCell(1, 1);
  r1.value = `🎓  ${schoolInfo.short.toUpperCase()} SCHOOL — RAPPORT FINANCIER MENSUEL & ENCAISSEMENTS`;
  r1.font = { name: "Calibri", size: 16, bold: true, color: { argb: COLORS.white } };
  r1.alignment = { vertical: "middle", horizontal: "center" };
  setCellFill(r1, COLORS.navyDark);
  ws.getRow(1).height = 38;

  ws.mergeCells(2, 1, 2, totalCols);
  const r2 = ws.getCell(2, 1);
  r2.value = `${schoolInfo.name} · ${schoolInfo.city} · ${schoolInfo.address}   |   Période: ${periodName} (${month})   |   Enseignant: ${teacher?.name || "Ameyoud Adam"}   |   Généré le: ${nowFormatted()}`;
  r2.font = { name: "Calibri", size: 10, bold: true, color: { argb: "93C5FD" } };
  r2.alignment = { vertical: "middle", horizontal: "center" };
  setCellFill(r2, COLORS.navySlate);
  ws.getRow(2).height = 22;

  ws.getRow(3).height = 8; // Spacer

  // ── 2. Top Executive KPI Metric Blocks (Rows 4-5) ──────────────────────────
  const kpis = [
    { title: "TOTAL ÉLÈVES", val: `${summary.totalStudents || students.length} Inscrits`, bg: "EFF6FF", text: "1E40AF", border: "BFDBFE", startCol: 1, endCol: 2 },
    { title: "SCOLARITÉ ENCAISSÉE", val: `${(summary.totalCollectedTuition || 0).toLocaleString()} DA`, bg: COLORS.emeraldLight, text: COLORS.emeraldDark, border: "A7F3D0", startCol: 3, endCol: 4 },
    { title: "RESTE À RECOUVRER", val: `${(summary.totalRest || 0).toLocaleString()} DA`, bg: COLORS.roseLight, text: COLORS.roseDark, border: "FECDD3", startCol: 5, endCol: 6 },
    { title: "ASSURANCES (800 DA)", val: `${(summary.totalAssuranceCollected || 0).toLocaleString()} DA`, bg: COLORS.cyanLight, text: COLORS.cyanDark, border: "A5F3FC", startCol: 7, endCol: 7 },
    { title: "PART ENSEIGNANT", val: `${(teacherCompensation?.totalTeacherNet || 0).toLocaleString()} DA`, bg: COLORS.purpleLight, text: COLORS.purpleDark, border: "DDD6FE", startCol: 8, endCol: 9 },
    { title: "PART NETTE CENTRE", val: `${(teacherCompensation?.totalSchoolNet || 0).toLocaleString()} DA`, bg: "ECFDF5", text: "047857", border: "A7F3D0", startCol: 10, endCol: 11 },
  ];

  kpis.forEach((k) => {
    ws.mergeCells(4, k.startCol, 4, k.endCol);
    const tCell = ws.getCell(4, k.startCol);
    tCell.value = k.title;
    tCell.font = { name: "Calibri", size: 9, bold: true, color: { argb: "64748B" } };
    tCell.alignment = { vertical: "middle", horizontal: "center" };
    setCellFill(tCell, k.bg);

    ws.mergeCells(5, k.startCol, 5, k.endCol);
    const vCell = ws.getCell(5, k.startCol);
    vCell.value = k.val;
    vCell.font = { name: "Calibri", size: 12, bold: true, color: { argb: k.text } };
    vCell.alignment = { vertical: "middle", horizontal: "center" };
    setCellFill(vCell, k.bg);

    for (let col = k.startCol; col <= k.endCol; col++) {
      ws.getCell(4, col).border = { top: { style: "thin", color: { argb: k.border } }, left: { style: "thin", color: { argb: k.border } }, right: { style: "thin", color: { argb: k.border } } };
      ws.getCell(5, col).border = { bottom: { style: "thin", color: { argb: k.border } }, left: { style: "thin", color: { argb: k.border } }, right: { style: "thin", color: { argb: k.border } } };
    }
  });

  ws.getRow(4).height = 18;
  ws.getRow(5).height = 26;
  ws.getRow(6).height = 10; // Spacer

  // ── 3. Group-by-Group Summary Breakdown Table (Rows 7-14) ──────────────────
  ws.mergeCells(7, 1, 7, totalCols);
  const grpTitle = ws.getCell(7, 1);
  grpTitle.value = `📊  RÉSUMÉ ET DÉTAIL DES PAIEMENTS PAR GROUPE (MODE DE CALCUL: ${commissionMode.toUpperCase()})`;
  grpTitle.font = { name: "Calibri", size: 11, bold: true, color: { argb: COLORS.white } };
  grpTitle.alignment = { vertical: "middle", indent: 1 };
  setCellFill(grpTitle, COLORS.navySlate);
  ws.getRow(7).height = 24;

  const grpHeaders = [
    "Nom du Groupe",
    "Effectif",
    "Scolarité Prévue (DA)",
    "Scolarité Encaissée (DA)",
    "Reste à Payer (DA)",
    "Assurance (800 DA)",
    "Total Caisse (DA)",
    "Part Enseignant (DA)",
    "Part Centre (DA)",
    "Taux Recouvrement",
    "Statuts Paiements"
  ];

  const grpHeaderRow = ws.getRow(8);
  grpHeaderRow.values = grpHeaders;
  grpHeaderRow.height = 26;
  grpHeaderRow.eachCell((cell) => {
    setCellFill(cell, COLORS.indigoHeader);
    cell.font = { name: "Calibri", size: 9, bold: true, color: { argb: COLORS.white } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = BORDER_HEADER;
  });

  let gRowIdx = 9;
  (teacherCompensation?.groupBreakdowns || []).forEach((gb, idx) => {
    const row = ws.getRow(gRowIdx);
    const count = gb.totalCount || gb.studentCount || 0;
    const expected = gb.expectedTuition || (count * 7500);
    const collected = gb.collectedTuition || 0;
    const rest = gb.restTuition || 0;
    const assurance = gb.assuranceCollected || (gb.assuranceCount ? gb.assuranceCount * 800 : 0);
    const totalCash = gb.totalGroupCash || (collected + assurance);
    const teacherPayout = gb.teacherPayout || gb.teacherNet || 0;
    const schoolNet = gb.schoolNet || Math.max(0, totalCash - teacherPayout);
    const rate = expected > 0 ? `${Math.round((collected / expected) * 100)}%` : "100%";
    const statsStr = `${gb.countPaid || 0} Payés · ${gb.countPartial || 0} Part · ${gb.countUnpaid || 0} Impayés`;

    row.values = [
      gb.groupName || "General",
      `${count} Élèves`,
      expected,
      collected,
      rest,
      assurance,
      totalCash,
      teacherPayout,
      schoolNet,
      rate,
      statsStr
    ];

    row.height = 22;
    const bg = idx % 2 === 0 ? COLORS.white : COLORS.grayZebra;

    row.eachCell({ includeEmpty: true }, (cell, colNum) => {
      cell.border = BORDER_THIN;
      setCellFill(cell, bg);
      cell.font = { name: "Calibri", size: 9, color: { argb: "1E293B" } };
      cell.alignment = { vertical: "middle", horizontal: "center" };

      if (colNum === 1) {
        cell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
        cell.font = { name: "Calibri", size: 9, bold: true };
      }
      if (colNum >= 3 && colNum <= 9) {
        cell.numFmt = '#,##0 "DA"';
        cell.alignment = { vertical: "middle", horizontal: "right" };
      }
      if (colNum === 4) {
        cell.font = { name: "Calibri", size: 9, bold: true, color: { argb: COLORS.emeraldDark } };
      }
      if (colNum === 5 && rest > 0) {
        setCellFill(cell, COLORS.roseLight);
        cell.font = { name: "Calibri", size: 9, bold: true, color: { argb: COLORS.roseDark } };
      }
      if (colNum === 8) {
        setCellFill(cell, COLORS.purpleLight);
        cell.font = { name: "Calibri", size: 9, bold: true, color: { argb: COLORS.purpleDark } };
      }
      if (colNum === 9) {
        setCellFill(cell, COLORS.emeraldLight);
        cell.font = { name: "Calibri", size: 9, bold: true, color: { argb: COLORS.emeraldDark } };
      }
    });

    gRowIdx++;
  });

  // Spacer between tables
  ws.getRow(gRowIdx).height = 12;
  gRowIdx++;

  // ── 4. Complete Student Payment Ledger Table (Row gRowIdx) ─────────────────
  ws.mergeCells(gRowIdx, 1, gRowIdx, totalCols);
  const stLedgerTitle = ws.getCell(gRowIdx, 1);
  stLedgerTitle.value = `👥  DÉTAIL NOMINATIF DES PAIEMENTS PAR ÉLÈVE (${students.length} ÉLÈVES INSCRITS)`;
  stLedgerTitle.font = { name: "Calibri", size: 11, bold: true, color: { argb: COLORS.white } };
  stLedgerTitle.alignment = { vertical: "middle", indent: 1 };
  setCellFill(stLedgerTitle, COLORS.navyDark);
  ws.getRow(gRowIdx).height = 26;
  gRowIdx++;

  const studentCols = [
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
    "Observations / Notes"
  ];

  const stHeadRow = ws.getRow(gRowIdx);
  stHeadRow.values = studentCols;
  stHeadRow.height = 28;
  stHeadRow.eachCell((cell) => {
    setCellFill(cell, COLORS.indigoHeader);
    cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: COLORS.white } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = BORDER_HEADER;
  });

  // AutoFilter for the student ledger
  ws.autoFilter = {
    from: { row: gRowIdx, column: 1 },
    to:   { row: gRowIdx, column: totalCols }
  };

  const studentStartRow = gRowIdx + 1;
  let sRowIdx = studentStartRow;

  // Sort students by group, then by name
  const sortedStudents = [...students].sort((a, b) => {
    const grpA = (a.groupName || a.studentProfile?.course || "").toLowerCase();
    const grpB = (b.groupName || b.studentProfile?.course || "").toLowerCase();
    if (grpA !== grpB) return grpA.localeCompare(grpB);
    return (a.name || "").localeCompare(b.name || "");
  });

  let sumAssurance = 0;

  sortedStudents.forEach((s, idx) => {
    const tuition = s.tuitionFee ?? (s.currentPayment?.amount ?? 7500);
    const paid = s.paidTuition ?? (s.currentPayment?.paidAmount ?? 0);
    const rest = s.rest != null ? s.rest : Math.max(0, tuition - paid);
    const hasAssurance = Boolean(s.assurancePaid || s.currentPayment?.assurancePaid);
    const isStopped = s.studentProfile?.isStopped || s.status === "stopped";

    if (hasAssurance) sumAssurance += 800;

    let payStatusText = "Unpaid";
    let payStatusBg = COLORS.roseLight;
    let payStatusColor = COLORS.roseDark;

    if (paid >= tuition) {
      payStatusText = "Paid 100% ✓";
      payStatusBg = COLORS.emeraldLight;
      payStatusColor = COLORS.emeraldDark;
    } else if (paid > 0) {
      payStatusText = "Partial";
      payStatusBg = COLORS.amberLight;
      payStatusColor = COLORS.amberDark;
    }

    const row = ws.getRow(sRowIdx);
    row.values = [
      idx + 1,
      s.name || "—",
      s.groupName || s.studentProfile?.course || s.course || "General",
      s.parentPhone || s.studentProfile?.parentPhone || s.phone || "—",
      tuition,
      paid,
      rest,
      hasAssurance ? "Paid (800 DA) ✓" : "Unpaid",
      payStatusText,
      isStopped ? "Stopped ⛔" : "Active 🟢",
      s.notes || s.currentPayment?.notes || ""
    ];

    row.height = 24;
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
          setCellFill(cell, COLORS.roseLight);
          cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: COLORS.roseDark } };
        }
      }
      if (colNum === 8 && hasAssurance) {
        setCellFill(cell, COLORS.cyanLight);
        cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: COLORS.cyanDark } };
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

    sRowIdx++;
  });

  const studentEndRow = sRowIdx - 1;

  // ── 5. Total Row with Dynamic SUM Formulas ────────────────────────────────
  const totalRow = ws.getRow(sRowIdx);
  totalRow.values = [
    "TOTALS",
    `${students.length} Élèves Total`,
    "",
    "",
    { formula: `SUM(E${studentStartRow}:E${studentEndRow})` },
    { formula: `SUM(F${studentStartRow}:F${studentEndRow})` },
    { formula: `SUM(G${studentStartRow}:G${studentEndRow})` },
    `${sumAssurance.toLocaleString()} DA`,
    (summary.totalRest || 0) === 0 ? "Complet 100% ✓" : `Reste: ${(summary.totalRest || 0).toLocaleString()} DA`,
    "",
    ""
  ];

  totalRow.height = 30;
  totalRow.eachCell({ includeEmpty: true }, (cell, colNum) => {
    setCellFill(cell, COLORS.navyDark);
    cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: COLORS.white } };
    cell.border = BORDER_HEADER;
    cell.alignment = { vertical: "middle", horizontal: "center" };

    if (colNum === 5 || colNum === 6 || colNum === 7) {
      cell.numFmt = '#,##0 "DA"';
      cell.alignment = { vertical: "middle", horizontal: "right" };
    }
  });

  // Set calibrated column widths for Excel
  ws.columns = [
    { width: 7 },   // N°
    { width: 28 },  // Nom
    { width: 22 },  // Groupe
    { width: 16 },  // Tél Parent
    { width: 18 },  // Scolarité
    { width: 18 },  // Payé
    { width: 18 },  // Reste
    { width: 20 },  // Assurance
    { width: 18 },  // État Paiement
    { width: 16 },  // Statut
    { width: 26 }   // Notes
  ];

  const buffer = await wb.xlsx.writeBuffer();
  const exportFileName = fileName || `${schoolInfo.short}_Rapport_Financier_${month}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), exportFileName);
}
