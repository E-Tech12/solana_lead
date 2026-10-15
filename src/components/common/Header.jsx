import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Play, RefreshCw, Key, ShieldCheck, AlertTriangle, Radio } from 'lucide-react';

export default function Header({ onScanTriggered }) {
  const { isAuthenticated, setIsPromptOpen } = useAuth();
  const [health, setHealth] = useState({ status: 'checking', is_scanning: false });
  const [isTriggering, setIsTriggering] = useState(false);
  const [triggerNotice, setTriggerNotice] = useState('');

  const checkHealth = async () => {
    try {
      const res = await api.getHealth();
      setHealth(res || { status: 'ok', is_scanning: false });
    } catch (e) {
      setHealth({ status: 'offline', is_scanning: false });
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleManualScan = async () => {
    if (!isAuthenticated) {
      setIsPromptOpen(true);
      return;
    }
    setIsTriggering(true);
    setTriggerNotice('');
    try {
      await api.triggerScan();
      setTriggerNotice('Scan initiated');
      checkHealth();
      if (onScanTriggered) onScanTriggered();
    } catch (err) {
      setTriggerNotice(err.message || 'Scan trigger failed');
    } finally {
      setIsTriggering(false);
      setTimeout(() => setTriggerNotice(''), 4000);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-subtle bg-bg-main/90 backdrop-blur-md px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-wide text-text-primary">SOLANA LEADS</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PWA v1.0
              </span>
            </div>
          </div>
        </div>

        {/* Right Status & Controls */}
        <div className="flex items-center gap-3">
          {/* Health indicator */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-bg-card border border-border-subtle text-xs">
            {health.status === 'ok' ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-text-secondary text-[11px] font-mono">
                  {health.is_scanning ? 'Scanning...' : 'Engine Online'}
                </span>
              </>
            ) : health.status === 'checking' ? (
              <span className="text-text-muted text-[11px] font-mono">Connecting...</span>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                <span className="text-amber-400 text-[11px] font-mono">Engine Offline</span>
              </>
            )}
          </div>

          {/* Quick Scan Button */}
          <button
            onClick={handleManualScan}
            disabled={isTriggering || health.is_scanning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
            title="Trigger an immediate discovery scan"
          >
            {health.is_scanning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden xs:inline">Scanning</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="hidden xs:inline">Run Scan</span>
              </>
            )}
          </button>

          {/* Auth Status Trigger */}
          <button
            onClick={() => setIsPromptOpen(true)}
            className={`p-1.5 rounded-lg border transition-colors ${
              isAuthenticated
                ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                : 'border-border-subtle text-text-muted hover:text-text-primary bg-bg-card'
            }`}
            title={isAuthenticated ? 'Personal session authenticated' : 'Authenticate personal session'}
          >
            {isAuthenticated ? <ShieldCheck className="w-4 h-4" /> : <Key className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {triggerNotice && (
        <div className="max-w-7xl mx-auto mt-2 text-center text-xs text-emerald-400 animate-fade-in font-mono">
          {triggerNotice}
        </div>
      )}
    </header>
  );
}
