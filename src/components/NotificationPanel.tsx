import React, { useState, useMemo } from 'react';
import { SimulatedTransaction } from '../types';
import { formatCurrency, formatDate } from '../utils';

interface NotificationPanelProps {
  transactions: SimulatedTransaction[];
  currency?: string;
  businessName?: string;
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
  businessName = 'PayFlow Demo'
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

      {/* Main Grid: Left is Alert logs container list, Right is Mock Email Sandbox display */}
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
            <div className="relative bg-white border border-slate-200 rounded-3xl shadow-lg shadow-slate-100 flow-hidden flex flex-col justify-between overflow-hidden">
              
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

    </div>
  );
}
