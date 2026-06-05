import React, { useEffect, useMemo, useState } from "react";
import { Wallet, Plus, Trash2, CheckCircle2, RefreshCcw, DollarSign } from "lucide-react";
import { api, getApiError } from "../../api/http.js";
import ErrorAlert from "../../components/ErrorAlert.jsx";

const statusBadge = {
  paid: "bg-emerald-100 text-emerald-800",
  partial: "bg-amber-100 text-amber-800",
  unpaid: "bg-rose-100 text-rose-800"
};

const emptyForm = { student: "", period: "", amount: "", paidAmount: "", method: "cash", note: "" };

export default function PaymentsPanel({ students = [] }) {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm((c) => ({ ...c, [key]: e.target.value }));

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.get("/payments", { params: statusFilter ? { status: statusFilter } : {} });
      setPayments(data.payments);
      setSummary(data.summary || []);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/payments", {
        ...form,
        amount: Number(form.amount),
        paidAmount: Number(form.paidAmount || 0)
      });
      setForm(emptyForm);
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
    } catch (err) { setError(getApiError(err)); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this payment record?")) return;
    try {
      await api.delete(`/payments/${id}`);
      load();
    } catch (err) { setError(getApiError(err)); }
  };

  const totals = useMemo(() => {
    const get = (s) => summary.find((x) => x._id === s) || { count: 0, total: 0, collected: 0 };
    const collected = summary.reduce((sum, x) => sum + (x.collected || 0), 0);
    const billed = summary.reduce((sum, x) => sum + (x.total || 0), 0);
    return { unpaid: get("unpaid"), partial: get("partial"), paid: get("paid"), collected, billed };
  }, [summary]);

  return (
    <div className="grid gap-6">
      <ErrorAlert message={error} />

      {/* Summary tiles */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Collected</p>
          <p className="mt-1 text-2xl font-black text-emerald-600">{totals.collected.toLocaleString()} DA</p>
          <p className="text-xs text-slate-400">of {totals.billed.toLocaleString()} DA billed</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Unpaid</p>
          <p className="mt-1 text-2xl font-black text-rose-600">{totals.unpaid.count}</p>
          <p className="text-xs text-slate-400">students owe fees</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Fully paid</p>
          <p className="mt-1 text-2xl font-black text-sky-600">{totals.paid.count}</p>
          <p className="text-xs text-slate-400">records settled</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.3fr]">
        {/* Record payment */}
        <div className="card p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-sky-600 p-2.5 shadow-sm">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Record a payment</h2>
              <p className="text-sm text-slate-500">Add a fee record for a student</p>
            </div>
          </div>

          <form className="grid gap-4" onSubmit={submit}>
            <label className="field">
              Student
              <select className="input" value={form.student} onChange={set("student")} required>
                <option value="">Select student…</option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>{s.name} — {s.studentProfile?.course || ""}</option>
                ))}
              </select>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="field">
                Period
                <input className="input" value={form.period} onChange={set("period")} placeholder="January 2026" required />
              </label>
              <label className="field">
                Method
                <select className="input" value={form.method} onChange={set("method")}>
                  <option value="cash">Cash</option>
                  <option value="transfer">Transfer</option>
                  <option value="card">Card</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label className="field">
                Amount (DA)
                <input className="input" type="number" min="0" value={form.amount} onChange={set("amount")} required />
              </label>
              <label className="field">
                Paid (DA)
                <input className="input" type="number" min="0" value={form.paidAmount} onChange={set("paidAmount")} placeholder="0" />
              </label>
            </div>
            <label className="field">
              Note
              <input className="input" value={form.note} onChange={set("note")} placeholder="Optional" />
            </label>
            <button className="btn-primary justify-center" type="submit" disabled={saving}>
              <Plus className="h-4 w-4" />
              {saving ? "Saving…" : "Add payment"}
            </button>
          </form>
        </div>

        {/* Payment list */}
        <div className="card p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 p-2.5 shadow-sm">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-bold">Payment records</h2>
            </div>
            <div className="flex gap-2">
              <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All</option>
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
              </select>
              <button className="btn-secondary" onClick={load}><RefreshCcw className="h-4 w-4" /></button>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-slate-400">Loading…</p>
          ) : payments.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Student", "Period", "Amount", "Status", ""].map((h) => (
                      <th key={h} className="pb-3 pr-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {payments.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50">
                      <td className="py-3 pr-3 font-medium text-slate-800">{p.student?.name || "—"}</td>
                      <td className="py-3 pr-3 text-slate-600">{p.period}</td>
                      <td className="py-3 pr-3 text-slate-700">
                        {p.paidAmount.toLocaleString()}/{p.amount.toLocaleString()} DA
                      </td>
                      <td className="py-3 pr-3">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusBadge[p.status]}`}>{p.status}</span>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-1.5">
                          {p.status !== "paid" && (
                            <button onClick={() => markPaid(p)} className="rounded-lg bg-emerald-50 p-1.5 text-emerald-700 transition hover:bg-emerald-100" title="Mark fully paid">
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                          )}
                          <button onClick={() => remove(p._id)} className="icon-btn-danger" title="Delete">
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
              <p className="mt-3 text-sm font-medium text-slate-500">No payment records yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
