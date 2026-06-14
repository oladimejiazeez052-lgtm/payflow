import React, { useState } from 'react';
import { fetchProfiles, saveProfileOnServer } from '../utils';

export interface UserWorkspace {
  role: 'Lead Architect' | 'Issued Sandbox Account' | '';
  businessName: string;
  currency: string;
  selectedChannels: string[];
  firstName: string;
  lastName: string;
  email: string;
  loginTime?: number;
  initialBalance?: number;
  currentBalance?: number;
  createdAt?: number;
}

interface AuthOnboardingProps {
  onComplete: (workspace: UserWorkspace) => void;
}

export default function AuthOnboarding({ onComplete }: AuthOnboardingProps) {
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLoginDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const targetEmail = email.trim().toLowerCase();
    const targetPassword = password;

    if (!targetEmail) {
      setErrorMessage("Please enter an email address.");
      return;
    }
    if (!targetPassword) {
      setErrorMessage("Please enter your password.");
      return;
    }

    // 1. Check if login is Lead Architect profile
    if (targetEmail === 'oladimejiazeez052@gmail.com' || targetEmail === 'abcdefg@gmail.com') {
      if (targetPassword === 'Architect2026!') {
        onComplete({
          role: 'Lead Architect',
          businessName: 'Lead Architect Console',
          currency: 'USD',
          selectedChannels: ['Zelle', 'Venmo', 'Cash App', 'Bank Transfer', 'Apple Pay'],
          firstName: 'Oladimeji',
          lastName: 'Azeez',
          email: targetEmail,
          loginTime: Date.now(),
          initialBalance: 10000000.00,
          currentBalance: 10000000.00,
          createdAt: Date.now()
        });
        return;
      } else {
        setErrorMessage("Access Denied: Invalid password for the Lead Architect Admin profile!");
        return;
      }
    }

    // 2. Check general created profiles (fetching from sever to allow mobile access)
    let profiles: any[] = [];
    try {
      profiles = await fetchProfiles();
    } catch (err) {
      console.error("Failed to fetch profiles from server, using local fallback", err);
    }

    // LocalStorage fallback if server is empty or failed
    if (!profiles || profiles.length === 0) {
      const savedProfilesStr = localStorage.getItem('payflow_profiles');
      if (savedProfilesStr) {
        try {
          profiles = JSON.parse(savedProfilesStr);
        } catch (err) {
          console.error("Failed to parse payflow_profiles", err);
        }
      }
    }

    const matchedProfileIdx = profiles.findIndex(p => p.email.trim().toLowerCase() === targetEmail);
    if (matchedProfileIdx !== -1) {
      const match = profiles[matchedProfileIdx];
      if (match.password === targetPassword) {
        const now = Date.now();
        
        // Expiration check: 48 hours
        if (match.loginTime && (now - match.loginTime > 48 * 60 * 60 * 1005)) {
          setErrorMessage("Profile Expired: This sandbox profile has expired after 48 hours of use. Please contact the Lead Architect.");
          return;
        }

        // Set login time if not set yet
        if (!match.loginTime) {
          match.loginTime = now;
          profiles[matchedProfileIdx] = match;
          localStorage.setItem('payflow_profiles', JSON.stringify(profiles));
          try {
            await saveProfileOnServer(match);
          } catch (err) {
            console.error("Failed to persist updated login profile to server", err);
          }
        }

        onComplete({
          role: 'Issued Sandbox Account',
          businessName: match.businessName || 'Acme Corp',
          currency: match.currency || 'USD',
          selectedChannels: match.selectedChannels || ['Zelle', 'Venmo', 'Cash App', 'Bank Transfer', 'Apple Pay'],
          firstName: match.firstName || 'Sarah',
          lastName: match.lastName || 'Jenkins',
          email: match.email,
          loginTime: match.loginTime,
          initialBalance: Number(match.initialBalance) || 5000,
          currentBalance: match.currentBalance !== undefined ? Number(match.currentBalance) : (Number(match.initialBalance) || 5000),
          createdAt: match.createdAt || now
        });
        return;
      } else {
        setErrorMessage("Access Denied: Incorrect password. Please try again.");
        return;
      }
    }

    setErrorMessage("Access Denied: Profile details not found. Only profiles created by the Lead Architect are authorized.");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans relative overflow-x-hidden">
      
      {/* Background radial gradient decoration glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-100/35 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-100/35 rounded-full blur-[100px] pointer-events-none z-0"></div>

      <header className="bg-blue-600 py-4 px-6 flex items-center justify-between shadow-md z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white/15 rounded-xl flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-sm font-bold">payments</span>
          </div>
          <span className="text-white font-extrabold text-sm tracking-tight">PAYFLOW DEMO SANDBOX</span>
        </div>
        <div className="px-3 py-1 bg-white/10 rounded-lg text-white/95 text-[10px] font-bold tracking-wider uppercase">
          V2 Training Module Active
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 z-10 w-full">
        
        <div className="w-full max-w-md animate-scale-up">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg mb-3 transform -rotate-3 hover:rotate-0 transition-transform duration-300 text-white">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
            </div>
            <h2 className="font-extrabold text-2xl text-slate-900 text-center tracking-tight">Welcome back</h2>
            <p className="text-slate-400 text-xs text-center mt-1">Please enter your credentials to log in to the sandbox</p>
          </div>

          <div className="bg-white border border-slate-200 shadow-xl rounded-2xl p-6 md:p-8">
            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-[11px] font-bold flex gap-2 items-center">
                <span className="material-symbols-outlined text-lg">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleLoginDemo} noValidate className="space-y-4 text-xs">
              
              <div className="space-y-1">
                <label htmlFor="login-email" className="font-semibold text-slate-500 uppercase tracking-wider block">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">mail</span>
                  <input
                    id="login-email"
                    type="email"
                    required
                    placeholder="abcdefg@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label htmlFor="login-password" className="font-semibold text-slate-500 uppercase tracking-wider block">Password</label>
                </div>
                <div className="relative font-bold">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">lock</span>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800"
                  >
                    <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-[0.98]"
              >
                Sign In
                <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
              </button>

            </form>

          </div>
        </div>

      </main>

      <footer className="bg-white border-t border-slate-100 py-3.5 px-6 text-center text-[10px] text-slate-400 z-40 font-medium">
        © 2026 PayFlow Simulation Frameworks. All rights reserved. • Licensed and secured by abcdefg@gmail.com
      </footer>

    </div>
  );
}
