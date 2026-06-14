import React, { useState, useEffect } from 'react';
import { SimulatedTransaction, AuditLog, Receipt, PaymentChannel, TransactionStatus } from './types';
import { 
  fetchTransactions, 
  fetchAuditLogs, 
  fetchReceipts, 
  createSimulatedTransaction, 
  resetTransactionsStore 
} from './utils';

// Import subcomponents
import Dashboard from './components/Dashboard';
import SimulatorModal from './components/SimulatorModal';
import AIScenarioPanel from './components/AIScenarioPanel';
import ReceiptBuilder from './components/ReceiptBuilder';
import AuditLedger from './components/AuditLedger';
import AuthOnboarding, { UserWorkspace } from './components/AuthOnboarding';
import SettingsPanel from './components/SettingsPanel';
import NotificationPanel from './components/NotificationPanel';
import Error404View from './components/Error404View';
import Error500View from './components/Error500View';
import LoadingSkeletonView from './components/LoadingSkeletonView';
import AdminProfilesPanel from './components/AdminProfilesPanel';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ai-scenario' | 'receipts' | 'audits' | 'settings' | 'alerts' | 'profiles-panel'>('dashboard');
  const [transactions, setTransactions] = useState<SimulatedTransaction[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  
  const [showSimModal, setShowSimModal] = useState(false);
  const [selectedTxFromDashboard, setSelectedTxFromDashboard] = useState<SimulatedTransaction | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [overrideState, setOverrideState] = useState<'none' | 'loading' | 'error-404' | 'error-500'>('none');

  // Dynamic Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('payflow_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'light';
  });

  // Dynamic Auth State - initially always logged out to satisfy re-login directives
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [workspace, setWorkspace] = useState<UserWorkspace | null>(null);

  const handleOnboardingComplete = (ws: UserWorkspace) => {
    setWorkspace(ws);
    setIsLoggedIn(true);
    localStorage.setItem('payflow_logged_in', 'true');
    localStorage.setItem('payflow_workspace', JSON.stringify(ws));
  };

  const handleLogActiveSessionOut = () => {
    setIsLoggedIn(false);
    setWorkspace(null);
    localStorage.removeItem('payflow_logged_in');
    localStorage.removeItem('payflow_workspace');
  };

  const handleUpdateWorkspace = (updated: UserWorkspace) => {
    setWorkspace(updated);
    localStorage.setItem('payflow_workspace', JSON.stringify(updated));
  };

  // Load server state on load
  const loadWorkspaceState = async () => {
    try {
      const [txs, logs, recs] = await Promise.all([
        fetchTransactions(),
        fetchAuditLogs(),
        fetchReceipts()
      ]);
      setTransactions(txs);
      setAuditLogs(logs);
      setReceipts(recs);
    } catch (err) {
      console.error("Workspace sync error: ", err);
    }
  };

  useEffect(() => {
    loadWorkspaceState();
  }, []);

  // Dynamic 48-hour validity tracking loop
  useEffect(() => {
    if (!isLoggedIn || !workspace || workspace.role === 'Lead Architect' || !workspace.loginTime) {
      return;
    }

    const checkExpiration = () => {
      const elapsedMs = Date.now() - (workspace.loginTime || 0);
      const limitMs = 48 * 60 * 60 * 1000;
      const remainingMs = limitMs - elapsedMs;

      if (remainingMs <= 0) {
        alert("Your 48-hour simulation session has expired. You will be automatically logged out now. Please contact the Lead Architect to grant access.");
        handleLogActiveSessionOut();
      }
    };

    checkExpiration();
    const interval = setInterval(checkExpiration, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [isLoggedIn, workspace]);

  // Submit New Simulated Transaction
  const handleSimulateTransactionSubmit = async (data: {
    amount: number;
    channel: PaymentChannel;
    sender: string;
    receiver: string;
    status: TransactionStatus;
    note: string;
  }) => {
    const newTx = await createSimulatedTransaction(data);
    setTransactions((prev) => [newTx, ...prev]);
    // Reload logs
    const updatedLogs = await fetchAuditLogs();
    setAuditLogs(updatedLogs);
    // Auto-select for receipt generation and switch active tab instantly
    setSelectedTxFromDashboard(newTx);
    setActiveTab('receipts');

    // Reduce standard user's issued profile balance
    if (workspace && workspace.role !== 'Lead Architect' && typeof workspace.currentBalance === 'number') {
      const reduction = Math.abs(data.amount);
      const updatedBalance = Math.max(0, workspace.currentBalance - reduction);
      const updatedWorkspace = {
        ...workspace,
        currentBalance: updatedBalance
      };
      setWorkspace(updatedWorkspace);

      const savedProfilesStr = localStorage.getItem('payflow_profiles');
      if (savedProfilesStr) {
        try {
          const profiles = JSON.parse(savedProfilesStr);
          const i = profiles.findIndex((p: any) => p.email.toLowerCase() === workspace.email.toLowerCase());
          if (i !== -1) {
            profiles[i].currentBalance = updatedBalance;
            localStorage.setItem('payflow_profiles', JSON.stringify(profiles));
          }
        } catch (err) {
          console.error("Failed to reduce profile balance in localStorage", err);
        }
      }
    }
  };

  // Reset core storage
  const handleResetLedgerAction = async () => {
    if (window.confirm("Are you sure you want to re-seed the transaction ledger to initial demo presets?")) {
      const resetTx = await resetTransactionsStore();
      setTransactions(resetTx);
      const logs = await fetchAuditLogs();
      setAuditLogs(logs);
    }
  };

  // Callback when AI completes generation
  const handleAIScenarioLoaded = async (newTxs: SimulatedTransaction[]) => {
    setTransactions((prev) => [...newTxs, ...prev]);
    const updatedLogs = await fetchAuditLogs();
    setAuditLogs(updatedLogs);

    // Reduce balance by completed simulated transaction sum
    if (workspace && workspace.role !== 'Lead Architect' && typeof workspace.currentBalance === 'number') {
      let sum = 0;
      newTxs.forEach(t => {
        if (t.status === 'Completed') {
          sum += Math.abs(t.amount);
        }
      });
      if (sum > 0) {
        const updatedBalance = Math.max(0, workspace.currentBalance - sum);
        const updatedWorkspace = {
          ...workspace,
          currentBalance: updatedBalance
        };
        setWorkspace(updatedWorkspace);

        const savedProfilesStr = localStorage.getItem('payflow_profiles');
        if (savedProfilesStr) {
          try {
            const profiles = JSON.parse(savedProfilesStr);
            const i = profiles.findIndex((p: any) => p.email.toLowerCase() === workspace.email.toLowerCase());
            if (i !== -1) {
              profiles[i].currentBalance = updatedBalance;
              localStorage.setItem('payflow_profiles', JSON.stringify(profiles));
            }
          } catch (err) {
            console.error("Failed to update scenario profiles", err);
          }
        }
      }
    }
  };

  // Callback of receipt compilations
  const handleReceiptCompiled = async (newRec: Receipt) => {
    setReceipts((prev) => [newRec, ...prev]);
    const updatedLogs = await fetchAuditLogs();
    setAuditLogs(updatedLogs);
  };

  // Select transaction from dashboard and shift active tabs instantly
  const handleSelectTransactionReceipt = (tx: SimulatedTransaction) => {
    setSelectedTxFromDashboard(tx);
    setActiveTab('receipts');
  };

  // If session is not logged in / configured, render beautiful complete login onboarding sequence from Batch 2
  if (!isLoggedIn || !workspace) {
    return <AuthOnboarding onComplete={handleOnboardingComplete} />;
  }

  // Intercept layout for simulation error states
  if (overrideState === 'error-404') {
    return <Error404View onBackToDashboard={() => setOverrideState('none')} />;
  }

  if (overrideState === 'error-500') {
    return (
      <Error500View 
        onRetry={() => {
          alert("Simulation engine re-connected successfully!");
          setOverrideState('none');
        }} 
        onBackToDashboard={() => setOverrideState('none')} 
      />
    );
  }

  // Derive initials
  const initials = `${workspace.firstName?.[0] || 'S'}${workspace.lastName?.[0] || 'J'}`.toUpperCase();

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans`}>
      
      <div className="flex flex-1 relative animate-fade-in">
        
        {/* Navigation Sidebar Drawer Panel (Desktop View) */}
        <aside className="fixed left-0 top-0 bottom-0 w-60 hidden lg:flex flex-col bg-slate-900 text-white z-40 p-5 justify-between">
          <div className="space-y-6">
            
            {/* Logo branding header */}
            <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-white text-lg">payments</span>
              </div>
              <div>
                <h1 className="font-extrabold text-xs tracking-tight leading-none text-white">PayFlow Demo</h1>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">P2P Simulator Mode</p>
              </div>
            </div>

            {/* Menu options list */}
            <nav className="space-y-1">
              {[
                { key: 'dashboard', label: 'Dashboard Spec', icon: 'dashboard' },
                ...(workspace.role === 'Lead Architect' ? [{ key: 'ai-scenario', label: 'AI Scenario Builder', icon: 'auto_awesome' }] : []),
                { key: 'receipts', label: 'Receipt Sandbox', icon: 'receipt_long' },
                ...(workspace.role === 'Lead Architect' ? [{ key: 'audits', label: 'Compliance Audits', icon: 'history_edu' }] : []),
                { key: 'alerts', label: 'Activity Alerts', icon: 'notifications' },
                ...(workspace.role === 'Lead Architect' ? [
                  { key: 'settings', label: 'Settings & Profile', icon: 'settings' },
                  { key: 'profiles-panel', label: 'Admin Profile Issuer', icon: 'supervised_user_circle' }
                ] : [])
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key as any)}
                  className={`w-full text-left py-3 px-4 rounded-xl flex items-center gap-3 transition text-xs font-semibold ${
                    activeTab === item.key 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 font-bold' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Live Testing Sandbox Overrides */}
            <div className="bg-slate-800/60 p-3 rounded-xl border border-white/5 space-y-2 mt-4">
              <span className="text-[9px] font-extrabold text-[#F59E0B] uppercase tracking-widest block">Batch 7 State Tester</span>
              <div className="space-y-1">
                <select
                  value={overrideState}
                  onChange={(e) => setOverrideState(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 text-[10px] rounded-lg p-1.5 font-bold text-slate-300 outline-none cursor-pointer focus:border-blue-500"
                >
                  <option value="none">Normal Simulator</option>
                  <option value="loading">Loading Skeletons</option>
                  <option value="error-404">404: Not Found</option>
                  <option value="error-500">500: Server Error</option>
                </select>
              </div>
            </div>

          </div>

          {/* User profile capsule at footer matching dynamic onboarding details */}
          <div className="border-t border-white/10 pt-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs uppercase">
                {initials}
              </div>
              <div className="leading-tight">
                <p className="text-xs font-bold text-slate-200 truncate max-w-[100px]">{workspace.firstName} {workspace.lastName}</p>
                <p className="text-[10px] text-slate-400 truncate max-w-[100px]">{workspace.role || 'Coordinator Admin'}</p>
              </div>
            </div>
            <button
              onClick={handleLogActiveSessionOut}
              title="Logout Active Simulation Workspace"
              className="material-symbols-outlined text-slate-500 hover:text-rose-450 transition cursor-pointer text-lg p-1 hover:bg-white/5 rounded-lg flex items-center justify-center"
            >
              logout
            </button>
          </div>
        </aside>

        {/* Content Shell wrapper */}
        <div className="flex-1 lg:ml-60 flex flex-col min-w-0">
          
          {/* Header Mobile Toolbar / Secondary stats bar */}
          <header className="sticky top-0 z-30 flex items-center justify-between px-6 lg:px-8 py-3 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-900 shadow-xs">
            <div className="flex items-center gap-2 lg:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition"
              >
                <span className="material-symbols-outlined text-xl">menu</span>
              </button>
              <span className="font-extrabold text-sm text-slate-900 dark:text-white leading-none">PayFlow</span>
            </div>

            <div className="hidden lg:block text-xs font-semibold text-slate-400 dark:text-slate-500">
              Training Session Mode Active • Org: <span className="font-mono text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded">{workspace.businessName}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-200 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Sandbox Mode ({workspace.role})
              </span>

              {/* Global Theme Toggle Button */}
              <button
                type="button"
                onClick={() => {
                  const nextTheme = theme === 'light' ? 'dark' : 'light';
                  setTheme(nextTheme);
                  localStorage.setItem('payflow_theme', nextTheme);
                }}
                className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition cursor-pointer flex items-center justify-center"
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              >
                <span className="material-symbols-outlined text-lg">
                  {theme === 'light' ? 'dark_mode' : 'light_mode'}
                </span>
              </button>

              {/* Direct simulator modal shortcut */}
              <button 
                onClick={() => setShowSimModal(true)}
                className="hidden md:flex px-3.5 py-1.5 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-150 dark:border-emerald-900/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition rounded-xl items-center gap-1.5 cursor-pointer shadow-3xs"
              >
                <span className="material-symbols-outlined text-sm font-bold text-emerald-600 animate-bounce">send_money</span>
                Send Money
              </button>
            </div>
          </header>

          {/* Mobile Collapse drawer panel */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-950/40 backdrop-blur-xs transition">
              <div className="absolute inset-x-0 inset-y-0" onClick={() => setMobileMenuOpen(false)}></div>
              
              <div className="relative bg-slate-900 text-white w-64 h-full p-5 flex flex-col justify-between z-10 animate-slide-right">
                <div className="space-y-6">
                  
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="font-bold text-sm tracking-tight">PayFlow navigation</span>
                    <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400">
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>

                  <nav className="space-y-1">
                    {[
                      { key: 'dashboard', label: 'Dashboard Spec', icon: 'dashboard' },
                      ...(workspace.role === 'Lead Architect' ? [{ key: 'ai-scenario', label: 'AI Scenario Builder', icon: 'auto_awesome' }] : []),
                      { key: 'receipts', label: 'Receipt Sandbox', icon: 'receipt_long' },
                      ...(workspace.role === 'Lead Architect' ? [{ key: 'audits', label: 'Compliance Audits', icon: 'history_edu' }] : []),
                      { key: 'alerts', label: 'Activity Alerts', icon: 'notifications' },
                      ...(workspace.role === 'Lead Architect' ? [
                        { key: 'settings', label: 'Settings & Profile', icon: 'settings' },
                        { key: 'profiles-panel', label: 'Admin Profile Issuer', icon: 'supervised_user_circle' }
                      ] : [])
                    ].map(item => (
                      <button
                        key={item.key}
                        onClick={() => {
                          setActiveTab(item.key as any);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full text-left py-3 px-4 rounded-xl flex items-center gap-3 transition text-xs font-semibold ${
                          activeTab === item.key 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'text-slate-400 hover:bg-white/5'
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg">{item.icon}</span>
                        {item.label}
                      </button>
                    ))}
                  </nav>

                </div>

                {/* Footer user panel mobile */}
                <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs uppercase">
                      {initials}
                    </div>
                    <div className="leading-tight">
                      <p className="text-xs font-bold text-slate-200">{workspace.firstName} {workspace.lastName}</p>
                      <p className="text-[10px] text-slate-400">{workspace.role || 'Admin Supervisor'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleLogActiveSessionOut}
                    className="p-1 text-slate-400 hover:text-rose-400"
                    title="Logout session"
                  >
                    <span className="material-symbols-outlined text-lg">logout</span>
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* Main workspace panels */}
          <main className="flex-1 overflow-y-auto px-6 lg:px-8 py-8 md:py-10 max-w-7xl w-full mx-auto pb-24">
            
            {overrideState === 'loading' ? (
              <LoadingSkeletonView />
            ) : (
              <>
                {activeTab === 'dashboard' && (
                  <Dashboard 
                    transactions={transactions} 
                    onAddTrigger={() => setShowSimModal(true)}
                    onResetTrigger={handleResetLedgerAction}
                    onSelectTransactionReceipt={handleSelectTransactionReceipt}
                    currency={workspace.currency}
                    businessName={workspace.businessName}
                    initialBalance={workspace.initialBalance}
                    currentBalance={workspace.currentBalance}
                    userRole={workspace.role}
                  />
                )}

                {activeTab === 'profiles-panel' && workspace.role === 'Lead Architect' && (
                  <AdminProfilesPanel />
                )}

                {activeTab === 'ai-scenario' && (
                  <AIScenarioPanel onScenarioLoaded={handleAIScenarioLoaded} />
                )}

                {activeTab === 'receipts' && (
                  <ReceiptBuilder 
                    transactions={transactions} 
                    selectedTxFromDashboard={selectedTxFromDashboard}
                    onReceiptCompiled={handleReceiptCompiled}
                    receipts={receipts}
                    userRole={workspace.role}
                    currentBalance={workspace.currentBalance}
                  />
                )}

                {activeTab === 'audits' && (
                   <AuditLedger auditLogs={auditLogs} />
                )}

                {activeTab === 'alerts' && (
                  <NotificationPanel 
                    transactions={transactions}
                    currency={workspace.currency}
                    businessName={workspace.businessName}
                    onAddTransaction={handleSimulateTransactionSubmit}
                  />
                )}

                {activeTab === 'settings' && (
                  <SettingsPanel 
                    workspace={workspace}
                    onUpdateWorkspace={handleUpdateWorkspace}
                    onResetLedger={handleResetLedgerAction}
                    onRefreshLogs={async () => {
                      const updatedLogs = await fetchAuditLogs();
                      setAuditLogs(updatedLogs);
                    }}
                    theme={theme}
                    onToggleTheme={() => {
                      const nextTheme = theme === 'light' ? 'dark' : 'light';
                      setTheme(nextTheme);
                      localStorage.setItem('payflow_theme', nextTheme);
                    }}
                  />
                )}
              </>
            )}

          </main>

        </div>

      </div>

      {/* Simulator Modal Box */}
      {showSimModal && (
        <SimulatorModal 
          onClose={() => setShowSimModal(false)} 
          onSubmit={handleSimulateTransactionSubmit} 
        />
      )}

      {/* Footer bar stating copyright & disclaimer status */}
      <footer className="bg-white border-t border-slate-100 py-4 px-6 text-center text-[10px] text-slate-400 z-20 font-medium">
        © 2026 PayFlow Simulation Frameworks. All rights reserved. • Licensed and secured by oladimejiazeez052@gmail.com
      </footer>

    </div>
  );
}
