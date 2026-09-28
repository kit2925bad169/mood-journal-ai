import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import {
  Lock,
  Mail,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  HeartHandshake
} from 'lucide-react';

export const LoginPage: React.FC<{
  onNavigate: (page: string) => void;
}> = ({ onNavigate }) => {
  const { login, loginDemo } = useAuth();
  const { t } = useLanguage();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier || !password) {
      setError('Please enter your email or mobile and password');
      return;
    }

    setIsLoading(true);

    try {
      await login(identifier, password);
      onNavigate('dashboard');
    } catch (err: any) {
      setError(
        err?.message ||
          'Login failed. Please verify your credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemo = async () => {
    setError('');
    setIsLoading(true);

    try {
      await loginDemo();
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err?.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* LEFT BRANDING */}
        <div className="hidden md:flex flex-col justify-between p-8 lg:p-10 bg-gradient-to-br from-emerald-800 to-teal-950 text-white relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold text-emerald-200 border border-white/10 mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mood Journal AI</span>
            </div>

            <h2 className="text-3xl font-extrabold leading-tight">
              Reflect with clarity. Grow with confidence.
            </h2>

            <p className="mt-3 text-sm text-emerald-100/90 leading-relaxed">
              Track your emotional wellness with explainable AI
              insights, private journaling, and tailored daily
              suggestions.
            </p>
          </div>

          <div className="space-y-3 pt-6 border-t border-emerald-700/50 text-xs text-emerald-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Voice speech-to-text in 6 languages</span>
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>
                Transparent AI reasoning with zero medical claims
              </span>
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Full control over your data & privacy</span>
            </div>
          </div>
        </div>

        {/* RIGHT LOGIN */}
        <div className="p-6 sm:p-10 flex flex-col justify-center">

          <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {t.auth.welcomeBack}
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t.auth.loginSubtitle}
            </p>
          </div>

          {/* USER DEMO LOGIN */}
          <button
            type="button"
            onClick={handleDemo}
            disabled={isLoading}
            className="w-full py-2.5 px-4 mb-5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <span>{t.auth.demoLogin}</span>

            <span className="text-[10px] opacity-75 font-normal">
              (Pre-loaded with 7-day trends)
            </span>
          </button>

          <div className="relative flex items-center justify-center mb-5">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />

            <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Or with credentials
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* USER LOGIN FORM */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t.auth.emailOrMobile}
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) =>
                    setIdentifier(e.target.value)
                  }
                  placeholder="demo@moodjournal.ai or +1555..."
                  required
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
                />

                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t.auth.password}
              </label>

              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
                />

                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>
                {isLoading
                  ? 'Signing in...'
                  : t.auth.login}
              </span>

              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* SUPPORTER LOGIN */}
          <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-800">
            <div className="text-center mb-3">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Are you a human supporter?
              </p>

              <p className="text-[11px] text-slate-400 mt-1">
                Support users through private one-to-one conversations.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                onNavigate('supporter-login')
              }
              className="w-full py-3 rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-all"
            >
              <HeartHandshake className="w-4 h-4" />

              <span>Supporter Login</span>

              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* REGISTER */}
          <div className="mt-6 text-center text-xs text-slate-600 dark:text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-800">
            <span>{t.auth.dontHaveAccount} </span>

            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 ml-1"
            >
              {t.auth.createNewAccount}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};