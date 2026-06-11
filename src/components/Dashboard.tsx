import React, { useState, useMemo } from 'react';
import { SimulatedTransaction, PaymentChannel, TransactionStatus } from '../types';
import { formatCurrency, formatDate } from '../utils';

interface DashboardProps {
  transactions: SimulatedTransaction[];
  onAddTrigger: () => void;
  onResetTrigger: () => void;
  onSelectTransactionReceipt: (tx: SimulatedTransaction) => void;
  currency?: string;
  businessName?: string;
}

export default function Dashboard({ 
  transactions, 
  onAddTrigger, 
  onResetTrigger,
  onSelectTransactionReceipt,
  currency = 'USD',
  businessName = 'Fintech Transaction Sandbox'
}: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<PaymentChannel | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<TransactionStatus | 'All'>('All');
  const [activeTx, setActiveTx] = useState<SimulatedTransaction | null>(null);
  const [flaggedFraudIds, setFlaggedFraudIds] = useState<string[]>([]);
  const [viewingMockEmail, setViewingMockEmail] = useState(false);

  // Derived Account Balances (accumulates simulated transactions dynamically onto a base)
  const balances = useMemo(() => {
    let checking = 685420.00;
    let zelle = 54120.00;
    let cashApp = 75540.00;
    let venmo = 86750.00;

    transactions.forEach(tx => {
      if (tx.status === 'Completed') {
        if (tx.channel === 'Bank Transfer') checking += tx.amount;
        else if (tx.channel === 'Zelle') zelle += tx.amount;
        else if (tx.channel === 'Cash App') cashApp += tx.amount;
        else if (tx.channel === 'Venmo') venmo += tx.amount;
      }
    });

    return { checking, zelle, cashApp, venmo };
  }, [transactions]);

  // General statistics
  const metrics = useMemo(() => {
    const totalTransactions = transactions.length;
    const completedTransactions = transactions.filter(t => t.status === 'Completed');
    const totalVolume = transactions.reduce((acc, t) => acc + Math.abs(t.amount), 0);
    const successRate = totalTransactions > 0 
      ? Math.round((completedTransactions.length / totalTransactions) * 100) 
      : 100;

    return {
      simulationCount: totalTransactions,
      totalVolume,
      successRate
    };
  }, [transactions]);

  // Filters transaction logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchSearch = 
        tx.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.receiver.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.note && tx.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
        tx.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchChannel = selectedChannel === 'All' || tx.channel === selectedChannel;
      const matchStatus = selectedStatus === 'All' || tx.status === selectedStatus;

      return matchSearch && matchChannel && matchStatus;
    });
  }, [transactions, searchTerm, selectedChannel, selectedStatus]);

  // Chart Coordinates calculation for premium custom SVG rendering
  const chartDataPoints = useMemo(() => {
    // Collect last 7 transactions or group values
    const dataPoints = transactions.slice(0, 10).reverse();
    if (dataPoints.length === 0) return [];
    
    // Normalize into coordinates [0-100] for representation
    const maxAmount = Math.max(...dataPoints.map(d => Math.abs(d.amount)), 50);
    const minAmount = Math.min(...dataPoints.map(d => Math.abs(d.amount)), 0);
    const range = maxAmount - minAmount || 1;

    return dataPoints.map((d, index) => {
      const x = (index / (dataPoints.length - 1 || 1)) * 100;
      const y = 90 - ((Math.abs(d.amount) - minAmount) / range) * 70; // Map between 20 and 90
      return { x, y, amt: Math.abs(d.amount), channel: d.channel, id: d.id };
    });
  }, [transactions]);

  const svgPath = useMemo(() => {
    if (chartDataPoints.length === 0) return '';
    return chartDataPoints.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');
  }, [chartDataPoints]);

  const svgAreaPath = useMemo(() => {
    if (chartDataPoints.length === 0) return '';
    const points = chartDataPoints.map(p => `${p.x} ${p.y}`).join(' L ');
    const first = chartDataPoints[0];
    const last = chartDataPoints[chartDataPoints.length - 1];
    return `M ${first.x} 100 L ${points} L ${last.x} 100 Z`;
  }, [chartDataPoints]);

  return (
    <div id="dashboard-view" className="space-y-8 animate-fade-in">
      
      {/* Simulation Headline Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{businessName}</h1>
          <p className="text-slate-500 text-sm">Send money to any recipient and instantly compile high-fidelity transaction receipts.</p>
        </div>
        <div className="flex gap-2">
          <button 
            id="reset-ledger-btn"
            onClick={onResetTrigger}
            className="px-4 py-2 text-sm font-medium border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition rounded-xl flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-lg">restart_alt</span>
            Reset Sandbox
          </button>
          <button 
            id="create-sim-btn"
            onClick={onAddTrigger}
            className="px-5 py-2.5 text-sm font-bold bg-[#00D632] hover:bg-[#00D633]/90 text-white rounded-xl transition flex items-center gap-2 shadow-sm shadow-green-100 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg font-black">send_money</span>
            Send Money
          </button>
        </div>
      </div>

      {/* Account Balances Widget Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Checking Balance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between hover:border-blue-100 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-xs font-semibold tracking-wide uppercase font-sans">Checking Balance</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg font-bold">account_balance</span>
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-950 leading-tight tracking-tight">{formatCurrency(balances.checking, currency)}</h3>
            <p className="text-[11px] text-slate-400 mt-1 uppercase font-semibold">Bank Transfers Simulation</p>
          </div>
        </div>

        {/* Zelle Balance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between hover:border-purple-100 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-xs font-semibold tracking-wide uppercase font-sans">Zelle Balance</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg font-bold">bolt</span>
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-950 leading-tight tracking-tight">{formatCurrency(balances.zelle, currency)}</h3>
            <p className="text-[11px] text-slate-400 mt-1 uppercase font-semibold">Instant P2P Rail</p>
          </div>
        </div>

        {/* Cash App Balance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between hover:border-emerald-100 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-xs font-semibold tracking-wide uppercase font-sans">Cash App Balance</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg font-bold">attach_money</span>
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-950 leading-tight tracking-tight">{formatCurrency(balances.cashApp, currency)}</h3>
            <p className="text-[11px] text-slate-400 mt-1 uppercase font-semibold">Mobile Wallet Assets</p>
          </div>
        </div>

        {/* Venmo Balance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between hover:border-sky-100 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-xs font-semibold tracking-wide uppercase font-sans">Venmo Balance</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">V</div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-950 leading-tight tracking-tight">{formatCurrency(balances.venmo, currency)}</h3>
            <p className="text-[11px] text-slate-400 mt-1 uppercase font-semibold">Social Feed Mock Flows</p>
          </div>
        </div>

      </div>

      {/* Main Graph & Core Performance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Custom Visual Interactive Area Chart card (recharts standard svg-drawn mockup) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Simulation Heat Metrics</h3>
              <p className="text-slate-400 text-xs">Dynamic transaction sizes plotting last completed actions</p>
            </div>
            <span className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full border border-blue-100">
              Live Interactive Feed
            </span>
          </div>

          <div className="relative h-48 w-full mt-2">
            {chartDataPoints.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 text-xs">
                <span className="material-symbols-outlined text-4xl mb-1">query_stats</span>
                No simulated points to plot
              </div>
            ) : (
              <>
                {/* SVG Curve Graphics */}
                <svg className="h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity="0.00" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="100" y2="20" stroke="#f1f5f9" strokeWidth="0.5" />
                  <line x1="0" y1="55" x2="100" y2="55" stroke="#f1f5f9" strokeWidth="0.5" />
                  <line x1="0" y1="90" x2="100" y2="90" stroke="#f1f5f9" strokeWidth="0.5" />

                  {/* Area Fill */}
                  <path d={svgAreaPath} fill="url(#chart-fill)" />

                  {/* Main Stroke */}
                  <path d={svgPath} fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />

                  {/* Dot Highlights */}
                  {chartDataPoints.map((p, i) => (
                    <g key={i} className="group/dot cursor-pointer">
                      <circle cx={p.x} cy={p.y} r="3" fill="#ffffff" stroke="#2563eb" strokeWidth="1.5" />
                      <circle cx={p.x} cy={p.y} r="5" fill="#2563eb" opacity="0" className="transition group-hover/dot:opacity-20" />
                    </g>
                  ))}
                </svg>

                {/* X-axis custom tags */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 text-[9px] text-slate-400 font-medium">
                  <span>Earliest Sim</span>
                  <span>Active Ledger Range</span>
                  <span>Latest Sim</span>
                </div>
              </>
            )}
          </div>

          {/* Quick tips */}
          <div className="flex gap-4 border-t border-slate-50 pt-4 mt-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 block"></span>
              Outbound / Inbound Volumes
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200 block"></span>
              Real-time calculations
            </span>
          </div>
        </div>

        {/* Dynamic Sandbox Metrics Side panel */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/15">
              <h3 className="font-semibold text-sm">Active Session Specs</h3>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Demo Sandbox</span>
            </div>

            <div className="space-y-4 mt-6">
              
              {/* Simulation count */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Total Simulation Count</span>
                <span className="font-mono text-sm font-bold bg-white/10 px-2 py-0.5 rounded text-slate-200">{metrics.simulationCount} items</span>
              </div>

              {/* Total volume */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Aesthetic Outflow Volume</span>
                <span className="font-mono text-sm font-bold text-slate-100">{formatCurrency(metrics.totalVolume, currency)}</span>
              </div>

              {/* Success rate */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Expected Success Rate</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-500 h-full" style={{ width: `${metrics.successRate}%` }}></div>
                  </div>
                  <span className="font-mono text-xs font-bold text-blue-400">{metrics.successRate}%</span>
                </div>
              </div>

              {/* API Status */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Sim Client Handshake</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                  OPERATIONAL
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-3 rounded-xl mt-6">
            <p className="text-[11px] text-slate-400 leading-normal">
              <strong>Compliance Check:</strong> Action watermarks are irreversibly burnt onto generated receipts and ledger templates.
            </p>
          </div>
        </div>

      </div>

      {/* Ledger DataTable Controls */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        
        {/* Filter bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-slate-50/50">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <span className="material-symbols-outlined text-slate-400 text-lg absolute left-3 top-1/2 -translate-y-1/2">
              search
            </span>
            <input 
              type="text"
              placeholder="Search sender, receiver, memo or simulation ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full text-sm bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl transition"
            />
          </div>

          {/* Custom Select Channels filters */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Direct selector triggers */}
            <div className="flex p-0.5 bg-slate-100 rounded-lg overflow-x-auto text-[11px] font-semibold text-slate-500 max-w-full">
              {(['All', 'Zelle', 'Venmo', 'Cash App', 'Bank Transfer'] as const).map(ch => (
                <button
                  key={ch}
                  onClick={() => setSelectedChannel(ch)}
                  className={`px-3 py-1.5 rounded-md transition whitespace-nowrap ${
                    selectedChannel === ch 
                      ? 'bg-white text-slate-950 shadow-xs' 
                      : 'hover:text-slate-900'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>

            {/* Status Selector */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="text-xs bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-600 focus:border-blue-500 outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>

          </div>

        </div>

        {/* DataTable Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-3.5">Reference ID</th>
                <th className="px-6 py-3.5">Channel</th>
                <th className="px-6 py-3.5">Payer Context</th>
                <th className="px-6 py-3.5">Receiver</th>
                <th className="px-6 py-3.5">Custom Note</th>
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-6 py-3.5 text-right">Amount</th>
                <th className="px-6 py-3.5 text-right">Aesthetic Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-400">
                    <div className="max-w-md mx-auto space-y-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                        <span className="material-symbols-outlined text-3xl">receipt_long</span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-900">No Active Transactions Yet</h4>
                        <p className="text-xs text-slate-400 leading-normal max-w-xs mx-auto">
                          Send money to a recipient to instantly log a payment and automatically generate its high-fidelity receipt.
                        </p>
                      </div>
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={onAddTrigger}
                          className="px-4 py-2 text-xs font-bold bg-[#00D632] hover:bg-[#00D632]/90 text-white rounded-xl transition shadow-md shadow-green-100 cursor-pointer"
                        >
                          Send Money now
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isFlagged = flaggedFraudIds.includes(tx.id);
                  return (
                    <tr 
                      key={tx.id} 
                      onClick={() => setActiveTx(tx)}
                      className={`cursor-pointer transition border-b border-slate-100 ${
                        isFlagged 
                          ? 'bg-rose-50/50 hover:bg-rose-100/70 border-l-4 border-l-rose-500' 
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* ID */}
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900 border-none flex items-center gap-1.5 h-full">
                        {isFlagged && (
                          <span className="material-symbols-outlined text-rose-600 text-sm font-bold animate-pulse" title="High-Risk Fraud Flagged">
                            warning
                          </span>
                        )}
                        {tx.id}
                      </td>
                      
                      {/* Channel badge */}
                      <td className="px-6 py-4 whitespace-nowrap border-none">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          tx.channel === 'Zelle' 
                            ? 'bg-purple-50 text-purple-700' 
                            : tx.channel === 'Venmo'
                            ? 'bg-sky-50 text-sky-700'
                            : tx.channel === 'Cash App'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}>
                          {tx.channel}
                        </span>
                      </td>

                      {/* Sender */}
                      <td className="px-6 py-4 text-slate-800 font-medium border-none">{tx.sender}</td>

                      {/* Receiver */}
                      <td className="px-6 py-4 text-slate-800 font-medium border-none">{tx.receiver}</td>

                      {/* Note memo */}
                      <td className="px-6 py-4 text-slate-500 text-xs italic max-w-xs truncate border-none">
                        {tx.note || 'No memo specified'}
                      </td>

                      {/* Timestamp */}
                      <td className="px-6 py-4 text-slate-400 text-xs border-none">{formatDate(tx.timestamp)}</td>

                      {/* Amount */}
                      <td className={`px-6 py-4 text-right font-semibold font-mono border-none ${
                        tx.amount < 0 ? 'text-rose-600' : 'text-emerald-600'
                      }`}>
                        {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount, currency)}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-right border-none">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : tx.status === 'Pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Counter Summary */}
        <div className="p-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400 font-medium tracking-tight bg-slate-50/20">
          <span>Showing {filteredTransactions.length} of {transactions.length} total active simulated events</span>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">Verified Cache Mode</span>
        </div>

      </div>

      {/* Transaction Inspection Slide-over Drawer Pane */}
      {activeTx && (() => {
        const isFlagged = flaggedFraudIds.includes(activeTx.id);
        const getInitials = (name: string) => {
          return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        };
        const mockAuthHash = `0x${activeTx.id.toLowerCase().replace(/[^a-f0-9]/g, '').slice(0, 5) || '92f'}...a12`;
        const mockLatency = (activeTx.id.charCodeAt(3) || 120) % 80 + 80;

        return (
          <div className="fixed inset-0 z-[120] flex justify-end bg-slate-950/40 backdrop-blur-xs transition">
            
            {/* Backdrop closer area */}
            <div className="absolute inset-x-0 inset-y-0" onClick={() => { setActiveTx(null); setViewingMockEmail(false); }}></div>

            {/* Core Panel Content */}
            <div className={`relative bg-white w-full max-w-md h-full shadow-2xl overflow-y-auto flex flex-col justify-between py-6 px-6 slide-over-panel ${
              isFlagged ? 'border-l-4 border-rose-500' : ''
            }`}>
              
              {/* Drawer Header */}
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-950">Transaction Details</h3>
                    <p className="font-mono text-xs font-bold text-blue-600 block mt-1">{activeTx.id}</p>
                  </div>
                  <button 
                    onClick={() => { setActiveTx(null); setViewingMockEmail(false); }}
                    className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {/* Status Highlight Card */}
                <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-between mt-4">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">CURRENT STATUS</span>
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      activeTx.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : activeTx.status === 'Pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {activeTx.status === 'Completed' ? 'SUCCESS' : activeTx.status === 'Pending' ? 'PENDING' : 'FAILED'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-1">Simulated Event</span>
                    <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter col-span-1">
                      Mock Environment
                    </span>
                  </div>
                </div>

                {/* Main Metric representation */}
                <div className="grid grid-cols-2 gap-4 py-6 border-b border-dashed border-slate-100">
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Amount</span>
                      <h1 className={`text-2xl font-black font-mono tracking-tight ${
                        activeTx.amount < 0 ? 'text-rose-600' : 'text-emerald-600'
                      }`}>
                        {activeTx.amount > 0 ? '+' : ''}{formatCurrency(activeTx.amount, currency)}
                      </h1>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Date &amp; Time</span>
                      <p className="text-xs font-semibold text-slate-800">{formatDate(activeTx.timestamp)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Payment Channel</span>
                      <p className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-xs text-slate-400">payments</span>
                        {activeTx.channel}
                      </p>
                    </div>
                  </div>

                  {/* Network Verification Box */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col justify-between">
                    <div className="border-b border-slate-200/50 pb-2 mb-2">
                      <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Network Verification</span>
                    </div>
                    <div className="space-y-1.5 text-[11px] font-medium text-slate-600">
                      <div className="flex justify-between">
                        <span>Latency</span>
                        <span className="font-mono text-slate-800">{mockLatency}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Auth Hash</span>
                        <span className="font-mono text-slate-800/80 truncate w-20 text-right" title={activeTx.id}>{mockAuthHash}</span>
                      </div>
                      <div className="flex justify-between items-center gap-1">
                        <span>ISO 20022</span>
                        <span className="material-symbols-outlined text-emerald-500 text-sm font-bold">check_circle</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fraud flag banner inside details panel if flagged */}
                {isFlagged && (
                  <div className="my-3 px-4 py-2.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl flex items-center gap-2 font-semibold">
                    <span className="material-symbols-outlined text-rose-600">report</span>
                    <span>This simulation event is flagged for anomalous high-risk fraud compliance inspection.</span>
                  </div>
                )}

                {/* Sender/Receiver Details with Circle Initial Avatars and Track */}
                <div className="py-6 space-y-4 border-b border-slate-100">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-705 font-bold flex items-center justify-center text-xs shadow-xs">
                      {getInitials(activeTx.sender)}
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Sender Details</span>
                      <p className="text-xs font-bold text-slate-800">{activeTx.sender}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">ACC: **** 4492 • Routing: 021000021</p>
                    </div>
                  </div>
                  
                  {/* Decorative bridge vector line */}
                  <div className="flex items-center gap-4 pl-4 py-0.5">
                    <div className="h-6 w-px bg-slate-200"></div>
                    <span className="material-symbols-outlined text-slate-300 text-xs">arrow_downward</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-xs shadow-xs">
                      {getInitials(activeTx.receiver)}
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Receiver Details</span>
                      <p className="text-xs font-bold text-slate-800">{activeTx.receiver}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">ID: PAY_HANDLE_009 • Verified Merchant</p>
                    </div>
                  </div>
                </div>

                {/* Topographical Map image as preview */}
                <div className="my-6">
                  <div className="rounded-xl overflow-hidden h-28 relative group border border-slate-100 shadow-xs">
                    <img 
                      alt="Topographical city map rendering" 
                      className="w-full h-full object-cover select-none pointer-events-none" 
                      referrerPolicy="no-referrer"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQic8LVXwerbLmL1bcliTtQjfTVMLtJt4elksb7mYSW0Ao7yEd547PSRSHs1Fv1Dz32dKlpfGwK7pJo_zCH019K_jB91OyKcNDeQ6C8kPYuwIF2FyNcn8H-UCNJ7xtRJ0RBwdMFSQvNZ8KMkF36b7tTRKXp_oxl0Rpn2k8AuDaFX8ttVbSqxKla6irzuqCZWNWKfEBHGSg8c6LXwZq8I6qO355VWC4sBH86dxyyrS-KbNk7Vtk3DixANyyeQM_6k4hgZn9f04PlrY" 
                    />
                    <div className="absolute inset-0 bg-slate-900/10 flex items-center justify-center">
                      <div className="bg-white/90 backdrop-blur-xs px-3 py-1 text-[10px] font-bold text-slate-800 rounded-lg shadow-sm">
                        Geolocation: San Francisco, CA
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email Notification Preview Section - Togglable */}
                <div className="border-t border-slate-100 pt-4">
                  <button 
                    onClick={() => setViewingMockEmail(!viewingMockEmail)}
                    className="w-full flex items-center justify-between text-left text-xs font-semibold text-slate-500 hover:text-slate-800 transition py-1.5"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-blue-600 text-sm">mail</span>
                      Alert Mail Delivery Preview ({activeTx.sender})
                    </span>
                    <span className="material-symbols-outlined text-sm font-bold">
                      {viewingMockEmail ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>

                  {viewingMockEmail && (
                    <div className="mt-3 border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white text-slate-800 text-xs animate-fade-in animate-duration-200">
                      <div className="bg-slate-900 text-white p-3 font-semibold flex items-center justify-between">
                        <span>PayFlow Simulation Engine</span>
                        <span className="text-[10px] text-amber-400 font-extrabold uppercase">Mock Alerts</span>
                      </div>
                      <div className="p-4 space-y-3">
                        <p className="font-bold">Heads up, {activeTx.receiver}!</p>
                        <p className="text-slate-500 leading-normal">
                          You received a simulated transaction transfer layout matching reference specification 
                          <strong className="text-slate-800"> {activeTx.id}</strong> on our 
                          <span className="text-blue-600 font-semibold"> {activeTx.channel} </span> rail setup.
                        </p>
                        <div className="bg-slate-50 p-3 rounded border border-slate-100 flex justify-between font-mono text-xs">
                          <span className="text-slate-400 font-semibold block">Total Transferred:</span>
                          <strong className={activeTx.amount < 0 ? 'text-rose-600' : 'text-emerald-600'}>
                            {formatCurrency(activeTx.amount, currency)}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Quick Actions at Footer */}
              <div className="border-t border-slate-100 pt-4 flex flex-col gap-2">
                <button 
                  onClick={() => {
                    onSelectTransactionReceipt(activeTx);
                    setActiveTx(null);
                    setViewingMockEmail(false);
                  }}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl text-center shadow-md shadow-blue-100 flex items-center justify-center gap-1.5 transition"
                >
                  <span className="material-symbols-outlined text-sm font-bold">receipt_long</span>
                  Compile Branded Receipt
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => {
                      setViewingMockEmail(!viewingMockEmail);
                    }}
                    className="py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
                  >
                    <span className="material-symbols-outlined text-sm">mail</span>
                    View Mock Email
                  </button>
                  <button 
                    onClick={() => {
                      if (isFlagged) {
                        setFlaggedFraudIds(prev => prev.filter(id => id !== activeTx.id));
                      } else {
                        setFlaggedFraudIds(prev => [...prev, activeTx.id]);
                      }
                    }}
                    className={`py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition ${
                      isFlagged
                        ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">flag</span>
                    {isFlagged ? 'Clear Fraud' : 'Flag Fraud'}
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
