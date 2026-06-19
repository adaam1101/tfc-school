import React, { useState, useEffect } from 'react';
import { useSchool, useLang } from '../App';
import { CreditCard, Users, Search, Edit3, DollarSign, Calendar, FileText, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../api';

export default function ModeratorDashboard() {
  const { school } = useSchool();
  const { lang, t } = useLang();

  const [activeTab, setActiveTab] = useState('payments');
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Payment Record Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [amountPaid, setAmountPaid] = useState(0);
  const [month, setMonth] = useState('');
  const [note, setNote] = useState('');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'payments') {
        const payData = await api.getPayments(school);
        setPayments(payData);
      } else if (activeTab === 'students' || activeTab === 'teachers') {
        const list = await api.getUsers(school);
        setStudents(list.filter(u => u.role === 'student'));
        setTeachers(list.filter(u => u.role === 'teacher'));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, school]);

  const openPaymentModal = (pay) => {
    setSelectedPayment(pay);
    setAmountPaid(pay.amountPaid);
    setMonth(pay.month);
    setNote(pay.note || '');
    setShowModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (amountPaid === '' || isNaN(Number(amountPaid))) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      await api.updatePayment(
        selectedPayment._id, 
        Number(amountPaid), 
        month, 
        note, 
        school
      );
      
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Remaining Balance Dynamic math
  const getRemainingBalance = () => {
    if (!selectedPayment) return 0;
    const total = selectedPayment.totalAmount;
    const paid = Number(amountPaid) || 0;
    return Math.max(0, total - paid);
  };

  // Get status badge string based on inputs
  const getStatusLabel = () => {
    const bal = getRemainingBalance();
    const paid = Number(amountPaid) || 0;
    if (paid === 0) return 'unpaid';
    if (bal <= 0) return 'paid';
    return 'partial';
  };

  // Filtering
  const getFilteredItems = () => {
    const query = searchQuery.toLowerCase();
    if (activeTab === 'payments') {
      return payments.filter(p => 
        p.studentName.toLowerCase().includes(query) || 
        p.formation.toLowerCase().includes(query)
      );
    } else if (activeTab === 'students') {
      return students.filter(s => 
        s.name.toLowerCase().includes(query) || 
        s.email.toLowerCase().includes(query)
      );
    } else if (activeTab === 'teachers') {
      return teachers.filter(t => 
        t.name.toLowerCase().includes(query) || 
        t.email.toLowerCase().includes(query)
      );
    }
    return [];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4 rtl:space-x-reverse">
        <button
          onClick={() => { setActiveTab('payments'); setSearchQuery(''); }}
          className={`pb-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'payments' 
              ? 'border-brand-primary text-brand-primary' 
              : 'border-transparent text-slate-550 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {t('navPayments')}
        </button>

        <button
          onClick={() => { setActiveTab('students'); setSearchQuery(''); }}
          className={`pb-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'students' 
              ? 'border-brand-primary text-brand-primary' 
              : 'border-transparent text-slate-550 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {t('tabStudents')}
        </button>

        <button
          onClick={() => { setActiveTab('teachers'); setSearchQuery(''); }}
          className={`pb-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'teachers' 
              ? 'border-brand-primary text-brand-primary' 
              : 'border-transparent text-slate-550 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {t('tabStaff')}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-655 dark:text-red-300 p-4 rounded-xl text-sm flex items-center space-x-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Toolbar Search & Refresh */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-850">
        <div className="relative w-full sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 bg-slate-55 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>

        <button onClick={fetchData} className="p-1.5 text-slate-500 hover:text-brand-primary self-end sm:self-auto"><RefreshCw size={16} /></button>
      </div>

      {/* PAYMENTS TAB CONTENT */}
      {activeTab === 'payments' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500">{t('submitting')}</div>
          ) : getFilteredItems().length === 0 ? (
            <div className="p-8 text-center text-slate-555 dark:text-slate-400">{t('noPayments')}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-850">
                    <th className="px-6 py-3">Student Name</th>
                    <th className="px-6 py-3">Formation</th>
                    <th className="px-6 py-3">Total Amount</th>
                    <th className="px-6 py-3">Amount Paid</th>
                    <th className="px-6 py-3">Balance</th>
                    <th className="px-6 py-3">Billing Month</th>
                    <th className="px-6 py-3 text-center">Status</th>
                    <th className="px-6 py-3 text-center">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-800/80 text-sm">
                  {getFilteredItems().map((pay) => (
                    <tr key={pay._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{pay.studentName}</td>
                      <td className="px-6 py-4 font-semibold text-slate-750 dark:text-slate-300">{pay.formation}</td>
                      <td className="px-6 py-4 font-mono text-slate-800 dark:text-slate-200">{pay.totalAmount} DA</td>
                      <td className="px-6 py-4 font-mono text-emerald-600 dark:text-emerald-455 font-bold">{pay.amountPaid} DA</td>
                      <td className="px-6 py-4 font-mono text-red-500 font-semibold">{pay.remainingBalance} DA</td>
                      <td className="px-6 py-4 text-xs font-mono">{pay.month}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          pay.status === 'paid' 
                            ? 'bg-emerald-100 dark:bg-emerald-950/35 text-emerald-600 dark:text-emerald-355'
                            : pay.status === 'partial'
                            ? 'bg-yellow-100 dark:bg-yellow-950/35 text-yellow-600 dark:text-yellow-355'
                            : 'bg-red-100 dark:bg-red-950/35 text-red-655 dark:text-red-355'
                        }`}>
                          {pay.status === 'paid' ? t('payStatusPaid') : pay.status === 'partial' ? t('payStatusPartial') : t('payStatusUnpaid')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => openPaymentModal(pay)}
                          className="px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 hover:bg-brand-primary text-brand-primary hover:text-white text-xs font-semibold rounded-lg transition-all flex items-center space-x-1 mx-auto"
                        >
                          <Edit3 size={12} />
                          <span>Record</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* STUDENTS LIST TAB */}
      {activeTab === 'students' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          {getFilteredItems().length === 0 ? (
            <p className="p-8 text-center text-slate-500">No student accounts found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-850">
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Student Email</th>
                    <th className="px-6 py-3">Phone</th>
                    <th className="px-6 py-3">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-800/80 text-sm">
                  {getFilteredItems().map((student) => (
                    <tr key={student._id}>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{student.name}</td>
                      <td className="px-6 py-4 text-xs font-mono text-brand-primary">{student.email}</td>
                      <td className="px-6 py-4 text-xs font-mono">{student.phone}</td>
                      <td className="px-6 py-4 text-xs text-slate-455">{new Date(student.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TEACHERS LIST TAB */}
      {activeTab === 'teachers' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          {getFilteredItems().length === 0 ? (
            <p className="p-8 text-center text-slate-550">No teachers found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-850">
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Email Address</th>
                    <th className="px-6 py-3">Phone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-800/80 text-sm">
                  {getFilteredItems().map((teacher) => (
                    <tr key={teacher._id}>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{teacher.name}</td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-650 dark:text-slate-400">{teacher.email}</td>
                      <td className="px-6 py-4 text-xs font-mono">{teacher.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL BILLING TRANSACTION */}
      {showModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in">
            
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
              <CreditCard className="text-brand-primary" size={20} />
              <span>Record Payment Transaction</span>
            </h3>

            <div className="bg-slate-55 dark:bg-slate-950 p-4 rounded-xl text-xs space-y-2 mb-4 border border-slate-200 dark:border-slate-850">
              <div className="flex justify-between">
                <span className="text-slate-500">Student:</span>
                <strong className="text-slate-850 dark:text-white">{selectedPayment.studentName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Formation:</span>
                <strong className="text-slate-850 dark:text-white">{selectedPayment.formation}</strong>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-900 pt-2 font-semibold">
                <span className="text-slate-700 dark:text-slate-400">Total Invoice Amount:</span>
                <span className="text-slate-900 dark:text-white font-mono">{selectedPayment.totalAmount} DA</span>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1">
                  <DollarSign size={14} />
                  <span>{t('amountPaidLabel')}</span>
                </label>
                <input
                  type="number"
                  min={0}
                  max={selectedPayment.totalAmount}
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-350 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1">
                    <Calendar size={14} />
                    <span>{t('monthPickerLabel')}</span>
                  </label>
                  <input
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-350 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Status Badge</label>
                  <div className="mt-1">
                    <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold capitalize ${
                      getStatusLabel() === 'paid' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                        : getStatusLabel() === 'partial'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                    }`}>
                      {t(`payStatus${getStatusLabel().charAt(0).toUpperCase() + getStatusLabel().slice(1)}`)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-brand-primary/5 border border-brand-primary/10 rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-550">Auto Remaining Balance:</span>
                  <strong className="text-brand-primary font-mono text-sm">{getRemainingBalance()} DA</strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1">
                  <FileText size={14} />
                  <span>{t('noteLabel')}</span>
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Paid in Cash, receipt #4212"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-350 dark:border-slate-850 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm"
                />
              </div>

              <div className="flex space-x-2 pt-4 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold rounded-xl text-xs"
                >
                  {t('cancelBtn')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-hover text-white font-semibold rounded-xl text-xs"
                >
                  Save Transaction
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
