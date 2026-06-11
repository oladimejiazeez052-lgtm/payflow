import React, { useState } from 'react';

interface Error500ViewProps {
  onRetry: () => void;
  onBackToDashboard: () => void;
}

export default function Error500View({ onRetry, onBackToDashboard }: Error500ViewProps) {
  const [showLogs, setShowLogs] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between" id="error-500-canvas">
      
      {/* Safety Notice Banner */}
      <div className="bg-[#F59E0B] text-white py-1.5 px-4 text-center font-bold text-[10px] tracking-widest uppercase">
        SIMULATION ONLY - NOT REAL MONEY - DEMO PLATFORM
      </div>

      {/* Top AppBar */}
      <header className="bg-white border-b border-slate-100 flex items-center justify-between px-6 lg:px-12 h-16">
        <h2 className="font-extrabold text-xs tracking-tight text-blue-600 leading-none">PayFlow Demo</h2>
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-slate-400 p-2 hover:bg-slate-50 rounded-full cursor-pointer text-lg">notifications</span>
          <span className="material-symbols-outlined text-slate-400 p-2 hover:bg-slate-50 rounded-full cursor-pointer text-lg">help</span>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-grow flex items-center justify-center px-6 py-10">
        <div className="max-w-md w-full flex flex-col items-center text-center space-y-6">
          
          {/* Illustration Section */}
          <div className="relative mb-2">
            <div className="absolute inset-0 bg-rose-500/5 rounded-full blur-2xl scale-125"></div>
            
            <div className="relative bg-white w-32 h-32 rounded-full flex items-center justify-center shadow-lg border border-slate-150">
              <span className="material-symbols-outlined text-rose-500 text-[64px]" style={{ fontVariationSettings: "'wght' 200" }}>
                cloud_off
              </span>

              {/* Floating Alert Badges */}
              <div className="absolute -top-1.5 -right-1.5 bg-white border border-rose-100 p-2 rounded-xl shadow-xs rotate-12">
                <span className="material-symbols-outlined text-rose-600 text-[18px] font-bold">priority_high</span>
              </div>
              
              <div className="absolute -bottom-1 -left-2.5 bg-white border border-slate-150 p-2 rounded-xl shadow-xs -rotate-12">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">database_off</span>
              </div>
              
            </div>
          </div>

          {/* Error Text Details */}
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-950 tracking-tight leading-tight">
              Simulation Interrupted
            </h1>
            <p className="text-slate-500 text-xs font-semibold leading-relaxed max-w-xs mx-auto">
              The mock transaction engine encountered an unexpected internal error (500). The simulation environment is currently unable to process your request.
            </p>
          </div>

          {/* Collapsible Error Code Details Panel */}
          <div className="w-full bg-slate-50 border border-slate-200 border-dashed rounded-xl p-4 text-left font-sans">
            <div 
              onClick={() => setShowLogs(!showLogs)} 
              className="flex items-center justify-between text-slate-600 hover:text-slate-900 transition font-bold text-xs cursor-pointer select-none"
            >
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">code</span>
                <span>View Error Details</span>
              </div>
              <span className={`material-symbols-outlined text-sm font-bold transition-transform duration-200 ${showLogs ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </div>

            {showLogs && (
              <div className="mt-4 pt-3 border-t border-slate-200 font-mono text-[10px] text-slate-500 space-y-1.5 overflow-x-auto select-all leading-normal">
                <p className="text-rose-600 font-bold">[CRITICAL_FAULT] Thread: simulation-worker-04</p>
                <p>&gt; Handshake failed with virtual_ledger_v2</p>
                <p>&gt; Stack: NullPointerException at MockProcessor.java:142</p>
                <p>&gt; Timestamp: {new Date().toISOString()}</p>
              </div>
            )}
          </div>

          {/* Custom Action Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <button 
              type="button"
              onClick={onRetry}
              className="w-full sm:flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md shadow-blue-100"
            >
              <span className="material-symbols-outlined text-sm font-extrabold">refresh</span>
              Retry Simulation
            </button>
            <button 
              type="button"
              onClick={onBackToDashboard}
              className="w-full sm:flex-1 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
            >
              <span className="material-symbols-outlined text-sm">dashboard</span>
              Return to Dashboard
            </button>
          </div>

          {/* Support Helpline Trigger */}
          <a 
            href="#admin_helpline"
            onClick={(e) => {
              e.preventDefault();
              alert("Routing diagnostics directly to compliance desk coordinator.");
            }}
            className="font-bold text-xs text-blue-600 hover:underline flex items-center gap-1 justify-center pt-2 select-none"
          >
            Contact System Administrator
            <span className="material-symbols-outlined text-xs font-bold">open_in_new</span>
          </a>

        </div>
      </main>

      {/* Footer bar */}
      <footer className="py-5 border-t border-slate-150 text-center bg-white">
        <p className="text-[10px] text-slate-400 font-bold">
          © 2026 PayFlow Simulation Frameworks. All rights reserved. • Live Environment Check
        </p>
      </footer>

    </div>
  );
}
