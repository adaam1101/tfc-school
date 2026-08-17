import React, { useEffect, useMemo, useState } from "react";
import {
  Wallet,
  Plus,
  Trash2,
  CheckCircle2,
  RefreshCcw,
  DollarSign,
  Search,
  X,
  BarChart2,
  Pencil
} from "lucide-react";
import { api, getApiError } from "../../api/http.js";
import ErrorAlert from "../../components/ErrorAlert.jsx";
import { SkeletonTableRow } from "../../components/Skeleton.jsx";

const statusBadge = {
  paid:    "bg-emerald-100 text-emerald-800",
  partial: "bg-amber-100 text-amber-800",
  unpaid:  "bg-rose-100 text-rose-800",
  overdue: "bg-red-100 text-red-800",
  pending: "bg-sky-100 text-sky-800"
};

const emptyForm = {
  student: "",
  month: new Date().toISOString().slice(0, 7),
  period: "",
  amount: "7500",
  paidAmount: "0",
  assuranceAmount: "800",
  assurancePaid: false,
  dueDate: "",
  method: "cash",
  notes: ""
};

import MonthlyFinancialRapportModal from "../../components/MonthlyFinancialRapportModal.jsx";

const PANEL_TABS = [
  { id: "records",  label: "Records",  icon: Wallet    },
  { id: "report",   label: "📊 Monthly Rapport (7,500 DA / Rest / Assurance)", icon: BarChart2 }
];

