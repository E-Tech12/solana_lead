import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Key, Server, Lock, AlertCircle } from 'lucide-react';

export default function AuthPromptModal() {
  const { isPromptOpen, setIsPromptOpen, exchangeKey, authError, isExchanging, backendUrl, updateBackendUrl } = useAuth();
  const [keyInput, setKeyInput] = useState('');
  const [urlInput, setUrlInput] = useState(backendUrl || '');
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!isPromptOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (urlInput !== backendUrl) {
      updateBackendUrl(urlInput);
    }
    if (keyInput.trim()) {
      await exchangeKey(keyInput.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-bg-card border border-border-subtle w-full max-w-md rounded-xl p-6 shadow-2xl relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary">Personal Backend Access</h2>
            <p className="text-xs text-text-secondary">Authenticate session with local PC backend</p>
          </div>
        </div>

        {authError && (
          <div className="flex items-center gap-2 p-3 mb-4 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-emerald-400" />
              Personal Access Key
            </label>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Enter your API bootstrap key"
              required
              className="w-full px-3.5 py-2.5 rounded-lg bg-bg-input border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-emerald-500/60 transition-colors"
            />
            <p className="text-[11px] text-text-muted mt-1.5">
              Stored temporarily in memory for this browser session.
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-text-secondary hover:text-text-primary underline flex items-center gap-1"
            >
              <Server className="w-3 h-3" />
              {showAdvanced ? 'Hide Connection URL' : 'Configure Backend / Cloudflare Tunnel URL'}
            </button>
            {showAdvanced && (
              <div className="mt-2">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://your-tunnel.trycloudflare.com or http://127.0.0.1:8000"
                  className="w-full px-3 py-2 rounded-lg bg-bg-input border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-emerald-500/60 font-mono"
                />
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isExchanging || !keyInput.trim()}
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isExchanging ? 'Connecting...' : 'Connect to Backend'}
            </button>
            <button
              type="button"
              onClick={() => setIsPromptOpen(false)}
              className="px-4 py-2.5 rounded-lg border border-border-subtle text-xs text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
