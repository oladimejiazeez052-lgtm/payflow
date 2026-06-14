import React, { useState } from 'react';

export interface UserWorkspace {
  role: 'Fintech Trainer' | 'UX Designer' | 'Developer' | 'Fintech Learner' | 'Lead Architect' | '';
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
  const [view, setView] = useState<'login' | 'register' | 'onboarding'>('login');
  const [onboardingStep, setOnboardingStep] = useState<number>(1);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Onboarding Config State
  const [selectedRole, setSelectedRole] = useState<'Fintech Trainer' | 'UX Designer' | 'Developer' | 'Fintech Learner' | ''>('');
  const [businessName, setBusinessName] = useState('Acme FinTech');
  const [currency, setCurrency] = useState('USD');
  const [channels, setChannels] = useState<string[]>(['Zelle', 'Bank Transfer', 'Card Mock']);

  const handleToggleChannel = (channel: string) => {
    setChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    );
  };

  const currentWorkspace: UserWorkspace = {
    role: selectedRole,
    businessName,
    currency,
    selectedChannels: channels,
    firstName: firstName || 'Sarah',
    lastName: lastName || 'Jenkins',
    email: email || 'coordinator@payflow.internal'
  };

  const handleSubmitRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) {
      alert("Name and email are required to simulation dashboard");
      return;
    }
    setView('onboarding');
    setOnboardingStep(1);
  };

  const [errorMessage, setErrorMessage] = useState('');

  const handleLoginDemo = (e: React.FormEvent) => {
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
    if (targetEmail === 'oladimejiazeez052@gmail.com') {
      if (targetPassword === 'Architect2026!') {
        onComplete({
          role: 'Lead Architect',
          businessName: 'Lead Architect Console',
          currency: 'USD',
          selectedChannels: ['Zelle', 'Venmo', 'Cash App', 'Bank Transfer', 'Apple Pay'],
          firstName: 'Oladimeji',
          lastName: 'Azeez',
          email: 'oladimejiazeez052@gmail.com',
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

    // 2. Check general created profiles
    const savedProfilesStr = localStorage.getItem('payflow_profiles');
    let profiles: any[] = [];
    if (savedProfilesStr) {
      try {
        profiles = JSON.parse(savedProfilesStr);
      } catch (err) {
        console.error("Failed to parse payflow_profiles", err);
      }
    }

    const matchedProfileIdx = profiles.findIndex(p => p.email.trim().toLowerCase() === targetEmail);
    if (matchedProfileIdx !== -1) {
      const match = profiles[matchedProfileIdx];
      if (match.password === targetPassword) {
        const now = Date.now();
        
        // Expiration check: 48 hours
        if (match.loginTime && (now - match.loginTime > 48 * 60 * 60 * 1000)) {
          setErrorMessage("Profile Expired: This sandbox profile has expired after 48 hours of use. Please contact the Lead Architect.");
          return;
        }

        // Set login time if not set yet
        if (!match.loginTime) {
          match.loginTime = now;
          profiles[matchedProfileIdx] = match;
          localStorage.setItem('payflow_profiles', JSON.stringify(profiles));
        }

        onComplete({
          role: match.role || 'Developer',
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
        
        {/* ================= LOGIN VIEW ================= */}
        {view === 'login' && (
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
                      placeholder="oladimejiazeez052@gmail.com"
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

              {/* Admin login helper details badge */}
              <div className="mt-6 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
                <span className="text-[10px] font-extrabold text-blue-800 tracking-wider uppercase block mb-1">Lead Architect Access</span>
                <p className="text-[10px] text-blue-700 leading-normal">
                  Login with Lead Architect email <strong className="font-bold underline">oladimejiazeez052@gmail.com</strong> and password <strong className="font-bold select-all bg-blue-100 px-1 rounded">Architect2026!</strong> to access administration controls and issue new profiles.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* ================= REGISTER VIEW ================= */}
        {view === 'register' && (
          <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center animate-fade-in">
            
            {/* Left Form Panel */}
            <div className="md:col-span-6 space-y-5">
              <div>
                <h2 className="font-extrabold text-2xl text-slate-900 tracking-tight">Create Account</h2>
                <p className="text-slate-400 text-xs mt-1">Experience the simulation-first sandbox flow builder.</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
                
                {/* Alert Badge info */}
                <div className="bg-amber-50 border border-amber-200/50 rounded-xl p-3 flex gap-2.5 items-start">
                  <span className="material-symbols-outlined text-amber-600 text-lg shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                  <p className="text-[10px] text-amber-800 leading-normal font-semibold">
                    This is a sandbox environment. All information entered is for demonstration and software training purposes only.
                  </p>
                </div>

                <form onSubmit={handleSubmitRegister} noValidate className="space-y-3.5 text-xs">
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="reg-first-name" className="font-semibold text-slate-500 uppercase tracking-wider block">First Name</label>
                      <input
                        id="reg-first-name"
                        type="text"
                        required
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-slate-50 focus:bg-white text-slate-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="reg-last-name" className="font-semibold text-slate-500 uppercase tracking-wider block">Last Name</label>
                      <input
                        id="reg-last-name"
                        type="text"
                        required
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-slate-50 focus:bg-white text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="reg-email" className="font-semibold text-slate-500 uppercase tracking-wider block">Email Address</label>
                    <input
                      id="reg-email"
                      type="email"
                      required
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-slate-50 focus:bg-white text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="reg-password" className="font-semibold text-slate-500 uppercase tracking-wider block">Password</label>
                    <input
                      id="reg-password"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-slate-50 focus:bg-white text-slate-800"
                    />
                    
                    {/* Password security strength indicator */}
                    <div className="pt-1.5 space-y-1">
                      <div className="flex justify-between text-[9px] font-bold text-slate-400">
                        <span>SECURITY METER LEVEL</span>
                        <span className="text-emerald-600">STRONG SECURITY</span>
                      </div>
                      <div className="flex gap-1 h-1">
                        <span className="flex-1 bg-emerald-500 rounded-sm"></span>
                        <span className="flex-1 bg-emerald-500 rounded-sm"></span>
                        <span className="flex-1 bg-emerald-500 rounded-sm"></span>
                        <span className="flex-1 bg-slate-200 rounded-sm"></span>
                      </div>
                    </div>
                  </div>

                  {/* Accept checkboxes */}
                  <label className="flex items-start gap-2.5 cursor-pointer select-none py-1 group">
                    <input 
                      type="checkbox" 
                      required 
                      defaultChecked 
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-0.5" 
                    />
                    <span className="text-[10px] text-slate-500 leading-normal">
                      I understand that <strong className="text-slate-700">PayFlow</strong> is a simulation sandbox framework. No actual funds are processed, and all data generated is strictly mock.
                    </span>
                  </label>

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl transition shadow-md active:scale-[0.98] text-center"
                  >
                    Create Sandbox Account
                  </button>

                </form>

                <p className="text-center text-xs text-slate-500 font-medium">
                  Already have an account?{' '}
                  <button onClick={() => setView('login')} className="text-blue-600 font-bold hover:underline">
                    Log in
                  </button>
                </p>

              </div>
            </div>

            {/* Right Interactive Art/Info Panel */}
            <div className="md:col-span-6 hidden md:block relative h-[500px] rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 p-8 flex flex-col justify-between text-white">
              
              {/* Background abstract overlay grids */}
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>

              {/* Float Glass Receipt */}
              <div className="relative w-72 mx-auto bg-white/10 backdrop-blur-md border border-white/25 rounded-2xl p-5 shadow-2xl rotate-[-3deg] hover:rotate-0 transition duration-500 text-slate-900 text-[10px]">
                <div className="flex flex-col items-center justify-center border-b border-white/10 pb-4 mb-4 text-white">
                  <span className="material-symbols-outlined text-blue-400 text-2xl mb-1.5">receipt_long</span>
                  <div className="h-2.5 w-20 bg-white/20 rounded-md"></div>
                  <div className="h-1.5 w-12 bg-white/15 rounded-md mt-1 mb-1"></div>
                </div>

                <div className="space-y-3 text-slate-300">
                  <div className="flex justify-between">
                    <span className="bg-white/15 h-2 w-16 rounded-md"></span>
                    <span className="bg-blue-400/20 h-2 w-8 rounded-md"></span>
                  </div>
                  <div className="flex justify-between">
                    <span className="bg-white/15 h-2 w-12 rounded-md"></span>
                    <span className="bg-white/10 h-2 w-6 rounded-md"></span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-white/10 text-white">
                    <span className="bg-white/30 h-3 w-14 rounded-md"></span>
                    <span className="bg-blue-400 h-3 w-10 rounded-md"></span>
                  </div>
                </div>

                <div className="mt-5 flex justify-center">
                  <img 
                    referrerPolicy="no-referrer"
                    alt="Demo QR Code" 
                    className="w-14 h-14 opacity-75 rounded"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGo3xLDIjg5fEAYnEJC-WnmJIdiFXLvBwzauAWuStZ4ReCmZIvIhujx2LoFUfyuhEODAvY26_kNJn3GKmxbJyiFUGCON1BlS_yv9c8Xxpbm-FVS8ikTv7dY-3x0kb7R3v-ajz-5UwRCTsxUMvsMbFCWvYDcXdqHp7Cv8C4lGxBJlesQtWGFVJpSnsdd6M7N_kjkTrJBQ9tRqwO6bINdqkNHBZD07e_nOsXrkAdaNZog7ChbzpiOLG3OfCFzwVrRfJ4vonzu4raDow"
                  />
                </div>
              </div>

              {/* Bottom pitch info */}
              <div className="text-center space-y-2 z-10 pt-10">
                <h3 className="font-extrabold text-lg leading-tight">Branded simulated document flows</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed max-w-sm mx-auto">
                  Build custom invoice slips and export beautiful PDF records instantly for client onboarding training programs.
                </p>
              </div>

            </div>

          </div>
        )}

        {/* ================= ONBOARDING SCREEN PATHS ================= */}
        {view === 'onboarding' && (
          <div className="w-full max-w-3xl bg-white border border-slate-200 shadow-xl rounded-3xl overflow-hidden animate-scale-up flex flex-col">
            
            {/* Top Multi-step progress tracks */}
            <div className="bg-slate-100 flex p-1 justify-between gap-1 border-b border-slate-200">
              {[1, 2, 3, 4].map((stepNum) => (
                <div 
                  key={stepNum}
                  className={`flex-1 text-center py-2 text-[10px] font-bold tracking-wider uppercase rounded-xl transition ${
                    stepNum === onboardingStep 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : stepNum < onboardingStep
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-400'
                  }`}
                >
                  Step {stepNum} of 4
                </div>
              ))}
            </div>

            {/* Step Content bodies */}
            <div className="p-6 md:p-8 flex-1 min-h-[360px] flex flex-col justify-between">

              {/* STEP 1: WELCOME INTRO */}
              {onboardingStep === 1 && (
                <div className="space-y-6 text-center max-w-md mx-auto py-4">
                  
                  {/* Visual Illustration panel placeholder */}
                  <div className="relative h-40 w-full bg-slate-50 flex items-center justify-center rounded-2xl border border-slate-100 overflow-hidden shadow-2xs">
                    <img 
                      referrerPolicy="no-referrer"
                      alt="Fintech graphic illustration" 
                      className="h-32 object-contain"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9Df7SyD0I3J4mYSyqWpL66onYcc3-xAcRdQlrKerAaI7oPf9IwFNBIYiS-v3anLSgfJxy61bF4rFunWqxu40PmF8Y8M70bKQfGrd1ypMtBJHJInisPRCgPxmvmPu-2CaJIg319rsUxY1XoGziB-UOLSccUWwZO9S_8sXzJcAXGS4Hj7-r1ES42kksGGGoonQvePijmdq9WVLKM32cPbJBNigIbdiOYWlY6iJzyh059ZEyoMRecSdPuS3R5qx1Ym05E6aMTxUH6uQ"
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-extrabold text-xl text-slate-900 tracking-tight">Welcome to PayFlow Demo Sandbox!</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      Let's set up your simulation workspace settings. Tailor your channels, simulated organization names, and business roles immediately.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setOnboardingStep(2)}
                      className="w-full py-3 bg-blue-600 text-white hover:bg-blue-700 font-extrabold rounded-xl text-xs transition active:scale-[0.98] shadow-sm"
                    >
                      Get Started Configuration
                    </button>
                    <button
                      type="button"
                      onClick={() => onComplete(currentWorkspace)}
                      className="text-slate-500 hover:text-slate-800 text-[11px] font-bold underline"
                    >
                      Skip Onboarding Directly to Live Sandbox
                    </button>
                  </div>

                </div>
              )}

              {/* STEP 2: CHOOSE PRIMARY ROLE */}
              {onboardingStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center max-w-lg mx-auto space-y-1.5">
                    <h3 className="font-extrabold text-lg text-slate-900">Choose your primary simulation role</h3>
                    <p className="text-slate-400 text-xs">This helps customize default payment directions and data scenarios for your test goals.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    
                    {/* Fintech Trainer */}
                    <div 
                      onClick={() => setSelectedRole('Fintech Trainer')}
                      className={`p-4 border rounded-2xl cursor-pointer transition flex gap-3 text-xs ${
                        selectedRole === 'Fintech Trainer' 
                          ? 'border-blue-500 bg-blue-50/40 outline-none ring-2 ring-blue-500/10' 
                          : 'border-slate-200 hover:border-slate-350 bg-slate-50/50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        selectedRole === 'Fintech Trainer' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        <span className="material-symbols-outlined text-lg">school</span>
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-slate-900">Fintech Trainer</h4>
                        <p className="text-[10px] text-slate-500 leading-normal">Educate clients on payment loops without legal risks or transaction real-money delays.</p>
                      </div>
                    </div>

                    {/* UX Designer */}
                    <div 
                      onClick={() => setSelectedRole('UX Designer')}
                      className={`p-4 border rounded-2xl cursor-pointer transition flex gap-3 text-xs ${
                        selectedRole === 'UX Designer' 
                          ? 'border-blue-500 bg-blue-50/40 outline-none ring-2 ring-blue-500/10' 
                          : 'border-slate-200 hover:border-slate-350 bg-slate-50/50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        selectedRole === 'UX Designer' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        <span className="material-symbols-outlined text-lg">palette</span>
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-slate-900">UX Designer</h4>
                        <p className="text-[10px] text-slate-500 leading-normal">Mock rapid P2P errors and high-latency receipts for pixel-ready system flow designs.</p>
                      </div>
                    </div>

                    {/* Developer */}
                    <div 
                      onClick={() => setSelectedRole('Developer')}
                      className={`p-4 border rounded-2xl cursor-pointer transition flex gap-3 text-xs ${
                        selectedRole === 'Developer' 
                          ? 'border-blue-500 bg-blue-50/40 outline-none ring-2 ring-blue-500/10' 
                          : 'border-slate-200 hover:border-slate-350 bg-slate-50/50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        selectedRole === 'Developer' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        <span className="material-symbols-outlined text-lg">terminal</span>
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-slate-900">Developer</h4>
                        <p className="text-[10px] text-slate-500 leading-normal">Test instant synthetic webhooks and ledger integrations with predictable sandbox data.</p>
                      </div>
                    </div>

                    {/* Fintech Learner */}
                    <div 
                      onClick={() => setSelectedRole('Fintech Learner')}
                      className={`p-4 border rounded-2xl cursor-pointer transition flex gap-3 text-xs ${
                        selectedRole === 'Fintech Learner' 
                          ? 'border-blue-500 bg-blue-50/40 outline-none ring-2 ring-blue-500/10' 
                          : 'border-slate-200 hover:border-slate-350 bg-slate-50/50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        selectedRole === 'Fintech Learner' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        <span className="material-symbols-outlined text-lg">rocket_launch</span>
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-slate-900">Fintech Learner</h4>
                        <p className="text-[10px] text-slate-500 leading-normal">Simulate transactions on standard rails (Zelle, Venmo, ACH) to understand money loops.</p>
                      </div>
                    </div>

                  </div>

                  {/* Actions footer */}
                  <div className="flex justify-between items-center border-t border-slate-100 pt-5">
                    <button
                      type="button"
                      onClick={() => setOnboardingStep(1)}
                      className="px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold transition"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={!selectedRole}
                      onClick={() => setOnboardingStep(3)}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 font-bold text-xs rounded-xl shadow-xs transition"
                    >
                      Next Step
                    </button>
                  </div>

                </div>
              )}

              {/* STEP 3: CONFIGURE CHANNELS & CO-IDENTITY */}
              {onboardingStep === 3 && (
                <div className="space-y-6">
                  
                  <div className="text-center max-w-lg mx-auto space-y-1">
                    <h3 className="font-extrabold text-lg text-slate-900">Configure Your Dynamic Channels</h3>
                    <p className="text-slate-400 text-xs">Set up default brand simulation parameters.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-xs">
                    
                    {/* Left details */}
                    <div className="md:col-span-5 space-y-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="space-y-1">
                        <label htmlFor="onb-biz-name" className="font-bold text-slate-500 uppercase tracking-wide block">Mock Company Name</label>
                        <input 
                          id="onb-biz-name"
                          type="text"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="onb-currency" className="font-bold text-slate-500 uppercase tracking-wide block">Base Currency Symbol</label>
                        <select
                          id="onb-currency"
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none"
                        >
                          <option value="USD">USD ($) United States</option>
                          <option value="EUR">EUR (€) Eurozone</option>
                          <option value="GBP">GBP (£) United Kingdom</option>
                        </select>
                      </div>

                      <div className="pt-2">
                        <span className="text-[10px] text-slate-400 leading-normal block italic font-medium">
                          These mock parameters are formatted globally onto current receipts.
                        </span>
                      </div>
                    </div>

                    {/* Right channel checkboxes */}
                    <div className="md:col-span-7 space-y-2">
                      <span className="font-bold text-slate-500 uppercase tracking-wide block">Select active channels for checkout</span>
                      
                      <div className="space-y-1.5 h-44 overflow-y-auto pr-1">
                        
                        {/* Zelle */}
                        <label className={`flex items-center justify-between p-2.5 border rounded-xl cursor-pointer transition ${
                          channels.includes('Zelle') ? 'border-blue-300 bg-blue-50/35 font-semibold' : 'border-slate-100 bg-white'
                        }`}>
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={channels.includes('Zelle')} 
                              onChange={() => handleToggleChannel('Zelle')}
                              className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                            />
                            <div>
                              <p className="text-xs text-slate-800">Zelle Direct</p>
                              <p className="text-[9px] text-slate-400">P2P Bank transfer rails</p>
                            </div>
                          </div>
                          <span className="material-symbols-outlined text-slate-400 text-lg">account_balance_wallet</span>
                        </label>

                        {/* Venmo */}
                        <label className={`flex items-center justify-between p-2.5 border rounded-xl cursor-pointer transition ${
                          channels.includes('Venmo') ? 'border-blue-300 bg-blue-50/35 font-semibold' : 'border-slate-100 bg-white'
                        }`}>
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={channels.includes('Venmo')} 
                              onChange={() => handleToggleChannel('Venmo')}
                              className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                            />
                            <div>
                              <p className="text-xs text-slate-800">Venmo Smart</p>
                              <p className="text-[9px] text-slate-400">Social transaction feeds</p>
                            </div>
                          </div>
                          <span className="material-symbols-outlined text-slate-400 text-lg">send_to_mobile</span>
                        </label>

                        {/* Cash App */}
                        <label className={`flex items-center justify-between p-2.5 border rounded-xl cursor-pointer transition ${
                          channels.includes('Cash App') ? 'border-blue-300 bg-blue-50/35 font-semibold' : 'border-slate-100 bg-white'
                        }`}>
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={channels.includes('Cash App')} 
                              onChange={() => handleToggleChannel('Cash App')}
                              className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                            />
                            <div>
                              <p className="text-xs text-slate-800">Cash App</p>
                              <p className="text-[9px] text-slate-400">Fast wallet cash payments</p>
                            </div>
                          </div>
                          <span className="material-symbols-outlined text-slate-400 text-lg">attach_money</span>
                        </label>

                        {/* Bank Transfer */}
                        <label className={`flex items-center justify-between p-2.5 border rounded-xl cursor-pointer transition ${
                          channels.includes('Bank Transfer') ? 'border-blue-300 bg-blue-50/35 font-semibold' : 'border-slate-100 bg-white'
                        }`}>
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={channels.includes('Bank Transfer')} 
                              onChange={() => handleToggleChannel('Bank Transfer')}
                              className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                            />
                            <div>
                              <p className="text-xs text-slate-800">Bank ACH/Wire</p>
                              <p className="text-[9px] text-slate-400">Traditional corporate settlements</p>
                            </div>
                          </div>
                          <span className="material-symbols-outlined text-slate-400 text-lg">account_balance</span>
                        </label>

                      </div>

                    </div>

                  </div>

                  {/* Actions footer */}
                  <div className="flex justify-between items-center border-t border-slate-100 pt-5">
                    <button
                      type="button"
                      onClick={() => setOnboardingStep(2)}
                      className="px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold transition"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setOnboardingStep(4)}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                    >
                      Next Step
                    </button>
                  </div>

                </div>
              )}

              {/* STEP 4: SANDBOX CONFIGURED & RECOMMENDED ACTIONS */}
              {onboardingStep === 4 && (
                <div className="space-y-6">
                  
                  <div className="text-center max-w-lg mx-auto space-y-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center shadow-xs border border-emerald-100">
                      <span className="material-symbols-outlined text-2xl font-bold">check_circle</span>
                    </div>
                    <h3 className="font-extrabold text-lg text-slate-900 leading-tight">Your Simulation Sandbox is Ready!</h3>
                    <p className="text-slate-400 text-xs">Everything is configured. You can start simulating real-time financial flows and auditing immediately.</p>
                  </div>

                  {/* Recommended Action steps grid */}
                  <div className="space-y-2 max-w-md mx-auto text-xs font-medium">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Recommended First Actions</span>
                    
                    {/* Item 1 */}
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/20 transition cursor-pointer flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-sm font-bold">send</span>
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <p className="text-slate-800 font-bold leading-none">Simulate Instant P2P Payment</p>
                        <p className="text-[10px] text-slate-400">Trigger standard Zelle or Cash App transfers</p>
                      </div>
                      <span className="material-symbols-outlined text-slate-350 text-sm">chevron_right</span>
                    </div>

                    {/* Item 2 */}
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/20 transition cursor-pointer flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-sm font-bold">auto_awesome</span>
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <p className="text-slate-800 font-bold leading-none">AI Scenario builder injection</p>
                        <p className="text-[10px] text-slate-400">Inject 12+ prompt-based scenarios with Gemini</p>
                      </div>
                      <span className="material-symbols-outlined text-slate-350 text-sm">chevron_right</span>
                    </div>

                    {/* Item 3 */}
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/20 transition cursor-pointer flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-sm font-bold">receipt_long</span>
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <p className="text-slate-800 font-bold leading-none">Compile beautiful branded PDFs</p>
                        <p className="text-[10px] text-slate-400">Print custom client layout acquisition slips</p>
                      </div>
                      <span className="material-symbols-outlined text-slate-350 text-sm">chevron_right</span>
                    </div>

                  </div>

                  {/* Submit complete */}
                  <div className="pt-4 border-t border-slate-100 flex justify-center">
                    <button
                      type="button"
                      onClick={() => onComplete(currentWorkspace)}
                      className="w-full max-w-sm py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl transition shadow-md text-xs flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      Go to Live Simulation Dashboard
                      <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                    </button>
                  </div>

                </div>
              )}

            </div>

          </div>
        )}

      </main>

      <footer className="bg-white border-t border-slate-100 py-3.5 px-6 text-center text-[10px] text-slate-400 z-40 font-medium">
        © 2026 PayFlow Simulation Frameworks. All rights reserved. • Licensed and secured by oladimejiazeez052@gmail.com
      </footer>

    </div>
  );
}
