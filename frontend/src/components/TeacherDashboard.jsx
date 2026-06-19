import React, { useState, useEffect } from 'react';
import { useSchool, useLang, useAuth } from '../App';
import { Calendar, Users, Megaphone, CheckCircle, AlertCircle, RefreshCw, Send } from 'lucide-react';
import { api } from '../api';

export default function TeacherDashboard({ isHub = false }) {
  const { school } = useSchool();
  const { lang, t } = useLang();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('attendance');
  const [timetable, setTimetable] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Attendance states
  const [selectedGroup, setSelectedGroup] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().substring(0, 10)); // today
  const [attendanceList, setAttendanceList] = useState([]); // [{ studentId, name, status: 'present'|'absent' }]

  // Notifications states
  const [selectedStudentForNote, setSelectedStudentForNote] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch timetable groups
      const timeData = await api.getTimetable(school);
      // filter timetable to only show this teacher's items
      const mySchedule = timeData.filter(item => item.teacherId === user.id || item.teacherName.toLowerCase().includes(user.name.toLowerCase().split(' ')[0]));
      setTimetable(mySchedule);
      if (mySchedule.length > 0) setSelectedGroup(mySchedule[0].groupName);

      // 2. Fetch students
      const usersList = await api.getUsers(school);
      const stds = usersList.filter(u => u.role === 'student');
      setStudents(stds);
      
      // Init attendance list roster with these students
      setAttendanceList(stds.map(s => ({
        studentId: s._id,
        studentName: s.name,
        status: 'present'
      })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [school, user]);

  // Attendance status toggler
  const toggleAttendanceStatus = (studentId, nextStatus) => {
    setAttendanceList(prev => 
      prev.map(item => item.studentId === studentId ? { ...item, status: nextStatus } : item)
    );
  };

  // Save Attendance to Backend
  const handleSaveAttendance = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!selectedGroup) {
      setError("Please select a group first");
      return;
    }

    try {
      await api.saveAttendance(
        attendanceDate, 
        selectedGroup, 
        attendanceList, 
        school
      );

      setSuccess("Attendance list saved successfully!");
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Simulated notification send to parent
  const handleSendNotification = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedStudentForNote || !noteTitle || !noteBody) {
      setError("All notification fields are required");
      return;
    }

    setSuccess(`Notification successfully dispatched to parents of student!`);
    
    // reset form
    setSelectedStudentForNote('');
    setNoteTitle('');
    setNoteBody('');
    setTimeout(() => setSuccess(''), 3000);
  };

  if (isHub) {
    // Return a simplified widget view for the Dashboard hub screen
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
          <Calendar size={18} className="text-brand-primary" />
          <span>My Teaching Timetable</span>
        </h4>
        {timetable.length === 0 ? (
          <p className="text-xs text-slate-500">No scheduled groups found for Prof. {user.name}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {timetable.map((item) => (
              <div key={item._id} className="p-3 bg-slate-55 dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-900 text-xs">
                <span className="font-bold text-sm block text-slate-900 dark:text-white">{item.groupName}</span>
                <span className="text-brand-primary font-semibold mt-1 block">{item.formation}</span>
                <div className="mt-2 text-slate-500 space-y-1">
                  <p>🗓️ {item.day}</p>
                  <p>⏰ {item.time}</p>
                  <p>🚪 Room: {item.room}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Tabs headers */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4 rtl:space-x-reverse">
        <button
          onClick={() => { setActiveTab('attendance'); setSuccess(''); setError(''); }}
          className={`pb-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'attendance' 
              ? 'border-brand-primary text-brand-primary' 
              : 'border-transparent text-slate-550 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {t('recordAttendanceBtn')}
        </button>

        <button
          onClick={() => { setActiveTab('timetable'); setSuccess(''); setError(''); }}
          className={`pb-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'timetable' 
              ? 'border-brand-primary text-brand-primary' 
              : 'border-transparent text-slate-550 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          My Assigned Groups
        </button>

        <button
          onClick={() => { setActiveTab('notifications'); setSuccess(''); setError(''); }}
          className={`pb-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'notifications' 
              ? 'border-brand-primary text-brand-primary' 
              : 'border-transparent text-slate-550 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Notifications to Parents
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-650 dark:text-red-300 p-4 rounded-xl text-sm flex items-center space-x-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-255 dark:border-emerald-900 text-emerald-600 dark:text-emerald-300 p-4 rounded-xl text-sm flex items-center space-x-2">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* ATTENDANCE TAB */}
      {activeTab === 'attendance' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Record Daily Class Attendance</h3>
            <button onClick={fetchData} className="p-1.5 self-end sm:self-auto text-slate-500 hover:text-brand-primary"><RefreshCw size={15} /></button>
          </div>

          <form onSubmit={handleSaveAttendance} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-55 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-850">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('selectGroup')}</label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-xs"
                  required
                >
                  <option value="">-- Choose Class Group --</option>
                  {timetable.map(t => (
                    <option key={t._id} value={t.groupName}>{t.groupName} ({t.formation})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('attendanceDate')}</label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-xs font-mono"
                  required
                />
              </div>
            </div>

            {/* Students Attendance Roster list */}
            {attendanceList.length === 0 ? (
              <p className="text-center text-sm text-slate-550 py-4">No student accounts registered in the school.</p>
            ) : (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-850">Student Roster</h4>
                {attendanceList.map((item) => (
                  <div key={item.studentId} className="flex justify-between items-center p-3 rounded-xl bg-slate-50/40 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-850/50">
                    <span className="font-semibold text-slate-850 dark:text-slate-250 text-sm">{item.studentName}</span>
                    
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <button
                        type="button"
                        onClick={() => toggleAttendanceStatus(item.studentId, 'present')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                          item.status === 'present'
                            ? 'bg-emerald-500 text-white border-transparent'
                            : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-855 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        {t('statusPresent')}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleAttendanceStatus(item.studentId, 'absent')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                          item.status === 'absent'
                            ? 'bg-red-500 text-white border-transparent'
                            : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-855 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        {t('statusAbsent')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || attendanceList.length === 0}
              className="px-5 py-2.5 bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              {t('saveAttendanceBtn')}
            </button>
          </form>
        </div>
      )}

      {/* GROUPS LIST */}
      {activeTab === 'timetable' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Assigned Teaching Timetable</h3>
          {timetable.length === 0 ? (
            <p className="text-sm text-slate-500">No scheduled groups registered under your name.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {timetable.map((item) => (
                <div key={item._id} className="p-4 bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-base font-bold text-slate-900 dark:text-white">{item.groupName}</span>
                    <span className="px-2 py-0.5 bg-brand-primary/10 text-brand-primary text-[10px] font-bold rounded-full">{item.room}</span>
                  </div>
                  <p className="text-xs text-brand-primary font-bold">{item.formation}</p>
                  <div className="pt-2 text-xs text-slate-555 dark:text-slate-400 space-y-1">
                    <p>🗓️ Day: {item.day}</p>
                    <p>⏰ Time: {item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* NOTIFICATIONS TAB */}
      {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm max-w-xl">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Push Notifications to Parents</h3>
          <p className="text-xs text-slate-550 dark:text-slate-400 mb-6">Send attendance warnings, behaviour alerts, or general updates directly to parents.</p>

          <form onSubmit={handleSendNotification} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Student</label>
              <select
                value={selectedStudentForNote}
                onChange={(e) => setSelectedStudentForNote(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-350 dark:border-slate-800 rounded-lg text-xs"
                required
              >
                <option value="">-- Choose Student --</option>
                {students.map(s => (
                  <option key={s._id} value={s.name}>{s.name} ({s.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Alert Category / Title</label>
              <input
                type="text"
                required
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="e.g. Attendance Warning / Good Progress Notification"
                className="w-full px-3 py-2 bg-slate-55 dark:bg-slate-950 border border-slate-350 dark:border-slate-800 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1">Message Body</label>
              <textarea
                required
                rows={4}
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
                placeholder="Write message here. It will be sent as an SMS alert to parent's verified phone..."
                className="w-full px-3 py-2 bg-slate-55 dark:bg-slate-950 border border-slate-350 dark:border-slate-800 rounded-lg text-xs"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold rounded-xl shadow-md flex items-center space-x-1.5"
            >
              <Send size={14} />
              <span>Send SMS Alert</span>
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
