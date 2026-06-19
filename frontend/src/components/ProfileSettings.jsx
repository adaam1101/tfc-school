import React, { useState } from 'react';
import { useAuth, useLang, useSchool } from '../App';
import { Shield, Key, Eye, EyeOff, CheckCircle2, AlertCircle, QrCode } from 'lucide-react';
import { api } from '../api';

export default function ProfileSettings() {
  const { user, updateUser } = useAuth();
  const { lang, t } = useLang();
  const { school } = useSchool();

  // Password update form
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  // 2FA state
  const [setupStep, setSetupStep] = useState(false); // setup active
  const [secret, setSecret] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [demoCode, setDemoCode] = useState('');
  const [tfaError, setTfaError] = useState('');
  const [tfaSuccess, setTfaSuccess] = useState('');
  const [tfaLoading, setTfaLoading] = useState(false);

  // Password submission handler
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');
    
    if (password !== confirmPassword) {
      setPassError("Passwords do not match");
      return;
    }

    setPassLoading(true);
    try {
      await api.updateUser(user.id, { name: user.name, password }, school);
      setPassSuccess("Password updated successfully!");
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPassError(err.message);
    } finally {
      setPassLoading(false);
    }
  };

  // Setup 2FA
  const initiate2faSetup = async () => {
    setTfaError('');
    setTfaSuccess('');
    setTfaLoading(true);
    try {
      const data = await api.setup2FA(school);
      setSecret(data.secret);
      setQrUrl(data.qrUrl);
      setDemoCode(data.demoCode); // Expose rotating key for quick UI testing
      setSetupStep(true);
    } catch (err) {
      setTfaError(err.message);
    } finally {
      setTfaLoading(false);
    }
  };

  // Verify and enable 2FA
  const confirm2faEnable = async (e) => {
    e.preventDefault();
    setTfaError('');
    setTfaSuccess('');

    if (!totpCode || totpCode.length !== 6) {
      setTfaError("Please enter a valid 6-digit code");
      return;
    }

    setTfaLoading(true);
    try {
      await api.enable2FA(totpCode, school);
      updateUser({ twoFactorEnabled: true });
      setTfaSuccess("Two-factor authentication enabled successfully!");
      setSetupStep(false);
      setTotpCode('');
    } catch (err) {
      setTfaError(err.message);
    } finally {
      setTfaLoading(false);
    }
  };

  // Disable 2FA
  const handleDisable2fa = async () => {
    if (!window.confirm("Are you sure you want to disable Two-Factor Authentication? Your account security will be lowered.")) return;
    setTfaError('');
    setTfaSuccess('');
    try {
      await api.disable2FA(school);
      updateUser({ twoFactorEnabled: false });
      setTfaSuccess("Two-factor authentication disabled successfully.");
    } catch (err) {
      setTfaError(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Profile Security Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Manage passwords, authentication tokens, and portal configurations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Password Reset Form Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Key size={18} className="text-brand-primary" />
            <span>Update Password</span>
          </h3>

          {passError && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-650 dark:text-red-300 p-3 rounded-lg text-xs flex items-center space-x-2">
              <AlertCircle size={14} />
              <span>{passError}</span>
            </div>
          )}

          {passSuccess && (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-255 dark:border-emerald-900 text-emerald-600 dark:text-emerald-300 p-3 rounded-lg text-xs flex items-center space-x-2">
              <CheckCircle2 size={14} />
              <span>{passSuccess}</span>
            </div>
          )}

          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-55 dark:bg-slate-950 border border-slate-300 dark:border-slate-855 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1">Confirm Password</label>
              <input
                type={showPass ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-55 dark:bg-slate-950 border border-slate-300 dark:border-slate-855 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                required
              />
            </div>

            <button
              type="submit"
              disabled={passLoading}
              className="px-5 py-2.5 bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold rounded-xl transition-all"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* 2FA Status Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Shield size={18} className="text-brand-primary" />
            <span>{t('twoFactorSettings')}</span>
          </h3>

          {tfaError && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-650 dark:text-red-300 p-3 rounded-lg text-xs flex items-center space-x-2">
              <AlertCircle size={14} />
              <span>{tfaError}</span>
            </div>
          )}

          {tfaSuccess && (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-255 dark:border-emerald-900 text-emerald-600 dark:text-emerald-300 p-3 rounded-lg text-xs flex items-center space-x-2">
              <CheckCircle2 size={14} />
              <span>{tfaSuccess}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="p-4 bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-850 dark:text-white">Security Level</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Toggle 2FA login verification code checks</p>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                user?.twoFactorEnabled 
                  ? 'bg-emerald-100 text-emerald-600' 
                  : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {user?.twoFactorEnabled ? '2FA ENABLED' : '2FA DISABLED'}
              </span>
            </div>

            {!setupStep ? (
              <div>
                {user?.twoFactorEnabled ? (
                  <button
                    onClick={handleDisable2fa}
                    className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 text-xs font-bold rounded-xl border border-red-200/50 dark:border-red-900 transition-all"
                  >
                    {t('disable2faBtn')}
                  </button>
                ) : (
                  <button
                    onClick={initiate2faSetup}
                    disabled={tfaLoading}
                    className="px-5 py-2.5 bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold rounded-xl transition-all"
                  >
                    {t('setup2faBtn')}
                  </button>
                )}
              </div>
            ) : (
              // 2FA Confirm Step panel
              <div className="p-4 bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl space-y-4 animate-fade-in">
                <div className="flex items-center space-x-2 text-brand-primary font-bold text-xs">
                  <QrCode size={18} />
                  <span>Setup Authentication App</span>
                </div>
                
                <p className="text-[10px] text-slate-550 leading-relaxed">
                  {t('scanQrHelp')}
                </p>

                {/* QR Code and Secret display */}
                <div className="flex flex-col items-center space-y-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-850">
                  <img src={qrUrl} alt="2FA QR Code Setup" className="h-40 w-40 border border-slate-200/50 dark:border-slate-800 p-1 bg-white rounded-lg" />
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400">Authenticator Secret Key:</span>
                    <p className="font-mono text-xs font-bold select-all text-slate-800 dark:text-white mt-0.5">{secret}</p>
                  </div>
                </div>

                {/* rotating evaluation code display */}
                {demoCode && (
                  <div className="p-2 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary rounded-xl text-center text-xs font-semibold">
                    🔑 Mock Code (for verification): <code className="text-sm font-mono tracking-wider font-extrabold select-all">{demoCode}</code>
                  </div>
                )}

                <form onSubmit={confirm2faEnable} className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">{t('enterCodeConfirm')}</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 text-center text-lg bg-white dark:bg-slate-900 border border-slate-350 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent font-mono tracking-widest"
                      placeholder="000000"
                      required
                    />
                  </div>

                  <div className="flex space-x-2 pt-1 justify-end">
                    <button
                      type="button"
                      onClick={() => setSetupStep(false)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-white font-semibold rounded-xl text-[10px]"
                    >
                      {t('cancelBtn')}
                    </button>
                    <button
                      type="submit"
                      disabled={tfaLoading}
                      className="px-4 py-2 bg-brand-primary hover:bg-brand-hover text-white font-semibold rounded-xl text-[10px]"
                    >
                      {t('enable2faBtn')}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
