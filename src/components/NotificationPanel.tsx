import React, { useState, useMemo } from 'react';
import { SimulatedTransaction } from '../types';
import { formatCurrency, formatDate } from '../utils';

interface NotificationPanelProps {
  transactions: SimulatedTransaction[];
  currency?: string;
  businessName?: string;
  onAddTransaction?: (data: {
    amount: number;
    channel: any;
    sender: string;
    receiver: string;
    status: any;
    note: string;
  }) => Promise<void>;
}

interface NotificationItem {
  id: string;
  type: 'success' | 'info' | 'warning' | 'security';
  title: string;
  text: string;
  timeLabel: string;
  referenceId?: string;
  amount?: number;
  recipient?: string;
  channel?: string;
  unread: boolean;
}

export default function NotificationPanel({ 
  transactions, 
  currency = 'USD',
  businessName = 'PayFlow Demo',
  onAddTransaction
}: NotificationPanelProps) {
  // Pre-seed mock notifications from mockup specs
  const [staticNotifications, setStaticNotifications] = useState<NotificationItem[]>([
    {
      id: 'mock-1',
      type: 'success',
      title: 'Simulated Zelle Transfer',
      text: 'Simulated Zelle Transfer of $450.00 created successfully.',
      timeLabel: '2m ago',
      referenceId: 'ZEL-9283ADFF',
      amount: 450.00,
      recipient: 'Adewale Cole',
      channel: 'Zelle',
      unread: true
    },
    {
      id: 'mock-2',
      type: 'info',
      title: 'Receipt PDF Generated',
      text: 'Receipt PDF generated for Coffee & Bytes Café.',
      timeLabel: '1h ago',
      referenceId: 'REC-8F9D2E1A',
      amount: 8.72,
      recipient: 'Coffee & Bytes Café',
      channel: 'Zelle Receipt',
      unread: false
    },
    {
      id: 'mock-3',
      type: 'warning',
      title: 'Transaction Failed',
      text: 'Warning: Simulated transaction VEN-3A8F2B1D marked as Failed.',
      timeLabel: '1d ago',
      referenceId: 'VEN-3A8F2B1D',
      amount: -15.00,
      recipient: 'Adewale Cole',
      channel: 'Venmo Payout',
      unread: false
    },
    {
      id: 'mock-4',
      type: 'security',
      title: 'New Device Detected',
      text: 'A login was detected from a Chrome browser on a Windows device. Was this you?',
      timeLabel: 'Yesterday',
      referenceId: 'SEC-88421',
      unread: false
    }
  ]);

  // Track dismissals/deletions
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  
  // Track preference toggles
  const [showPrefModal, setShowPrefModal] = useState(false);
  const [configPrefs, setConfigPrefs] = useState({
    zelle: true,
    venmo: true,
    cashApp: true,
    bankTransfer: true,
    failAlerts: true,
    securityAlerts: true
  });

  // Track selected notification for Mock Email Previewer
  const [selectedNotifId, setSelectedNotifId] = useState<string>('mock-1');

  // Track active sub-tab (Alerts Feed vs Email Inbox Simulator)
  const [activeSubTab, setActiveSubTab] = useState<'alerts' | 'emails'>('alerts');
  
  // States for Email Simulation workspace
  const [emailBrand, setEmailBrand] = useState<'Cash App' | 'Zelle' | 'Venmo' | 'Apple Pay'>('Cash App');
  const [recipientName, setRecipientName] = useState('Wesley Jeffrey');
  const [holdAmount, setHoldAmount] = useState('750.00');
  const [expansionAmount, setExpansionAmount] = useState('150.00');
  const [isProcessingLimitPayment, setIsProcessingLimitPayment] = useState(false);
  const [limitPaymentSuccess, setLimitPaymentSuccess] = useState(false);
  const [successPaymentId, setSuccessPaymentId] = useState('');
  const [confirmInputAmt, setConfirmInputAmt] = useState('150.00');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [processingSteps, setProcessingSteps] = useState<string[]>([]);

  // Convert current simulated transactions to notifications for the unified feed
  const liveNotifs = useMemo(() => {
    return transactions.slice(0, 10).map((tx, idx) => {
      const type = tx.status === 'Completed' ? 'success' : tx.status === 'Pending' ? 'info' : 'warning';
      return {
        id: `live-${tx.id}`,
        type: type as any,
        title: `Simulated ${tx.channel} Transfer`,
        text: `Sent ${formatCurrency(Math.abs(tx.amount), currency)} from ${tx.sender} to ${tx.receiver}. Status: ${tx.status}`,
        timeLabel: idx === 0 ? 'Just now' : `${idx + 1}m ago`,
        referenceId: tx.id,
        amount: tx.amount,
        recipient: tx.receiver,
        channel: tx.channel,
        unread: idx === 0 // the newest one is unread
      } as NotificationItem;
    });
  }, [transactions, currency]);

  // Filter out dismissed notification items
  const allNotifications = useMemo(() => {
    const combined = [...liveNotifs, ...staticNotifications];
    return combined.filter(notif => !removedIds.includes(notif.id));
  }, [liveNotifs, staticNotifications, removedIds]);

  // Find the focused item for preview
  const activeFocusItem = useMemo(() => {
    return allNotifications.find(n => n.id === selectedNotifId) || allNotifications[0] || null;
  }, [allNotifications, selectedNotifId]);

  // Mark all as read
  const handleMarkAllRead = () => {
    setStaticNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    // Live items will be considered read
    setSelectedNotifId(allNotifications[0]?.id || '');
  };

  // Dismiss notification card
  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRemovedIds(prev => [...prev, id]);
    if (selectedNotifId === id) {
      const remaining = allNotifications.filter(n => n.id !== id);
      if (remaining.length > 0) {
        setSelectedNotifId(remaining[0].id);
      }
    }
  };

  // Trigger limit payment verification wizard
  const handleTriggerPaymentModal = () => {
    setConfirmInputAmt(expansionAmount);
    setPaymentError('');
    setIsProcessingLimitPayment(false);
    setLimitPaymentSuccess(false);
    setProcessingSteps([]);
    setShowPaymentModal(true);
  };

  // Submit and verify limit payment simulation
  const handleConfirmLimitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amtNum = parseFloat(confirmInputAmt);
    if (isNaN(amtNum) || amtNum <= 0) {
      setPaymentError('Please enter a valid positive numeric payment amount.');
      return;
    }

    setPaymentError('');
    setIsProcessingLimitPayment(true);
    setProcessingSteps(['Initializing secure TLS tunnel to clearing network...']);

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    try {
      await sleep(800);
      setProcessingSteps(prev => [...prev, 'Synthesizing compliance checksums...']);
      await sleep(800);
      setProcessingSteps(prev => [...prev, 'Logging security ledger validation block...']);
      await sleep(950);
      setProcessingSteps(prev => [...prev, `Resolving limit expansion clearing queue for ${recipientName}...`]);
      await sleep(900);

      // Submit actual Simulated Outflow Transaction
      if (onAddTransaction) {
        await onAddTransaction({
          amount: -amtNum,
          channel: emailBrand,
          sender: businessName,
          receiver: `${emailBrand} Support`,
          status: 'Completed',
          note: `${emailBrand} Limit Expansion Upgrade Fee Approved`
        });
      }

      const randId = `${emailBrand.toUpperCase().replace(/\s/g, '')}-LG-${Math.floor(100000 + Math.random() * 900000)}`;
      setSuccessPaymentId(randId);
      setLimitPaymentSuccess(true);
    } catch (err: any) {
      console.error(err);
      setPaymentError(err?.message || 'Verification routing failed or request timed out.');
    } finally {
      setIsProcessingLimitPayment(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10" id="notification-center-suite">
      
      {/* Tab Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-950 tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-2xl font-bold">
              notifications
            </span>
            Notification Panel
          </h2>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl font-medium leading-relaxed">
            Manage your simulation activity alerts, test email responders, and configure sandbox webhook notifications.
          </p>
        </div>
        
        <div className="flex items-center gap-2 select-none">
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-xs font-extrabold text-blue-600">done_all</span>
            Mark All as Read
          </button>
          
          <button
            onClick={() => setShowPrefModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-blue-100"
          >
            <span className="material-symbols-outlined text-xs font-bold">tune</span>
            Configure Preferences
          </button>
        </div>
      </div>

      {/* Sub-Tabs Navigation Menu */}
      <div className="flex border-b border-slate-200 dark:border-slate-800/80 mb-2 select-none">
        <button
          type="button"
          onClick={() => setActiveSubTab('alerts')}
          className={`pb-3 pt-1 px-5 text-xs font-bold transition-all border-b-2 -mb-px flex items-center gap-2 ${
            activeSubTab === 'alerts'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span className="material-symbols-outlined text-base">notifications</span>
          Simulated Feed & Stream
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('emails')}
          className={`pb-3 pt-1 px-5 text-xs font-bold transition-all border-b-2 -mb-px flex items-center gap-2 ${
            activeSubTab === 'emails'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span className="material-symbols-outlined text-base">mail</span>
          Email Simulation
        </button>
      </div>

      {/* Alerts & Logs Feed Tab */}
      {activeSubTab === 'alerts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Alerts & Logs Feed (8-cols duration) */}
          <div className="lg:col-span-7 space-y-4">
            
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider block mb-1 text-slate-400">
              Simulated Activity Stream
            </h3>

            {allNotifications.length === 0 ? (
              <div className="bg-white border border-slate-150 p-12 text-center rounded-2xl flex flex-col items-center justify-center">
                <div className="relative w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
                  <span className="material-symbols-outlined text-3xl">notifications_off</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">All cleared or muted</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                  No active simulation events recorded. Click "New Simulation" in the Topbar to synthesize dynamic activities!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {allNotifications.map((notif) => {
                  const isActive = activeFocusItem?.id === notif.id;
                  
                  return (
                    <div
                      key={notif.id}
                      onClick={() => setSelectedNotifId(notif.id)}
                      className={`group relative bg-white border rounded-2xl p-4 cursor-pointer transition shadow-xs flex gap-3.5 items-start select-none ${
                        isActive 
                          ? 'border-blue-500 ring-2 ring-blue-50/70 bg-blue-50/5' 
                          : 'border-slate-150/70 hover:bg-slate-50/50'
                      }`}
                    >
                      {/* Unread indication ping dot */}
                      {notif.unread && (
                        <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                      )}

                      {/* Indicator Icon with dynamic coloring */}
                      <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center shadow-xs ${
                        notif.type === 'success' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : notif.type === 'warning'
                          ? 'bg-rose-50 text-rose-600 border border-rose-100'
                          : notif.type === 'security'
                          ? 'bg-amber-50 text-amber-600 border border-amber-100'
                          : 'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                        <span className="material-symbols-outlined text-xl leading-none">
                          {notif.type === 'success' ? 'check_circle' : notif.type === 'warning' ? 'warning' : notif.type === 'security' ? 'security' : 'info'}
                        </span>
                      </div>

                      {/* Details section */}
                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex justify-between items-center gap-2">
                          <span className="font-bold text-xs text-slate-950 block truncate leading-snug">
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap shrink-0">
                            {notif.timeLabel}
                          </span>
                        </div>
                        <p className="text-slate-500 font-medium text-xs mt-1 leading-relaxed">
                          {notif.text}
                        </p>
                        
                        {/* Actions tags visible on hover */}
                        <div className="mt-2 text-[10px] font-bold text-slate-400 flex items-center gap-3">
                          <span className="text-blue-600 hover:underline">Inspect response mail</span>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={(e) => handleDismiss(notif.id, e)}
                            className="text-slate-400 hover:text-rose-600 hover:underline"
                          >
                            Dismiss Alert
                          </button>
                        </div>
                      </div>

                      {/* Fast close button */}
                      <button
                        type="button"
                        onClick={(e) => handleDismiss(notif.id, e)}
                        className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition duration-150 w-6 h-6 rounded-lg bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center"
                        title="Dismiss notification"
                      >
                        <span className="material-symbols-outlined text-sm font-bold">close</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* Mock Email Sandbox Previewer (5-cols duration) */}
          <div className="lg:col-span-5 space-y-4">
            
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider block mb-1 text-slate-400">
              Secure Outbound Email Live Sandbox
            </h3>

            {activeFocusItem ? (
              <div className="relative bg-white border border-slate-200 rounded-3xl shadow-lg shadow-slate-100 flex flex-col justify-between overflow-hidden">
                
                {/* Dynamic Diagonal Watermark strictly requested by aesthetics */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] rotate-[-30deg] z-10 select-none">
                  <div className="text-[52px] font-black text-slate-900 text-center leading-none tracking-widest uppercase">
                    SIMULATION<br />ONLY<br />DEMO
                  </div>
                </div>

                {/* Email Envelope Header */}
                <div className="bg-slate-900 text-white p-4 flex items-center gap-3 relative z-20">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
                    <span className="material-symbols-outlined text-[18px] font-bold">bolt</span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-extrabold text-[12px] truncate leading-tight">PayFlow Automatic Sim Alerts</div>
                    <div className="text-slate-400 text-[9px] font-mono font-bold truncate leading-none">noreply@simulation.payflow.com</div>
                  </div>
                </div>

                {/* Email Client Payload Form Body */}
                <div className="p-6 space-y-5 relative z-20">
                  
                  {/* Subject Label */}
                  <div className="space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">EMAIL SUBJECT</div>
                    <h4 className="font-black text-slate-950 text-sm tracking-tight leading-tight">
                      {activeFocusItem.type === 'security' ? 'Security Alert: Login Session Active' : 'Transaction Notification Confirmed'}
                    </h4>
                    <div className="text-[10px] text-slate-400 font-mono font-bold">Ref code: {activeFocusItem.referenceId || 'SIM-99230-XP'}</div>
                  </div>

                  <div className="h-px bg-slate-100"></div>

                  {/* Email Body Message */}
                  <div className="text-slate-600 text-xs font-semibold leading-relaxed space-y-3">
                    <p>Dear {businessName} Admin,</p>

                    {activeFocusItem.type === 'security' ? (
                      <p>
                        This is a real-time cybersecurity simulation. A mock validation check noted access from a Chrome client. 
                        No real accounts are affected.
                      </p>
                    ) : (
                      <p>
                        Your simulated payment instruction has successfully resolved on our simulated loop network! 
                        The payment metadata logs show correct cryptographic checksums and compliance routing validation.
                      </p>
                    )}

                    <p className="text-slate-400 text-[11px] leading-snug">
                       Review the simulation configuration and validation payload specs in details below:
                    </p>
                  </div>

                  {/* Transaction Data Table inside Email container */}
                  {activeFocusItem.type !== 'security' && (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2.5 font-sans">
                      
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Recipient Label</span>
                        <span className="font-extrabold text-slate-800">{activeFocusItem.recipient || 'Sarah Johnson'}</span>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Outbound Amount</span>
                        <span className="font-mono font-black text-blue-600 text-sm">
                          {activeFocusItem.amount !== undefined 
                            ? formatCurrency(Math.abs(activeFocusItem.amount), currency) 
                            : formatCurrency(1200.00, currency)
                          }
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Simulation Rail</span>
                        <span className="font-extrabold text-slate-800 bg-white border border-slate-100 px-2 py-0.5 rounded text-[10px]">
                          {activeFocusItem.channel || 'ACH Simulation'}
                        </span>
                      </div>

                    </div>
                  )}

                  {/* Dynamic Call to Action Link Mock button */}
                  <div className="bg-blue-600 text-center py-2.5 rounded-xl text-white text-xs font-bold font-sans cursor-pointer active:scale-95 transition-all shadow-md shadow-blue-100">
                    View Simulated Dashboard
                  </div>

                  {/* Legal Statement Watermark explicitly styled */}
                  <p className="text-[10px] text-slate-400 text-center italic leading-normal select-none">
                    This transaction is fully simulated inside the PayFlow sandbox. No real fiat currencies or bank transfers have been moved or recorded.
                  </p>

                </div>

                {/* Verified Footer branding icon representing security compliance */}
                <div className="bg-slate-50 border-t border-slate-100 p-4 shrink-0 flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span>Compliance Code: ISO 20022 SEED</span>
                  <span className="text-blue-600 block">PayFlow Secure</span>
                </div>

              </div>
            ) : (
              <div className="bg-white border border-slate-150 p-6 rounded-2xl text-center text-slate-400 font-medium text-xs">
                Preview email notification layouts by selecting any alert log item on the left.
              </div>
            )}

            {/* Power Tip Card */}
            <div className="bg-blue-600 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden group select-none">
              {/* Ambient pattern accent */}
              <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-white/10 blur-xl"></div>
              
              <div className="relative z-10 space-y-1.5">
                <h5 className="font-bold text-xs uppercase tracking-widest text-blue-200">Power Tip</h5>
                <p className="text-white font-extrabold text-xs leading-snug">
                  You can trigger specific failure scenarios in the "Config" tab to test how your integration handles transaction reversals.
                </p>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Email Simulation Sub-tab View */}
      {activeSubTab === 'emails' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in text-left">
          
          {/* Left panel: Simulation Controls & Inbox Previews */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Configuration card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-xs">
              <div className="border-b border-slate-100 dark:border-slate-800/65 pb-2.5">
                <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-blue-600">settings</span>
                  Simulation Parameters
                </h4>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Configure specific receipt limit alert triggers instantly.
                </p>
              </div>

              {/* Brand Selector Toggles */}
              <div className="space-y-1.5">
                <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block">
                  Alert Brand Styling
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Cash App', 'Zelle', 'Venmo', 'Apple Pay'] as const).map((brand) => (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => {
                        setEmailBrand(brand);
                        // update default amounts matching reasonable specs
                        if (brand === 'Cash App') {
                          setHoldAmount('750.00');
                          setExpansionAmount('150.00');
                        } else if (brand === 'Zelle') {
                          setHoldAmount('1,500.00');
                          setExpansionAmount('250.00');
                        } else if (brand === 'Apple Pay') {
                          setHoldAmount('950.00');
                          setExpansionAmount('180.00');
                        } else {
                          setHoldAmount('620.00');
                          setExpansionAmount('120.00');
                        }
                      }}
                      className={`py-2 px-1 text-[10px] font-black rounded-xl border transition text-center ${
                        emailBrand === brand
                          ? 'border-blue-600 bg-blue-50/10 text-blue-600 dark:text-blue-400 font-black'
                          : 'border-slate-150 text-slate-500 hover:bg-slate-50 dark:border-slate-850'
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient Account Name */}
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block">
                  Simulated Recipient
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Wesley Jeffrey"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Hold Amount & Expansion Fee Fields */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block">
                    Pending Amt ({currency})
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                      $
                    </span>
                    <input
                      type="text"
                      value={holdAmount}
                      onChange={(e) => setHoldAmount(e.target.value)}
                      className="w-full pl-6 pr-2 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs font-mono font-bold text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-rose-500 font-extrabold uppercase tracking-widest block">
                     Expansion Cost
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-rose-450">
                      $
                    </span>
                    <input
                      type="text"
                      value={expansionAmount}
                      onChange={(e) => setExpansionAmount(e.target.value)}
                      className="w-full pl-6 pr-2 py-2 border border-rose-100 dark:border-slate-800 rounded-xl bg-rose-50/10 dark:bg-slate-950 text-xs font-mono font-bold text-rose-600 dark:text-rose-400"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Simulated Inbox list */}
            <div className="space-y-2 select-none">
              <h5 className="font-bold text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
                Simulated Sandbox Inbox
              </h5>

              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/60 shadow-xs">
                
                {/* Cash App Item Link */}
                <div 
                  onClick={() => {
                    setEmailBrand('Cash App');
                    setHoldAmount('750.00');
                    setExpansionAmount('150.00');
                  }}
                  className={`p-3.5 cursor-pointer text-left transition duration-150 border-l-4 ${
                    emailBrand === 'Cash App' 
                      ? 'bg-emerald-50/5 dark:bg-emerald-950/5 text-slate-900 dark:text-white border-emerald-500' 
                      : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-850/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-black text-xs text-slate-900 dark:text-white">Cash App Dispatch Service</span>
                    <span className="text-[9px] text-slate-400 font-bold">10:52 AM</span>
                  </div>
                  <h6 className="font-bold text-xs text-slate-700 dark:text-slate-300 truncate mt-0.5">
                    URGENT HOLD: Action Required for Transaction ref #REC-CASH42
                  </h6>
                  <p className="text-[10px] text-slate-400 dark:text-slate-450 truncate font-semibold mt-1">
                    Dear Customer, we encountered a little problem trying to credit your Cash App account with that amount...
                  </p>
                </div>

                {/* Zelle Item Link */}
                <div 
                  onClick={() => {
                    setEmailBrand('Zelle');
                    setHoldAmount('1,500.00');
                    setExpansionAmount('250.00');
                  }}
                  className={`p-3.5 cursor-pointer text-left transition duration-150 border-l-4 ${
                    emailBrand === 'Zelle' 
                      ? 'bg-purple-50/5 dark:bg-purple-950/5 text-slate-900 dark:text-white border-purple-500' 
                      : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-850/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-black text-xs text-slate-900 dark:text-white">Zelle Payments Clearing Hub</span>
                    <span className="text-[9px] text-slate-400 font-bold">9:15 AM</span>
                  </div>
                  <h6 className="font-bold text-xs text-slate-700 dark:text-slate-300 truncate mt-0.5">
                    Hold Notice: Account Expansion Required to Complete Clearing Process
                  </h6>
                  <p className="text-[10px] text-slate-400 dark:text-slate-450 truncate font-semibold mt-1">
                    To complete this transaction and receive the funds, please contact Zelle Support to increase...
                  </p>
                </div>

                {/* Venmo Item Link */}
                <div 
                  onClick={() => {
                    setEmailBrand('Venmo');
                    setHoldAmount('620.00');
                    setExpansionAmount('120.00');
                  }}
                  className={`p-3.5 cursor-pointer text-left transition duration-150 border-l-4 ${
                    emailBrand === 'Venmo' 
                      ? 'bg-blue-50/5 dark:bg-blue-950/5 text-slate-900 dark:text-white border-blue-500' 
                      : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-850/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-black text-xs text-slate-900 dark:text-white">Venmo Clearance Desk</span>
                    <span className="text-[9px] text-slate-400 font-bold">Yesterday</span>
                  </div>
                  <h6 className="font-bold text-xs text-slate-700 dark:text-slate-300 truncate mt-0.5">
                    Alert: Limit Exceeded - Settlement Held Until Business Elevation Payment
                  </h6>
                  <p className="text-[10px] text-slate-400 dark:text-slate-450 truncate font-semibold mt-1">
                    We encounter a little problem while trying to credit your Venmo account with that amount because...
                  </p>
                </div>

                {/* Apple Pay Item Link */}
                <div 
                  onClick={() => {
                    setEmailBrand('Apple Pay');
                    setHoldAmount('950.00');
                    setExpansionAmount('180.00');
                  }}
                  className={`p-3.5 cursor-pointer text-left transition duration-150 border-l-4 ${
                    emailBrand === 'Apple Pay' 
                      ? 'bg-zinc-50/50 dark:bg-zinc-950/5 text-slate-900 dark:text-white border-slate-950 dark:border-white' 
                      : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-850/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-black text-xs text-slate-900 dark:text-white">Apple Pay Dispatch Desk</span>
                    <span className="text-[9px] text-zinc-500 font-bold">Just now</span>
                  </div>
                  <h6 className="font-bold text-xs text-slate-700 dark:text-slate-300 truncate mt-0.5">
                    URGENT HOLD: Action Required for Transaction ref #APL-LIMIT77
                  </h6>
                  <p className="text-[10px] text-slate-400 dark:text-slate-450 truncate font-semibold mt-1">
                    Dear Customer, we encountered a little problem trying to credit your Apple Pay account with that amount...
                  </p>
                </div>

              </div>
            </div>

          </div>

          {/* Right panel: High Fidelity Email Client Container */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Realtime success dynamic notification banner */}
            {limitPaymentSuccess && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 rounded-3xl border border-emerald-200/60 dark:border-emerald-900/35 shadow-xs animate-fade-in space-y-1.5 cursor-default font-sans">
                <div className="flex items-center gap-2 font-black text-xs">
                  <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[18px]">verified</span>
                  MOCK UPGRADE PAYMENT REGISTERED successfully
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold leading-normal">
                  You successfully paid a mock limit expansion fee of <span className="font-black underline">${confirmInputAmt}</span>. 
                  This outflow payment has updated your simulated ledger with ID <code className="bg-emerald-100/50 dark:bg-emerald-900/40 px-1 rounded font-mono text-[10px] font-bold">{successPaymentId}</code>. 
                  Your {emailBrand} pending holding cap is resolved.
                </p>
              </div>
            )}

            {/* High-Fidelity Email Mockup Envelope */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden flex flex-col justify-between relative">
                         {/* Decorative Brand Header Border Line */}
              <div className={`h-1.5 w-full ${
                emailBrand === 'Cash App' ? 'bg-emerald-500' : emailBrand === 'Zelle' ? 'bg-purple-600' : emailBrand === 'Apple Pay' ? 'bg-slate-900' : 'bg-sky-500'
              }`}></div>

              {/* From/To Metadata Grid */}
              <div className="bg-slate-50 dark:bg-slate-900/40 p-4 border-b border-light-slate-100 dark:border-slate-800/70 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-[34px] h-[34px] rounded-full flex items-center justify-center font-extrabold text-white text-xs ${
                    emailBrand === 'Cash App' ? 'bg-emerald-500' : emailBrand === 'Zelle' ? 'bg-purple-600' : emailBrand === 'Apple Pay' ? 'bg-black border border-zinc-800' : 'bg-sky-450'
                  }`}>
                    {emailBrand === 'Apple Pay' ? '' : emailBrand[0]}
                  </div>
                  <div className="text-left">
                    <div className="font-extrabold text-[12px] text-slate-900 dark:text-white leading-tight">
                      {emailBrand === 'Cash App' ? 'Cash App Support Services' : emailBrand === 'Zelle' ? 'Zelle Transfer Security' : emailBrand === 'Apple Pay' ? 'Apple Pay Dispatch Service' : 'Venmo Compliance Desk'}
                    </div>
                    <div className="text-slate-400 dark:text-slate-400 text-[9px] font-mono leading-none mt-0.5">
                      {emailBrand === 'Cash App' ? 'support@cash.app' : emailBrand === 'Zelle' ? 'alerts@zellepay.com' : emailBrand === 'Apple Pay' ? 'dispatch@apple-pay.com' : 'clearance@venmo.com'}
                    </div>
                  </div>
                </div>

                <div className="text-right text-[10px] text-slate-400 font-bold font-mono">
                  <div>TO: {businessName.replace(/\s+/g, '').toLowerCase()}@inbox.com</div>
                  <div className="text-blue-500 mt-1 uppercase text-[9px] font-black">Secure Webmail Inbox</div>
                </div>
              </div>

              {/* Dynamic Subject Details Container */}
              <div className="px-6 pt-5 pb-3 bg-slate-50/10 dark:bg-slate-900/20">
                <div className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 tracking-wider uppercase">Email Subject Line</div>
                <h3 className="font-extrabold text-slate-950 dark:text-white text-sm mt-0.5 tracking-tight leading-snug">
                  Action Required: Transaction limit hold notice for pending deposit of ${holdAmount}
                </h3>
              </div>

              <div className="h-px bg-slate-100 dark:bg-slate-800/75 mx-6"></div>

              {/* Email formal body containing precise support text + requested limit cost write-up */}
              <div className="p-6 text-slate-650 dark:text-slate-350 text-xs font-semibold leading-relaxed space-y-4 font-sans">
                
                <p className="text-slate-800 dark:text-slate-200">Dear {recipientName || 'Sandbox User'},</p>

                {/* Specific support text for transaction limit issues exactly styled */}
                <p className="bg-rose-50/40 dark:bg-rose-950/15 border-l-4 border-rose-500 px-4 py-3 text-rose-900 dark:text-rose-400 rounded-r-xl leading-relaxed font-bold shadow-2xs">
                  To complete this transaction and receive the funds, please contact {emailBrand === 'Cash App' ? 'Cash App Support' : emailBrand === 'Zelle' ? 'Zelle Support' : emailBrand === 'Apple Pay' ? 'Apple Wallet Support' : 'Venmo Support'} to increase your transaction limit. we encounter a little problem while trying to credit your {emailBrand === 'Cash App' ? 'Cash App' : emailBrand === 'Zelle' ? 'Zelle' : emailBrand === 'Apple Pay' ? 'Apple Pay' : 'Venmo'} account,with that amount because the status of your {emailBrand === 'Cash App' ? 'Cash App' : emailBrand === 'Zelle' ? 'Zelle' : emailBrand === 'Apple Pay' ? 'Apple Pay' : 'Venmo'} account is not a business user which makes your account have a limit and this amount seems to be above your limit.You have to take the urgent step to expand your account limit.
                </p>

                {/* Exact requested text incorporating price precisely as requested */}
                <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl text-center border border-slate-150/40 dark:border-slate-800/40 shadow-xs">
                  <p className="text-slate-900 dark:text-white text-xs font-black tracking-tight leading-normal uppercase">
                    Security Resolution Notice
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 text-sm font-semibold mt-1 leading-snug font-sans">
                    You will have to pay <span className="text-rose-600 dark:text-rose-400 font-extrabold underline">${expansionAmount}</span> to expand your transaction limit
                  </p>
                </div>

                <p className="text-slate-400 dark:text-slate-450 text-[11px] leading-relaxed">
                  Upon processing this deposits protocol, clearing systems will elevate your daily parameters, releasing this hold and transferring pending funds into your verified balance.
                </p>

                {/* Exact requested button that says: 'enter the amount to pay' */}
                <div className="pt-2 text-center select-none">
                  <button
                    type="button"
                    onClick={handleTriggerPaymentModal}
                    className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition duration-150 shadow-md shadow-blue-100 hover:scale-[1.01] active:scale-95 inline-flex items-center gap-2 justify-center cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm font-bold">payments</span>
                    enter the amount to pay
                  </button>
                </div>

              </div>

              {/* Professional Inbox Footer Block */}
              <div className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/70 p-4 flex justify-between items-center text-[9px] font-bold text-slate-400 dark:text-slate-500 font-mono">
                <span>Verification standard: ISO 20022 SEED</span>
                <span className="text-blue-500">PayFlow Protection Hub</span>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* Preferences overlay modal */}
      {showPrefModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/40 backdrop-blur-xs transition animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 p-6 space-y-6 shadow-2xl relative">
            
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <div>
                <h4 className="font-black text-slate-950 text-sm">Alert Preferences Context</h4>
                <p className="text-[10px] text-slate-400 font-bold tracking-wide uppercase mt-0.5">Sandbox Config</p>
              </div>
              <button 
                onClick={() => setShowPrefModal(false)}
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition"
              >
                <span className="material-symbols-outlined text-sm font-bold">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Choose which simulated channels are allowed to send test logs or push alerts:
              </p>

              <div className="space-y-3 font-semibold text-xs text-slate-700">
                {[
                  { key: 'zelle', title: 'Zelle Notifications', desc: 'Allows instant P2P alert triggers' },
                  { key: 'venmo', title: 'Venmo Group Splits', desc: 'Enables social stream logs' },
                  { key: 'cashApp', title: 'Cash App Handle Pings', desc: 'Alert consumer balance reloads' },
                  { key: 'bankTransfer', title: 'Bank ACH/Wires', desc: 'Enables large corporate ledger checks' },
                  { key: 'failAlerts', title: 'Rejection Alerts', desc: 'Triggers immediately upon failure' },
                  { key: 'securityAlerts', title: 'Security Audits', desc: 'Sends login or IP change alerts' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition">
                    <div>
                      <div className="text-slate-900 font-bold">{item.title}</div>
                      <div className="text-[10px] text-slate-400 font-medium mt-0.5">{item.desc}</div>
                    </div>
                    
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={(configPrefs as any)[item.key]} 
                        onChange={() => {
                          setConfigPrefs(prev => ({
                            ...prev,
                            [item.key]: !(prev as any)[item.key]
                          }));
                        }}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 gap-2">
              <button
                onClick={() => setShowPrefModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl active:scale-95 transition"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Interactive Limit Expansion Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/50 backdrop-blur-xs transition animate-fade-in text-left">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-2xl relative mx-4">
            
            {/* Header */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-950 dark:text-white text-xs uppercase tracking-wider">
                    Limit Expansion deposit
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">
                    {emailBrand} Sandbox clearing
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 transition"
              >
                <span className="material-symbols-outlined text-sm font-bold">close</span>
              </button>
            </div>

            {/* Modal Body form */}
            {!limitPaymentSuccess ? (
              <form onSubmit={handleConfirmLimitPayment} className="space-y-4">
                
                <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl text-xs space-y-2 border border-slate-150/40 dark:border-slate-800/40 font-semibold leading-normal">
                  <p className="text-slate-655 dark:text-slate-350">
                    To release the pending hold of <span className="font-extrabold text-slate-900 dark:text-white">${holdAmount}</span>, you are required to pay the following amount:
                  </p>
                  <p className="text-[13px] text-slate-900 dark:text-white font-black underline bg-white dark:bg-slate-950 px-2 py-1.5 rounded-lg border border-slate-150/40 dark:border-slate-800 text-center">
                    You will have to pay ${expansionAmount} to expand your transaction limit
                  </p>
                </div>

                {/* Input Field */}
                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block font-sans">
                    Confirm payment amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-450">$</span>
                    <input
                      type="text"
                      required
                      disabled={isProcessingLimitPayment}
                      value={confirmInputAmt}
                      onChange={(e) => setConfirmInputAmt(e.target.value)}
                      className="w-full pl-6 pr-3 py-2.5 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 text-xs font-mono font-bold text-slate-900 dark:text-white rounded-xl"
                      placeholder={expansionAmount}
                    />
                  </div>
                </div>

                {/* Error messages */}
                {paymentError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-[11px] font-bold">
                    {paymentError}
                  </div>
                )}

                {/* Dynamic processing log trace steps */}
                {isProcessingLimitPayment && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[10px] space-y-1 shadow-inner select-none max-h-36 overflow-y-auto">
                    <div className="text-blue-400 font-bold mb-1 border-b border-rose-950/20 pb-1 font-mono">Clearing Network Logs:</div>
                    {processingSteps.map((step, idx) => (
                      <div key={idx} className="text-slate-300 flex items-center gap-1.5 animate-fade-in font-mono">
                        <span className="text-blue-500 font-bold shrink-0">➔</span>
                        <span>{step}</span>
                      </div>
                    ))}
                    <div className="text-blue-500 font-black animate-pulse flex items-center gap-1.5 mt-2 font-mono">
                       <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                       <span>PROCESSING TRANSACTION CLEARANCE...</span>
                    </div>
                  </div>
                )}

                {/* Action CTA Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    disabled={isProcessingLimitPayment}
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-710 dark:text-slate-300 font-bold text-xs rounded-xl active:scale-95 transition disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessingLimitPayment}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl active:scale-[0.98] transition disabled:opacity-50 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    {isProcessingLimitPayment ? (
                      <span>Verifying...</span>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">enhanced_encryption</span>
                        <span>Confirm Outflow</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            ) : (
              // Success Visual Card
              <div className="space-y-4 text-center animate-fade-in font-sans">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/30 rounded-full border border-emerald-100 dark:border-emerald-900/35 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
                  <span className="material-symbols-outlined text-4xl">verified</span>
                </div>
                
                <div className="space-y-1">
                  <h5 className="font-extrabold text-slate-900 dark:text-white text-sm">Upgrade Compliance Approved!</h5>
                  <p className="text-xs text-slate-400 dark:text-slate-500 leading-normal">
                    Limit holding requirements successfully bypassed on the mock network.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 border border-slate-150/45 dark:border-slate-800/40 space-y-1">
                  <div className="flex justify-between">
                    <span>TRANSACTION VALUE:</span>
                    <span className="text-rose-650">${confirmInputAmt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CLEARING REFERENCE ID:</span>
                    <span className="text-slate-900 dark:text-white font-black">{successPaymentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TARGET PROTOCOL:</span>
                    <span>{emailBrand.toUpperCase()} INTERCEPT</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl active:scale-95 transition cursor-pointer"
                >
                  Return to Sandbox Inbox
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
