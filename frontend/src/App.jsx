import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { translations } from './i18n';

// 1. Context Declarations
const AuthContext = createContext(null);
const LangContext = createContext(null);
const ThemeContext = createContext(null);
const SchoolContext = createContext(null);

export const useAuth = () => useContext(AuthContext);
export const useLang = () => useContext(LangContext);
export const useTheme = () => useContext(ThemeContext);
export const useSchool = () => useContext(SchoolContext);

// Dynamic reset password page
import ResetPasswordConfirm from './components/ResetPasswordConfirm';
import LoginForm from './components/LoginForm';
import PublicInscription from './components/PublicInscription';
import DashboardLayout from './components/DashboardLayout';

export default function App() {
  // 2. Authentication State
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // Update user profile info (e.g. after changing 2FA settings)
  const updateUser = (updatedFields) => {
    const updated = { ...user, ...updatedFields };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
  };

  // 3. Language State (FR / AR / EN, persisted to localStorage)
  const [lang, setLangState] = useState(localStorage.getItem('lang') || 'fr');
  
  const setLang = (newLang) => {
    localStorage.setItem('lang', newLang);
    setLangState(newLang);
  };

  useEffect(() => {
    // Sync document direction
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = lang;
    }
  }, [lang]);

  // Translate Helper
  const t = (key) => {
    return translations[lang][key] || translations['en'][key] || key;
  };

  // 4. Dark Mode State
  const [theme, setThemeState] = useState(localStorage.getItem('theme') || 'dark'); // default dark mode for premium feel

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', nextTheme);
    setThemeState(nextTheme);
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // 5. School Brand State (driven by VITE_SCHOOL environment variable)
  // Options: 'tfc' or 'nextmind'
  const school = import.meta.env.VITE_SCHOOL || 'tfc';

  useEffect(() => {
    if (school === 'nextmind') {
      document.documentElement.classList.add('school-nextmind');
    } else {
      document.documentElement.classList.remove('school-nextmind');
    }
  }, [school]);

  // Protected Route component
  function ProtectedRoute({ children }) {
    if (!token) return <Navigate to="/login" replace />;
    return children;
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, updateUser }}>
      <LangContext.Provider value={{ lang, setLang, t }}>
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
          <SchoolContext.Provider value={{ school }}>
            <BrowserRouter>
              <Routes>
                {/* Public enrollment page */}
                <Route path="/" element={<PublicInscription />} />
                {/* Auth login */}
                <Route path="/login" element={!token ? <LoginForm /> : <Navigate to="/dashboard" replace />} />
                {/* Admin generated reset password confirmation link */}
                <Route path="/reset-password" element={<ResetPasswordConfirm />} />
                {/* Protected dashboards */}
                <Route 
                  path="/dashboard/*" 
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  } 
                />
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </SchoolContext.Provider>
        </ThemeContext.Provider>
      </LangContext.Provider>
    </AuthContext.Provider>
  );
}
