import React, { useState, useEffect } from 'react';
import { SimulatedTransaction, Receipt, ReceiptLineItem, TransactionStatus } from '../types';
import { createBrandedReceipt, formatCurrency } from '../utils';
import { toPng } from 'html-to-image';

interface ReceiptBuilderProps {
  transactions: SimulatedTransaction[];
  selectedTxFromDashboard: SimulatedTransaction | null;
  onReceiptCompiled: (newReceipt: Receipt) => void;
  receipts: Receipt[];
  userRole?: string;
  currentBalance?: number;
}

const LOGO_COLORS = ['blue', 'indigo', 'purple', 'emerald', 'amber', 'rose', 'slate'];

export default function ReceiptBuilder({ 
  transactions, 
  selectedTxFromDashboard,
  onReceiptCompiled,
  receipts,
  userRole,
  currentBalance
}: ReceiptBuilderProps) {
  const [associatedTxId, setAssociatedTxId] = useState('');
  const [merchantName, setMerchantName] = useState('Coffee & Bytes Café');
  const [lineItems, setLineItems] = useState<ReceiptLineItem[]>([
    { id: '1', item: 'Double Shot Organic Latte', price: 4.50 },
    { id: '2', item: 'Sourdough Avocado Bagel', price: 4.22 }
  ]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [taxPercent, setTaxPercent] = useState('0');
  const [logoColor, setLogoColor] = useState('blue');
  const [logoInitials, setLogoInitials] = useState('CB');
  const [isCompiling, setIsCompiling] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Sandbox Receipts Templates Custom State matching Image 1 & Image 2 (Cash App & Zelle)
  const [templateType, setTemplateType] = useState<'merchant' | 'cashapp' | 'cashapp_email' | 'zelle_sent' | 'zelle_email' | 'venmo' | 'venmo_email' | 'apple_pay' | 'apple_pay_email'>('merchant');
  const [receiverName, setReceiverName] = useState('Wesley Jeffrey');
  const [receiverHandle, setReceiverHandle] = useState('$WesKing410');
  const [memoNote, setMemoNote] = useState('Giveaway Cash');
  const [transferDateStr, setTransferDateStr] = useState('Today at 01:13 PM');
  const [receiptStatus, setReceiptStatus] = useState<TransactionStatus>('Completed');

  // Watch for transaction selections from Dashboard in parent
  useEffect(() => {
    if (selectedTxFromDashboard) {
      setAssociatedTxId(selectedTxFromDashboard.id);
      setMerchantName(selectedTxFromDashboard.sender);
      setLogoInitials(selectedTxFromDashboard.sender.substring(0, 2).toUpperCase());
      
      const amt = Math.abs(selectedTxFromDashboard.amount);
      setLineItems([
        { id: '1', item: selectedTxFromDashboard.note || 'Consulting Services', price: amt }
      ]);

      // Populating the mockup-specific fields
      setReceiverName(selectedTxFromDashboard.receiver || 'Wesley Jeffrey');
      setMemoNote(selectedTxFromDashboard.note || 'Giveaway Cash');
      setReceiptStatus(selectedTxFromDashboard.status || 'Completed');

      if (selectedTxFromDashboard.channel === 'Cash App') {
        setTemplateType('cashapp');
        const formattedHandle = selectedTxFromDashboard.receiver.startsWith('$') 
          ? selectedTxFromDashboard.receiver 
          : `$${selectedTxFromDashboard.receiver.replace(/\s+/g, '')}`;
        setReceiverHandle(formattedHandle);
      } else if (selectedTxFromDashboard.channel === 'Zelle') {
        setTemplateType('zelle_sent');
        setReceiverHandle(selectedTxFromDashboard.receiver);
      } else if (selectedTxFromDashboard.channel === 'Venmo') {
        setTemplateType('venmo');
        const formattedHandle = selectedTxFromDashboard.receiver.startsWith('@') 
          ? selectedTxFromDashboard.receiver 
          : `@${selectedTxFromDashboard.receiver.replace(/\s+/g, '')}`;
        setReceiverHandle(formattedHandle);
      } else if (selectedTxFromDashboard.channel === 'Apple Pay') {
        setTemplateType('apple_pay');
        setReceiverHandle(selectedTxFromDashboard.receiver);
      } else {
        setTemplateType('merchant');
        setReceiverHandle('');
      }

      if (selectedTxFromDashboard.timestamp) {
        try {
          const date = new Date(selectedTxFromDashboard.timestamp);
          const timeFormatted = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
          setTransferDateStr(`Today at ${timeFormatted}`);
        } catch (_) {
          setTransferDateStr('Today at 01:13 PM');
        }
      } else {
        setTransferDateStr('Today at 01:13 PM');
      }
    }
  }, [selectedTxFromDashboard]);

  // Handle transaction selector switch directly
  const handleTxAssociationChange = (id: string) => {
    setAssociatedTxId(id);
    const found = transactions.find(t => t.id === id);
    if (found) {
      setMerchantName(found.sender);
      setLogoInitials(found.sender.substring(0, 2).toUpperCase());
      const amt = Math.abs(found.amount);
      setLineItems([
        { id: '1', item: found.note || 'Consulting Services', price: amt }
      ]);

      // Populating custom fields
      setReceiverName(found.receiver || 'Wesley Jeffrey');
      setMemoNote(found.note || 'Giveaway Cash');
      setReceiptStatus(found.status || 'Completed');

      if (found.channel === 'Cash App') {
        setTemplateType('cashapp');
        const formattedHandle = found.receiver.startsWith('$') 
          ? found.receiver 
          : `$${found.receiver.replace(/\s+/g, '')}`;
        setReceiverHandle(formattedHandle);
      } else if (found.channel === 'Zelle') {
        setTemplateType('zelle_sent');
        setReceiverHandle(found.receiver);
      } else if (found.channel === 'Venmo') {
        setTemplateType('venmo');
        const formattedHandle = found.receiver.startsWith('@') 
          ? found.receiver 
          : `@${found.receiver.replace(/\s+/g, '')}`;
        setReceiverHandle(formattedHandle);
      } else if (found.channel === 'Apple Pay') {
        setTemplateType('apple_pay');
        setReceiverHandle(found.receiver);
      } else {
        setTemplateType('merchant');
        setReceiverHandle('');
      }

      if (found.timestamp) {
        try {
          const date = new Date(found.timestamp);
          const timeFormatted = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
          setTransferDateStr(`Today at ${timeFormatted}`);
        } catch (_) {
          setTransferDateStr('Today at 01:13 PM');
        }
      } else {
        setTransferDateStr('Today at 01:13 PM');
      }
    }
  };

  const handleAddItem = () => {
    if (!newItemName.trim() || !newItemPrice) return;
    const price = parseFloat(newItemPrice);
    if (isNaN(price) || price < 0) return;

    const newItem: ReceiptLineItem = {
      id: Math.random().toString(),
      item: newItemName.trim(),
      price
    };

    setLineItems([...lineItems, newItem]);
    setNewItemName('');
    setNewItemPrice('');
  };

  const handleRemoveItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const totals = React.useMemo(() => {
    const subtotal = lineItems.reduce((acc, curr) => acc + curr.price, 0);
    const taxRate = parseFloat(taxPercent) / 100 || 0;
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  }, [lineItems, taxPercent]);

  const handleCompileReceiptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== 'Lead Architect' && typeof currentBalance === 'number' && currentBalance <= 0) {
      setErrorMsg('insufficient funds receipt cannot be generated at this time');
      return;
    }
    if (!merchantName.trim()) {
      setErrorMsg('Merchant name cannot be empty.');
      return;
    }
    if (lineItems.length === 0) {
      setErrorMsg('Receipt must contain at least 1 line item.');
      return;
    }

    try {
      setIsCompiling(true);
      setErrorMsg('');
      setSuccessMsg('');

      const compiled = await createBrandedReceipt({
        transactionId: associatedTxId || null,
        merchantName: merchantName.trim(),
        lineItems,
        subtotal: totals.subtotal,
        taxAmount: totals.taxAmount,
        total: totals.total,
        logoColor,
        logoInitials: logoInitials.trim() || merchantName.substring(0, 2).toUpperCase()
      });

      onReceiptCompiled(compiled);
      setSuccessMsg(`✅ Custom Receipt Compiled successfully! ID: ${compiled.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Compiler failure.');
    } finally {
      setIsCompiling(false);
    }
  };

  const handlePrintReceipt = () => {
    if (userRole !== 'Lead Architect' && typeof currentBalance === 'number' && currentBalance <= 0) {
      setErrorMsg('insufficient funds receipt cannot be generated at this time');
      return;
    }
    window.print();
  };

  const handleDownloadHighResPNG = async () => {
    if (userRole !== 'Lead Architect' && typeof currentBalance === 'number' && currentBalance <= 0) {
      setErrorMsg('insufficient funds receipt cannot be generated at this time');
      return;
    }
    const node = document.getElementById('print-receipt-container');
    if (!node) {
      setErrorMsg('No receipt display canvas loaded to capture.');
      return;
    }
    try {
      setIsCompiling(true);
      setErrorMsg('');
      setSuccessMsg('');
      
      // Delay slightly to stabilize layout
      await new Promise(resolve => setTimeout(resolve, 250));

      // Capture at highly optimized scale to prevent blurriness entirely
      const dataUrl = await toPng(node, {
        pixelRatio: 4, // 400% scale for extreme non-blurry clarity
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          margin: '0',
          boxShadow: 'none',
        },
        backgroundColor: '#ffffff'
      });

      const link = document.createElement('a');
      link.download = `Receipt_${merchantName.trim().replace(/\s+/g, '_') || 'Simulated'}_HQ.png`;
      link.href = dataUrl;
      link.click();
      setSuccessMsg('✅ Ultra-HQ Crisp PNG Image downloaded successfully!');
    } catch (err: any) {
      console.error("Screenshot capture error: ", err);
      setErrorMsg(`Screenshot generation failure: ${err.message || 'Rendering fault.'}`);
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <div id="receipts-flow" className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
      
      {/* Receipts creator form section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-6">
        
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">Custom Branded Layout Compiler</h3>
          <p className="text-slate-400 dark:text-slate-450 text-xs">Simulate professional client invoices and transaction slips instantly.</p>
        </div>

        <form onSubmit={handleCompileReceiptSubmit} noValidate className="space-y-4 text-xs">
          
          {userRole !== 'Lead Architect' && typeof currentBalance === 'number' && currentBalance <= 0 && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/25 text-rose-700 dark:text-rose-400 rounded-xl font-bold border border-rose-250 dark:border-rose-900/40 flex flex-col items-center justify-center gap-2 text-center my-2">
              <span className="material-symbols-outlined text-4xl text-rose-600">block</span>
              <span className="text-sm font-extrabold uppercase tracking-widest text-rose-800 dark:text-rose-300">Account Depleted</span>
              <span className="text-xs font-bold leading-normal">
                insufficient funds receipt cannot be generated at this time
              </span>
            </div>
          )}
          
          {successMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/25 text-emerald-800 dark:text-emerald-400 rounded-xl font-semibold border border-emerald-100 dark:border-emerald-900/40 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">check_circle</span>
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/25 text-rose-700 dark:text-rose-400 rounded-xl font-semibold border border-rose-100 dark:border-rose-900/40 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {errorMsg}
            </div>
          )}

          {/* Associate Transaction Dropdown */}
          <div className="space-y-1">
            <label className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider block">Link simulated transaction (Optional)</label>
            <select
              value={associatedTxId}
              onChange={(e) => handleTxAssociationChange(e.target.value)}
              className="px-3 py-2 w-full border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl transition bg-white dark:bg-slate-950 text-slate-800 dark:text-white block"
            >
              <option key="no-link-req" value="">-- No Direct Link Required --</option>
              {transactions.map((t, idx) => (
                <option key={`tx-option-${t.id || idx}-${idx}`} value={t.id}>
                  {t.id} - {t.sender} Payout (${Math.abs(t.amount).toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            
            {/* Merchant Name */}
            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider block">Merchant Name</label>
              <input
                type="text"
                value={merchantName}
                onChange={(e) => {
                  setMerchantName(e.target.value);
                  setLogoInitials(e.target.value.substring(0, 2).toUpperCase());
                }}
                className="px-3 py-2 w-full border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl transition bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
              />
            </div>

            {/* Logo initials */}
            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider block">Logo Initials</label>
              <input
                type="text"
                maxLength={4}
                value={logoInitials}
                onChange={(e) => setLogoInitials(e.target.value)}
                placeholder="CB"
                className="px-3 py-2 w-full border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl transition bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
              />
            </div>

          </div>

          {/* Template Style Selector */}
          <div className="space-y-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl">
            <label className="text-slate-600 dark:text-slate-450 font-bold uppercase tracking-wider block">Receipt Display Canvas Style</label>
            <select
              value={templateType}
              onChange={(e) => setTemplateType(e.target.value as any)}
              className="px-3 py-2 w-full border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl transition bg-white dark:bg-slate-900 font-bold text-slate-705 dark:text-slate-200 cursor-pointer block"
            >
              <option value="merchant">Standard Invoice Receipt (Barcode)</option>
              <option value="cashapp">Cash App Receipt 1 (Standard App Slip)</option>
              <option value="cashapp_email">Cash App Receipt 2 (Email/Mail Notification)</option>
              <option value="zelle_sent">Zelle Receipt 1 (Normal Sent Slip App)</option>
              <option value="zelle_email">Zelle Receipt 2 (Email/Mail Notification)</option>
              <option value="venmo">Venmo Receipt 1 (Standard App Slip)</option>
              <option value="venmo_email">Venmo Receipt 2 (Email/Mail Notification)</option>
              <option value="apple_pay">Apple Pay Receipt 1 (iOS Apple Wallet)</option>
              <option value="apple_pay_email">Apple Pay Receipt 2 (Email Alert & Dispatch)</option>
            </select>
          </div>

          {/* Status Marking Selector */}
          <div className="space-y-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl">
            <label className="text-slate-600 dark:text-slate-450 font-bold uppercase tracking-wider block">Receipt Financial Status Marking</label>
            <select
              value={receiptStatus}
              onChange={(e) => setReceiptStatus(e.target.value as any)}
              className="px-3 py-2 w-full border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl transition bg-white dark:bg-slate-900 font-bold text-slate-705 dark:text-slate-200 cursor-pointer block"
            >
              <option value="Completed">Completed (Cleared/Settled/Paid)</option>
              <option value="Pending">Pending (Processing/On-Hold)</option>
              <option value="Failed">Failed (Declined/Void/Error)</option>
            </select>
          </div>

          {/* Conditional Input Fields for App transfer receipt styles */}
          {templateType !== 'merchant' && (
            <div className="border border-blue-100 dark:border-blue-900/40 bg-blue-50/20 dark:bg-blue-950/10 p-4 rounded-xl space-y-3">
              <span className="text-blue-700 dark:text-blue-400 font-bold uppercase tracking-wider block">Recipient Handle & Layout Detail overrides</span>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold block">Receiver Display Name</span>
                  <input
                    type="text"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    placeholder="e.g. Wesley Jeffrey"
                    className="px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none rounded-lg text-xs w-full"
                  />
                </div>
                
                <div className="space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold block">Receiver Handle / Address</span>
                  <input
                    type="text"
                    value={receiverHandle}
                    onChange={(e) => setReceiverHandle(e.target.value)}
                    placeholder={
                      templateType === 'cashapp' || templateType === 'cashapp_email' 
                        ? 'e.g. $WesKing410' 
                        : templateType === 'venmo' || templateType === 'venmo_email' 
                        ? 'e.g. @username' 
                        : templateType === 'apple_pay' || templateType === 'apple_pay_email'
                        ? 'e.g. +1 (555) 019-2834'
                        : 'e.g. receiver@email'
                    }
                    className="px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none rounded-lg text-xs w-full font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold block">Memo / Note / Purpose</span>
                  <input
                    type="text"
                    value={memoNote}
                    onChange={(e) => setMemoNote(e.target.value)}
                    placeholder="e.g. Giveaway Cash"
                    className="px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none rounded-lg text-xs w-full"
                  />
                </div>
                
                <div className="space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold block">Timestamp (Text representation)</span>
                  <input
                    type="text"
                    value={transferDateStr}
                    onChange={(e) => setTransferDateStr(e.target.value)}
                    placeholder="e.g. Today at 01:13 PM"
                    className="px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none rounded-lg text-xs w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Branding Selector */}
          <div className="space-y-1.5">
            <span className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider block">Interface Branding Shade</span>
            <div className="flex gap-2.5">
              {LOGO_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setLogoColor(color)}
                  className={`w-7 h-7 rounded-full border-2 transition ${
                    color === 'blue' ? 'bg-blue-600' :
                    color === 'indigo' ? 'bg-indigo-600' :
                    color === 'purple' ? 'bg-purple-600' :
                    color === 'emerald' ? 'bg-emerald-600' :
                    color === 'amber' ? 'bg-amber-500' :
                    color === 'rose' ? 'bg-rose-500' : 'bg-slate-700'
                  } ${logoColor === color ? 'border-amber-400 scale-110' : 'border-transparent hover:scale-105'}`}
                ></button>
              ))}
            </div>
          </div>

          {/* Line Items addition */}
          <div className="border border-slate-100 dark:border-slate-800 p-4 rounded-xl space-y-3 bg-slate-50/50 dark:bg-slate-950/20">
            <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">Receipt Items Ledger</span>
            
            {/* Items list current */}
            <div className="space-y-2">
              {lineItems.map(item => (
                <div key={item.id} className="flex justify-between items-center bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 shadow-3xs font-medium">
                  <div>
                    <span className="text-slate-800 dark:text-slate-200">{item.item}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-600 dark:text-slate-400">{formatCurrency(item.price)}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="w-5 h-5 text-slate-400 hover:text-rose-600 flex items-center justify-center transition"
                    >
                      <span className="material-symbols-outlined text-sm font-bold">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Inputs inline */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Item name description"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none rounded-lg text-xs flex-1"
              />
              <input
                type="text"
                inputMode="decimal"
                placeholder="$ Price"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                className="px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-950 dark:text-white focus:outline-none rounded-lg text-xs w-20 font-bold"
              />
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-bold rounded-lg border border-blue-100 dark:border-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-xs transition whitespace-nowrap"
              >
                Add Item
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            
            {/* Tax Rates */}
            <div className="space-y-1">
              <label className="text-slate-500 font-semibold uppercase tracking-wider block">Simulated Sales Tax Percent (%)</label>
              <input
                type="text"
                inputMode="decimal"
                value={taxPercent}
                onChange={(e) => setTaxPercent(e.target.value)}
                className="px-3 py-2 w-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl transition"
              />
            </div>

            {/* Compiled Counter */}
            <div className="space-y-1 flex flex-col justify-end">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Total Invoice Amount:</span>
              <span className="text-lg font-bold font-mono text-slate-900 leading-none pb-2">{formatCurrency(totals.total)}</span>
            </div>

          </div>

          {/* Form Actions */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2 pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isCompiling}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition text-center shadow-xs"
            >
              {isCompiling ? "Compiling..." : "Save Brand Receipt"}
            </button>
            <button
              type="button"
              onClick={handleDownloadHighResPNG}
              className="px-4 py-3 bg-slate-900 border border-slate-950 text-white hover:bg-slate-800 font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
              title="Download crystal-clear, non-blurry PNG screenshot"
            >
              <span className="material-symbols-outlined text-sm font-black">download</span>
              <span>Download HQ PNG</span>
            </button>
            <button
              type="button"
              onClick={handlePrintReceipt}
              className="px-4 py-3 border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl transition"
            >
              Print / PDF
            </button>
          </div>

        </form>

      </div>

      {/* Receipts Mockup Live view Section */}
      <div className="flex flex-col select-none">

        {/* The Receipt rendering Card */}
        <div id="print-receipt-container" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md max-w-sm mx-auto w-full relative overflow-hidden font-sans text-slate-800 text-xs text-left transition-all duration-300">

          {templateType === 'cashapp' && (
            <div className="flex flex-col py-2" id="cash-app-preview-card">
              
              {/* Green circular check icon / profile header */}
              <div className="flex flex-col items-center justify-center text-center pb-5 pt-2 border-b border-slate-100">
                <div className="w-16 h-16 bg-[#00D632] rounded-full flex items-center justify-center text-white mb-3 shadow-[0_4px_12px_rgba(0,214,50,0.15)] animate-scale-up">
                  <span className="material-symbols-outlined text-[32px] font-bold">check</span>
                </div>
                
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-[#00D633] uppercase tracking-widest font-sans block mb-1">Receipt Completed</span>
                  <h2 className="text-[20px] font-extrabold text-slate-900 tracking-tight leading-tight">{receiverName}</h2>
                  <p className="text-slate-400 font-bold text-[12px]">{receiverHandle}</p>
                </div>
              </div>

              {/* Grid with transaction properties */}
              <div className="py-5 space-y-3 text-[11px]">
                
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Receipt Amount</span>
                  <span className="text-base font-black text-slate-900 font-mono">
                    {formatCurrency(totals.total)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-t border-slate-100">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">For (Memo)</span>
                  <span className="font-semibold text-slate-800 text-[11px] max-w-[180px] text-right truncate">
                    {memoNote || 'Funds transfer'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-t border-slate-100">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Sender (Payer)</span>
                  <span className="font-semibold text-slate-800">
                    {merchantName || 'Sandbox Client'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-t border-slate-100">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Payment Method</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-[#00D632] font-black">lock_open</span>
                    Cash Account Balance
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-t border-slate-100">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Timestamp</span>
                  <span className="font-semibold text-slate-600">
                    {transferDateStr}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-t border-slate-100">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Identifier ID</span>
                  <span className="font-mono text-slate-800 font-bold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-150">
                    #{associatedTxId ? associatedTxId.toUpperCase() : "CASH-7D9A2V"}
                  </span>
                </div>

              </div>

              {/* Cash App Distinctive bottom graphic branding badge */}
              <div className="mt-4 pt-4 border-t border-dashed border-slate-100 flex items-center justify-center gap-1.5 text-[#00D632]">
                <span className="material-symbols-outlined text-sm font-black">payments</span>
                <span className="font-black text-[12px] tracking-tight">Cash App Official Receipt</span>
              </div>

            </div>
          )}

          {templateType === 'cashapp_email' && (
            <div className="flex flex-col space-y-4 font-sans animate-scale-up" id="cashapp-email-preview-card">
              
              {/* Institution Header simulation */}
              <div className="bg-[#093011] p-3 -mx-6 -mt-6 flex justify-between items-center text-white font-normal text-xs uppercase tracking-wider relative">
                <div className="flex items-center gap-1.5">
                  <span className="bg-[#00D632] px-2 py-0.5 rounded font-black text-[10px] text-black tracking-normal leading-none font-sans">$</span>
                  <span className="font-bold text-[10px] tracking-tight text-white">cash app check-deposit</span>
                </div>
                <span className="text-[10px] font-extrabold text-[#00D632]">Cash® Active</span>
              </div>

              {/* Alert Message body */}
              <div className="pt-4 space-y-3">
                <h3 className="text-[#093011] font-bold text-[15px] leading-snug">
                  A new Cash App payment of {formatCurrency(totals.total)} is waiting in your account.
                </h3>
              </div>

              {/* Transaction details block */}
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 text-[11px] space-y-2 text-slate-600 font-sans">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Date:</span>
                  <span className="font-bold text-slate-705">{transferDateStr.replace('Today at ', '') || '11/05/2026'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">From Payer:</span>
                  <span className="font-bold text-slate-705">{merchantName || 'Sandbox Payer'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">To Recipient:</span>
                  <span className="font-bold text-slate-705">{receiverName || 'Wesley Jeffrey'}</span>
                </div>
                <div className="flex justify-between pb-0.5">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Deposit Code:</span>
                  <span className="font-mono font-bold text-slate-850 bg-slate-200/55 px-1.5 py-0.5 rounded">#{associatedTxId ? associatedTxId.toUpperCase() : 'CASH-9E2A8V'}</span>
                </div>
              </div>

              {/* Notice text */}
              <div className="text-[10px] text-slate-500 leading-normal space-y-3">
                <p>
                  You have received a payment of <strong className="text-rose-600">{formatCurrency(totals.total)} USD</strong> from a Cash App Corporate/Business Account.
                </p>
                <p className="text-slate-700 font-semibold leading-relaxed p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
                  To complete this transaction and receive the funds, please contact Cash App Support to increase your transaction limit.we encounter a little problem while trying to credit your Cash App account,with that amount because the status of your Cash App account is not a business user which makes your account have a limit and this amount seems to be above your limit.You have to take the urgent step to expand your account limit.
                </p>
              </div>

              {/* Need assistance helpline trigger */}
              <div className="border-t border-slate-100 pt-4 p-3 bg-emerald-50 rounded-xl text-emerald-950 font-bold text-[10px] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm font-bold text-emerald-700">help_outline</span>
                  <span>Need assistance with your limit?</span>
                </div>
                <span className="text-emerald-700 underline font-extrabold cursor-pointer hover:text-emerald-955 font-mono text-[10px]">+1 (470) 847-6743</span>
              </div>

              {/* Settlements Confirmed badge */}
              <div className="text-center text-[8px] font-bold tracking-wider uppercase rounded-lg">
                {receiptStatus === 'Completed' ? (
                  <div className="text-emerald-700 bg-emerald-50 border border-emerald-100 py-1.5 rounded-lg">
                    ✓ Balance Cleared by Cash App Business Verification
                  </div>
                ) : receiptStatus === 'Pending' ? (
                  <div className="text-amber-700 bg-amber-50 border border-amber-100 py-1.5 rounded-lg animate-pulse">
                    ⚠️ Deposit Held - Account Upgrade Required
                  </div>
                ) : (
                  <div className="text-rose-700 bg-rose-50 border border-rose-100 py-1.5 rounded-lg">
                    ✗ Deposit Failed - Verification Protocol Incomplete
                  </div>
                )}
              </div>

            </div>
          )}

          {templateType === 'zelle_sent' && (
            <div className="flex flex-col py-2 font-sans" id="zelle-sent-preview-card">
              
              {/* Institution Header bar */}
              <div className="flex flex-col items-center justify-center text-center pb-5 pt-2 border-b border-slate-100">
                <div className="w-14 h-14 bg-[#7C3AED] rounded-full flex items-center justify-center text-white mb-3 shadow-[0_4px_12px_rgba(124,58,237,0.15)] font-bold italic font-mono text-lg animate-scale-up">
                  zelle
                </div>
                
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-[#7C3AED] uppercase tracking-widest block mb-1">Transfer Sent Successfully</span>
                  <span className="text-[28px] font-black text-slate-900 tracking-tight block font-mono leading-none">
                    -{formatCurrency(totals.total)}
                  </span>
                  <p className="text-slate-500 font-medium text-[11px] pt-1">
                    Sent with Zelle® to <strong className="text-slate-800">{receiverName}</strong>
                  </p>
                </div>
              </div>

              {/* Properties list */}
              <div className="py-5 space-y-3 text-[11px]">
                
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Recipient Display</span>
                  <span className="font-extrabold text-slate-800">{receiverName}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-t border-slate-100">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Destination Address</span>
                  <span className="font-bold text-violet-700 font-mono text-[10px] bg-slate-50 border border-slate-150 px-1.5 py-0.5 rounded">
                    {receiverHandle || receiverName}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-t border-slate-100">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Memo Purpose</span>
                  <span className="font-semibold text-slate-800">
                    {memoNote || 'Giveaway Cash'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-t border-slate-100">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Sending Institution</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-700 block"></span>
                    Chase Bank / U.S. Bank Mobile App
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-t border-slate-100">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Transmission Date</span>
                  <span className="font-semibold text-slate-600">
                    {transferDateStr}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-t border-slate-100">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Confirmation Number</span>
                  <span className="font-mono text-violet-700 font-black text-[10.5px]">
                    ZLE-{associatedTxId ? associatedTxId.substring(0, 10).toUpperCase() : "USBO729N4B"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-t border-slate-100">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Status</span>
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-705 font-extrabold text-[9.5px] rounded-full border border-emerald-150 flex items-center gap-1 justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    DELIVERED / COMPLETED
                  </span>
                </div>

              </div>

              {/* Success guarantee mark */}
              <div className="bg-violet-50 text-[#7C3AED] rounded-xl p-3 text-[10px] leading-relaxed font-bold border border-violet-100 mt-1">
                Zelle® transfers are immediate with zero processing fees. Please keep this app confirmation sheet for your financial logs.
              </div>

            </div>
          )}

          {templateType === 'zelle_email' && (
            <div className="flex flex-col space-y-4 font-sans" id="zelle-preview-card">
              
              {/* Institution Header simulation matching screenshot */}
              <div className="bg-[#002f6c] p-3 -mx-6 -mt-6 flex justify-between items-center text-white font-normal text-xs uppercase tracking-wider relative">
                <div className="flex items-center gap-1.5">
                  <span className="bg-rose-600 px-1.5 py-0.5 rounded font-black text-[9px] text-white tracking-normal leading-none">US</span>
                  <span className="font-bold text-[10px] tracking-tight">u.s. bank</span>
                </div>
                <span className="text-[10px] font-extrabold text-[#7C3AED]">Zelle® Active</span>
              </div>

              {/* Alert Message body from Image 2 */}
              <div className="pt-4 space-y-3">
                <h3 className="text-[#002f6c] font-bold text-[15px] leading-snug">
                  A new Zelle® payment of {formatCurrency(totals.total)} in your account.
                </h3>
              </div>

              {/* Transaction details block */}
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 text-[11px] space-y-2 text-slate-600 font-sans">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Date:</span>
                  <span className="font-bold text-slate-705">{transferDateStr.replace('Today at ', '') || '11/05/2026'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">From Payer:</span>
                  <span className="font-bold text-slate-705">{merchantName || 'Sandbox Payer'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">To Recipient:</span>
                  <span className="font-bold text-slate-705">{receiverName || 'Wesley Jeffrey'}</span>
                </div>
                <div className="flex justify-between pb-0.5">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Confirmation code:</span>
                  <span className="font-mono font-bold text-violet-700">{associatedTxId || 'USBOJxzosY5S'}</span>
                </div>
              </div>

              {/* Notice text */}
              <div className="text-[10px] text-slate-500 leading-normal space-y-3">
                <p>
                  You have received a payment of <strong className="text-rose-600">{formatCurrency(totals.total)} USD</strong> from a Zelle Corporate/Business Account.
                </p>
                <p className="text-slate-700 font-semibold leading-relaxed p-3 bg-violet-50/50 rounded-xl border border-violet-100/50">
                  To complete this transaction and receive the funds, please contact Zelle Support to increase your transaction limit.we encounter a little problem while trying to credit your Zelle account,with that amount because the status of your Zelle account is not a business user which makes your account have a limit and this amount seems to be above your limit.You have to take the urgent step to expand your account limit.
                </p>
              </div>

              {/* Need assistance helpline trigger */}
              <div className="border-t border-slate-100 pt-4 p-3 bg-violet-50 rounded-xl text-violet-900 font-semibold text-[10px] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm font-bold text-violet-700">help_outline</span>
                  <span>Need assistance with your limit?</span>
                </div>
                <span className="text-violet-700 underline font-extrabold cursor-pointer hover:text-violet-900 font-mono text-[10px]">+1 (470) 847-6743</span>
              </div>

              {/* Settlements Confirmed badge */}
              <div className="text-center text-[8px] font-bold tracking-wider uppercase rounded-lg">
                {receiptStatus === 'Completed' ? (
                  <div className="text-emerald-700 bg-emerald-50 border border-emerald-100 py-1.5 rounded-lg">
                    ✓ Settle Clearance Confirmed by Zelle® Support
                  </div>
                ) : receiptStatus === 'Pending' ? (
                  <div className="text-amber-700 bg-amber-50 border border-amber-100 py-1.5 rounded-lg animate-pulse">
                    ⚠️ Settlement Processing - Held Under Clearing Limit
                  </div>
                ) : (
                  <div className="text-rose-700 bg-rose-50 border border-rose-100 py-1.5 rounded-lg">
                    ✗ Settlement Halted - Clearance Code Verification Required
                  </div>
                )}
              </div>

            </div>
          )}

          {templateType === 'venmo' && (
            <div className="flex flex-col space-y-4 font-sans animate-scale-up" id="venmo-preview-card">
              
              {/* iOS style Venmo Top Navigation Indicator */}
              <div className="flex justify-between items-center bg-[#008CFF] text-white p-3.5 -mx-6 -mt-6">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm font-bold">arrow_back</span>
                  <span className="font-extrabold text-[12px] tracking-tight">Transaction Details</span>
                </div>
                <span className="material-symbols-outlined text-sm font-bold">help</span>
              </div>

              {/* Main Avatar and Action Name */}
              <div className="flex flex-col items-center justify-center text-center pt-4 pb-2">
                <div className="w-14 h-14 rounded-full bg-[#008CFF]/10 text-[#008CFF] font-extrabold text-sm flex items-center justify-center relative mb-2.5 border-2 border-dashed border-[#008CFF]/30">
                  {receiverName.substring(0, 2).toUpperCase()}
                </div>
                
                <p className="text-slate-850 text-[12.5px] font-bold leading-normal">
                  You paid <strong>{receiverName}</strong>
                </p>
                <p className="text-[#008CFF] text-[10.5px] font-extrabold tracking-wide">{receiverHandle || '@username'}</p>
              </div>

              {/* Massive Bold Venmo Amount */}
              <div className="text-center py-1">
                <span className="text-[34px] font-black text-slate-900 tracking-tight leading-none font-sans">
                  -{formatCurrency(totals.total)}
                </span>
              </div>

              {/* Real speech bubble container for the memo */}
              <div className="relative bg-slate-50 rounded-2xl p-3 border border-slate-150 text-slate-700 text-xs leading-relaxed max-w-[280px] mx-auto text-left flex items-start gap-2">
                <span className="material-symbols-outlined text-[#008CFF] text-xs pt-0.5">chat_bubble</span>
                <p className="font-semibold text-slate-800 italic">"{memoNote || 'Consulting fees'}"</p>
              </div>

              {/* Transaction Key Details list */}
              <div className="bg-white border border-slate-150 rounded-2xl p-4 space-y-2.5 text-[11px] font-medium text-slate-600">
                
                <div className="flex justify-between items-center text-slate-750">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[8.5px]">Payment Status</span>
                  {receiptStatus === 'Completed' ? (
                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-150 px-2.5 py-0.5 rounded-full font-bold text-[9px] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
                      Completed
                    </span>
                  ) : receiptStatus === 'Pending' ? (
                    <span className="text-amber-700 bg-amber-50 border border-amber-150 px-2.5 py-0.5 rounded-full font-bold text-[9px] flex items-center gap-1 animate-pulse">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                      Pending Clear
                    </span>
                  ) : (
                    <span className="text-rose-700 bg-rose-50 border border-rose-150 px-2.5 py-0.5 rounded-full font-bold text-[9px] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                      Declined
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center border-t border-slate-100 pt-2 text-slate-755">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[8.5px]">Source Funding</span>
                  <span className="font-bold text-slate-800">Venmo Balance &amp; Card</span>
                </div>

                <div className="flex justify-between items-center border-t border-slate-100 pt-2 text-slate-755">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[8.5px]">Transaction Date</span>
                  <span className="font-bold text-slate-800">{transferDateStr}</span>
                </div>

                <div className="flex justify-between items-center border-t border-slate-100 pt-2 text-slate-755">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[8.5px]">Transmission ID</span>
                  <span className="font-mono text-slate-500 text-[10px]">
                    {associatedTxId ? `VENMO-${associatedTxId.slice(0, 10).toUpperCase()}` : "VENMO-9284N102"}
                  </span>
                </div>

              </div>

              {/* Small Venmo tagline */}
              <div className="text-center text-[9px] text-slate-400 font-bold tracking-wider uppercase pt-1">
                Venmo® Security Verified SSL
              </div>

            </div>
          )}

          {templateType === 'venmo_email' && (
            <div className="flex flex-col space-y-4 font-sans animate-scale-up" id="venmo-email-preview-card">
              
              {/* Institution Header simulation */}
              <div className="bg-[#002f6c] p-3 -mx-6 -mt-6 flex justify-between items-center text-white font-normal text-xs uppercase tracking-wider relative">
                <div className="flex items-center gap-1.5">
                  <span className="bg-[#008CFF] px-2 py-0.5 rounded font-black text-[9px] text-white tracking-normal leading-none font-sans">v</span>
                  <span className="font-bold text-[10px] tracking-tight text-white font-sans">venmo ledger desk</span>
                </div>
                <span className="text-[10px] font-extrabold text-[#008CFF]">Venmo® Active</span>
              </div>

              {/* Alert Message body */}
              <div className="pt-4 space-y-3">
                <h3 className="text-[#002f6c] font-bold text-[15px] leading-snug">
                  A new Venmo payment of {formatCurrency(totals.total)} has arrived.
                </h3>
              </div>

              {/* Transaction details block */}
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 text-[11px] space-y-2 text-slate-600 font-sans">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Date:</span>
                  <span className="font-bold text-slate-705">{transferDateStr.replace('Today at ', '') || '11/05/2026'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">From Payer:</span>
                  <span className="font-bold text-slate-705">{merchantName || 'Sandbox Payer'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">To Recipient:</span>
                  <span className="font-bold text-slate-705">{receiverName || 'Wesley Jeffrey'}</span>
                </div>
                <div className="flex justify-between pb-0.5">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Clearance code:</span>
                  <span className="font-mono font-bold text-[#008CFF]">{associatedTxId ? `VEN-${associatedTxId.toUpperCase()}` : 'VEN-BOJxzosY'}</span>
                </div>
              </div>

              {/* Notice text */}
              <div className="text-[10px] text-slate-500 leading-normal space-y-3">
                <p>
                  You have received a payment of <strong className="text-rose-600">{formatCurrency(totals.total)} USD</strong> from a Venmo Corporate/Business Account.
                </p>
                <p className="text-slate-700 font-semibold leading-relaxed p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                  To complete this transaction and receive the funds, please contact Venmo Support to increase your transaction limit.we encounter a little problem while trying to credit your Venmo account,with that amount because the status of your Venmo account is not a business user which makes your account have a limit and this amount seems to be above your limit.You have to take the urgent step to expand your account limit.
                </p>
              </div>

              {/* Need assistance helpline trigger */}
              <div className="border-t border-slate-100 pt-4 p-3 bg-blue-50 rounded-xl text-blue-950 font-bold text-[10px] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm font-bold text-[#008CFF]">help_outline</span>
                  <span>Need assistance with your limit?</span>
                </div>
                <span className="text-[#008CFF] underline font-extrabold cursor-pointer hover:text-[#002f6c] font-mono text-[10px]">+1 (470) 847-6743</span>
              </div>

              {/* Settlements Confirmed badge */}
              <div className="text-center text-[8px] font-bold tracking-wider uppercase rounded-lg">
                {receiptStatus === 'Completed' ? (
                  <div className="text-emerald-700 bg-emerald-50 border border-emerald-100 py-1.5 rounded-lg">
                    ✓ Balance Credited into Venmo Secured Account
                  </div>
                ) : receiptStatus === 'Pending' ? (
                  <div className="text-amber-700 bg-amber-50 border border-amber-100 py-1.5 rounded-lg animate-pulse">
                    ⚠️ Held Status - Pending Limit Upgrade Approval
                  </div>
                ) : (
                  <div className="text-rose-700 bg-rose-50 border border-rose-100 py-1.5 rounded-lg">
                    ✗ Settlement Failure - Merchant Code Decline
                  </div>
                )}
              </div>

            </div>
          )}

          {templateType === 'apple_pay' && (
            <div className="flex flex-col space-y-4 font-sans text-white bg-black -mx-6 -my-6 p-6 min-h-[460px] animate-scale-up border border-zinc-900 rounded-3xl" id="apple-pay-preview-card">
              
              {/* Done / Apple Wallet style header block */}
              <div className="flex justify-between items-center text-zinc-400 text-xs font-semibold pt-2">
                <span className="text-white text-[13px] tracking-tight font-extrabold flex items-center gap-1.5 font-sans">
                  <span className="cursor-pointer text-white font-black"></span> Pay
                </span>
                <span className="text-emerald-500 font-extrabold tracking-tight uppercase text-[9px] bg-emerald-950/45 px-2 py-0.5 rounded border border-emerald-500/20">
                  {receiptStatus === 'Completed' ? '✓ Paid' : receiptStatus === 'Pending' ? '◴ Pending' : '✗ Failed'}
                </span>
              </div>

              {/* Huge central check symbol / circle representation */}
              <div className="flex flex-col items-center justify-center pt-8 pb-4 space-y-2.5">
                <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-zinc-950 via-zinc-900 to-zinc-800 opacity-80" />
                  <span className="material-symbols-outlined text-4xl text-white font-black z-10">
                    {receiptStatus === 'Completed' ? 'check' : receiptStatus === 'Pending' ? 'schedule' : 'close'}
                  </span>
                </div>
                <div className="flex flex-col items-center flex-wrap whitespace-nowrap">
                  <span className="text-zinc-400 font-extrabold text-[10px] tracking-widest uppercase">
                    Apple Pay Transfer
                  </span>
                  <span className="text-white text-3xl font-black font-sans leading-none mt-2 tracking-tight">
                    {formatCurrency(totals.total)}
                  </span>
                </div>
              </div>

              {/* Sender & Receiver list */}
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 text-xs space-y-3">
                <div className="flex justify-between border-b border-zinc-800 pb-2.5">
                  <span className="text-zinc-500 font-semibold tracking-wide uppercase text-[8px]">Sender Payer</span>
                  <span className="font-bold text-white tracking-tight">{merchantName || 'Sandbox Sender'}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2.5">
                  <span className="text-zinc-500 font-semibold tracking-wide uppercase text-[8px]">Recipient Mobile (USA)</span>
                  <span className="font-bold text-white font-mono tracking-tight">{receiverHandle || '+1 (555) 019-2834'}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2.5">
                  <span className="text-zinc-500 font-semibold tracking-wide uppercase text-[8px]">Memo Detail</span>
                  <span className="font-semibold text-zinc-300 italic max-w-[150px] truncate block text-right">
                    {memoNote || 'No memo specified'}
                  </span>
                </div>
                <div className="flex justify-between pb-0.5">
                  <span className="text-zinc-500 font-semibold tracking-wide uppercase text-[8px]">Clearance reference</span>
                  <span className="font-mono font-bold text-zinc-200 text-[10px]">{associatedTxId ? `APL-${associatedTxId.toUpperCase()}` : 'APL-REXTZ'}</span>
                </div>
              </div>

              {/* Bottom security assurance block */}
              <div className="pt-4 flex flex-col items-center justify-center space-y-1 mt-auto">
                <p className="text-zinc-400 text-[9px] text-center max-w-[210px] uppercase font-bold tracking-wider leading-relaxed">
                   Wallet Security Cleared 
                </p>
                <span className="text-zinc-500 font-mono text-[8.5px] tracking-wider">
                  {transferDateStr}
                </span>
              </div>

            </div>
          )}

          {templateType === 'apple_pay_email' && (
            <div className="flex flex-col space-y-4 font-sans animate-scale-up" id="apple-pay-email-preview-card">
              
              {/* Institution Header simulation */}
              <div className="bg-[#f5f5f7] p-3 -mx-6 -mt-6 flex justify-between items-center text-slate-900 border-b border-slate-200">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xs text-black"> Pay Dispatch</span>
                </div>
                <span className="text-[9px] font-extrabold tracking-wider uppercase bg-slate-900 text-white px-2 py-0.5 rounded">
                  Secure Clearance
                </span>
              </div>

              {/* Alert Message body */}
              <div className="pt-4 space-y-3">
                <h3 className="text-black font-black text-[15px] leading-tight tracking-tight">
                  Your Apple Pay transfer of {formatCurrency(totals.total)} has cleared.
                </h3>
              </div>

              {/* Transaction details block */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-[11px] space-y-2 text-slate-600 font-sans">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Date:</span>
                  <span className="font-bold text-slate-705">{transferDateStr.replace('Today at ', '') || '11/05/2026'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Sender Payer:</span>
                  <span className="font-bold text-slate-705">{merchantName || 'Sandbox Payer'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">To USA Number:</span>
                  <span className="font-bold text-slate-705 font-mono">{receiverHandle || '+1 (555) 019-2834'}</span>
                </div>
                <div className="flex justify-between pb-0.5">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Apple Clearance:</span>
                  <span className="font-mono font-bold text-slate-800">{associatedTxId ? `APL-${associatedTxId.toUpperCase()}` : 'APL-AXZOYT'}</span>
                </div>
              </div>

              {/* Notice text */}
              <div className="text-[10px] text-slate-500 leading-normal space-y-3 font-sans">
                <p>
                  You have received an Apple Pay transfer of <strong className="text-slate-950 font-bold">{formatCurrency(totals.total)} USD</strong> directed to your verified USA mobile number.
                </p>
                <div className="text-slate-700 font-semibold leading-relaxed p-3.5 bg-zinc-50 rounded-xl border border-zinc-200">
                  <p className="text-rose-600 font-bold mb-1">⚠️ Limit Notice from Clearance Desk:</p>
                  <p className="text-[9.5px]">
                    To complete this transaction and receive the dispatch funds, please contact Apple Wallet Support to increase your transaction limit. we encounter a little problem while trying to credit your Apple Pay account,with that amount because the status of your Apple Pay account is not a business user which makes your account have a limit and this amount seems to be above your limit.You have to take the urgent step to expand your account limit.
                  </p>
                </div>
              </div>

              {/* Need assistance helpline trigger */}
              <div className="border border-slate-200 pt-3.5 pb-3.5 px-3 bg-[#f5f5f7] rounded-xl text-slate-900 font-bold text-[10.5px] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm font-bold text-zinc-650">contact_support</span>
                  <span>USA Apple Clearance Helpdesk:</span>
                </div>
                <span className="text-slate-950 underline font-extrabold cursor-pointer font-mono text-[10px]">+1 (470) 847-6743</span>
              </div>

              {/* Settlements Confirmed badge */}
              <div className="text-center text-[8px] font-bold tracking-wider uppercase rounded-lg">
                {receiptStatus === 'Completed' ? (
                  <div className="text-emerald-700 bg-emerald-50 border border-emerald-100 py-1.5 rounded-lg">
                    ✓ Balance Cleared by Apple Pay Dispatch Service
                  </div>
                ) : receiptStatus === 'Pending' ? (
                  <div className="text-amber-705 bg-amber-50 border border-amber-100 py-1.5 rounded-lg animate-pulse">
                    ⚠️ Held Status - Pending Verification Upgrade
                  </div>
                ) : (
                  <div className="text-rose-700 bg-rose-50 border border-rose-100 py-1.5 rounded-lg">
                    ✗ Apple Pay Limit Validation Reject
                  </div>
                )}
              </div>

            </div>
          )}

          {templateType === 'merchant' && (
            <>
              <div className="flex flex-col items-center justify-center text-center pb-6 border-b border-dashed border-slate-100">
                
                {/* Branded initial circle */}
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold mb-3 shadow-md ${
                  logoColor === 'indigo' ? 'bg-indigo-600' :
                  logoColor === 'purple' ? 'bg-purple-600' :
                  logoColor === 'emerald' ? 'bg-emerald-600' :
                  logoColor === 'amber' ? 'bg-amber-500' :
                  logoColor === 'rose' ? 'bg-rose-500' :
                  logoColor === 'slate' ? 'bg-slate-700' : 'bg-blue-600'
                }`}>
                  {logoInitials || "TX"}
                </div>

                <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">{merchantName || "Sandbox Merchant"}</h2>
                <p className="text-slate-400 text-[10px] mt-0.5 uppercase tracking-wide">
                  ID Linked: {associatedTxId || "Manual Entry"}
                </p>
              </div>

              {/* Core Table List */}
              <div className="py-6 space-y-4 font-medium border-b border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Acquisition Slips</span>
                
                <div className="space-y-2">
                  {lineItems.map((item, index) => (
                    <div key={item.id || index} className="flex justify-between items-center text-slate-800">
                      <span className="text-slate-600">{item.item}</span>
                      <span className="font-mono">{formatCurrency(item.price)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing computations */}
              <div className="py-4 space-y-2 text-right font-medium">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal Amount:</span>
                  <span className="font-mono">{formatCurrency(totals.subtotal)}</span>
                </div>
                
                <div className="flex justify-between text-slate-400">
                  <span>Tax ({taxPercent}%):</span>
                  <span className="font-mono">{formatCurrency(totals.taxAmount)}</span>
                </div>

                <div className="flex justify-between text-slate-900 font-bold border-t border-slate-100 pt-2 text-sm">
                  <span>Gross Total:</span>
                  <span className="font-mono text-blue-600">{formatCurrency(totals.total)}</span>
                </div>

              </div>

              {/* Mock Barcode decoration */}
              <div className="pt-6 flex flex-col items-center justify-center space-y-1.5 border-t border-dashed border-slate-100">
                
                {/* Bar lines */}
                <div className="flex gap-0.5 justify-center h-8 opacity-75">
                  {[2,4,1,3,2,5,1,4,3,2,1,4,2,3,4,1,5,3].map((w, index) => (
                    <span key={index} className="bg-slate-900" style={{ width: `${w}px` }}></span>
                  ))}
                </div>
                <span className="font-mono text-[9px] text-slate-400">TXN-{associatedTxId || "MANUAL-DRAFT"}</span>
              </div>

              {/* Under warning notices */}
              <div className="mt-6 text-center text-[8px] font-bold text-slate-500 tracking-wide uppercase border-t border-slate-100 pt-3">
                Thank you for your business!<br />
                Please keep this receipt for your records.
              </div>
            </>
          )}

        </div>

      </div>

    </div>
  );
}
