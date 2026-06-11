import React, { useState } from 'react';
import { UserWorkspace } from './AuthOnboarding';

interface SettingsPanelProps {
  workspace: UserWorkspace;
  onUpdateWorkspace: (updated: UserWorkspace) => void;
  onResetLedger: () => Promise<void>;
  onRefreshLogs: () => Promise<void>;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export default function SettingsPanel({ 
  workspace, 
  onUpdateWorkspace, 
  onResetLedger,
  onRefreshLogs,
  theme = 'light',
  onToggleTheme
}: SettingsPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'sandbox' | 'security'>('profile');

  // Profile Form States
  const [firstName, setFirstName] = useState(workspace.firstName || '');
  const [lastName, setLastName] = useState(workspace.lastName || '');
  const [email, setEmail] = useState(workspace.email || '');

  // Sandbox Form States
  const [currency, setCurrency] = useState(workspace.currency || 'USD');
  const [businessName, setBusinessName] = useState(workspace.businessName || 'Acme FinTech');
  const [mockBalance, setMockBalance] = useState('25000.00');
  const [dailyLimit, setDailyLimit] = useState('5,000.00');
  const [networkDelay, setNetworkDelay] = useState('Low (200ms)');

  // Security Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);

  // Status Alerts
  const [alertText, setAlertText] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText('sk_test_51MzS2lH8N7q0X9zP1e2r3t4y5u6i7o8p');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setAlertText({ type: 'error', message: 'First name and Last name are required.' });
      return;
    }
    const updated: UserWorkspace = {
      ...workspace,
      firstName,
      lastName,
      email
    };
    onUpdateWorkspace(updated);
    setAlertText({ type: 'success', message: 'Profile settings saved successfully.' });
    setTimeout(() => setAlertText(null), 3000);
  };

  const handleSaveSandbox = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserWorkspace = {
      ...workspace,
      currency,
      businessName
    };
    onUpdateWorkspace(updated);
    setAlertText({ type: 'success', message: 'Sandbox configuration updated successfully.' });
    setTimeout(() => setAlertText(null), 3000);
  };

  const handleUpdateSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      setAlertText({ type: 'error', message: 'New password and confirm password do not match.' });
      return;
    }
    setAlertText({ type: 'success', message: 'Security preferences updated successfully.' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setAlertText(null), 3000);
  };

  const triggerResetLedger = async () => {
    try {
      await onResetLedger();
      setAlertText({ type: 'success', message: 'Ledger reset successfully. Mock transactions seeded to presets.' });
      setTimeout(() => setAlertText(null), 4000);
    } catch (err: any) {
      setAlertText({ type: 'error', message: 'Failed to reset sandbox simulator data.' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10" id="settings-suite-panel">
      
      {/* Settings Panel Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl">
            settings
          </span>
          Settings
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-2xl font-medium leading-relaxed">
          Manage your account preferences, configure sandbox API parameters, and reset mockup databases.
        </p>
      </div>

      {alertText && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 border animate-fade-in ${
          alertText.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/25 border-emerald-100 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-450' 
            : 'bg-rose-50 dark:bg-rose-950/25 border-rose-100 dark:border-rose-900/40 text-rose-800 dark:text-rose-450'
        }`}>
          <span className="material-symbols-outlined text-sm font-bold">
            {alertText.type === 'success' ? 'check_circle' : 'report'}
          </span>
          <span>{alertText.message}</span>
        </div>
      )}

      {/* Grid Settings Layout: Sidebar Tabs + Content Box */}
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
        
        {/* Inner Settings Panel Sidebar Nav */}
        <nav className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-1.5 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-none shrink-0">
          {[
            { tag: 'profile', title: 'Profile Details', icon: 'person' },
            { tag: 'sandbox', title: 'Sandbox Config', icon: 'biotech' },
            { tag: 'security', title: 'Security & API', icon: 'verified_user' }
          ].map(btn => (
            <button
              key={btn.tag}
              onClick={() => {
                setActiveSubTab(btn.tag as any);
                setAlertText(null);
              }}
              className={`text-left px-4 py-3 font-semibold text-xs rounded-xl transition duration-150 flex items-center gap-2.5 ${
                activeSubTab === btn.tag
                  ? 'bg-blue-600 shadow-md shadow-blue-900/10 text-white font-bold'
                  : 'text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-900 font-medium'
              }`}
            >
              <span className="material-symbols-outlined text-sm leading-none">{btn.icon}</span>
              {btn.title}
            </button>
          ))}
        </nav>

        {/* Dynamic content rendering column */}
        <div className="space-y-6 min-w-0">
          
          {/* PROFILE SUB-TAB */}
          {activeSubTab === 'profile' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-lg shadow-slate-100 space-y-6">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 text-sm">person</span>
                Profile Settings
              </h3>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                
                {/* Profile Avatar / Hero Banner */}
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative group shrink-0">
                    <img 
                      alt="Sarah Jenkins profile" 
                      className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 dark:border-slate-800 bg-slate-50" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWUlCp359LPhjNM-wop3Hx5I3cwO7KsGD33CyEZo2j5NYs2aoNZ93NBBfuSKc-pge4Nrj5lDkbR3DBx9BhTTTDUUjw8ENlXR_-VNyWEZdfsqFYK3nSbxO2DcnyNG1gGKpNzzJ9AR4TZF4bv-36r06ybO5Md9b7fW3MwvcA-E965ZtzsgNoJpwHfax-_4GUWAkKZDc1mnd9CXqqJ4W3TFFeLTc4CRnZ7-VgwtwEJU4DdEBKJ9WfyuIOOQydKkepeaJwdy_7ZNYLxoM" 
                    />
                    <div className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1.5 shadow-lg border border-white dark:border-slate-800 cursor-pointer hover:scale-105 transition-all">
                      <span className="material-symbols-outlined text-xs font-bold leading-none">photo_camera</span>
                    </div>
                  </div>
                  <div className="text-center sm:text-left">
                    <h4 className="font-bold text-slate-950 dark:text-white text-sm">
                      {workspace.firstName} {workspace.lastName}
                    </h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-1 uppercase tracking-wider">{workspace.role || 'CS Trainer'}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                      Configure your trainer profile name representation inside mock notifications and reports.
                    </p>
                  </div>
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-slate-50/70 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-850 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 outline-none text-slate-800 dark:text-white text-xs font-bold transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-slate-50/70 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-850 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 outline-none text-slate-800 dark:text-white text-xs font-bold transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50/70 border border-slate-200/70 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 focus:bg-white outline-none text-slate-800 text-xs font-bold transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                      Active User Role
                    </label>
                    <input
                      type="text"
                      value={workspace.role || 'Fintech Trainer'}
                      disabled
                      className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-400 text-xs font-bold cursor-not-allowed"
                    />
                    <p className="text-[10px] text-slate-400 font-medium">Roles are provisioned during compliance onboarding and cannot be changed.</p>
                  </div>

                  {/* Theme display preference toggle */}
                  <div className="sm:col-span-2 space-y-2 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Workspace Display Theme</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Toggle high contrast dark preference for compliance interfaces and builders.</span>
                      </div>
                      <button
                        type="button"
                        onClick={onToggleTheme}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/10 ${
                          theme === 'dark' ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                            theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submits */}
                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-100 active:scale-95 transition-all"
                  >
                    Save Changes
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* SANDBOX CONFIG SUB-TAB */}
          {activeSubTab === 'sandbox' && (
            <div className="space-y-6">
              
              <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-lg shadow-slate-100 space-y-6">
                <h3 className="font-extrabold text-slate-900 text-sm tracking-tight border-b border-slate-100 pb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400 text-sm">biotech</span>
                  Sandbox Configuration
                </h3>

                <form onSubmit={handleSaveSandbox} className="space-y-6">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                        Primary Currency
                      </label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full bg-slate-50/70 border border-slate-200/70 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 focus:bg-white outline-none text-slate-800 text-xs font-bold transition-all"
                      >
                        <option value="USD">USD - US Dollar ($)</option>
                        <option value="EUR">EUR - Euro (€)</option>
                        <option value="GBP">GBP - British Pound (£)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                        Mock Initial Balance
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">$</span>
                        <input
                          type="text"
                          value={mockBalance}
                          onChange={(e) => setMockBalance(e.target.value)}
                          className="w-full bg-slate-50/70 border border-slate-200/70 rounded-xl pl-8 pr-4 py-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 focus:bg-white outline-none text-slate-800 text-xs font-bold transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                        Acme Brand Label Name
                      </label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full bg-slate-50/70 border border-slate-200/70 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 focus:bg-white outline-none text-slate-800 text-xs font-bold transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                        Daily Transaction Limit Value
                      </label>
                      <input
                        type="text"
                        value={dailyLimit}
                        onChange={(e) => setDailyLimit(e.target.value)}
                        className="w-full bg-slate-50/70 border border-slate-200/70 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 focus:bg-white outline-none text-slate-800 text-xs font-bold transition-all"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                        Simulated Network Sync latency
                      </label>
                      <select
                        value={networkDelay}
                        onChange={(e) => setNetworkDelay(e.target.value)}
                        className="w-full bg-slate-50/70 border border-slate-200/70 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 focus:bg-white outline-none text-slate-800 text-xs font-bold transition-all"
                      >
                        <option value="None (Instant)">None (Instant payload transfers)</option>
                        <option value="Low (200ms)">Low (200ms default latency bounds)</option>
                        <option value="High (2s)">High (2s simulated internet bandwidth load)</option>
                      </select>
                      <p className="text-[10px] text-slate-400 font-medium">Artificial latency delay applies whenever committing new manual custom forms.</p>
                    </div>

                  </div>

                  {/* Submits */}
                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-100 active:scale-95 transition-all"
                    >
                      Update Config
                    </button>
                  </div>

                </form>
              </div>

              {/* Danger Zone */}
              <div className="border border-rose-100 bg-rose-50/30 rounded-2xl p-6 space-y-4">
                <div>
                  <h4 className="font-extrabold text-rose-750 text-sm tracking-tight flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-rose-600 text-lg">dangerous</span>
                    Danger Zone
                  </h4>
                  <p className="text-slate-500 text-xs mt-1 font-medium leading-relaxed">
                    Permanent simulation actions that affect your sandbox environment logs and mock ledger data stores. Correct safety parameters are advised.
                  </p>
                </div>

                <div className="bg-white border border-rose-150/80 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-900">Reset Sandbox Ledger Data</div>
                    <div className="text-[10px] text-slate-400 font-bold mt-0.5">Delete all mock transactions, invoice receipts, and simulation activity logs.</div>
                  </div>
                  <button
                    type="button"
                    onClick={triggerResetLedger}
                    className="w-full sm:w-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-100 active:scale-95 transition-all"
                  >
                    Reset Sandbox Data
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* SECURITY & API SUB-TAB */}
          {activeSubTab === 'security' && (
            <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-lg shadow-slate-100 space-y-6">
              <h3 className="font-extrabold text-slate-900 text-sm tracking-tight border-b border-slate-100 pb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 text-sm">verified_user</span>
                Security &amp; API Keys
              </h3>

              <form onSubmit={handleUpdateSecurity} className="space-y-6">
                
                {/* Password modification */}
                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Change Profile Password</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50/70 border border-slate-200/70 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 focus:bg-white outline-none text-slate-800 text-xs font-bold transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50/70 border border-slate-200/70 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 focus:bg-white outline-none text-slate-800 text-xs font-bold transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Confirm Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50/70 border border-slate-200/70 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 focus:bg-white outline-none text-slate-800 text-xs font-bold transition-all"
                      />
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* API Keys configuration panel */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest block">API Developer Configuration</p>
                    <button 
                      type="button" 
                      onClick={() => {
                        setAlertText({ type: 'success', message: 'API sandbox key successfully cycled/regenerated.' });
                        setTimeout(() => setAlertText(null), 3500);
                      }}
                      className="text-blue-600 font-bold text-xs hover:underline"
                    >
                      Regenerate Key
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value="sk_test_51MzS2lH8N7q0X9zP1e2r3t4y5u6i7o8p"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-16 py-3 text-slate-600 text-xs font-mono select-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopyApiKey}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white hover:bg-slate-55 border border-slate-200 rounded-lg p-1.5 flex items-center justify-center shadow-xs transition"
                      title="Copy credentials"
                    >
                      <span className="material-symbols-outlined text-slate-500 text-sm font-bold">
                        {copiedKey ? 'done' : 'content_copy'}
                      </span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">Use this mock key to authorize and configure API simulation tunnels locally from scripts.</p>
                </div>

                {/* Submits */}
                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-100 active:scale-95 transition-all"
                  >
                    Update Security
                  </button>
                </div>

              </form>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
