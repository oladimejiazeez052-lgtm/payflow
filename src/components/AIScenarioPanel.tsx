import React, { useState, useRef, useEffect } from 'react';
import { generateAIScenario } from '../utils';
import { SimulatedTransaction } from '../types';

interface AIScenarioPanelProps {
  onScenarioLoaded: (newTxs: SimulatedTransaction[]) => void;
}

interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  timestamp: string;
}

export default function AIScenarioPanel({ onScenarioLoaded }: AIScenarioPanelProps) {
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorText, setErrorText] = useState('');
  const [successCount, setSuccessCount] = useState<number | null>(null);

  // Chat Bot State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      text: "I can help you build transaction histories, simulate edge cases, or analyze your current simulator load. What would you like to build today?",
      timestamp: 'Just now'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat window when new message arrives
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  // Steps for premium Fintech simulator synthesization animation
  const loadingSteps = [
    "Analyzing prompt context with Gemini 3.5-Flash...",
    "Synthesizing randomized client and employee profiles...",
    "Validating secure sandbox transaction checksums...",
    "Structuring ISO 8601 calendar timeline increments...",
    "Flushing simulated event blocks into the global ledger feed..."
  ];

  const handleGenerate = async (promptToUse: string) => {
    if (!promptToUse.trim()) return;
    setLoading(true);
    setErrorText('');
    setSuccessCount(null);
    setLoadingStep(0);

    // Smooth progress increment
    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 1400);

    try {
      const result = await generateAIScenario(promptToUse);
      clearInterval(stepInterval);
      setLoadingStep(loadingSteps.length - 1);
      setTimeout(() => {
        onScenarioLoaded(result);
        setSuccessCount(result.length);
        setLoading(false);
        setCustomPrompt('');
      }, 600);
    } catch (err: any) {
      clearInterval(stepInterval);
      setErrorText(err.message || "Failed to synthesize sandbox sequence.");
      setLoading(false);
    }
  };

  // Chat message submit to Express Gemini Proxy
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput.trim();
    setChatInput('');
    
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatLoading(true);

    try {
      // Send chat history payload for back-and-forth context consistency
      const historyPayload = chatMessages
        .filter(m => m.id !== 'msg-init')
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          content: m.text
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, history: historyPayload })
      });

      if (!res.ok) throw new Error("Could not fetch assistant chat reply.");
      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || "I encountered an error formulating this response. Please retry.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: `asst-err-${Date.now()}`,
        sender: 'assistant',
        text: "I am having trouble communicating with the server. Please check your network or try again.",
        timestamp: 'Just now'
      };
      setChatMessages(prev => [...prev, errMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in pb-10" id="ai-scenario-suite">
      
      {/* Main AI Input Area (Left 8-cols) */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* Scenario Generator Intro Header */}
        <div>
          <h2 className="text-2xl font-black text-slate-950 tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 animate-pulse text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
            Generate Financial Flows
          </h2>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl font-medium leading-relaxed">
            Generate realistic transaction histories, high-risk user personas, and compliance auditing templates in real-time using natural language prompting.
          </p>
        </div>

        {/* The Glass Prompt Area Card */}
        <div className="bg-white/85 border border-slate-200/60 shadow-lg shadow-slate-100 p-6 rounded-2xl relative overflow-hidden backdrop-blur-md">
          
          {loading ? (
            /* Premium active Synthesizer Loader state */
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin"></div>
                <span className="material-symbols-outlined absolute left-1/2 top-1/2 -google-translate -translate-x-1/2 -translate-y-1/2 text-blue-600 text-2xl animate-pulse">
                  database_sync
                </span>
              </div>

              <div className="space-y-2 max-w-lg">
                <h4 className="font-extrabold text-slate-900 tracking-tight">Synthesizing Real-time Ledger Blocks</h4>
                <p className="text-xs text-blue-600 font-mono italic font-semibold animate-pulse uppercase tracking-wider">
                  {loadingSteps[loadingStep]}
                </p>
              </div>

              {/* Progress visual tracker */}
              <div className="flex gap-1 bg-slate-50 p-1.5 rounded-full border border-slate-100">
                {loadingSteps.map((_, i) => (
                  <span 
                    key={i} 
                    className={`w-10 h-1.5 rounded-full transition-all duration-300 ${
                      i <= loadingStep ? 'bg-blue-600 shadow-sm' : 'bg-slate-200/60'
                    }`}
                  ></span>
                ))}
              </div>
            </div>
          ) : (
            /* Prompt Input Dashboard */
            <div className="space-y-4">
              
              {/* Errors notifications */}
              {errorText && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
                  <span className="material-symbols-outlined text-rose-600">report</span>
                  <span>{errorText}</span>
                </div>
              )}

              {/* Success output notifications */}
              {successCount !== null && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
                  <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                  <span>Simulation successful! AI synthesized and committed <strong>{successCount}</strong> test items to the live ledger feed.</span>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label htmlFor="payout-prompt-textarea" className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                  Your Simulation Request
                </label>
                <textarea
                  id="payout-prompt-textarea"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Type a simulation command, e.g., 'Generate 10 bank transfers from Apex Corp ranging from $1,000 to $5,000 with pending state'..."
                  className="w-full h-44 bg-slate-50/70 border border-slate-200/70 rounded-xl p-4 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 focus:bg-white outline-none text-slate-800 text-sm font-medium transition-all resize-none"
                />
              </div>

              {/* Suggestion Chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setCustomPrompt("Generate Zelle refund pattern: 6 transfers of exactly $125.00 back to merchant handles tagged as Refund.")}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 active:scale-95 text-xs font-bold text-slate-700 rounded-full transition"
                >
                  Create Zelle refund pattern
                </button>
                <button
                  type="button"
                  onClick={() => setCustomPrompt("Generate a high-volume Venmo history: 15 micro splits under $30 with completed status and restaurant memos.")}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 active:scale-95 text-xs font-bold text-slate-700 rounded-full transition"
                >
                  Build a high-volume Venmo history
                </button>
                <button
                  type="button"
                  onClick={() => setCustomPrompt("Generate Failures: Mock 5 Cash App transfers that failed to resolve with compliance alerts inside memo.")}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 active:scale-95 text-xs font-bold text-slate-700 rounded-full transition"
                >
                  Mock 5 Cash App failures
                </button>
              </div>

              {/* Submission Button aligned to right */}
              <div className="flex justify-end pt-2 border-t border-slate-150/40">
                <button
                  type="button"
                  disabled={!customPrompt.trim()}
                  onClick={() => handleGenerate(customPrompt)}
                  className={`px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 tracking-wide transition shadow-md active:scale-95 ${
                    customPrompt.trim()
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100 cursor-pointer'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm font-bold animate-pulse">auto_awesome</span>
                  Generate Simulation
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Recent Scenarios Container Grid */}
        <div className="mt-2 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
            <span className="material-symbols-outlined text-slate-400 text-lg">folder_open</span>
            Recent Scenarios
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Card 1: Payroll Surge */}
            <div 
              onClick={() => {
                const p = "Generate 24 ACH Bank Transfer payroll salary distributions from Apex Corp ranging from $1,200 to $4,500 all marked as Completed to show a heavy payroll load spike.";
                setCustomPrompt(p);
                handleGenerate(p);
              }}
              className="bg-white border border-slate-150/80 hover:border-blue-300 hover:shadow-md cursor-pointer transition p-4 rounded-xl flex items-center gap-4 group relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">receipt_long</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs text-slate-950 truncate group-hover:text-blue-600 transition">Payroll Surge (Apex Corp)</p>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-wide">24 transactions • 2m ago</p>
              </div>
              <span className="material-symbols-outlined text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all text-lg shrink-0">
                chevron_right
              </span>
            </div>

            {/* Card 2: High-risk Personas */}
            <div 
              onClick={() => {
                const p = "Generate 10 high-risk instant Venmo and Cash App payments from burner merchant names, marked failed or pending and tagged with severe chargeback issues.";
                setCustomPrompt(p);
                handleGenerate(p);
              }}
              className="bg-white border border-slate-150/80 hover:border-rose-300 hover:shadow-md cursor-pointer transition p-4 rounded-xl flex items-center gap-4 group relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">person_search</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs text-slate-950 truncate group-hover:text-amber-700 transition">High-risk Personas</p>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-wide">10 users • 1h ago</p>
              </div>
              <span className="material-symbols-outlined text-slate-300 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all text-lg shrink-0">
                chevron_right
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* Right Side Panel: AI Chat & Highlights (Right 4-cols) */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* Assistant Chat Component */}
        <div className="bg-white border border-slate-150 rounded-2xl shadow-lg shadow-slate-100 flex flex-col overflow-hidden min-h-[440px] max-h-[440px]">
          
          {/* Box Header */}
          <div className="p-4 border-b border-slate-100 flex items-center gap-2.5 bg-slate-50">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-sm font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                smart_toy
              </span>
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 block leading-tight">Assistant Chat</span>
              <span className="text-[10px] text-slate-400 font-bold block leading-none">Powered by Gemini 3.5</span>
            </div>
          </div>

          {/* Chat Bubble Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 no-scrollbar">
            {chatMessages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-black shrink-0 shadow-xs">
                    AI
                  </div>
                )}
                <div className={`p-3 rounded-xl text-xs font-semibold leading-relaxed shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span className={`block text-[8px] mt-1 text-right ${
                    msg.sender === 'user' ? 'text-blue-100' : 'text-slate-400'
                  }`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {/* Simulated typing status */}
            {chatLoading && (
              <div className="flex gap-2 max-w-[85%]">
                <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold shrink-0 animate-pulse">
                  AI
                </div>
                <div className="p-2.5 rounded-xl text-xs text-slate-400 bg-white border border-slate-100 rounded-tl-none flex items-center gap-1">
                  <span>Assistant is analyzing</span>
                  <span className="flex gap-0.5">
                    <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                  </span>
                </div>
              </div>
            )}
            
            <div ref={chatBottomRef} />
          </div>

          {/* Input field Footer */}
          <form onSubmit={handleSendChat} className="p-3 border-t border-slate-100 bg-white">
            <div className="relative">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about compliance or rails..."
                disabled={chatLoading}
                className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 pl-4 pr-10 outline-none text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 disabled:opacity-60 transition"
              />
              <button 
                type="submit" 
                disabled={!chatInput.trim() || chatLoading}
                className={`absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                  chatInput.trim() && !chatLoading
                    ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-90'
                    : 'text-slate-300'
                }`}
              >
                <span className="material-symbols-outlined text-sm font-bold">send</span>
              </button>
            </div>
          </form>

        </div>

        {/* Feature Highlight Card with Topographical Style Wave Image background */}
        <div className="relative rounded-2xl overflow-hidden group border border-slate-200 bg-slate-900 text-white shadow-md">
          <div className="h-44 relative overflow-hidden">
            <img 
              alt="Deep network flow streams illustration" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 select-none pointer-events-none opacity-85" 
              referrerPolicy="no-referrer"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDiQjk5Tz4bEgI8Ox1KpCqg7X2L2jb7b3qnJhOCA_90ZtKTzhEoDJgDBVNDLjRDwBi0TFVc4e0OhR0MYRzzqrp52hVNyi9Rvgw8pyBT9hTeZDUf6vPxPUWOrARXX7qWSIeDqp-pmx3DLK6LvP6NF2mje1olwowf5TuUem6_v_VfRksk3nrnwDO-oiRAjOPXAj75LwBcVApQl0oukMQN1hqmFd_yoFmYQA6XAAM21rUkpoX--fYXjSfcb4RFAkHsK4BO10nsQjmWTGA" 
            />
            {/* Elegant overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-4 flex flex-col justify-end">
              <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide bg-blue-500 text-white w-max mb-1.5">
                Feature Update
              </span>
              <p className="text-white font-black text-sm tracking-tight leading-tight">New: Bulk Receipt Export</p>
              <p className="text-slate-300 font-medium text-[10px] mt-0.5 leading-snug">
                Generate up to 500 compliant PDF invoice templates in a single prompt for rapid system testing.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
