/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { LanguageProvider } from './context/LanguageContext.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { Navbar } from './components/Navbar.js';
import { Sidebar } from './components/Sidebar.js';

// Pages
import { LandingPage } from './pages/LandingPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { JournalInputPage } from './pages/JournalInputPage.js';
import { ChatPage } from './pages/ChatPage.js';
import { HistoryPage } from './pages/HistoryPage.js';
import { InsightsPage } from './pages/InsightsPage.js';
import { GoalsPage } from './pages/GoalsPage.js';
import { SupportPage } from './pages/SupportPage.js';
import { SupporterLoginPage } from './pages/SupporterLoginPage.js';
import { SupporterDashboardPage } from './pages/SupporterDashboardPage.js';
import { SettingsPage } from './pages/SettingsPage.js';

function MainLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Sync navigation on auth change
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && (currentPage === 'landing' || currentPage === 'login' || currentPage === 'register' || currentPage === 'supporter-login')) {
        setCurrentPage(user?.role === 'supporter' ? 'supporter-dashboard' : 'dashboard');
      } else if (!isAuthenticated && currentPage !== 'login' && currentPage !== 'register') {
        setCurrentPage('landing');
      }
    }
  }, [isAuthenticated, isLoading, user?.role]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 animate-pulse flex items-center justify-center text-white text-xl">
            🌿
          </div>
          <p className="text-xs font-semibold text-slate-500">Loading Mood Journal AI...</p>
        </div>
      </div>
    );
  }

  // Render appropriate page content
  const renderContent = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={setCurrentPage} />;
      case 'login':
        return <LoginPage onNavigate={setCurrentPage} />;
      case 'register':
        return <RegisterPage onNavigate={setCurrentPage} />;
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentPage} />;
      case 'journal':
        return <JournalInputPage onNavigate={setCurrentPage} />;
      case 'chat':
        return <ChatPage />;
      case 'history':
        return <HistoryPage onNavigate={setCurrentPage} />;
      case 'insights':
        return <InsightsPage />;
      case 'goals':
        return <GoalsPage />;
      case 'support':
        return <SupportPage onNavigate={setCurrentPage} />;
      case 'supporter-login':
        return <SupporterLoginPage onNavigate={setCurrentPage} />;
      case 'supporter-dashboard':
        return <SupporterDashboardPage />;
      case 'settings':
        return <SettingsPage onNavigate={setCurrentPage} />;
      default:
        return <DashboardPage onNavigate={setCurrentPage} />;
    }
  };

  const isPublicPage = currentPage === 'landing' || currentPage === 'login' || currentPage === 'register' || currentPage === 'supporter-login';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navigation Bar */}
      <Navbar
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        activePage={currentPage}
        onNavigate={setCurrentPage}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex w-full">
        {/* Sidebar (authenticated app views) */}
        {!isPublicPage && isAuthenticated && user?.role !== 'supporter' && (
          <Sidebar
            activePage={currentPage}
            onNavigate={setCurrentPage}
            isOpenMobile={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Page Content Viewport */}
        <main className={`flex-1 overflow-y-auto ${isPublicPage ? 'p-0' : 'p-4 sm:p-6 lg:p-8'}`}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <MainLayout />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
