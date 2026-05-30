import React, { useState, useEffect } from 'react';
import { PageId, AnalysisResult, MarketDataSource } from './types';
import { saveStoredRecords, getStoredMarketSources, saveStoredMarketSources } from './data';
import { clearAuth, fetchMe, getToken, loadHistoryAsRecords, setAuth } from './lib/api';
import { logoutFirebase } from './lib/firebaseAuth';

// Navigation Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Page Components
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AnalyzeResume from './pages/AnalyzeResume';
import ResultsDashboard from './pages/ResultsDashboard';
import HistoryAnalytics from './pages/HistoryAnalytics';
import StoredMarketData from './pages/StoredMarketData';
import Profile from './pages/Profile';

import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('login');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Local Storage States
  const [records, setRecords] = useState<AnalysisResult[]>([]);
  const [sources, setSources] = useState<MarketDataSource[]>([]);
  const [activeAnalysisResult, setActiveAnalysisResult] = useState<AnalysisResult | null>(null);

  // Load state on mount
  useEffect(() => {
    if (window.location.pathname.endsWith('/auth/callback')) {
      return;
    }

    const token = getToken();

    if (token) {
      fetchMe()
        .then(() => {
          setCurrentPage('dashboard');
          return loadHistoryAsRecords();
        })
        .then((apiRecords) => {
          setRecords(apiRecords);
          saveStoredRecords(apiRecords);
        })
        .catch(() => {
          clearAuth();
          setCurrentPage('login');
          setRecords([]);
        });
    } else {
      setCurrentPage('login');
      setRecords([]);
    }

    setSources(getStoredMarketSources());
  }, []);

  // Update localStorage when records change
  const handleAddRecord = (record: AnalysisResult) => {
    const updated = [record, ...records];
    setRecords(updated);
    saveStoredRecords(updated);
    setActiveAnalysisResult(record);
    setCurrentPage('results');
  };

  const handleClearHistory = () => {
    setRecords([]);
    saveStoredRecords([]);
    setActiveAnalysisResult(null);
  };

  const handleAddSource = (src: MarketDataSource) => {
    const updated = [src, ...sources];
    setSources(updated);
    saveStoredMarketSources(updated);
  };

  const handleClearSources = () => {
    setSources([]);
    saveStoredMarketSources([]);
  };

  const handleLogout = async () => {
    clearAuth();
    try {
      await logoutFirebase();
    } catch {
      // ignore Firebase sign-out errors
    }
    setActiveAnalysisResult(null);
    setCurrentPage('login');
  };

  const handleLoginSuccess = () => {
    setCurrentPage('dashboard');
    loadHistoryAsRecords()
      .then((apiRecords) => {
        setRecords(apiRecords);
        saveStoredRecords(apiRecords);
      })
      .catch(() => {
        setRecords([]);
      });
    setSources(getStoredMarketSources());
  };

  // Google OAuth redirect: /auth/callback?token=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthToken = params.get('token');
    const onCallbackPath = window.location.pathname.endsWith('/auth/callback');

    if (!onCallbackPath || !oauthToken) return;

    setAuth(oauthToken, { name: 'User', email: '' });
    fetchMe()
      .then(() => {
        window.history.replaceState({}, '', '/');
        handleLoginSuccess();
      })
      .catch(() => {
        clearAuth();
        window.history.replaceState({}, '', '/');
        setCurrentPage('login');
      });
  }, []);

  // Filter records in global query searches (for header)
  const filteredRecords = records.filter(rec => {
    if (!searchQuery) return true;
    const term = searchQuery.toLowerCase();
    return (
      rec.targetRole.toLowerCase().includes(term) ||
      rec.companyName.toLowerCase().includes(term) ||
      rec.candidateName.toLowerCase().includes(term)
    );
  });

  const isAuthPage = currentPage === 'login' || currentPage === 'signup';

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] relative overflow-x-hidden antialiased font-sans selection:bg-white selection:text-black">
      
      {/* Global subtle grain overlay texture to capture dark luxury cinematic look */}
      <div className="fixed inset-0 pointer-events-none z-50 bg-image-grain opacity-[0.03]" />

      {/* Cinematic Background Architecture Mockup */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute right-0 bottom-0 w-[60%] h-full bg-gradient-to-t from-black via-transparent to-transparent opacity-65"></div>
        <div className="absolute right-[-10%] top-[-20%] w-[800px] h-[1200px] bg-gradient-to-br from-[#1A1A1A] to-transparent transform -rotate-12 blur-3xl opacity-25"></div>
        {/* Mock Skyscraper Geometry */}
        <div className="absolute right-[10%] bottom-0 w-[1px] h-full bg-white/[0.03]"></div>
        <div className="absolute right-[30%] bottom-0 w-[1px] h-[80%] bg-white/[0.02]"></div>
        <div className="absolute right-[50%] bottom-0 w-[1px] h-[60%] bg-white/[0.01]"></div>
        <div className="absolute bottom-[20%] right-0 w-full h-[1px] bg-white/[0.03]"></div>
      </div>

      <div className="flex relative z-10">
        
        {/* Sidebar Nav (collapsible layout) */}
        {!isAuthPage && (
          <Sidebar
            currentPage={currentPage}
            onNavigate={(page) => setCurrentPage(page)}
            isOpen={isSidebarOpen}
            onCloseMobile={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main stage canvas */}
        <div
          className={`flex-1 min-h-screen flex flex-col transition-all duration-300 ${
            !isAuthPage ? 'md:pl-64' : 'pl-0'
          }`}
        >
          {/* Header */}
          {!isAuthPage && (
            <Header
              onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
              onNavigate={(page) => setCurrentPage(page)}
              searchQuery={searchQuery}
              onSearchChange={(q) => setSearchQuery(q)}
            />
          )}

          {/* Core Content frame */}
          <main className={!isAuthPage ? 'p-6 flex-1' : 'flex-1'}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="h-full"
              >
                {currentPage === 'login' && (
                  <Login
                    onNavigate={(page) => setCurrentPage(page)}
                    onLoginSuccess={handleLoginSuccess}
                  />
                )}
                {currentPage === 'signup' && (
                  <Signup
                    onNavigate={(page) => setCurrentPage(page)}
                    onSignupSuccess={handleLoginSuccess}
                  />
                )}
                {currentPage === 'dashboard' && (
                  <Dashboard
                    onNavigate={(page) => setCurrentPage(page)}
                    records={filteredRecords}
                  />
                )}
                {currentPage === 'analyze' && (
                  <AnalyzeResume
                    onNavigate={(page) => setCurrentPage(page)}
                    onAnalysisComplete={handleAddRecord}
                  />
                )}
                {currentPage === 'results' && (
                  <ResultsDashboard
                    onNavigate={(page) => setCurrentPage(page)}
                    result={activeAnalysisResult || (records.length > 0 ? records[0] : null)}
                    onSaveToHistory={handleAddRecord}
                  />
                )}
                {currentPage === 'history' && (
                  <HistoryAnalytics
                    onNavigate={(page) => setCurrentPage(page)}
                    records={filteredRecords}
                    onClearHistory={handleClearHistory}
                  />
                )}
                {currentPage === 'market-data' && (
                  <StoredMarketData
                    onNavigate={(page) => setCurrentPage(page)}
                    sources={sources}
                    onClearSources={handleClearSources}
                    onAddSource={handleAddSource}
                  />
                )}
                {currentPage === 'profile' && (
                  <Profile
                    onNavigate={(page) => setCurrentPage(page)}
                    records={records}
                    onLogout={handleLogout}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

      </div>
    </div>
  );
}
