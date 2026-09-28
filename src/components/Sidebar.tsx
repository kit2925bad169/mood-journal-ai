import React from 'react';
import { useLanguage } from '../context/LanguageContext.js';
import {
  Home,
  PenLine,
  MessageSquare,
  History,
  TrendingUp,
  Target,
  HeartHandshake,
  Settings,
  ShieldCheck,
  X
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  isOpenMobile,
  onCloseMobile
}) => {
  const { t } = useLanguage();

  const navItems = [
    { id: 'dashboard', label: t.nav.home, icon: Home },
    { id: 'journal', label: t.nav.newJournal, icon: PenLine },
    { id: 'chat', label: t.nav.chatWithAI, icon: MessageSquare },
    { id: 'history', label: t.nav.history, icon: History },
    { id: 'insights', label: t.nav.insights, icon: TrendingUp },
    { id: 'goals', label: t.nav.goals, icon: Target },
    { id: 'support', label: t.nav.support, icon: HeartHandshake },
    { id: 'settings', label: t.nav.settings, icon: Settings },
  ];

  const handleSelect = (id: string) => {
    onNavigate(id);
    onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full justify-between p-4">
      {/* Top brand & navigation links */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2 pt-2 md:hidden">
          <span className="font-extrabold text-slate-900 dark:text-white text-base">
            🌿 Mood Journal AI
          </span>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Disclaimer Box */}
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Wellness Guarantee</span>
        </div>
        <p className="leading-snug">
          {t.disclaimer}
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md shrink-0 h-[calc(100vh-4rem)] sticky top-16">
        {content}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Drawer Panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {content}
      </div>
    </>
  );
};
