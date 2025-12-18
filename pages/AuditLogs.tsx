import React from 'react';
import { FileText, CheckCircle, XCircle, AlertOctagon, Search } from 'lucide-react';
import { AuditLogEntry } from '../types';

interface AuditLogsProps {
  logs: AuditLogEntry[];
}

export const AuditLogs: React.FC<AuditLogsProps> = ({ logs }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Audit Trail</h1>
          <p className="text-slate-400">Cryptographically signed logs for compliance and forensics.</p>
        </div>
        <div className="flex gap-3">
           <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 text-sm font-medium transition-colors">
             Export CSV
           </button>
           <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-emerald-900/20 transition-colors">
             Verify Signatures
           </button>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-800 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search by hash, user, or action ID..." 
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-400">
            <thead className="text-xs text-slate-500 uppercase bg-slate-950 border-b border-slate-800">
              <tr>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">User / Actor</th>
                <th className="px-6 py-3">Details</th>
                <th className="px-6 py-3">Immutable Hash (SHA-256)</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-600">
                    No logs recorded in this session yet.
                  </td>
                </tr>
              ) : (
                logs.slice().reverse().map((log) => (
                  <tr key={log.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      {log.status === 'success' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                      {log.status === 'violation' && <AlertOctagon className="w-4 h-4 text-rose-500" />}
                      {log.status === 'error' && <XCircle className="w-4 h-4 text-amber-500" />}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-300">
                      {new Date(log.timestamp).toISOString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-200">
                      <span className={`px-2 py-1 rounded text-[10px] border ${
                         log.action === 'PII_REDACTION' ? 'bg-rose-500/10 border-rose-500/50 text-rose-400' : 'bg-slate-700 border-slate-600'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{log.user}</td>
                    <td className="px-6 py-4 max-w-xs truncate" title={log.details}>{log.details}</td>
                    <td className="px-6 py-4 font-mono text-[10px] text-slate-500">
                      {log.hash.substring(0, 24)}...
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};