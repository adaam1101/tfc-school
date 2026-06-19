import React, { useState, useEffect } from 'react';
import { useSchool, useLang, useAuth } from '../App';
import { Users, Plus, Search, Edit3, Trash2, ShieldCheck, Mail, Phone, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../api';

export default function UsersStaffList() {
  const { school } = useSchool();
  const { lang, t } = useLang();
  const { user: currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('students');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // CRUD Form states
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('teacher');
  const [phone, setPhone] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getUsers(school);
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [school]);

  const handleOpenCreate = () => {
    clearForm();
    setShowModal(true);
  };

  const handleOpenEdit = (user) => {
    setEditId(user._id);
    setEmail(user.email);
    setName(user.name);
    setRole(user.role);
    setPhone(user.phone || '');
    setPassword(''); // don't fill password
    setShowModal(true);
  };

  const clearForm = () => {
    setEditId('');
    setEmail('');
    setPassword('');
    setName('');
    setRole('teacher');
    setPhone('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || (!editId && !password)) {
      setError("Please fill out name, email, and password");
      return;
    }

    try {
      if (editId) {
        // Edit User
        await api.updateUser(editId, { name, phone, password: password || undefined }, school);
      } else {
        // Create User (Admin Only)
        await api.createUser({ email, password, name, role, phone }, school);
      }

      setShowModal(false);
      clearForm();
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user? All billing and attendance links may be affected.")) return;
    setError('');
    try {
      await api.deleteUser(id, school);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Filter based on selected tab
  const getFilteredUsers = () => {
    const list = users.filter((u) => {
      if (activeTab === 'students') return u.role === 'student';
      if (activeTab === 'teachers') return u.role === 'teacher';
      return u.role === 'sous-admin' || u.role === 'moderator';
    });

    const query = searchQuery.toLowerCase();
    return list.filter((u) => 
      u.name.toLowerCase().includes(query) || 
      u.email.toLowerCase().includes(query)
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4 rtl:space-x-reverse">
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
          {t('roleTeacher')}s
        </button>

        <button
          onClick={() => { setActiveTab('staff'); setSearchQuery(''); }}
          className={`pb-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'staff' 
              ? 'border-brand-primary text-brand-primary' 
              : 'border-transparent text-slate-550 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Administration Staff
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-650 dark:text-red-300 p-4 rounded-xl text-sm flex items-center space-x-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Toolbar */}
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
            className="block w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-350 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>

        <div className="flex space-x-2 rtl:space-x-reverse self-end sm:self-auto">
          <button onClick={fetchData} className="p-2 text-slate-500 hover:text-brand-primary"><RefreshCw size={16} /></button>
          
          {/* Create User Button - Admin Only */}
          {currentUser.role === 'admin' && activeTab !== 'students' && (
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold rounded-xl flex items-center space-x-1"
            >
              <Plus size={16} />
              <span>{t('createUserBtn')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid List View */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">{t('submitting')}</div>
        ) : getFilteredUsers().length === 0 ? (
          <p className="p-8 text-center text-slate-500 dark:text-slate-400">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-850">
                  <th className="px-6 py-3">User Details</th>
                  <th className="px-6 py-3">Email Contact</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3 text-center">System Role</th>
                  {['admin', 'sous-admin'].includes(currentUser.role) && <th className="px-6 py-3 text-center">{t('actions')}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-800/80 text-sm">
                {getFilteredUsers().map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{u.name}</td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-650 dark:text-slate-400">{u.email}</td>
                    <td className="px-6 py-4 text-xs font-mono">{u.phone || 'N/A'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.role === 'admin' ? 'bg-red-150 text-red-700 dark:bg-red-950/30' :
                        u.role === 'sous-admin' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/30' :
                        u.role === 'moderator' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/30' :
                        u.role === 'teacher' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/30' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    
                    {['admin', 'sous-admin'].includes(currentUser.role) && (
                      <td className="px-6 py-4 text-center">
                        {/* Lock out editing admins if user is sous-admin */}
                        {currentUser.role === 'sous-admin' && u.role === 'admin' ? (
                          <span className="text-xs text-slate-400">—</span>
                        ) : (
                          <div className="flex justify-center space-x-2 rtl:space-x-reverse">
                            <button
                              onClick={() => handleOpenEdit(u)}
                              className="text-xs font-bold text-brand-primary hover:underline"
                            >
                              Edit
                            </button>
                            
                            {/* Deleting staff - admin only */}
                            {currentUser.role === 'admin' && u.role !== 'admin' && (
                              <button
                                onClick={() => handleDeleteUser(u._id)}
                                className="text-slate-400 hover:text-red-500"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    )}

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT USER DIALOG MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {editId ? 'Edit User Profile' : 'Create Staff User Account'}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1">{t('nameInput')}</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Leila Meziane"
                  className="w-full px-3 py-2 bg-slate-55 dark:bg-slate-950 border border-slate-350 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('email')}</label>
                <input
                  type="email"
                  required
                  disabled={!!editId}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@school.dz"
                  className="w-full px-3 py-2 bg-slate-55 dark:bg-slate-950 border border-slate-350 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('password')} {editId && '(Leave blank to keep same)'}</label>
                <input
                  type="password"
                  required={!editId}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-55 dark:bg-slate-950 border border-slate-350 dark:border-slate-850 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('phoneInput')}</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0550 112233"
                  className="w-full px-3 py-2 bg-slate-55 dark:bg-slate-950 border border-slate-355 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              {!editId && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('roleInput')}</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-55 dark:bg-slate-950 border border-slate-350 dark:border-slate-850 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    <option value="sous-admin">Sous-Administrator</option>
                    <option value="moderator">Moderator</option>
                    <option value="teacher">Teacher</option>
                  </select>
                </div>
              )}

              <div className="flex space-x-2 pt-4 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-white font-semibold rounded-xl text-xs"
                >
                  {t('cancelBtn')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-hover text-white font-semibold rounded-xl text-xs"
                >
                  {t('submitBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
