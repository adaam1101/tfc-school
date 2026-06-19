import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLang, useSchool } from '../App';
import { api } from '../api';

export default function ResetPasswordConfirm() {
  const { t } = useLang();
  const { school } = useSchool();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const userId = searchParams.get('userId');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newPassword) {
      setError(t('password') + ' is required');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await api.confirmResetPassword(token, userId, newPassword, school);
      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
        <h2 className="text-2xl font-bold text-center text-white mb-6">
          {t('resetPasswordConfirmTitle')}
        </h2>

        {error && (
          <div className="bg-red-500/15 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 px-4 py-3 rounded-lg text-sm mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              {t('newPasswordLabel')}
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 bg-slate-750 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 bg-slate-750 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-brand-primary hover:bg-brand-hover text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50"
          >
            {loading ? t('submitting') : t('savePasswordBtn')}
          </button>
        </form>
      </div>
    </div>
  );
}
