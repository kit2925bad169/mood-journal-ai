import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage, LANGUAGE_OPTIONS } from '../context/LanguageContext.js';
import { useTheme } from '../context/ThemeContext.js';
import {
  Bell,
  Sun,
  Moon,
  Globe,
  Menu,
  X,
  Sparkles,
  LogOut,
  User as UserIcon,
  CheckCircle,
  Clock
} from 'lucide-react';
import { api } from '../services/api.js';
import { ReminderItem } from '../types.js';

export const Navbar: React.FC<{
  onToggleSidebar?: () => void;
  activePage: string;
  onNavigate: (page: string) => void;
}> = ({ onToggleSidebar, activePage, onNavigate }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme, isDark } = useTheme();

  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      api.getReminders().then((res) => setReminders(res.reminders)).catch(() => {});
    }
  }, [isAuthenticated]);

  const activeLangObj = LANGUAGE_OPTIONS.find((l) => l.code === language) || LANGUAGE_OPTIONS[0];

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Mobile hamburger & Logo */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user?.role !== 'supporter' && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div
            onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'landing')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <span className="text-lg">🌿</span>
            </div>
            <div>
              <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-base sm:text-lg block leading-none">
                Mood Journal <span className="text-emerald-600 dark:text-emerald-400">AI</span>
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block mt-0.5">
                Explainable Emotion Intelligence
              </span>
            </div>
          </div>
        </div>

        {/* Right: Controls & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-all"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{activeLangObj.nativeName}</span>
            </button>

            {showLangDropdown && (
              <div
                className="absolute right-0 mt-2 w-44 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl py-1.5 z-50 text-xs"
                onMouseLeave={() => setShowLangDropdown(false)}
              >
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Select Language
                </div>
                {LANGUAGE_OPTIONS.map((item) => (
                  <button
                    key={item.code}
                    onClick={() => {
                      setLanguage(item.code);
                      setShowLangDropdown(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                      language === item.code ? 'font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{item.nativeName}</span>
                    <span className="text-[10px] opacity-60">({item.label})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            aria-label="Toggle Dark Mode"
            title={isDark ? t.common.lightMode : t.common.darkMode}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Notifications / Reminders Popover */}
          {isAuthenticated && (
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-all"
                title="Daily Reminders"
              >
                <Bell className="w-4 h-4" />
                {reminders.some((r) => r.enabled) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>

              {showNotifications && (
                <div
                  className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl p-3 z-50 text-xs"
                  onMouseLeave={() => setShowNotifications(false)}
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-900 dark:text-white">Active Daily Reminders</span>
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="space-y-2">
                    {reminders.filter((r) => r.enabled).length === 0 ? (
                      <p className="text-slate-500 dark:text-slate-400 text-center py-2">No active reminders</p>
                    ) : (
                      reminders
                        .filter((r) => r.enabled)
                        .map((r, i) => (
                          <div key={i} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                            <p className="text-slate-700 dark:text-slate-200 font-medium leading-tight">{r.message}</p>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
                              Scheduled daily at {r.scheduledTime}
                            </span>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile / Auth Action */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div
                onClick={() => onNavigate(user?.role === 'supporter' ? 'supporter-dashboard' : 'settings')}
                className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-xs cursor-pointer hover:ring-2 hover:ring-emerald-500 transition-all"
                title={user?.name}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
                title={t.nav.logout}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('login')}
                className="px-3.5 py-1.5 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                {t.auth.login}
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
              >
                {t.auth.createNewAccount}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
