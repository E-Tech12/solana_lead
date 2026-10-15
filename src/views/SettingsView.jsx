import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { usePush } from '../context/PushContext';
import EmptyState from '../components/common/EmptyState';
import {
  Sliders,
  Plus,
  Trash2,
  Check,
  Bell,
  Sparkles,
  Server,
  Key,
  ShieldCheck,
  Send,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export default function SettingsView() {
  const { isAuthenticated, setIsPromptOpen, backendUrl, updateBackendUrl, exchangeKey } = useAuth();
  const { isSupported, permission, isSubscribed, isLoading: pushLoading, statusMessage, subscribeUser, unsubscribeUser, triggerTestPush } = usePush();

  // Settings State
  const [settingsData, setSettingsData] = useState({
    freshness_hours: 24.0,
    scan_interval_minutes: 60,
    min_score_alert: 80,
    max_videos_per_keyword: 10,
    max_comments_per_video: 25,
    push_notifications_enabled: true
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSavedNotice, setSettingsSavedNotice] = useState('');

  // Keywords State
  const [keywords, setKeywords] = useState([]);
  const [newPhrase, setNewPhrase] = useState('');
  const [newCategory, setNewCategory] = useState('Core Solana');
  const [keywordsLoading, setKeywordsLoading] = useState(false);

  // Backend connection form
  const [customBackendUrl, setCustomBackendUrl] = useState(backendUrl || '');
  const [keyInput, setKeyInput] = useState('');
  const [keyNotice, setKeyNotice] = useState('');

  const loadData = async () => {
    if (!isAuthenticated) return;
    try {
      setKeywordsLoading(true);
      const [kRes, sRes] = await Promise.all([
        api.getKeywords(),
        api.getSettings()
      ]);
      setKeywords(kRes || []);
      if (sRes) setSettingsData(sRes);
    } catch (e) {
      console.error(e);
    } finally {
      setKeywordsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  // Keyword Handlers
  const handleAddKeyword = async (e) => {
    e.preventDefault();
    if (!newPhrase.trim()) return;
    try {
      const added = await api.createKeyword({
        phrase: newPhrase.trim(),
        category: newCategory,
        is_active: true
      });
      setKeywords(prev => [...prev, added]);
      setNewPhrase('');
    } catch (err) {
      alert(err.message || 'Failed to add keyword');
    }
  };

  const handleToggleKeyword = async (kw) => {
    try {
      const updated = await api.updateKeyword(kw.id, { is_active: !kw.is_active });
      setKeywords(prev => prev.map(k => k.id === kw.id ? updated : k));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteKeyword = async (id) => {
    if (!confirm('Are you sure you want to delete this keyword?')) return;
    try {
      await api.deleteKeyword(id);
      setKeywords(prev => prev.filter(k => k.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSeedKeywords = async () => {
    try {
      setKeywordsLoading(true);
      const seeded = await api.seedKeywords();
      setKeywords(seeded || []);
    } catch (err) {
      alert(err.message || 'Failed to seed keywords');
    } finally {
      setKeywordsLoading(false);
    }
  };

  // Pipeline Settings Handler
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsSavedNotice('');
    try {
      await api.updateSettings(settingsData);
      setSettingsSavedNotice('Pipeline settings saved successfully.');
      setTimeout(() => setSettingsSavedNotice(''), 3500);
    } catch (err) {
      alert(err.message || 'Failed to update settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  // Backend Key Re-pair Handler
  const handleUpdateBackendKey = async (e) => {
    e.preventDefault();
    setKeyNotice('');
    if (customBackendUrl !== backendUrl) {
      updateBackendUrl(customBackendUrl);
    }
    if (keyInput.trim()) {
      const ok = await exchangeKey(keyInput.trim());
      if (ok) {
        setKeyNotice('Authenticated successfully.');
        setKeyInput('');
        setTimeout(() => setKeyNotice(''), 3000);
      } else {
        setKeyNotice('Invalid access key.');
      }
    }
  };

  return (
    <div className="space-y-8 max-w-4xl pb-12">
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight">
          Settings & Configuration
        </h1>
        <p className="text-xs text-text-secondary">
          Configure discovery keywords, mobile push notifications, and pipeline parameters
        </p>
      </div>

      {!isAuthenticated && (
        <EmptyState
          type="offline"
          title="Session Authentication Required"
          description="Enter your personal access key below to load and modify configuration."
        />
      )}

      {/* 1. KEYWORD & TOPIC MANAGEMENT */}
      <div className="p-5 sm:p-6 rounded-2xl bg-bg-card border border-border-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider font-mono">
              TikTok Discovery Keywords
            </h2>
            <p className="text-xs text-text-secondary">
              Search phrases and topic tags inspected during automated discovery scans
            </p>
          </div>

          <button
            onClick={handleSeedKeywords}
            disabled={!isAuthenticated || keywordsLoading}
            className="px-3 py-1.5 rounded-xl border border-border-subtle bg-bg-elevated hover:bg-zinc-800 text-text-primary text-xs font-medium transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Seed 25+ Default Topics</span>
          </button>
        </div>

        {/* Add Keyword Form */}
        <form onSubmit={handleAddKeyword} className="flex flex-col sm:flex-row gap-2 pt-2">
          <input
            type="text"
            value={newPhrase}
            onChange={(e) => setNewPhrase(e.target.value)}
            placeholder="Add new keyword (e.g., 'Pump.fun slippage guide')..."
            disabled={!isAuthenticated}
            className="flex-1 px-3.5 py-2 rounded-xl bg-bg-main border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-emerald-500/60 transition-colors"
          />

          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            disabled={!isAuthenticated}
            className="px-3 py-2 rounded-xl bg-bg-main border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-emerald-500/60 transition-colors"
          >
            <option value="Core Solana">Core Solana</option>
            <option value="Wallet Learning">Wallet Learning</option>
            <option value="Launch Platforms">Launch Platforms</option>
            <option value="Beginner Problems">Beginner Problems</option>
            <option value="Custom">Custom</option>
          </select>

          <button
            type="submit"
            disabled={!isAuthenticated || !newPhrase.trim()}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>

        {/* Keywords List */}
        <div className="pt-2">
          {keywords.length === 0 ? (
            <p className="text-xs text-text-muted py-4 text-center">
              No keywords configured. Click "Seed 25+ Default Topics" above to load initial set.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
              {keywords.map((kw) => (
                <div
                  key={kw.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors ${
                    kw.is_active
                      ? 'bg-bg-main border-border-subtle text-text-primary'
                      : 'bg-bg-main/40 border-border-subtle/40 text-text-muted'
                  }`}
                >
                  <div className="truncate mr-2">
                    <span className="font-medium block truncate">{kw.phrase}</span>
                    <span className="text-[10px] text-text-muted font-mono">{kw.category}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleToggleKeyword(kw)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                        kw.is_active
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-500 border border-zinc-700/40'
                      }`}
                    >
                      {kw.is_active ? 'Active' : 'Paused'}
                    </button>
                    <button
                      onClick={() => handleDeleteKeyword(kw.id)}
                      className="p-1 text-text-muted hover:text-red-400 transition-colors"
                      title="Delete keyword"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. WEB PUSH NOTIFICATIONS */}
      <div className="p-5 sm:p-6 rounded-2xl bg-bg-card border border-border-subtle space-y-4">
        <div>
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider font-mono flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-400" />
            Mobile PWA Web Push Notifications
          </h2>
          <p className="text-xs text-text-secondary">
            Dispatches real-time push alerts to your mobile phone when high-intent leads (score ≥ 80) are found
          </p>
        </div>

        <div className="p-4 rounded-xl bg-bg-main border border-border-subtle/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-text-primary">Device Subscription:</span>
              {isSubscribed ? (
                <span className="text-emerald-400 font-mono flex items-center gap-1 font-medium">
                  <Check className="w-3.5 h-3.5" /> Subscribed & Active
                </span>
              ) : (
                <span className="text-amber-400 font-mono">Not Subscribed</span>
              )}
            </div>
            <p className="text-[11px] text-text-muted">
              Browser permission: <strong className="font-mono text-text-secondary">{permission}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isSubscribed ? (
              <button
                onClick={subscribeUser}
                disabled={pushLoading || !isAuthenticated}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {pushLoading ? 'Enabling...' : 'Enable on this Device'}
              </button>
            ) : (
              <button
                onClick={unsubscribeUser}
                disabled={pushLoading}
                className="px-3.5 py-2 rounded-xl border border-border-subtle bg-bg-elevated hover:bg-zinc-800 text-text-secondary hover:text-text-primary text-xs font-medium transition-colors"
              >
                Disable
              </button>
            )}

            <button
              onClick={triggerTestPush}
              disabled={pushLoading || !isSubscribed}
              className="px-3.5 py-2 rounded-xl border border-border-subtle bg-bg-card hover:bg-bg-elevated text-emerald-400 hover:text-emerald-300 text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-40"
              title="Dispatches a harmless test push notification"
            >
              <Send className="w-3 h-3" />
              <span>Test Push</span>
            </button>
          </div>
        </div>

        {statusMessage && (
          <p className="text-xs text-emerald-400 font-mono animate-fade-in">{statusMessage}</p>
        )}
      </div>

      {/* 3. PIPELINE PARAMETERS */}
      <div className="p-5 sm:p-6 rounded-2xl bg-bg-card border border-border-subtle space-y-4">
        <div>
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider font-mono">
            Pipeline & Intelligence Rules
          </h2>
          <p className="text-xs text-text-secondary">
            Control video freshness threshold, scan interval, and lead alert sensitivity
          </p>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-text-secondary font-medium mb-1">
                Video Freshness Window (Hours)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="72"
                value={settingsData.freshness_hours}
                onChange={(e) => setSettingsData({ ...settingsData, freshness_hours: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-bg-main border border-border-subtle text-text-primary font-mono focus:outline-none focus:border-emerald-500/60"
              />
              <span className="text-[10px] text-text-muted mt-1 block">Default: 24.0 hours</span>
            </div>

            <div>
              <label className="block text-text-secondary font-medium mb-1">
                Scan Interval (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="1440"
                value={settingsData.scan_interval_minutes}
                onChange={(e) => setSettingsData({ ...settingsData, scan_interval_minutes: parseInt(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-bg-main border border-border-subtle text-text-primary font-mono focus:outline-none focus:border-emerald-500/60"
              />
              <span className="text-[10px] text-text-muted mt-1 block">Scheduled background frequency</span>
            </div>

            <div>
              <label className="block text-text-secondary font-medium mb-1">
                Alert Score Threshold (0–100)
              </label>
              <input
                type="number"
                min="40"
                max="100"
                value={settingsData.min_score_alert}
                onChange={(e) => setSettingsData({ ...settingsData, min_score_alert: parseInt(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-bg-main border border-border-subtle text-text-primary font-mono focus:outline-none focus:border-emerald-500/60"
              />
              <span className="text-[10px] text-text-muted mt-1 block">Push triggers at or above this score</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              disabled={settingsLoading || !isAuthenticated}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors disabled:opacity-50"
            >
              {settingsLoading ? 'Saving...' : 'Save Pipeline Settings'}
            </button>
            {settingsSavedNotice && (
              <span className="text-xs text-emerald-400 font-mono animate-fade-in">{settingsSavedNotice}</span>
            )}
          </div>
        </form>
      </div>

      {/* 4. BACKEND CONNECTION & AUTH */}
      <div className="p-5 sm:p-6 rounded-2xl bg-bg-card border border-border-subtle space-y-4">
        <div>
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider font-mono flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            Backend & Cloudflare Tunnel Connection
          </h2>
          <p className="text-xs text-text-secondary">
            Configure secure HTTPS connectivity to your local PC backend without exposing admin keys
          </p>
        </div>

        <form onSubmit={handleUpdateBackendKey} className="space-y-3 text-xs">
          <div>
            <label className="block text-text-secondary font-medium mb-1">
              Backend API Base URL (e.g., Cloudflare Tunnel)
            </label>
            <input
              type="text"
              value={customBackendUrl}
              onChange={(e) => setCustomBackendUrl(e.target.value)}
              placeholder="https://your-tunnel.trycloudflare.com or http://127.0.0.1:8000"
              className="w-full px-3.5 py-2 rounded-xl bg-bg-main border border-border-subtle text-text-primary font-mono focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          <div>
            <label className="block text-text-secondary font-medium mb-1">
              Re-enter Personal Bootstrap Key
            </label>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Enter personal access key to exchange for new short-lived session"
              className="w-full px-3.5 py-2 rounded-xl bg-bg-main border border-border-subtle text-text-primary focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-bg-elevated hover:bg-zinc-800 border border-border-subtle text-text-primary font-medium text-xs transition-colors"
            >
              Update Connection & Re-Authenticate
            </button>
            {keyNotice && <span className="text-xs text-emerald-400 font-mono">{keyNotice}</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
