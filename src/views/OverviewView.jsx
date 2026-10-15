import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { usePush } from '../context/PushContext';
import LeadCard from '../components/leads/LeadCard';
import LeadDetailModal from '../components/leads/LeadDetailModal';
import ScoreBadge from '../components/common/ScoreBadge';
import EmptyState from '../components/common/EmptyState';
import { Radio, Users, Bell, Tag, ArrowRight, Play, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function OverviewView({ onNavigateToLeads }) {
  const { isAuthenticated, setIsPromptOpen } = useAuth();
  const { isSubscribed } = usePush();
  const [stats, setStats] = useState({
    totalLeads: 0,
    highIntentLeads: 0,
    activeKeywords: 0,
    freshVideos: 0,
    lastScan: null
  });
  const [recentLeads, setRecentLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadOverviewData = async () => {
    setLoading(true);
    try {
      // 1. Fetch leads
      let leadsRes = { items: [], total: 0 };
      if (isAuthenticated) {
        leadsRes = await api.getLeads({ size: 10, min_score: 60 });
        setRecentLeads(leadsRes.items || []);
      }

      // 2. Fetch keywords
      let keywordsRes = [];
      if (isAuthenticated) {
        keywordsRes = await api.getKeywords();
      }

      // 3. Fetch scans
      let scansRes = [];
      if (isAuthenticated) {
        scansRes = await api.getScanHistory(1);
      }

      const highIntentCount = (leadsRes.items || []).filter(l => l.score >= 80).length;
      const lastScan = scansRes.length > 0 ? scansRes[0] : null;

      setStats({
        totalLeads: leadsRes.total || 0,
        highIntentLeads: highIntentCount,
        activeKeywords: (keywordsRes || []).filter(k => k.is_active).length,
        freshVideos: lastScan ? lastScan.fresh_videos : 0,
        lastScan: lastScan
      });
    } catch (e) {
      console.warn('Overview fetch notice:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverviewData();
  }, [isAuthenticated]);

  const handleStatusChange = async (id, status) => {
    try {
      await api.updateLeadStatus(id, status);
      setRecentLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
      if (selectedLead && selectedLead.id === id) {
        setSelectedLead(prev => ({ ...prev, status }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Summary */}
      <div className="p-5 sm:p-6 rounded-2xl bg-bg-card border border-border-subtle relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs uppercase font-mono tracking-wider text-emerald-400 font-semibold">
                Intelligence Engine
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
              Solana Memecoin Beginner Leads
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary max-w-xl mt-1 leading-relaxed">
              Monitoring public TikTok conversations to detect genuine beginner questions, wallet setup friction, and first-time Solana memecoin interest.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isAuthenticated ? (
              <button
                onClick={() => setIsPromptOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
              >
                Authenticate Session
              </button>
            ) : (
              <button
                onClick={onNavigateToLeads}
                className="px-4 py-2 rounded-xl bg-bg-elevated hover:bg-zinc-800 border border-border-subtle text-xs font-medium text-text-primary flex items-center gap-1.5 transition-colors"
              >
                <span>View All Leads</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-bg-card border border-border-subtle">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-medium">High-Intent Leads</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{stats.highIntentLeads}</div>
          <span className="text-[11px] text-text-muted mt-1 block">Score ≥ 80 / 100</span>
        </div>

        <div className="p-4 rounded-xl bg-bg-card border border-border-subtle">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-medium">Total Leads Persisted</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-text-primary">{stats.totalLeads}</div>
          <span className="text-[11px] text-text-muted mt-1 block">In local SQLite DB</span>
        </div>

        <div className="p-4 rounded-xl bg-bg-card border border-border-subtle">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-medium">Active Search Topics</span>
            <Tag className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-text-primary">{stats.activeKeywords}</div>
          <span className="text-[11px] text-text-muted mt-1 block">Configured keywords</span>
        </div>

        <div className="p-4 rounded-xl bg-bg-card border border-border-subtle">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-medium">Mobile Push Status</span>
            <Bell className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-sm font-semibold text-text-primary mt-1">
            {isSubscribed ? (
              <span className="text-emerald-400 flex items-center gap-1 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Active PWA
              </span>
            ) : (
              <span className="text-text-muted font-mono">Not Subscribed</span>
            )}
          </div>
          <span className="text-[11px] text-text-muted mt-1 block">Web Push VAPID</span>
        </div>
      </div>

      {/* Recent Discoveries Feed */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider font-mono">
              Recent High-Scoring Discoveries
            </h2>
            <p className="text-xs text-text-secondary">Discovered public comments filtered by 24h video freshness</p>
          </div>
          <button
            onClick={onNavigateToLeads}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
          >
            <span>View Feed</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {!isAuthenticated ? (
          <EmptyState
            type="offline"
            title="Session Authentication Required"
            description="Authenticate with your personal bootstrap access key to view leads and operational data."
            action={
              <button
                onClick={() => setIsPromptOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                Enter Access Key
              </button>
            }
          />
        ) : recentLeads.length === 0 ? (
          <EmptyState
            title="No leads discovered yet"
            description="Initiate your first scan or wait for the scheduled coordinator to run active keyword searches."
          />
        ) : (
          <div className="space-y-3">
            {recentLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onSelect={(l) => setSelectedLead(l)}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
