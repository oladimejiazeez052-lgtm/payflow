import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../utils';

interface ProfileItem {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'Fintech Trainer' | 'UX Designer' | 'Developer' | 'Fintech Learner';
  businessName: string;
  currency: string;
  initialBalance: number;
  currentBalance: number;
  createdAt: number;
  loginTime?: number;
}

export default function AdminProfilesPanel() {
  const [profiles, setProfiles] = useState<ProfileItem[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Fintech Trainer' | 'UX Designer' | 'Developer' | 'Fintech Learner'>('Developer');
  const [businessName, setBusinessName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [balanceInputType, setBalanceInputType] = useState<'preset' | 'custom'>('preset');
  const [presetBalance, setPresetBalance] = useState<number>(5000);
  const [customBalanceStr, setCustomBalanceStr] = useState('15000');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load profiles from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('payflow_profiles');
    if (saved) {
      try {
        setProfiles(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse payflow_profiles", e);
      }
    }
  }, []);

  // Save profiles
  const saveProfiles = (updated: ProfileItem[]) => {
    setProfiles(updated);
    localStorage.setItem('payflow_profiles', JSON.stringify(updated));
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim() || !businessName.trim()) {
      setFeedback({ type: 'error', message: 'All profile generation fields are strictly required.' });
      return;
    }

    // Email unique check
    const targetEmail = email.trim().toLowerCase();
    if (targetEmail === 'oladimejiazeez052@gmail.com') {
      setFeedback({ type: 'error', message: 'Cannot create a profile with the reserved Lead Architect email address.' });
      return;
    }

    if (profiles.some(p => p.email.toLowerCase() === targetEmail)) {
      setFeedback({ type: 'error', message: `A profile with the email address ${targetEmail} already exists.` });
      return;
    }

    const assignedBalance = balanceInputType === 'preset' ? presetBalance : (Number(customBalanceStr) || 5000);

    const newProfile: ProfileItem = {
      email: targetEmail,
      password: password.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role,
      businessName: businessName.trim(),
      currency,
      initialBalance: assignedBalance,
      currentBalance: assignedBalance,
      createdAt: Date.now()
    };

    const updated = [newProfile, ...profiles];
    saveProfiles(updated);

    // Reset fields
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setBusinessName('');
    setFeedback({ type: 'success', message: `Profile for ${newProfile.firstName} ${newProfile.lastName} was created successfully!` });
  };

  const handleDeleteProfile = (targetEmail: string) => {
    if (confirm(`Are you sure you want to delete and revoke the active sandbox access for ${targetEmail}?`)) {
      const updated = profiles.filter(p => p.email.toLowerCase() !== targetEmail.toLowerCase());
      saveProfiles(updated);
    }
  };

  const getProfileTimeStatus = (p: ProfileItem) => {
    if (!p.loginTime) return { status: 'Pending Login', color: 'text-amber-600 bg-amber-50 border-amber-100', text: 'Never accessed yet' };
    const elapsed = Date.now() - p.loginTime;
    const limit = 48 * 60 * 60 * 1000;
    const remaining = limit - elapsed;

    if (remaining <= 0) {
      return { status: 'Expired', color: 'text-rose-600 bg-rose-50 border-rose-150', text: 'Expired 48h validity' };
    }

    const hoursLeft = Math.ceil(remaining / (1000 * 60 * 60));
    return { status: 'Active', color: 'text-emerald-700 bg-emerald-50 border-emerald-100', text: `${hoursLeft}h remaining` };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-2xl">supervised_user_circle</span>
            Lead Architect Admin Console
          </h2>
          <p className="text-slate-400 text-xs mt-1">Issue unique sandbox profiles with custom initial balances and rigid 48-hour expirations.</p>
        </div>
        <div className="px-3.5 py-1.5 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 font-bold text-xs flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></span>
          System Admin: Verified Lead Architect
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl text-xs font-bold border flex items-center gap-2 ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
            : 'bg-rose-50 text-rose-700 border-rose-100'
        }`}>
          <span className="material-symbols-outlined">{feedback.type === 'success' ? 'check_circle' : 'error'}</span>
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Creation card */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-150 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-blue-500 text-lg">person_add</span>
              Issue Sandbox Profile
            </h3>
            <p className="text-slate-400 text-[11px] mt-0.5">Define allocated simulation credentials and bounds.</p>
          </div>

          <form onSubmit={handleCreateProfile} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-500 uppercase block tracking-wider text-[10px]">First Name</label>
                <input 
                  type="text"
                  required
                  placeholder="Sarah"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500 uppercase block tracking-wider text-[10px]">Last Name</label>
                <input 
                  type="text"
                  required
                  placeholder="Jenkins"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-500 uppercase block tracking-wider text-[10px]">Email Address</label>
                <input 
                  type="email"
                  required
                  placeholder="sarah@fintechtrainer.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500 uppercase block tracking-wider text-[10px]">Password</label>
                <input 
                  type="text"
                  required
                  placeholder="TypePassword123"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-500 uppercase block tracking-wider text-[10px]">Business Name / Tenant</label>
                <input 
                  type="text"
                  required
                  placeholder="Sarah Coffee Café"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500 uppercase block tracking-wider text-[10px]">Role Play Track</label>
                <select 
                  value={role} 
                  onChange={e => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-blue-500"
                >
                  <option value="Fintech Trainer">Fintech Trainer</option>
                  <option value="UX Designer">UX Designer</option>
                  <option value="Developer">Developer</option>
                  <option value="Fintech Learner">Fintech Learner</option>
                </select>
              </div>
            </div>

            {/* BALANCE SETTING */}
            <div className="p-3.5 bg-slate-50/70 border border-slate-150 rounded-xl space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-150">
                <span className="font-extrabold text-slate-700 block text-[10px] uppercase tracking-wider">Initial Available Balance</span>
                <div className="flex gap-1">
                  <button 
                    type="button" 
                    onClick={() => setBalanceInputType('preset')}
                    className={`px-2 py-0.5 rounded text-[9px] font-bold ${balanceInputType === 'preset' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-650'}`}
                  >
                    Presets
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setBalanceInputType('custom')}
                    className={`px-2 py-0.5 rounded text-[9px] font-bold ${balanceInputType === 'custom' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-650'}`}
                  >
                    Custom Value
                  </button>
                </div>
              </div>

              {balanceInputType === 'preset' ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPresetBalance(5000)}
                    className={`p-2.5 border rounded-xl font-bold text-center transition ${
                      presetBalance === 5000 ? 'border-blue-500 bg-blue-50/50 text-blue-750' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    $5,000.00
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetBalance(50000)}
                    className={`p-2.5 border rounded-xl font-bold text-center transition ${
                      presetBalance === 50000 ? 'border-blue-500 bg-blue-50/50 text-blue-750' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    $50,050.00
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                    <input 
                      type="number"
                      value={customBalanceStr}
                      onChange={e => setCustomBalanceStr(e.target.value)}
                      placeholder="15000"
                      className="w-full pl-7 pr-3 py-2 border border-slate-250 bg-white rounded-xl focus:outline-none"
                    />
                  </div>
                  <span className="text-[9px] text-slate-400 block italic">Any integer value from $100 to $1,000,000 is supported.</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-500 uppercase block tracking-wider text-[10px]">Currency Format</label>
              <select 
                value={currency} 
                onChange={e => setCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-blue-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl transition shadow flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">assignment_ind</span>
              Generate & Output Credentials
            </button>
          </form>
        </div>

        {/* Existing Accounts grid */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="space-y-4 flex-1">
            <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-indigo-505 text-lg">admin_panel_settings</span>
                  Active Issued Credentials List
                </h3>
                <p className="text-slate-400 text-[11px]">Real-time audit of allocated logins, current funding states, and temporal lifespans.</p>
              </div>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold text-[10px] rounded-lg border border-blue-100">
                {profiles.length} Issued Profiles
              </span>
            </div>

            {profiles.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <span className="material-symbols-outlined text-4xl text-slate-250">contact_mail</span>
                <p className="text-xs font-medium">No issued sandbox login details are active yet.</p>
                <p className="text-[10px] text-slate-400">Use the left generator form to issue your first credential block.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-150 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      <th className="py-2.5">User Profile Info</th>
                      <th className="py-2.5">Mock Business</th>
                      <th className="py-2.5">Wallet Balance</th>
                      <th className="py-2.5">Validity Timer</th>
                      <th className="py-2.5 text-right">Revocation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map((p) => {
                      const age = getProfileTimeStatus(p);
                      return (
                        <tr key={p.email} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                          <td className="py-3 pr-2 font-medium">
                            <div className="space-y-0.5">
                              <p className="font-bold text-slate-900">{p.firstName} {p.lastName}</p>
                              <p className="font-mono text-[9px] text-slate-400">{p.email}</p>
                              <p className="text-[9px] font-bold text-blue-650 bg-blue-50/60 border border-blue-100/50 rounded-md px-1 py-0.2 select-none w-fit">{p.role}</p>
                            </div>
                          </td>
                          <td className="py-3 text-slate-500 font-semibold">{p.businessName}</td>
                          <td className="py-3">
                            <div className="space-y-0.5">
                              <p className="font-bold text-slate-900">{formatCurrency(p.currentBalance, p.currency)}</p>
                              <p className="text-[9px] text-slate-400">of {formatCurrency(p.initialBalance, p.currency)}</p>
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="space-y-1">
                              <span className={`px-1.5 py-0.5 border rounded-lg font-bold text-[9px] inline-block ${age.color}`}>
                                {age.status}
                              </span>
                              <p className="text-[9px] text-slate-400 font-medium block">{age.text}</p>
                            </div>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteProfile(p.email)}
                              className="w-7 h-7 bg-red-50 text-red-600 border border-red-100 rounded-lg flex items-center justify-center hover:bg-red-100 transition shadow-xs hover:text-red-700 ml-auto cursor-pointer"
                              title="Revoke / Delete Credentials Instantly"
                            >
                              <span className="material-symbols-outlined text-sm font-bold">delete_forever</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
