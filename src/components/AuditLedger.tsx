import React, { useState, useMemo } from 'react';
import { AuditLog } from '../types';
import { formatDate } from '../utils';

interface AuditLedgerProps {
  auditLogs: AuditLog[];
}

export default function AuditLedger({ auditLogs }: AuditLedgerProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      return (
        log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.actionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [auditLogs, searchTerm]);

  return (
    <div id="compliance-audits" className="space-y-6 animate-fade-in">
      
      {/* Header Info Banner describing compliance logging */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">System Compliance & Security Audit Trail</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Read-only logging of simulated transaction entries and mockup receipts compiled during this session.</p>
        </div>
        <div className="px-3.5 py-1 text-xs font-semibold bg-slate-900 dark:bg-slate-800 text-slate-200 dark:text-slate-350 rounded-lg flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">gavel</span>
          Immutable Audit
        </div>
      </div>

      {/* Main Filters bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col md:flex-row justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined text-slate-400 text-lg absolute left-3 top-1/2 -translate-y-1/2">
            search
          </span>
          <input 
            type="text"
            placeholder="Search log ID, coordinator email context, action code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl transition"
          />
        </div>

        {/* Diagnostic data */}
        <div className="text-right text-[11px] text-slate-400 flex items-center gap-2">
          <span>Active Coordinator Email:</span>
          <strong className="text-slate-700 dark:text-slate-300">oladimejiazeez052@gmail.com</strong>
        </div>

      </div>

      {/* Data tables list */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden">
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-slate-900 dark:bg-slate-950 text-slate-400 dark:text-slate-500 text-[10px] font-semibold uppercase tracking-wider border-b border-slate-800 dark:border-slate-900">
                <th className="px-6 py-3.5 w-32">Log Sequence ID</th>
                <th className="px-6 py-3.5 w-44">Executed Timestamp</th>
                <th className="px-6 py-3.5 w-48">Operator (User Email)</th>
                <th className="px-6 py-3.5 w-44">Action Categorization</th>
                <th className="px-6 py-3.5">Details and Context Descriptor</th>
                <th className="px-6 py-3.5 text-right w-28">Client Host ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <span className="material-symbols-outlined text-3xl mb-1 text-slate-300 dark:text-slate-700">
                      history_edu
                    </span>
                    <p className="text-[10px]">No security logs match your search constraints.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    
                    {/* Log ID */}
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {log.id}
                    </td>

                    {/* Timestamp */}
                    <td className="px-6 py-4 text-slate-400 dark:text-slate-500 whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </td>

                    {/* Operator Email */}
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-sans font-medium whitespace-nowrap">
                      {log.userEmail}
                    </td>

                    {/* Action Category code */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                        log.actionType.includes('AI') 
                          ? 'bg-violet-100 text-violet-800 dark:bg-violet-950/40 dark:text-violet-400' 
                          : log.actionType.includes('Reset') || log.actionType.includes('Clear')
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                          : log.actionType.includes('Receipt')
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400'
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-800/60 dark:text-slate-350'
                      }`}>
                        {log.actionType}
                      </span>
                    </td>

                    {/* Detailed description */}
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 max-w-md truncate font-sans">
                      {log.details}
                    </td>

                    {/* IP signature hash mapping */}
                    <td className="px-6 py-4 text-right text-slate-400 dark:text-slate-500 font-bold whitespace-nowrap">
                      {log.ipHash}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Counter total metadata specs footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 text-[10px] text-slate-400 font-bold border-t border-slate-100 dark:border-slate-800 flex justify-between items-center whitespace-nowrap">
          <span>COMPILED LOG DIAGNOSTICS: {filteredLogs.length} EVENT BLOCKS DETECTED</span>
          <span>AUDIT STATE: ACTIVE LOCKS SECURED</span>
        </div>

      </div>

    </div>
  );
}
