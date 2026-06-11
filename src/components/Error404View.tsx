import React, { useState } from 'react';

interface Error404ViewProps {
  onBackToDashboard: () => void;
}

export default function Error404View({ onBackToDashboard }: Error404ViewProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleLocateClick = () => {
    if (searchTerm.trim()) {
      alert(`Simulation Search Initiated for: ${searchTerm}\nTracing through simulated network clusters...`);
    } else {
      alert("Please enter a Simulation ID or Transaction Hash first.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between" id="error-404-canvas">
      
      {/* Header / Logo Area */}
      <header className="flex justify-between items-center px-6 lg:px-12 py-6">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
            <span className="material-symbols-outlined text-white text-xl">payments</span>
          </div>
          <h1 className="font-extrabold text-slate-900 tracking-tight text-lg">PayFlow</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={() => alert("Simulation support centers are currently active online.")}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition"
          >
            Help Center
          </button>
          <button 
            type="button" 
            onClick={() => alert("Simulated tech support responder dispatched.")}
            className="bg-blue-600 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-md shadow-blue-100"
          >
            Support
          </button>
        </div>
      </header>

      {/* Content Canvas */}
      <div className="flex-grow flex items-center justify-center px-6 lg:px-12 py-10">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          
          {/* Left Content: Hero Text */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-700 font-bold text-xs uppercase tracking-wider">
              <span className="material-symbols-outlined text-sm">warning</span>
              ERROR CODE: 404_SCENARIO_BREAK
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-black text-slate-950 tracking-tight leading-tight">
              Scenario Not Found
            </h2>
            
            <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-sm">
              The financial simulation path you're looking for has deviated from the bounds of our ledger. Either this scenario ID doesn't exist or it was archived during a system refresh.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-sm group">
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Simulation ID or Transaction Hash..."
                className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-24 text-xs font-semibold outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
              />
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition">
                search
              </span>
              <button 
                type="button"
                onClick={handleLocateClick}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all select-none"
              >
                Locate
              </button>
            </div>
          </div>

          {/* Right Content: Bento Grid Visualization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Glassmorphism Visual Card */}
            <div className="col-span-1 sm:col-span-2 relative overflow-hidden h-40 rounded-2xl border border-slate-200 bg-slate-100 flex items-center justify-center p-6 text-center select-none">
              {/* Background Illustration */}
              <img 
                className="absolute inset-0 w-full h-full object-cover opacity-10 grayscale" 
                alt="Fintech network flow diagram" 
                referrerPolicy="no-referrer"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJTpe2aRnOv0fK7Q0FzeplcSSq4HeB-vtX9cPE-ozqiASOQao-_KO8f-LJkl1pwYVuqD9H6ZNgmAzN9nFuWJsACfObI977-5dXWlLgXKcwcZ1at5Yzk-_sfxmEPZhh_NbpomY73cYe82q1R9pItSL196bcVs8Fyo8elaUdafJ6Xg7vljBI99nJ8c6RshPaXsaVqwdMBWh6sweSyNStF3ylWYNfYXExOKxs_X04vXyDus1j_XGzWsvWlrd4pgYUuJb00LYT_Hj06_E"
              />
              
              <div className="relative z-10 space-y-1.5">
                <span className="material-symbols-outlined text-4xl text-blue-600/60 block mx-auto">
                  query_stats
                </span>
                <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-widest block">
                  Navigation Integrity Check: FAILED
                </span>
              </div>
            </div>

            {/* Quick Link: Dashboard */}
            <button 
              onClick={onBackToDashboard}
              className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 text-left hover:shadow-lg transition-all group shrink-0 flex flex-col justify-between h-32"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-lg">dashboard</span>
              </div>
              <div className="leading-tight">
                <h4 className="font-bold text-slate-900 text-xs">Dashboard</h4>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">Return to sandbox overview</p>
              </div>
            </button>

            {/* Quick Link: Help Support trigger */}
            <button 
              onClick={() => {
                alert("Redirecting to verification diagnostics ledger...");
              }}
              className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 text-left hover:shadow-lg transition-all group shrink-0 flex flex-col justify-between h-32"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-lg">payments</span>
              </div>
              <div className="leading-tight">
                <h4 className="font-bold text-slate-900 text-xs">Verify Ledger</h4>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">Verify simulation status logs</p>
              </div>
            </button>

            {/* AI Assistant Banner */}
            <button 
              onClick={() => {
                alert("Triggering contextual AI assistance diagnostics...");
              }}
              className="col-span-1 sm:col-span-2 p-5 rounded-2xl border border-blue-500 bg-gradient-to-r from-blue-600 to-blue-700 text-white flex items-center justify-between text-left hover:opacity-95 transition-all shadow-md shadow-blue-100"
            >
              <div>
                <h4 className="font-black text-sm text-white">Ask AI Assistant</h4>
                <p className="text-[10px] text-blue-100 font-medium mt-0.5">Find where this scenario went wrong.</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                <span className="material-symbols-outlined text-white text-md">smart_toy</span>
              </div>
            </button>

          </div>

        </div>
      </div>

      {/* Atmospheric Footer */}
      <footer className="py-6 border-t border-slate-150 text-center bg-white">
        <p className="text-[10px] text-slate-400 font-bold">
          © 2026 PayFlow Simulation Frameworks. System integrity: <span className="text-emerald-600 font-extrabold pb-0.5">STABLE</span>
        </p>
      </footer>

    </div>
  );
}
