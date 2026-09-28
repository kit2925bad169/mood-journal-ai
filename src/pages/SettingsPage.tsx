import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage, LANGUAGE_OPTIONS } from '../context/LanguageContext.js';
import { useTheme } from '../context/ThemeContext.js';
import { api } from '../services/api.js';
import { ReminderItem } from '../types.js';
import {
  Globe,
  Sun,
  Moon,
  Bell,
  Download,
  Trash2,
  ShieldCheck,
  Plus
} from 'lucide-react';

export const SettingsPage: React.FC<{ onNavigate: (page: string) => void }> = ({
  onNavigate
}) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { toggleTheme, isDark } = useTheme();

  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [newReminderMsg, setNewReminderMsg] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('20:00');
  const [isExporting, setIsExporting] = useState(false);

  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission | 'unsupported'>(
      typeof window !== 'undefined' && 'Notification' in window
        ? Notification.permission
        : 'unsupported'
    );

  /*
   * Keep the latest reminders available to the notification
   * scheduler without restarting the interval every time
   * the reminders state changes.
   */
  const remindersRef = useRef<ReminderItem[]>([]);

  /*
   * Prevent duplicate notifications.
   */
  const notificationIntervalRef = useRef<number | null>(null);

  /*
   * ---------------------------------------------------------
   * KEEP REF IN SYNC WITH REMINDERS
   * ---------------------------------------------------------
   */
  useEffect(() => {
    remindersRef.current = reminders;
  }, [reminders]);

  /*
   * ---------------------------------------------------------
   * LOAD REMINDERS
   * ---------------------------------------------------------
   */
  useEffect(() => {
    loadReminders();
  }, []);

  /*
   * ---------------------------------------------------------
   * START NOTIFICATION CHECKER
   * ---------------------------------------------------------
   */
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!('Notification' in window)) {
      setNotificationPermission('unsupported');
      return;
    }

    /*
     * Check every 10 seconds.
     *
     * This is intentionally frequent so the notification
     * still works even if the page was loaded a few seconds
     * before the scheduled minute.
     */
    notificationIntervalRef.current = window.setInterval(() => {
      checkScheduledReminders();
    }, 10000);

    /*
     * Also check immediately.
     */
    checkScheduledReminders();

    return () => {
      if (notificationIntervalRef.current !== null) {
        window.clearInterval(notificationIntervalRef.current);
        notificationIntervalRef.current = null;
      }
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * CHECK SCHEDULED REMINDERS
   * ---------------------------------------------------------
   */
  const checkScheduledReminders = () => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!('Notification' in window)) {
      return;
    }

    if (Notification.permission !== 'granted') {
      return;
    }

    const now = new Date();

    const currentHour = now
      .getHours()
      .toString()
      .padStart(2, '0');

    const currentMinute = now
      .getMinutes()
      .toString()
      .padStart(2, '0');

    const currentTime = `${currentHour}:${currentMinute}`;

    /*
     * Use the REF so this always contains the newest reminders.
     */
    const currentReminders = remindersRef.current;

    currentReminders.forEach((reminder) => {
      if (!reminder.enabled) {
        return;
      }

      if (reminder.scheduledTime !== currentTime) {
        return;
      }

      /*
       * Use local date instead of UTC date.
       */
      const localDate =
        `${now.getFullYear()}-` +
        `${(now.getMonth() + 1).toString().padStart(2, '0')}-` +
        `${now.getDate().toString().padStart(2, '0')}`;

      const notificationKey =
        `mood-journal-reminder-${reminder.id}-${localDate}`;

      /*
       * Because we check every 10 seconds, the same reminder
       * could otherwise fire several times during the minute.
       */
      if (localStorage.getItem(notificationKey)) {
        return;
      }

      try {
        const notification = new Notification(
          'Mood Journal Reminder',
          {
            body: reminder.message,
            icon: '/favicon.ico',
            tag: `mood-journal-${reminder.id}`
          }
        );

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        localStorage.setItem(notificationKey, 'shown');

        console.log(
          'Mood Journal notification shown:',
          reminder.message
        );
      } catch (error) {
        console.error(
          'Failed to display browser notification:',
          error
        );
      }
    });
  };

  /*
   * ---------------------------------------------------------
   * ENABLE BROWSER NOTIFICATIONS
   * ---------------------------------------------------------
   */
  const handleEnableNotifications = async () => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!('Notification' in window)) {
      alert(
        'Your browser does not support notifications.'
      );

      setNotificationPermission('unsupported');
      return;
    }

    try {
      const permission =
        await Notification.requestPermission();

      setNotificationPermission(permission);

      if (permission === 'granted') {
        /*
         * Immediately check in case a reminder is already
         * scheduled for the current minute.
         */
        checkScheduledReminders();
      } else if (permission === 'denied') {
        alert(
          'Notifications are blocked. Please allow notifications for this site in Chrome site settings.'
        );
      }
    } catch (error) {
      console.error(
        'Notification permission error:',
        error
      );
    }
  };

  /*
   * ---------------------------------------------------------
   * LOAD REMINDERS FROM SUPABASE
   * ---------------------------------------------------------
   */
  const loadReminders = async () => {
    try {
      const res = await api.getReminders();

      setReminders(res.reminders);

      remindersRef.current = res.reminders;
    } catch (err) {
      console.error(
        'Error fetching reminders:',
        err
      );
    }
  };

  /*
   * ---------------------------------------------------------
   * ADD REMINDER
   * ---------------------------------------------------------
   */
  const handleAddReminder = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!newReminderMsg.trim()) {
      return;
    }

    try {
      /*
       * Request permission from this user action if needed.
       */
      if (
        'Notification' in window &&
        Notification.permission === 'default'
      ) {
        const permission =
          await Notification.requestPermission();

        setNotificationPermission(permission);
      }

      const res = await api.addReminder(
        newReminderMsg.trim(),
        newReminderTime
      );

      setReminders((prev) => {
        const updated = [...prev, res.reminder];

        remindersRef.current = updated;

        return updated;
      });

      setNewReminderMsg('');

      /*
       * Immediately check the new reminder.
       */
      setTimeout(() => {
        checkScheduledReminders();
      }, 100);
    } catch (err) {
      console.error(
        'Failed to add reminder:',
        err
      );

      alert('Failed to add reminder');
    }
  };

  /*
   * ---------------------------------------------------------
   * TOGGLE REMINDER
   * ---------------------------------------------------------
   */
  const handleToggleReminder = async (
    id: string,
    current: boolean
  ) => {
    const updatedReminders =
      reminders.map((r) =>
        r.id === id
          ? {
              ...r,
              enabled: !current
            }
          : r
      );

    setReminders(updatedReminders);

    remindersRef.current = updatedReminders;

    try {
      await api.toggleReminder(
        id,
        !current
      );
    } catch (err) {
      console.error(
        'Failed to toggle reminder:',
        err
      );

      const restoredReminders =
        reminders.map((r) =>
          r.id === id
            ? {
                ...r,
                enabled: current
              }
            : r
        );

      setReminders(restoredReminders);

      remindersRef.current =
        restoredReminders;
    }
  };

  /*
   * ---------------------------------------------------------
   * DELETE REMINDER
   * ---------------------------------------------------------
   */
  const handleDeleteReminder = async (
    id: string
  ) => {
    const previousReminders = [...reminders];

    const updatedReminders =
      reminders.filter((r) => r.id !== id);

    setReminders(updatedReminders);

    remindersRef.current = updatedReminders;

    try {
      await api.deleteReminder(id);

      /*
       * Remove today's notification marker too.
       */
      const now = new Date();

      const localDate =
        `${now.getFullYear()}-` +
        `${(now.getMonth() + 1).toString().padStart(2, '0')}-` +
        `${now.getDate().toString().padStart(2, '0')}`;

      localStorage.removeItem(
        `mood-journal-reminder-${id}-${localDate}`
      );
    } catch (err) {
      console.error(
        'Failed to delete reminder:',
        err
      );

      setReminders(previousReminders);

      remindersRef.current =
        previousReminders;
    }
  };

  /*
   * ---------------------------------------------------------
   * EXPORT DATA
   * ---------------------------------------------------------
   */
  const handleExportData = async () => {
    setIsExporting(true);

    try {
      const data = await api.exportData();

      const blob = new Blob(
        [JSON.stringify(data, null, 2)],
        {
          type: 'application/json'
        }
      );

      const url =
        URL.createObjectURL(blob);

      const a =
        document.createElement('a');

      a.href = url;

      a.download =
        `mood_journal_export_${new Date()
          .toISOString()
          .slice(0, 10)}.json`;

      document.body.appendChild(a);

      a.click();

      document.body.removeChild(a);

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(
        'Export failed:',
        err
      );

      alert('Export failed.');
    } finally {
      setIsExporting(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * DELETE ACCOUNT
   * ---------------------------------------------------------
   */
  const handleDeleteAccount = async () => {
    const confirmation =
      window.confirm(
        'Are you sure you want to permanently delete your account and all associated reflections? This action cannot be undone.'
      );

    if (!confirmation) {
      return;
    }

    try {
      await api.deleteAccount();

      logout();

      onNavigate('landing');
    } catch (err) {
      console.error(
        'Failed to delete account:',
        err
      );

      alert('Failed to delete account');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">

        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">

          <span className="p-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600">
            ⚙️
          </span>

          <span>
            Settings & Preferences
          </span>

        </h1>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize application language, theme, daily notifications, and data privacy
        </p>

      </div>

      {/* Account Info */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">

        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Profile Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">

            <span className="text-slate-400 block mb-0.5">
              Name
            </span>

            <span className="font-bold text-slate-900 dark:text-white">
              {user?.name}
            </span>

          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">

            <span className="text-slate-400 block mb-0.5">
              Email
            </span>

            <span className="font-bold text-slate-900 dark:text-white">
              {user?.email}
            </span>

          </div>

        </div>

      </div>

      {/* Language & Theme */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">

        <div>

          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">

            <Globe className="w-4 h-4 text-emerald-600" />

            <span>
              Interface & Voice Language
            </span>

          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Select your preferred language. All prompts, AI reflections, voice recognition, and audio speech will adapt instantly.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">

            {LANGUAGE_OPTIONS.map((item) => (

              <button
                key={item.code}
                onClick={() =>
                  setLanguage(item.code)
                }
                className={`p-3 rounded-2xl border text-xs text-left transition-all ${
                  language === item.code
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >

                <div className="font-bold">
                  {item.nativeName}
                </div>

                <div className="text-[10px] text-slate-400">
                  {item.label}
                </div>

              </button>

            ))}

          </div>

        </div>

        {/* Theme Toggle */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">

          <div>

            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">

              {isDark ? (
                <Moon className="w-4 h-4 text-slate-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}

              <span>
                Appearance Mode
              </span>

            </h4>

            <p className="text-xs text-slate-500">
              Currently using{' '}
              {isDark
                ? 'Dark Mode'
                : 'Light Mode'}
            </p>

          </div>

          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
          >
            Switch to{' '}
            {isDark
              ? 'Light'
              : 'Dark'}
          </button>

        </div>

      </div>

      {/* Daily Reminders */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">

        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">

          <Bell className="w-4 h-4 text-emerald-600" />

          <span>
            Daily Reflection Reminders
          </span>

        </h3>

        <p className="text-xs text-slate-500">
          Set scheduled nudges to check in with yourself and journal your thoughts.
        </p>

        {/* Notification Permission */}
        {'Notification' in window && (
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

              <div>

                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Browser Notifications
                </p>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">

                  {notificationPermission === 'granted'
                    ? 'Notifications are enabled. Your reminders can notify you at the scheduled time.'
                    : notificationPermission === 'denied'
                    ? 'Notifications are blocked for this site.'
                    : 'Enable notifications to receive your scheduled reminders.'}

                </p>

              </div>

              {notificationPermission !== 'granted' && (
                <button
                  type="button"
                  onClick={
                    handleEnableNotifications
                  }
                  className="shrink-0 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all"
                >
                  🔔 Enable Notifications
                </button>
              )}

              {notificationPermission === 'granted' && (
                <span className="shrink-0 text-xs font-bold text-emerald-600">
                  ✓ Enabled
                </span>
              )}

            </div>

          </div>
        )}

        {/* Existing Reminders */}
        <div className="space-y-2">

          {reminders.length === 0 && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-400 text-center">
              No reminders added yet.
            </div>
          )}

          {reminders.map((r) => (

            <div
              key={r.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs"
            >

              <div className="flex items-center gap-3">

                <input
                  type="checkbox"
                  checked={r.enabled}
                  onChange={() =>
                    handleToggleReminder(
                      r.id,
                      r.enabled
                    )
                  }
                  className="rounded-md accent-emerald-600 w-4 h-4 cursor-pointer"
                />

                <div>

                  <span
                    className={`font-semibold ${
                      r.enabled
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-400 line-through'
                    }`}
                  >
                    {r.message}
                  </span>

                  <span className="text-[10px] text-slate-400 block">
                    Daily at{' '}
                    {r.scheduledTime}
                  </span>

                </div>

              </div>

              <button
                onClick={() =>
                  handleDeleteReminder(
                    r.id
                  )
                }
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-all"
                aria-label="Delete reminder"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

            </div>

          ))}

        </div>

        {/* Add Reminder */}
        <form
          onSubmit={handleAddReminder}
          className="pt-2 flex flex-col sm:flex-row items-center gap-2"
        >

          <input
            type="text"
            value={newReminderMsg}
            onChange={(e) =>
              setNewReminderMsg(
                e.target.value
              )
            }
            placeholder="e.g. Evening gratitude check-in..."
            required
            className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white w-full sm:w-auto"
          />

          <input
            type="time"
            value={newReminderTime}
            onChange={(e) =>
              setNewReminderTime(
                e.target.value
              )
            }
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />

          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-xs"
          >

            <Plus className="w-3.5 h-3.5" />

            <span>
              Add Reminder
            </span>

          </button>

        </form>

      </div>

      {/* Privacy & Data */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">

        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">

          <ShieldCheck className="w-4 h-4 text-emerald-600" />

          <span>
            Privacy & Data Sovereignty
          </span>

        </h3>

        <p className="text-xs text-slate-500">
          Your reflections are strictly private. You can export a full JSON archive of your entries or permanently wipe your account at any moment.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">

          <button
            onClick={handleExportData}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-750 transition-all"
          >

            <Download className="w-4 h-4 text-emerald-600" />

            <span>
              {isExporting
                ? 'Exporting...'
                : 'Export All Journals (JSON)'}
            </span>

          </button>

          <button
            onClick={
              handleDeleteAccount
            }
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all border border-rose-200 dark:border-rose-900/50"
          >

            <Trash2 className="w-4 h-4" />

            <span>
              Delete Account & Reflections
            </span>

          </button>

        </div>

      </div>

      {/* Medical Disclaimer */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-center gap-2">

        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />

        <span>
          {t.disclaimer}
        </span>

      </div>

    </div>
  );
};