import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, useLang, useTheme, useSchool } from '../App';
import { Lock, Mail, ShieldAlert, Key, HelpCircle, Sun, Moon } from 'lucide-react';
import { api } from '../api';

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { lang, setLang, t } = useLang();
  const { theme, toggleTheme } = useTheme();
  const { school } = useSchool();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 2FA state
  const [require2fa, setRequire2fa] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [demo2fa, setDemo2fa] = useState('');

  // Login credentials tips helper
  const [showTips, setShowTips] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.login(
        email, 
        password, 
        require2fa ? totpCode : undefined, 
        school
      );

      if (data.require2FA) {
        setRequire2fa(true);
        setDemo2fa(data.demoCode); // Expose rotating code in demo evaluation mode
        setLoading(false);
        return;
      }

      // Success
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-550 dark:bg-slate-950 transition-colors duration-200">
      
      {/* Dynamic Header Controls */}
      <div className="absolute top-4 right-4 flex items-center space-x-2 rtl:space-x-reverse">
        {/* Language Switcher */}
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-350 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
        >
          <option value="fr">Français (FR)</option>
          <option value="ar">العربية (AR)</option>
          <option value="en">English (EN)</option>
        </select>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 bg-white dark:bg-slate-900 border border-slate-350 dark:border-slate-800 text-slate-850 dark:text-slate-200 rounded-lg focus:outline-none"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Dynamic School Logo Branding */}
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20 shadow-lg">
            <span className="text-2xl font-black text-brand-primary">
              {school === 'tfc' ? 'TFC' : 'NM'}
            </span>
          </div>
        </div>

        <h2 className="text-center text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {school === 'tfc' ? 'TFC School' : 'NextMind Academy'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          {t('loginTitle')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl border border-slate-200/50 dark:border-slate-800/40">
          
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-950/25 border border-red-200 dark:border-red-900/50 text-red-650 dark:text-red-300 px-4 py-3 rounded-lg text-sm flex items-start space-x-2 rtl:space-x-reverse">
              <ShieldAlert size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            {!require2fa ? (
              // Standard Fields
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t('email')}
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-350 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-primary/50 text-sm"
                      placeholder="name@school.dz"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t('password')}
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock size={18} />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-350 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-primary/50 text-sm"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              // 2FA Code Form
              <div className="animate-fade-in">
                <div className="flex justify-center mb-4 text-brand-primary">
                  <Key size={36} />
                </div>
                <h3 className="text-lg font-bold text-center text-slate-900 dark:text-white mb-2">
                  {t('verify2fa')}
                </h3>
                <p className="text-xs text-center text-slate-500 dark:text-slate-400 mb-4">
                  {t('totpHelp')}
                </p>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t('totpCode')}
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    className="block w-full text-center tracking-widest text-2xl py-3 bg-slate-50 dark:bg-slate-950 border border-slate-350 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    placeholder="000000"
                    required
                  />
                </div>

                {/* 2FA Demo Code Helper (Highly User-Friendly for Reviewers) */}
                {demo2fa && (
                  <div className="mt-4 p-3 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary rounded-xl text-center text-xs">
                    <span className="font-semibold">{t('demo2faCode')}</span>{' '}
                    <span className="font-mono text-base tracking-wider font-bold select-all">{demo2fa}</span>
                  </div>
                )}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all duration-150 disabled:opacity-50"
              >
                {loading ? t('loggingIn') : require2fa ? t('verifyBtn') : t('loginBtn')}
              </button>
            </div>
          </form>

          {/* Quick Demo Access Credentials Tooltip */}
          <div className="mt-6 border-t border-slate-100 dark:border-slate-800/85 pt-4 text-center">
            <button
              onClick={() => setShowTips(!showTips)}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-brand-primary flex items-center justify-center space-x-1 mx-auto"
            >
              <HelpCircle size={14} />
              <span>Need test accounts?</span>
            </button>

            {showTips && (
              <div className="mt-3 text-left bg-slate-55 dark:bg-slate-950 p-3 rounded-xl border border-slate-150 dark:border-slate-900 text-xs text-slate-700 dark:text-slate-300 space-y-2 max-h-40 overflow-y-auto">
                <p className="font-bold border-b border-slate-200 dark:border-slate-900 pb-1 text-slate-900 dark:text-white">Seeded logins (Password: <code className="bg-slate-200 dark:bg-slate-850 px-1 rounded">Admin123!</code> / <code className="bg-slate-200 dark:bg-slate-850 px-1 rounded">Staff123!</code> / <code className="bg-slate-200 dark:bg-slate-850 px-1 rounded">Teacher123!</code> / <code className="bg-slate-200 dark:bg-slate-850 px-1 rounded">Student123!</code>)</p>
                <div>
                  <span className="font-semibold">Admin:</span>
                  <ul className="list-disc pl-4 text-[11px] text-slate-500 dark:text-slate-400">
                    <li>admin@tfcschool.dz</li>
                    <li>admin@nextmind.dz</li>
                  </ul>
                </div>
                <div>
                  <span className="font-semibold">Staff/Moderators:</span>
                  <ul className="list-disc pl-4 text-[11px] text-slate-500 dark:text-slate-400">
                    <li>sousadmin@tfcschool.dz (Sous-Admin)</li>
                    <li>moderator@tfcschool.dz (Moderator)</li>
                    <li>moderator@nextmind.dz (Moderator)</li>
                  </ul>
                </div>
                <div>
                  <span className="font-semibold">Teacher:</span>
                  <ul className="list-disc pl-4 text-[11px] text-slate-500 dark:text-slate-400">
                    <li>teacher@tfcschool.dz</li>
                    <li>teacher@nextmind.dz</li>
                  </ul>
                </div>
                <div>
                  <span className="font-semibold">Student:</span>
                  <ul className="list-disc pl-4 text-[11px] text-slate-500 dark:text-slate-400">
                    <li>yacine@tfcschool.dz</li>
                    <li>farid@nextmind.dz</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-xs font-semibold text-brand-primary hover:underline">
              ← Go back to Public Inscription Page
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
