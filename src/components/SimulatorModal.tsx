import React, { useState } from 'react';
import { PaymentChannel, TransactionStatus } from '../types';

interface SimulatorModalProps {
  onClose: () => void;
  onSubmit: (data: {
    amount: number;
    channel: PaymentChannel;
    sender: string;
    receiver: string;
    status: TransactionStatus;
    note: string;
  }) => Promise<void>;
}

export default function SimulatorModal({ onClose, onSubmit }: SimulatorModalProps) {
  const [direction, setDirection] = useState<'incoming' | 'outgoing'>('outgoing');
  const [channel, setChannel] = useState<PaymentChannel>('Zelle');
  const [amountInput, setAmountInput] = useState('');
  const [sender, setSender] = useState('Adewale Cole');
  const [receiver, setReceiver] = useState('Jessica Miller');
  const [status, setStatus] = useState<TransactionStatus>('Completed');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState('');

  // Dynamic helper links to verify handles in respective platforms
  const getCashAppUrl = () => {
    const clean = receiver.trim();
    if (!clean) return 'https://cash.app';
    const target = clean.startsWith('$') ? clean : `$${clean}`;
    return `https://cash.app/${encodeURIComponent(target)}`;
  };

  const getVenmoUrl = () => {
    const clean = receiver.trim();
    if (!clean) return 'https://venmo.com';
    const target = clean.startsWith('@') ? clean.slice(1) : clean;
    return `https://venmo.com/u/${encodeURIComponent(target)}`;
  };

  // Auto handle default name switches when user toggles flow direction
  const handleDirectionChange = (dir: 'incoming' | 'outgoing') => {
    setDirection(dir);
    if (dir === 'incoming') {
      setSender('Jessica Miller');
      setReceiver('Adewale Cole');
    } else {
      setSender('Adewale Cole');
      setReceiver('Coffee & Bytes Café');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    const parsedAmt = parseFloat(amountInput);
    if (isNaN(parsedAmt) || parsedAmt <= 0) {
      setErrorText('Please specify a positive amount greater than $0.00.');
      return;
    }

    if (!sender.trim() || !receiver.trim()) {
      setErrorText('Payer (Sender) and Receiver name cells are mandatory.');
      return;
    }

    // Amount sign depends strictly on direction
    const actualAmount = direction === 'outgoing' ? -parsedAmt : parsedAmt;

    try {
      setIsSubmitting(true);
      await onSubmit({
        amount: actualAmount,
        channel,
        sender: sender.trim(),
        receiver: receiver.trim(),
        status,
        note: note.trim()
      });
      onClose();
    } catch (err: any) {
      setErrorText(err.message || 'Simulation runtime error happened.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
      
      {/* Background closer */}
      <div className="absolute inset-x-0 inset-y-0" onClick={onClose}></div>
      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-scale-up">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-105 flex justify-between items-center bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-md font-bold">send_money</span>
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">Send Money &amp; Generate Receipt</h3>
              <p className="text-slate-400 text-[10px] mt-0.5">Enter direct payment details to compile your customized receipt.</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white transition flex items-center justify-center"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">

          {/* Error Message */}
          {errorText && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-100 animate-shake">
              <span className="material-symbols-outlined">error</span>
              {errorText}
            </div>
          )}

          {/* Quick Info text */}
          <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-3 text-[11px] text-blue-800 leading-normal">
            <strong>Easy Setup:</strong> Simply fill in the receiver details and amount below. The system will automatically create the transaction ledger entry and instantly boot up your high-fidelity receipt display canvas.
          </div>

          {/* Sender & Channel */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Sender */}
            <div className="space-y-1">
              <label htmlFor="sender-txt" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Payer Name (Sender)</label>
              <input
                id="sender-txt"
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                className="px-3.5 py-2 w-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-xs rounded-xl font-medium transition"
              />
            </div>

            {/* Payment Channel */}
            <div className="space-y-1">
              <label htmlFor="channel-sel" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Receipt Platform / Channel</label>
              <select
                id="channel-sel"
                value={channel}
                onChange={(e) => setChannel(e.target.value as PaymentChannel)}
                className="px-3 py-2 w-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-xs font-bold rounded-xl transition bg-white"
              >
                <option value="Cash App">Cash App ($cashtag)</option>
                <option value="Zelle">Zelle Clearance</option>
                <option value="Venmo">Venmo (@handle)</option>
                <option value="Bank Transfer">Bank Transfer (Invoice)</option>
              </select>
            </div>

          </div>

          {/* Recipient Details */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Receiver Name */}
            <div className="space-y-1">
              <label htmlFor="receiver-txt" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Receiver Name (Recipient)</label>
              <input
                id="receiver-txt"
                type="text"
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                placeholder="e.g. Wesley Jeffrey"
                className="px-3.5 py-2 w-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-xs font-semibold rounded-xl transition"
              />
            </div>

            {/* Simulated Direction or Automatic Output for amount sign helper */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Recipient Username or Handle</label>
              <input
                type="text"
                placeholder={channel === 'Cash App' ? 'e.g. $WesKing410' : channel === 'Venmo' ? 'e.g. @username' : 'e.g. receiver@email.com'}
                className="px-3.5 py-2 w-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-xs rounded-xl transition font-mono font-bold text-blue-700"
                onChange={(e) => {
                  // Prepopulate or sync handle directly if desired, but we can rely on standard receiver
                }}
              />
            </div>

          </div>

          <div className="grid grid-cols-2 gap-4">
            
            {/* Amount Input */}
            <div className="space-y-1">
              <label htmlFor="amount-val" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Payment Amount ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
                <input
                  id="amount-val"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="pl-7 pr-4 py-2 w-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-xs font-black rounded-xl transition text-slate-900"
                />
              </div>
            </div>

            {/* Status State */}
            <div className="space-y-1">
              <label htmlFor="status-sel" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Payment Status Marking</label>
              <select
                id="status-sel"
                value={status}
                onChange={(e) => setStatus(e.target.value as TransactionStatus)}
                className="px-3 py-2 w-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-xs font-bold bg-white rounded-xl transition"
              >
                <option value="Completed">Completed (Cleared/Paid)</option>
                <option value="Pending">Pending (Processing)</option>
                <option value="Failed">Failed (Declined)</option>
              </select>
            </div>

          </div>

          {/* Memo & Instruction */}
          <div className="space-y-1">
            <label htmlFor="note-txt" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Payment Memo / Purpose (Note)</label>
            <input
              id="note-txt"
              type="text"
              placeholder="e.g. Giveaway Cash"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="px-3.5 py-2 w-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-xs rounded-xl font-medium transition"
            />
          </div>

          {/* Quick Lookup Guide Block */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 select-none" id="verified-payment-lookup-guide">
            <div className="flex items-center gap-1.5 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[13px] text-blue-600">verified_user</span>
              <span>Platforms Verification Sandbox</span>
            </div>
            <p className="text-slate-500 text-[10px] leading-relaxed">
              Ensure receiver identity matches active registered profiles:
            </p>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <a 
                href={getCashAppUrl()}
                target="_blank" 
                rel="noopener noreferrer"
                className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200 hover:border-emerald-500 text-emerald-700 rounded-lg text-[9px] font-extrabold flex items-center gap-1 transition"
              >
                Cash App Search
              </a>
              <a 
                href={getVenmoUrl()}
                target="_blank" 
                rel="noopener noreferrer"
                className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-500 text-blue-700 rounded-lg text-[9px] font-extrabold flex items-center gap-1 transition"
              >
                Venmo Lookup
              </a>
              <a 
                href="https://www.zellepay.com/get-started" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-205 hover:border-violet-500 text-violet-700 rounded-lg text-[9px] font-extrabold flex items-center gap-1 transition"
              >
                Zelle Registry
              </a>
            </div>
          </div>

          {/* Modal Actions Footer */}
          <div className="border-t border-slate-100 pt-4 mt-2 flex justify-end gap-2 text-xs">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-slate-705 bg-slate-100 hover:bg-slate-200 font-semibold rounded-xl transition disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-slate-900 border border-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-200 border-t-transparent animate-spin inline-block"></span>
                  Building...
                </>
              ) : (
                <>Complete &amp; Generate Receipt</>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
