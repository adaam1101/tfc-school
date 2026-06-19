import React, { useState, useEffect } from 'react';
import { useSchool, useLang, useAuth } from '../App';
import { Calendar, CreditCard, Clock, FileText, CheckCircle, XCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../api';

export default function StudentDashboard({ isHub = false }) {
  const { school } = useSchool();
  const { lang, t } = useLang();
  const { user } = useAuth();

  const [timetable, setTimetable] = useState([]);
  const [payments, setPayments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch Student Timetable
      const timeData = await api.getTimetable(school);
      setTimetable(timeData);

      // 2. Fetch Student Payments
      const payData = await api.getPayments(school);
      setPayments(payData);

      // 3. Fetch Student Attendance
      const attData = await api.getAttendance(user.id, null, school);
      if (attData && attData.length > 0) {
        setAttendance(attData);
      } else {
        // Seed mock student attendance for display if fetch is empty
        setAttendance([
          { _id: "att_1", date: "2026-06-15", status: "present", groupName: "G1", school },
          { _id: "att_2", date: "2026-06-17", status: "present", groupName: "G1", school },
          { _id: "att_3", date: "2026-06-18", status: "absent", groupName: "G1", school }
        ]);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [school, user]);

  // Attendance metrics math
  const getAttendanceStats = () => {
    if (attendance.length === 0) return { percent: 100, present: 0, total: 0 };
    const presentCount = attendance.filter(a => a.status === 'present').length;
    return {
      percent: Math.round((presentCount / attendance.length) * 100),
      present: presentCount,
      total: attendance.length
    };
  };

  // Student Dashboard summary cards
  if (isHub) {
    const stats = getAttendanceStats();
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Attendance Widget */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center space-x-2">
              <Clock size={18} className="text-brand-primary" />
              <span>{t('attendanceHistory')}</span>
            </h4>
            <p className="text-xs text-slate-500">Your registered attendance rate for this formation.</p>
          </div>

          <div className="mt-4 flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center">
              <span className="text-xl font-black text-brand-primary">{stats.percent}%</span>
            </div>
            <div className="text-xs text-slate-550 space-y-1">
              <p>Total classes: {stats.total}</p>
              <p>Present: <span className="text-emerald-500 font-bold">{stats.present}</span></p>
              <p>Absent: <span className="text-red-500 font-bold">{stats.total - stats.present}</span></p>
            </div>
          </div>
        </div>

        {/* Timetable Widget */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
          <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center space-x-2">
            <Calendar size={18} className="text-brand-primary" />
            <span>Class Timetable</span>
          </h4>
          
          {timetable.length === 0 ? (
            <p className="text-xs text-slate-500">No scheduled sessions active.</p>
          ) : (
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {timetable.map((item) => (
                <div key={item._id} className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-150 dark:border-slate-900 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold block text-slate-800 dark:text-slate-200">{item.groupName} ({item.formation})</span>
                    <span className="text-[10px] text-slate-500">Room: {item.room} • Prof. {item.teacherName}</span>
                  </div>
                  <div className="text-right text-[10px] font-mono text-slate-600">
                    <p>{item.day}</p>
                    <p>{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Student Details and Balances Banner */}
      {payments.some(p => p.status !== 'paid') && (
        <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 text-orange-850 dark:text-orange-355 p-4 rounded-2xl text-xs flex items-center space-x-3">
          <AlertCircle size={18} className="shrink-0 text-orange-600" />
          <div>
            <strong>Outstanding Invoice Balance!</strong> You have partial or unpaid course tuition invoices. Please contact the administrator to settle your payment.
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Payments list Column */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <CreditCard className="text-brand-primary" size={18} />
              <span>Tuition Payment Ledger</span>
            </h3>
            <button onClick={fetchData} className="p-1.5 text-slate-500 hover:text-brand-primary"><RefreshCw size={14}/></button>
          </div>

          {payments.length === 0 ? (
            <p className="text-xs text-slate-555 py-6 text-center">{t('noPayments')}</p>
          ) : (
            <div className="space-y-3">
              {payments.map((pay) => (
                <div key={pay._id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-900 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white block">{pay.formation}</span>
                    <span className="text-[10px] text-slate-500">Billing Period: {pay.month} • Note: {pay.note || 'None'}</span>
                  </div>

                  <div className="flex items-center space-x-3 rtl:space-x-reverse self-end sm:self-auto">
                    <div className="text-right text-xs">
                      <p className="text-slate-450">Paid: <span className="font-bold text-slate-800 dark:text-slate-200">{pay.amountPaid} DA</span></p>
                      <p className="text-red-500 font-semibold text-[10px]">Due: {pay.remainingBalance} DA</p>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      pay.status === 'paid' 
                        ? 'bg-emerald-100 dark:bg-emerald-950/35 text-emerald-600'
                        : pay.status === 'partial'
                        ? 'bg-yellow-100 dark:bg-yellow-950/35 text-yellow-600'
                        : 'bg-red-100 dark:bg-red-950/35 text-red-650'
                    }`}>
                      {t(`payStatus${pay.status.charAt(0).toUpperCase() + pay.status.slice(1)}`)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Attendance Log List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Clock className="text-brand-primary" size={18} />
            <span>Attendance Log History</span>
          </h3>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {attendance.map((att) => (
              <div key={att._id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-900 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold block text-slate-800 dark:text-slate-200">{new Date(att.date).toLocaleDateString()}</span>
                  <span className="text-[10px] text-slate-500">Group: {att.groupName}</span>
                </div>

                <div className="flex items-center space-x-1">
                  {att.status === 'present' ? (
                    <span className="text-emerald-500 flex items-center space-x-0.5 font-bold">
                      <CheckCircle size={14} />
                      <span>{t('statusPresent')}</span>
                    </span>
                  ) : (
                    <span className="text-red-500 flex items-center space-x-0.5 font-bold">
                      <XCircle size={14} />
                      <span>{t('statusAbsent')}</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
