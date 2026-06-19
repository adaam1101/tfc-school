import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useLang, useTheme, useSchool } from '../App';
import { 
  LayoutDashboard, FileText, CreditCard, Calendar, Megaphone, 
  History, Users, User, LogOut, Menu, X, Sun, Moon, GraduationCap 
} from 'lucide-react';

// Sub-dashboards
import AdminDashboard from './AdminDashboard';
import SousAdminDashboard from './SousAdminDashboard';
import ModeratorDashboard from './ModeratorDashboard';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';
import ProfileSettings from './ProfileSettings';
import UsersStaffList from './UsersStaffList';
import { api } from '../api';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLang();
  const { theme, toggleTheme } = useTheme();
  const { school } = useSchool();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);

  // Filter sidebar navigation based on role-based access control
  const navItems = [
    { name: t('navDashboard'), path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'sous-admin', 'moderator', 'teacher', 'student'] },
    { name: t('navEnrollments'), path: '/dashboard/enrollments', icon: FileText, roles: ['admin', 'sous-admin', 'moderator'] },
    { name: t('navPayments'), path: '/dashboard/payments', icon: CreditCard, roles: ['admin', 'moderator', 'student'] },
    { name: t('navTimetable'), path: '/dashboard/timetable', icon: Calendar, roles: ['admin', 'sous-admin', 'moderator', 'teacher', 'student'] },
    { name: t('navAnnouncements'), path: '/dashboard/announcements', icon: Megaphone, roles: ['admin', 'sous-admin', 'moderator', 'teacher', 'student'] },
    { name: t('navUsers'), path: '/dashboard/users', icon: Users, roles: ['admin', 'sous-admin', 'moderator', 'teacher'] },
    { name: t('navLogs'), path: '/dashboard/logs', icon: History, roles: ['admin'] },
    { name: t('navProfile'), path: '/dashboard/profile', icon: User, roles: ['admin', 'sous-admin', 'moderator', 'teacher', 'student'] }
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(user?.role));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-200">
      
      {/* 1. Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <GraduationCap className="h-8 w-8 text-brand-primary" />
            <span className="font-extrabold text-lg tracking-tight">
              {school === 'tfc' ? 'TFC School' : 'NextMind'}
            </span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  active 
                    ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/15' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${lang === 'ar' ? 'ml-3' : 'mr-3'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User profile footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 rtl:space-x-reverse truncate">
              <div className="h-9 w-9 rounded-full bg-brand-primary/10 text-brand-primary font-bold flex items-center justify-center border border-brand-primary/20">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-550 dark:text-slate-500 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 text-xs font-bold rounded-xl border border-red-100 dark:border-red-950 hover:bg-red-100/55 transition-all"
          >
            <LogOut size={14} className={lang === 'ar' ? 'ml-1.5' : 'mr-1.5'} />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* 2. Mobile Drawer Navigation */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Overlay backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          <div className="relative flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-850 h-full max-w-xs animate-fade-in">
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <GraduationCap className="h-8 w-8 text-brand-primary" />
                <span className="font-extrabold text-lg tracking-tight">
                  {school === 'tfc' ? 'TFC School' : 'NextMind'}
                </span>
              </div>
              <button 
                onClick={() => setMobileOpen(false)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {filteredNav.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                      active 
                        ? 'bg-brand-primary text-white shadow-lg' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className={`h-5 w-5 shrink-0 ${lang === 'ar' ? 'ml-3' : 'mr-3'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-4 py-2 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 text-xs font-bold rounded-xl border border-red-100 hover:bg-red-100/55 transition-all"
              >
                <LogOut size={14} className={lang === 'ar' ? 'ml-1.5' : 'mr-1.5'} />
                <span>{t('logout')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header toolbar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 relative z-10">
          <div className="flex items-center">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-550 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white"
            >
              <Menu size={20} />
            </button>
            <div className="ml-2 md:ml-0 flex items-center space-x-2 rtl:space-x-reverse text-xs bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-2.5 py-1 rounded-full text-slate-650 dark:text-slate-400">
              <span className="font-bold text-brand-primary uppercase">
                {school === 'tfc' ? 'TFC School' : 'NextMind Academy'}
              </span>
              <span>•</span>
              <span className="capitalize font-semibold">{t(`role${user?.role.charAt(0).toUpperCase() + user?.role.slice(1).replace('-', '')}`)}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {/* Language Switcher */}
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
            >
              <option value="fr">FR</option>
              <option value="ar">AR</option>
              <option value="en">EN</option>
            </select>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 rounded-lg"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </header>

        {/* Dashboard Routing Sub-sections */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<DashboardHub />} />
            <Route path="/enrollments" element={<AdminDashboard />} />
            <Route path="/payments" element={<ModeratorDashboard />} />
            <Route path="/timetable" element={<SousAdminDashboard />} />
            <Route path="/announcements" element={<SousAdminDashboard tab="announcements" />} />
            <Route path="/users" element={<UsersStaffList />} />
            <Route path="/logs" element={<AdminDashboard tab="logs" />} />
            <Route path="/profile" element={<ProfileSettings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>

    </div>
  );
}

// 4. General Stats Dashboard Hub (adapts to each user role)
function DashboardHub() {
  const { user } = useAuth();
  const { t } = useLang();
  const { school } = useSchool();
  const [stats, setStats] = useState({ students: 0, pending: 0, groups: 0, revenue: 0 });
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch enrollments to compute stats
        let enrolls = [];
        if (['admin', 'sous-admin', 'moderator'].includes(user?.role)) {
          enrolls = await api.getEnrollments(school);
        }

        // Fetch payments for revenue
        let pays = [];
        if (['admin', 'moderator', 'student'].includes(user?.role)) {
          pays = await api.getPayments(school);
        }

        // Fetch timetable groups
        let groups = [];
        try {
          groups = await api.getTimetable(school);
        } catch (e) {}

        // Fetch announcements
        let anns = [];
        try {
          anns = await api.getAnnouncements(school);
          setAnnouncements(anns.slice(0, 3)); // show top 3
        } catch (e) {}

        // Fetch all users to filter active students count
        let usersList = [];
        if (['admin', 'sous-admin', 'moderator'].includes(user?.role)) {
          usersList = await api.getUsers(school);
        }

        const activeStds = usersList.filter(u => u.role === 'student').length;
        const totalPayments = pays.reduce((sum, item) => sum + (item.amountPaid || 0), 0);
        const pendingEnrolls = enrolls.filter(e => e.status === 'pending').length;

        setStats({
          students: activeStds || 2, // fallback values for demo UI
          pending: pendingEnrolls,
          groups: groups.length || 1,
          revenue: totalPayments
        });
      } catch (err) {
        console.error("Error loading stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, [school, user]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          {t('welcome')}, {user?.name}!
        </h1>
        <p className="text-sm text-slate-550 dark:text-slate-400 mt-1">
          Here is a summary of what's happening at {school === 'tfc' ? 'TFC School' : 'NextMind Academy'}.
        </p>
      </div>

      {/* Stats Cards Section (Admin / Sous-Admin / Moderator) */}
      {['admin', 'sous-admin', 'moderator'].includes(user?.role) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
            <p className="text-xs font-semibold text-slate-450 dark:text-slate-500 uppercase">{t('statsStudents')}</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">{stats.students}</h3>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
            <p className="text-xs font-semibold text-slate-450 dark:text-slate-500 uppercase">{t('statsPending')}</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">{stats.pending}</h3>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
            <p className="text-xs font-semibold text-slate-450 dark:text-slate-500 uppercase">{t('statsGroups')}</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">{stats.groups}</h3>
          </div>

          {['admin', 'moderator'].includes(user?.role) && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
              <p className="text-xs font-semibold text-slate-450 dark:text-slate-500 uppercase">{t('statsRevenue')}</p>
              <h3 className="text-3xl font-black text-brand-primary mt-2">{stats.revenue} DA</h3>
            </div>
          )}
        </div>
      )}

      {/* Student View Cards */}
      {user?.role === 'student' && <StudentDashboard isHub={true} />}

      {/* Teacher View Cards */}
      {user?.role === 'teacher' && <TeacherDashboard isHub={true} />}

      {/* Announcements Board Widget */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center space-x-2 rtl:space-x-reverse">
          <Megaphone className="text-brand-primary" size={20} />
          <span>Latest Announcements</span>
        </h3>

        {announcements.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('noAnnouncements')}</p>
        ) : (
          <div className="space-y-4">
            {announcements.map((ann) => (
              <div key={ann._id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-900 rounded-xl">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{ann.title}</h4>
                  <span className="text-[10px] text-slate-500 dark:text-slate-500">{new Date(ann.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{ann.content}</p>
                <div className="mt-2 text-[10px] text-slate-400 dark:text-slate-600">
                  {t('postedBy')} {ann.author} ({ann.role})
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
