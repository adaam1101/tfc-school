import React, { useState, useEffect } from 'react';
import { useSchool, useLang } from '../App';
import { Plus, Trash2, Calendar, Megaphone, Clock, MapPin, User, BookOpen, AlertCircle } from 'lucide-react';
import { api } from '../api';

export default function SousAdminDashboard({ tab: propTab }) {
  const { school } = useSchool();
  const { lang, t } = useLang();

  const [activeTab, setActiveTab] = useState(propTab || 'timetable');
  const [timetable, setTimetable] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Timetable modal / form states
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [editId, setEditId] = useState('');
  const [groupName, setGroupName] = useState('');
  const [teacherSelect, setTeacherSelect] = useState(''); // JSON string containing teacherId and teacherName
  const [formation, setFormation] = useState('');
  const [day, setDay] = useState('Saturday');
  const [time, setTime] = useState('09:00 - 11:00');
  const [room, setRoom] = useState('');

  // Formations helper to auto-populate choices based on school
  const schoolFormations = {
    tfc: ["Informatique", "Kids: Anglais & Français", "Couture & Stylisme", "Secrétariat-GRH", "Vendeur en pharmacie", "Photography", "Robotique"],
    nextmind: ["Design Graphique", "UI/UX Figma", "Video Editing", "Digital Art", "ESP", "English Adults", "Web & Mobile Development"]
  };

  // 2. Announcement form states
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');

  useEffect(() => {
    if (propTab) {
      setActiveTab(propTab);
    }
  }, [propTab]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'timetable') {
        const timeData = await api.getTimetable(school);
        setTimetable(timeData);

        // Fetch teachers list for timetable assign dropdown
        const list = await api.getUsers(school);
        setTeachers(list.filter(u => u.role === 'teacher'));
      } else if (activeTab === 'announcements') {
        const annData = await api.getAnnouncements(school);
        setAnnouncements(annData);
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

  // Timetable submit
  const handleTimetableSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!groupName || !teacherSelect || !formation || !day || !time || !room) {
      setError("Please fill out all fields");
      return;
    }

    const teacherObj = JSON.parse(teacherSelect);

    try {
      await api.saveTimetable({
        _id: editId || undefined,
        groupName,
        teacherId: teacherObj.id,
        teacherName: teacherObj.name,
        formation,
        day,
        time,
        room
      }, school);
      
      setShowTimeModal(false);
      clearTimeForm();
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditTimetable = (item) => {
    setEditId(item._id);
    setGroupName(item.groupName);
    setTeacherSelect(JSON.stringify({ id: item.teacherId, name: item.teacherName }));
    setFormation(item.formation);
    setDay(item.day);
    setTime(item.time);
    setRoom(item.room);
    setShowTimeModal(true);
  };

  const handleDeleteTimetable = async (id) => {
    if (!window.confirm("Are you sure you want to delete this schedule entry?")) return;
    try {
      await api.deleteTimetable(id, school);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const clearTimeForm = () => {
    setEditId('');
    setGroupName('');
    setTeacherSelect('');
    setFormation('');
    setDay('Saturday');
    setTime('09:00 - 11:00');
    setRoom('');
  };

  // Announcement submit
  const handleAnnounceSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!annTitle || !annContent) {
      setError("Title and content are required");
      return;
    }

    try {
      await api.postAnnouncement(annTitle, annContent, school);
      setShowAnnModal(false);
      setAnnTitle('');
      setAnnContent('');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await api.deleteAnnouncement(id, school);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toggle header tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4 rtl:space-x-reverse">
        <button
          onClick={() => setActiveTab('timetable')}
          className={`pb-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'timetable' 
              ? 'border-brand-primary text-brand-primary' 
              : 'border-transparent text-slate-550 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {t('navTimetable')}
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`pb-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'announcements' 
              ? 'border-brand-primary text-brand-primary' 
              : 'border-transparent text-slate-550 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {t('navAnnouncements')}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-650 dark:text-red-300 p-4 rounded-xl text-sm flex items-center space-x-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* TIMETABLE TAB */}
      {activeTab === 'timetable' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white">Class Groups Timetable Planner</h3>
            <button
              onClick={() => { clearTimeForm(); setShowTimeModal(true); }}
              className="px-4 py-2 bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold rounded-xl flex items-center space-x-1"
            >
              <Plus size={16} />
              <span>{t('addScheduleBtn')}</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            {timetable.length === 0 ? (
              <p className="p-8 text-center text-slate-555 dark:text-slate-450">{t('noSchedule')}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left rtl:text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-850">
                      <th className="px-6 py-3">{t('groupNameLabel')}</th>
                      <th className="px-6 py-3">{t('formFormation')}</th>
                      <th className="px-6 py-3">{t('teacherLabel')}</th>
                      <th className="px-6 py-3">{t('dayLabel')}</th>
                      <th className="px-6 py-3">{t('timeLabel')}</th>
                      <th className="px-6 py-3">{t('roomLabel')}</th>
                      <th className="px-6 py-3 text-center">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 dark:divide-slate-800/80 text-sm">
                    {timetable.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{item.groupName}</td>
                        <td className="px-6 py-4 font-semibold text-brand-primary">{item.formation}</td>
                        <td className="px-6 py-4">{item.teacherName}</td>
                        <td className="px-6 py-4">{item.day}</td>
                        <td className="px-6 py-4 font-mono text-xs">{item.time}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-semibold text-xs">{item.room}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center space-x-2 rtl:space-x-reverse">
                            <button
                              onClick={() => handleEditTimetable(item)}
                              className="text-xs text-brand-primary hover:underline font-semibold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTimetable(item._id)}
                              className="text-slate-450 hover:text-red-500"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ANNOUNCEMENTS TAB */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white">Announcements Board</h3>
            <button
              onClick={() => setShowAnnModal(true)}
              className="px-4 py-2 bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold rounded-xl flex items-center space-x-1"
            >
              <Plus size={16} />
              <span>{t('postAnnouncementBtn')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {announcements.map((ann) => (
              <div key={ann._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm relative flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-bold text-slate-900 dark:text-white text-lg">{ann.title}</h4>
                    <button
                      onClick={() => handleDeleteAnnouncement(ann._id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-55 dark:hover:bg-slate-850"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <p className="text-sm text-slate-650 dark:text-slate-400 leading-relaxed whitespace-pre-line">{ann.content}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-850 text-[10px] text-slate-455 dark:text-slate-500 flex justify-between">
                  <span>Author: {ann.author} ({ann.role})</span>
                  <span>{new Date(ann.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TIMETABLE SAVE MODAL */}
      {showTimeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm" onClick={() => setShowTimeModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {editId ? 'Edit Group Schedule' : 'Add Group Schedule'}
            </h3>

            <form onSubmit={handleTimetableSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1">{t('groupNameLabel')}</label>
                <input
                  type="text"
                  required
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. Informatique-G3"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-850 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1">{t('formFormation')}</label>
                <select
                  required
                  value={formation}
                  onChange={(e) => setFormation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-850 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  <option value="">-- Choose Formation --</option>
                  {schoolFormations[school].map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1">{t('teacherLabel')}</label>
                <select
                  required
                  value={teacherSelect}
                  onChange={(e) => setTeacherSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-850 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  <option value="">-- Assign Teacher --</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={JSON.stringify({ id: t._id, name: t.name })}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1">{t('dayLabel')}</label>
                  <select
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-850 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    {['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1">{t('roomLabel')}</label>
                  <input
                    type="text"
                    required
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="e.g. Lab 2"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-850 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1">{t('timeLabel')}</label>
                <input
                  type="text"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="e.g. 09:00 - 11:30"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-850 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div className="flex space-x-2 pt-4 justify-end">
                <button
                  type="button"
                  onClick={() => setShowTimeModal(false)}
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

      {/* ANNOUNCEMENT CREATE MODAL */}
      {showAnnModal && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm" onClick={() => setShowAnnModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t('postAnnouncementBtn')}</h3>

            <form onSubmit={handleAnnounceSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1">{t('titleLabel')}</label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. Timetable Updates for Eid Holiday"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-850 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1">{t('contentLabel')}</label>
                <textarea
                  required
                  rows={4}
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="Type the announcement contents here..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-850 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm"
                />
              </div>

              <div className="flex space-x-2 pt-4 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAnnModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-white font-semibold rounded-xl text-xs"
                >
                  {t('cancelBtn')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-hover text-white font-semibold rounded-xl text-xs"
                >
                  Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
