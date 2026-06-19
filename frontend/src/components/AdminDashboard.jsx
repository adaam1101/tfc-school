import React, { useState, useEffect } from 'react';
import { useSchool, useLang } from '../App';
import { 
  Check, X, Clipboard, CheckCircle2, History, Trash2, Key, AlertCircle, RefreshCw 
} from 'lucide-react';
import { api } from '../api';

export default function AdminDashboard({ tab: propTab }) {
  const { school } = useSchool();
  const { lang, t } = useLang();
  
  const [activeTab, setActiveTab] = useState(propTab || 'enrollments');
  const [enrollments, setEnrollments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Popup states
  const [credsPopup, setCredsPopup] = useState(null); // { email, password, name }
  const [copied, setCopied] = useState(false);
  
  const [selectedUserForReset, setSelectedUserForReset] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [resetCopied, setResetCopied] = useState(false);

  useEffect(() => {
    if (propTab) {
      setActiveTab(propTab);
    }
  }, [propTab]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'enrollments') {
        const data = await api.getEnrollments(school);
        setEnrollments(data);
      } else if (activeTab === 'logs') {
        const data = await api.getLogs(school);
        setLogs(data);
      } else if (activeTab === 'reset') {
        const data = await api.getUsers(school);
        setUsers(data);
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

  // Approval handler
  const handleApprove = async (id) => {
    setError('');
    try {
      const data = await api.approveEnrollment(id, school);
      setCredsPopup(data.credentials);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Rejection handler
  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this enrollment request?")) return;
    setError('');
    try {
      await api.rejectEnrollment(id, school);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Password reset generator
  const handleGenerateReset = async () => {
    if (!selectedUserForReset) return;
    setError('');
    setGeneratedLink('');
    setResetCopied(false);
    try {
      const data = await api.generateResetLink(selectedUserForReset, school);
      const fullLink = `${window.location.origin}${data.resetLink}`;
      setGeneratedLink(fullLink);
    } catch (err) {
      setError(err.message);
    }
  };

  // Clear system logs
  const handleClearLogs = async () => {
    if (!window.confirm("Are you sure you want to CLEAR ALL activity logs for launch day?")) return;
    setError('');
    try {
      await api.clearLogs(school);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Clipboard copies
  const copyCredsToClipboard = () => {
    if (!credsPopup) return;
    const text = `Student Account Generated:\nName: ${credsPopup.name}\nEmail: ${credsPopup.email}\nTemp Password: ${credsPopup.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyResetLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setResetCopied(true);
    setTimeout(() => setResetCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Tab Navigation header */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4 rtl:space-x-reverse">
        <button
          onClick={() => setActiveTab('enrollments')}
          className={`pb-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'enrollments' 
              ? 'border-brand-primary text-brand-primary' 
              : 'border-transparent text-slate-550 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {t('navEnrollments')}
        </button>

        <button
          onClick={() => setActiveTab('reset')}
          className={`pb-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'reset' 
              ? 'border-brand-primary text-brand-primary' 
              : 'border-transparent text-slate-550 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {t('resetPassword')}
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'logs' 
              ? 'border-brand-primary text-brand-primary' 
              : 'border-transparent text-slate-550 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {t('navLogs')}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-650 dark:text-red-300 p-4 rounded-xl text-sm flex items-center space-x-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* RENDER ACTIVE TAB */}

      {activeTab === 'enrollments' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white">Pre-Registration Approval Panel</h3>
            <button onClick={fetchData} className="p-1.5 text-slate-500 hover:text-brand-primary"><RefreshCw size={15} /></button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">{t('submitting')}</div>
          ) : enrollments.length === 0 ? (
            <div className="p-8 text-center text-slate-555 dark:text-slate-400">{t('noEnrollments')}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-850">
                    <th className="px-6 py-3">Student Name</th>
                    <th className="px-6 py-3">Age</th>
                    <th className="px-6 py-3">Phone</th>
                    <th className="px-6 py-3">Formation / Level</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-center">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-800/80 text-sm">
                  {enrollments.map((enroll) => (
                    <tr key={enroll._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                        {enroll.name}
                        {enroll.isOrphan && <span className="ml-2 px-2 py-0.5 bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-300 text-[10px] rounded-full">Orphan</span>}
                        {enroll.isTwoFormations && <span className="ml-2 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-300 text-[10px] rounded-full">Double</span>}
                      </td>
                      <td className="px-6 py-4">{enroll.age}</td>
                      <td className="px-6 py-4 font-mono text-xs">{enroll.phone}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-250">{enroll.formation}</div>
                        {enroll.level && <div className="text-xs text-slate-500 dark:text-slate-450">{enroll.level}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          enroll.status === 'approved' 
                            ? 'bg-emerald-100 dark:bg-emerald-950/35 text-emerald-600 dark:text-emerald-350'
                            : enroll.status === 'rejected'
                            ? 'bg-red-100 dark:bg-red-950/35 text-red-655 dark:text-red-350'
                            : 'bg-yellow-100 dark:bg-yellow-950/35 text-yellow-600 dark:text-yellow-350'
                        }`}>
                          {enroll.status === 'approved' ? t('statusApproved') : enroll.status === 'rejected' ? t('statusRejected') : t('statusPending')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {enroll.status === 'pending' ? (
                          <div className="flex justify-center space-x-2 rtl:space-x-reverse">
                            <button
                              onClick={() => handleApprove(enroll._id)}
                              className="p-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-900 rounded-lg transition-all"
                              title="Approve & Generate Credentials"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => handleReject(enroll._id)}
                              className="p-1 bg-red-50 dark:bg-red-950/20 text-red-655 dark:text-red-400 hover:bg-red-100 border border-red-200 dark:border-red-900 rounded-lg transition-all"
                              title="Reject Request"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-600">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reset' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Password Reset Key Generator</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Select a teacher, student, or staff member. The system will generate a secure one-off reset link. Copy and send it to them. No email config required.
          </p>

          <div className="space-y-4 max-w-xl">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-350 mb-1.5">Select User Account</label>
              <select
                value={selectedUserForReset}
                onChange={(e) => {
                  setSelectedUserForReset(e.target.value);
                  setGeneratedLink('');
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-350 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-primary"
              >
                <option value="">-- Choose User Account --</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email}) - Role: {u.role.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGenerateReset}
              disabled={!selectedUserForReset || loading}
              className="px-5 py-2.5 bg-brand-primary hover:bg-brand-hover text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50"
            >
              {t('generateResetLink')}
            </button>

            {generatedLink && (
              <div className="mt-6 p-4 bg-brand-primary/10 border border-brand-primary/20 rounded-xl space-y-3 animate-fade-in">
                <span className="text-xs font-bold text-brand-primary block">{t('resetLinkGenerated')}</span>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <input
                    type="text"
                    readOnly
                    value={generatedLink}
                    className="flex-1 bg-white dark:bg-slate-950 text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-850 font-mono focus:outline-none"
                  />
                  <button
                    onClick={copyResetLink}
                    className="px-3 py-2 bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold rounded-lg flex items-center space-x-1"
                  >
                    <Clipboard size={14} />
                    <span>{resetCopied ? t('copied') : t('copyBtn')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Activity Log Audit Trail</h3>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">Records of all portal authentication and data modifications</p>
            </div>
            <button
              onClick={handleClearLogs}
              className="px-4 py-2 bg-red-50 dark:bg-red-950/20 text-red-655 dark:text-red-400 hover:bg-red-100 text-xs font-bold border border-red-200 dark:border-red-900 rounded-xl flex items-center space-x-1"
            >
              <Trash2 size={14} />
              <span>{t('clearLogsBtn')}</span>
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">{t('submitting')}</div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-slate-555 dark:text-slate-400">{t('noLogs')}</div>
          ) : (
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-left rtl:text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-850">
                    <th className="px-6 py-3">{t('logUser')}</th>
                    <th className="px-6 py-3">{t('logAction')}</th>
                    <th className="px-6 py-3">{t('logDetails')}</th>
                    <th className="px-6 py-3">{t('logTime')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-800/80 text-xs font-medium text-slate-600 dark:text-slate-350">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{log.user}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.action.includes('LOGIN') ? 'bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400' :
                          log.action.includes('APPROVE') ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-455' :
                          log.action.includes('REJECT') ? 'bg-red-100 dark:bg-red-950/30 text-red-655 dark:text-red-400' :
                          'bg-slate-200 dark:bg-slate-850 text-slate-655 dark:text-slate-455'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono">{log.details}</td>
                      <td className="px-6 py-4 text-slate-455 dark:text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* APPROVED STUDENT CREDENTIALS POPUP DIALOG */}
      {credsPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setCredsPopup(null)} />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl w-full max-w-md shadow-2xl animate-fade-in text-center">
            
            <div className="h-14 w-14 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 size={28} />
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('credentialsTitle')}</h3>
            <p className="text-xs text-slate-555 dark:text-slate-400 mb-6">{t('credentialsDesc')}</p>

            <div className="bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl text-left text-xs font-mono space-y-2 mb-6">
              <div>
                <span className="text-slate-400">Name:</span> <strong className="text-slate-900 dark:text-white font-sans">{credsPopup.name}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span>
                  <span className="text-slate-400">Email:</span> <strong className="text-slate-900 dark:text-white select-all">{credsPopup.email}</strong>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>
                  <span className="text-slate-400">Password:</span> <strong className="text-brand-primary select-all text-sm font-black">{credsPopup.password}</strong>
                </span>
              </div>
            </div>

            <div className="flex space-x-2 rtl:space-x-reverse">
              <button
                onClick={copyCredsToClipboard}
                className="flex-1 py-2.5 bg-brand-primary hover:bg-brand-hover text-white text-sm font-semibold rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5"
              >
                <Clipboard size={16} />
                <span>{copied ? t('copied') : t('copyBtn')}</span>
              </button>
              <button
                onClick={() => setCredsPopup(null)}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-sm font-semibold rounded-xl transition-all"
              >
                {t('closeBtn')}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
