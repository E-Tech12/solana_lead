import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/common/EmptyState';
import { Activity, RefreshCw, AlertCircle, CheckCircle, Clock, ShieldCheck, Terminal } from 'lucide-react';

export default function MonitoringView() {
  const { isAuthenticated, setIsPromptOpen } = useAuth();
  const [scans, setScans] = useState([]);
  const [scannerStatus, setScannerStatus] = useState({ is_scanning: false, is_scheduler_active: true });
  const [health, setHealth] = useState({ status: 'ok', db_connected: true });
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [hRes, sStatusRes, sHistoryRes] = await Promise.all([
        api.getHealth().catch(() => ({ status: 'offline', db_connected: false })),
        api.getScannerStatus().catch(() => ({ is_scanning: false, is_scheduler_active: false })),
        api.getScanHistory(20).catch(() => [])
      ]);
      setHealth(hRes);
      setScannerStatus(sStatusRes);
      setScans(sHistoryRes || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight">
            Engine Monitoring & Diagnostics
          </h1>
          <p className="text-xs text-text-secondary">
            Operational telemetry from your local Windows PC discovery engine
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="p-2 rounded-xl border border-border-subtle bg-bg-card hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors"
          title="Refresh telemetry"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
        </button>
      </div>

      {/* Operational Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Backend API status */}
        <div className="p-4 rounded-xl bg-bg-card border border-border-subtle">
          <span className="text-xs text-text-muted font-medium block mb-1">Backend Connection</span>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${health.status === 'ok' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span className="font-semibold text-sm text-text-primary capitalize">{health.status}</span>
          </div>
          <span className="text-[11px] text-text-muted font-mono mt-1 block">
            SQLite DB: {health.db_connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Worker Status */}
        <div className="p-4 rounded-xl bg-bg-card border border-border-subtle">
          <span className="text-xs text-text-muted font-medium block mb-1">Worker Discovery State</span>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${scannerStatus.is_scanning ? 'bg-amber-400 animate-ping' : 'bg-emerald-500'}`}></span>
            <span className="font-semibold text-sm text-text-primary">
              {scannerStatus.is_scanning ? 'Scan In Progress' : 'Idle / Ready'}
            </span>
          </div>
          <span className="text-[11px] text-text-muted font-mono mt-1 block">
            Scheduler: {scannerStatus.is_scheduler_active ? 'Active Loop' : 'Suspended'}
          </span>
        </div>

        {/* Runtime info */}
        <div className="p-4 rounded-xl bg-bg-card border border-border-subtle">
          <span className="text-xs text-text-muted font-medium block mb-1">Host Runtime</span>
          <div className="font-semibold text-sm text-text-primary font-mono">Windows 11 PC</div>
          <span className="text-[11px] text-text-muted font-mono mt-1 block">
            Playwright + Dedicated Profile
          </span>
        </div>
      </div>

      {/* Scan History Table */}
      <div>
        <div className="mb-3">
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider font-mono">
            Scan Audit Trail & History
          </h2>
          <p className="text-xs text-text-secondary">
            Audit log of discovery runs with actual item counts and error reports
          </p>
        </div>

        {!isAuthenticated ? (
          <EmptyState
            type="offline"
            title="Session Authentication Required"
            description="Authenticate to inspect the engine's diagnostic telemetry."
            action={
              <button
                onClick={() => setIsPromptOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                Enter Access Key
              </button>
            }
          />
        ) : scans.length === 0 ? (
          <EmptyState
            type="terminal"
            title="No scan runs recorded yet"
            description="Click 'Run Scan' in the top header to execute your first discovery run."
          />
        ) : (
          <div className="rounded-xl border border-border-subtle bg-bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-bg-main border-b border-border-subtle text-text-muted uppercase font-mono text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Scan Run</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Keywords</th>
                    <th className="px-4 py-3">Videos Discovered</th>
                    <th className="px-4 py-3">Fresh (&lt;24h)</th>
                    <th className="px-4 py-3">Comments</th>
                    <th className="px-4 py-3">Leads</th>
                    <th className="px-4 py-3">Alerts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/60 text-text-secondary">
                  {scans.map((s) => {
                    const isSuccess = s.status === 'completed';
                    const isRunning = s.status === 'running';

                    return (
                      <tr key={s.id} className="hover:bg-bg-elevated/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-text-primary font-medium">
                          #{s.id}
                          <span className="text-[10px] text-text-muted block font-sans">
                            {new Date(s.started_at).toLocaleTimeString()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase ${
                            isSuccess
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : isRunning
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {s.status}
                          </span>
                          {s.error_message && (
                            <span className="text-[10px] text-red-400 block mt-1 max-w-xs truncate" title={s.error_message}>
                              {s.error_message}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono">{s.keywords_processed}</td>
                        <td className="px-4 py-3 font-mono">{s.videos_found}</td>
                        <td className="px-4 py-3 font-mono text-emerald-400 font-semibold">{s.fresh_videos}</td>
                        <td className="px-4 py-3 font-mono">{s.comments_scanned}</td>
                        <td className="px-4 py-3 font-mono font-bold text-text-primary">{s.leads_found}</td>
                        <td className="px-4 py-3 font-mono text-emerald-400">{s.notifications_dispatched}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