function formatMonth(m) {
  if (!m) return "–";
  const [year, month] = m.split("-");
  if (!year || !month) return m;
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

function MonthlyReport() {
  const [showModal, setShowModal] = useState(false);
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/payments/report/monthly")
      .then(({ data }) => setReport(data.report || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const maxCollected = useMemo(
    () => Math.max(1, ...report.map((r) => r.totalCollected || 0)),
    [report]
  );

  return (
    <div className="grid gap-6">
      {/* Top Banner with Full Detailed Report Trigger */}
      <div className="rounded-3xl border border-emerald-200 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 p-6 text-white shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-100">
            📊 Executive Financial Rapport
          </span>
          <h3 className="text-xl font-black">
            Monthly Tuition (7,500 DA), Rest & Assurance (800 DA)
          </h3>
          <p className="text-xs text-emerald-100">
            View full student-by-student financial table, rest to collect, insurance totals, and print official documents.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-white text-emerald-950 font-black px-6 py-3.5 text-sm shadow-md hover:bg-emerald-50 active:scale-95 transition-all"
        >
          <BarChart2 className="h-5 w-5 text-emerald-700" />
          <span>Open Full Monthly Rapport</span>
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading summary…</p>
      ) : !report.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-12 text-center">
          <BarChart2 className="h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-500">No payment data yet</p>
        </div>
      ) : (
        <>
          {/* Bar chart */}
          <div className="card p-6">
            <h3 className="mb-4 text-base font-bold text-slate-800 dark:text-white">Monthly Revenue History</h3>
            <div className="flex items-end gap-2 overflow-x-auto pb-2" style={{ minHeight: "160px" }}>
              {[...report].reverse().map((r) => {
                const pct = Math.round(((r.totalCollected || 0) / maxCollected) * 100);
                return (
                  <div key={r._id} className="flex flex-col items-center gap-1" style={{ minWidth: "56px" }}>
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                      {(r.totalCollected || 0).toLocaleString()}
                    </span>
                    <div
                      className="w-10 rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-400 transition-all"
                      style={{ height: `${Math.max(4, (pct / 100) * 130)}px` }}
                      title={`${formatMonth(r._id)}: ${(r.totalCollected || 0).toLocaleString()} DA collected`}
                    />
                    <span className="text-[10px] text-slate-500 text-center">{formatMonth(r._id)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Table */}
          <div className="card p-6">
            <h3 className="mb-4 text-base font-bold text-slate-800 dark:text-white">Aggregate Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="pb-3 pr-4 text-left pl-2">Month</th>
                    <th className="pb-3 pr-4 text-left">Tuition Billed</th>
                    <th className="pb-3 pr-4 text-left">Collected</th>
                    <th className="pb-3 pr-4 text-left">Rest (Remaining)</th>
                    <th className="pb-3 pr-4 text-left">Assurance (800 DA)</th>
                    <th className="pb-3 pr-4 text-left">Paid Students</th>
                    <th className="pb-3 pr-4 text-left">Partial</th>
                    <th className="pb-3 text-left">Unpaid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/60 font-medium">
                  {report.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                      <td className="py-3 pl-2 pr-4 font-bold text-slate-900 dark:text-white">{formatMonth(r._id)}</td>
                      <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">{(r.totalBilled || 0).toLocaleString()} DA</td>
                      <td className="py-3 pr-4 font-bold text-emerald-600 dark:text-emerald-400">{(r.totalCollected || 0).toLocaleString()} DA</td>
                      <td className="py-3 pr-4 font-bold text-rose-600 dark:text-rose-400">{(r.totalRest || 0).toLocaleString()} DA</td>
                      <td className="py-3 pr-4 font-bold text-teal-600 dark:text-teal-400">{(r.totalAssurance || 0).toLocaleString()} DA</td>
                      <td className="py-3 pr-4">
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">{r.countPaid || 0}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">{r.countPartial || 0}</span>
                      </td>
                      <td className="py-3">
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">{r.countPending || 0}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {showModal && (
        <MonthlyFinancialRapportModal onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

export default function PaymentsPanel({ students = [] }) {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ student: "", month: "", status: "" });
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [panelTab, setPanelTab] = useState("records");

  const setF = (key) => (e) => setForm((c) => ({ ...c, [key]: e.target.value }));
  const setFilter = (key) => (e) => setFilters((c) => ({ ...c, [key]: e.target.value }));

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.month)  params.month  = filters.month;
      const { data } = await api.get("/payments", { params });
      setPayments(data.payments || []);
      setSummary(data.summary || []);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filters.status, filters.month]);

  // Client-side name search filter
  const filtered = useMemo(() => {
    if (!search.trim()) return payments;
    const q = search.toLowerCase();
    return payments.filter((p) => p.student?.name?.toLowerCase().includes(q));
  }, [payments, search]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditingId(p._id);
    setForm({
      student:    p.student?._id || p.student || "",
      month:      p.month || "",
      period:     p.period || "",
      amount:     String(p.amount || ""),
      paidAmount: String(p.paidAmount || 0),
      dueDate:    p.dueDate ? p.dueDate.slice(0, 10) : "",
      method:     p.method || "cash",
      notes:      p.notes || p.note || ""
    });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditingId(null); setForm(emptyForm); };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        student:    form.student,
        month:      form.month || undefined,
        period:     form.period || undefined,
        amount:     Number(form.amount),
        paidAmount: Number(form.paidAmount || 0),
        dueDate:    form.dueDate || undefined,
        method:     form.method,
        notes:      form.notes || undefined
      };
      if (editingId) {
        await api.put(`/payments/${editingId}`, payload);
      } else {
        await api.post("/payments", payload);
      }
      closeModal();
      load();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const markPaid = async (p) => {
    try {
      await api.put(`/payments/${p._id}`, { paidAmount: p.amount });
      load();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this payment record?")) return;
    try {
      await api.delete(`/payments/${id}`);
      load();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const totals = useMemo(() => {
    const get = (s) => summary.find((x) => x._id === s) || { count: 0, total: 0, collected: 0 };
    const collectedAll = summary.reduce((acc, x) => acc + (x.collected || 0), 0);
    const overdueTotal = get("overdue").total || 0;
    const pendingCount = (get("unpaid").count || 0) + (get("pending").count || 0);
    return { collectedAll, overdueTotal, pendingCount, paid: get("paid") };
  }, [summary]);

  // Current month for stats display
  const currentMonth = new Date().toISOString().slice(0, 7);

  return (
    <div className="grid gap-6">
      <ErrorAlert message={error} />

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Collected</p>
          <p className="mt-1 text-2xl font-black text-emerald-600">{totals.collectedAll.toLocaleString()} DA</p>
          <p className="text-xs text-slate-400">all time</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Overdue Amount</p>
          <p className="mt-1 text-2xl font-black text-red-600">{totals.overdueTotal.toLocaleString()} DA</p>
          <p className="text-xs text-slate-400">unpaid past due date</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Payments</p>
          <p className="mt-1 text-2xl font-black text-sky-600">{totals.pendingCount}</p>
          <p className="text-xs text-slate-400">awaiting payment</p>
        </div>
      </div>

      {/* Panel tab navigation */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
        {PANEL_TABS.map((t) => {
          const Icon = t.icon;
          const active = panelTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setPanelTab(t.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                active
                  ? "bg-gradient-to-r from-emerald-500 to-brand-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Monthly report tab */}
      {panelTab === "report" && <MonthlyReport />}

      {/* Records tab */}
      {panelTab === "records" && (
        <div className="card p-6">
          {/* Header + Add button */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-brand-600 p-2.5 shadow-sm">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Payment Records</h2>
                <p className="text-sm text-slate-500">{filtered.length} records</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn-secondary" onClick={load}>
                <RefreshCcw className="h-4 w-4" />
              </button>
              <button className="btn-primary" onClick={openAdd}>
                <Plus className="h-4 w-4" />
                Add Payment
              </button>
            </div>
          </div>

          {/* Filter bar */}
          <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_160px_160px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="input pl-9"
                placeholder="Search by student name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <input
              type="month"
              className="input"
              value={filters.month}
              onChange={setFilter("month")}
              title="Filter by month"
            />
            <select className="input" value={filters.status} onChange={setFilter("status")}>
              <option value="">All statuses</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
              <option value="overdue">Overdue</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {loading ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <tbody>{Array.from({ length: 5 }).map((_, i) => <SkeletonTableRow key={i} cols={8} />)}</tbody>
              </table>
            </div>
          ) : filtered.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Student", "Course", "Period / Month", "Amount", "Due date", "Status", "Paid date", "Actions"].map((h) => (
                      <th key={h} className="pb-3 pr-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400 first:pl-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 pl-2 pr-3 font-medium text-slate-800">{p.student?.name || "—"}</td>
                      <td className="py-3 pr-3 text-xs text-slate-500">{p.student?.studentProfile?.course || "—"}</td>
                      <td className="py-3 pr-3 text-slate-600">{p.period || formatMonth(p.month) || "—"}</td>
                      <td className="py-3 pr-3 text-slate-700">
                        <span className="font-semibold">{(p.paidAmount || 0).toLocaleString()}</span>
                        <span className="text-slate-400">/{(p.amount || 0).toLocaleString()} DA</span>
                      </td>
                      <td className="py-3 pr-3 text-xs text-slate-500">
                        {p.dueDate ? new Date(p.dueDate).toLocaleDateString("en-GB") : "—"}
                      </td>
                      <td className="py-3 pr-3">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusBadge[p.status] || "bg-slate-100 text-slate-600"}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-xs text-slate-500">
                        {p.paidDate ? new Date(p.paidDate).toLocaleDateString("en-GB") : "—"}
                      </td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            className="icon-btn"
                            onClick={() => openEdit(p)}
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          {p.status !== "paid" && (
                            <button
                              type="button"
                              onClick={() => markPaid(p)}
                              className="rounded-lg bg-emerald-50 p-2 text-emerald-700 transition hover:bg-emerald-100"
                              title="Mark as Paid"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => remove(p._id)}
                            className="icon-btn-danger"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-12 text-center">
              <Wallet className="h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-500">No payment records found</p>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`rounded-xl p-2.5 shadow-sm ${editingId ? "bg-gradient-to-br from-amber-500 to-orange-500" : "bg-gradient-to-br from-emerald-500 to-brand-600"}`}>
                  {editingId ? <Pencil className="h-5 w-5 text-white" /> : <DollarSign className="h-5 w-5 text-white" />}
                </div>
                <h3 className="text-base font-bold">{editingId ? "Edit payment" : "Add payment"}</h3>
              </div>
              <button type="button" className="icon-btn" onClick={closeModal}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <form className="grid gap-4" onSubmit={submit}>
              {!editingId && (
                <label className="field">
                  Student
                  <select className="input" value={form.student} onChange={setF("student")} required>
                    <option value="">Select student…</option>
                    {students.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} — {s.studentProfile?.course || ""}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="field">
                  Month (YYYY-MM)
                  <input type="month" className="input" value={form.month} onChange={setF("month")} />
                </label>
                <label className="field">
                  Period label
                  <input className="input" value={form.period} onChange={setF("period")} placeholder="e.g. January 2026" />
                </label>
                <label className="field">
                  Tuition Fee (DA)
                  <input className="input font-bold" type="number" min="0" value={form.amount} onChange={setF("amount")} placeholder="7500" required />
                </label>
                <label className="field">
                  Paid Amount (DA)
                  <input className="input font-bold" type="number" min="0" value={form.paidAmount} onChange={setF("paidAmount")} placeholder="0" />
                </label>
                <label className="field">
                  Due date
                  <input type="date" className="input" value={form.dueDate} onChange={setF("dueDate")} />
                </label>
                <label className="field">
                  Method
                  <select className="input" value={form.method} onChange={setF("method")}>
                    <option value="cash">Cash</option>
                    <option value="bank">Bank</option>
                    <option value="transfer">Transfer</option>
                    <option value="card">Card</option>
                    <option value="other">Other</option>
                  </select>
                </label>
              </div>

              {/* Calculated Rest & Assurance Banner */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <div>
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">Rest (Remaining):</span>
                  <span className={`font-black text-sm ${
                    Math.max(0, (Number(form.amount) || 7500) - (Number(form.paidAmount) || 0)) === 0
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}>
                    {Math.max(0, (Number(form.amount) || 7500) - (Number(form.paidAmount) || 0)).toLocaleString()} DA
                  </span>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none font-bold text-slate-700 dark:text-slate-200">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    checked={Boolean(form.assurancePaid)}
                    onChange={(e) => setForm(f => ({ ...f, assurancePaid: e.target.checked }))}
                  />
                  <span>🛡️ Assurance (800 DA) Paid</span>
                </label>
              </div>

              <label className="field">
                Notes
                <input className="input" value={form.notes} onChange={setF("notes")} placeholder="Optional notes" />
              </label>

              <div className="flex gap-2">
                <button className="btn-primary flex-1 justify-center" type="submit" disabled={saving}>
                  {saving ? "Saving…" : editingId ? "Update" : "Add payment"}
                </button>
                <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
