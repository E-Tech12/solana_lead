import React from 'react';
import ScoreBadge from '../common/ScoreBadge';
import { X, ExternalLink, User, Calendar, Tag, Shield, Bookmark, Check, Trash2 } from 'lucide-react';

export default function LeadDetailModal({ lead, onClose, onStatusChange }) {
  if (!lead) return null;

  const handleOpenTikTok = () => {
    if (lead.video_url) {
      window.open(lead.video_url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleOpenProfile = () => {
    if (lead.profile_url) {
      window.open(lead.profile_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-bg-card border border-border-subtle w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-border-subtle">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-base text-text-primary">
                {lead.username ? `@${lead.username}` : 'Anonymous Commenter'}
              </span>
              <ScoreBadge score={lead.score} size="lg" />
            </div>
            <p className="text-xs text-text-secondary">{lead.classification}</p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-border-subtle text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comment Text Box */}
        <div className="mb-5">
          <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider font-mono">
            Original Comment
          </label>
          <div className="p-4 rounded-xl bg-bg-main border border-border-subtle text-sm text-text-primary leading-relaxed font-normal">
            "{lead.comment_text}"
          </div>
        </div>

        {/* Score Reasoning */}
        <div className="mb-5">
          <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider font-mono">
            Intelligence & Intent Breakdown
          </label>
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-text-primary leading-relaxed">
            <p className="font-semibold text-emerald-400 mb-1">
              Score: {lead.score}/100 — {lead.classification}
            </p>
            <p className="text-text-secondary">{lead.score_explanation}</p>
            <div className="mt-2 text-[10px] text-text-muted font-mono">
              Scoring Algorithm: v{lead.scoring_version}
            </div>
          </div>
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-xs">
          <div className="p-3 rounded-lg bg-bg-main border border-border-subtle/80 flex items-center gap-2.5">
            <Tag className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[11px] text-text-muted block">Matched Keyword</span>
              <span className="font-medium text-text-primary">{lead.matched_keyword || 'General'}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-bg-main border border-border-subtle/80 flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[11px] text-text-muted block">Video Published Time (UTC)</span>
              <span className="font-medium text-text-primary">
                {lead.published_at ? new Date(lead.published_at).toLocaleString() : 'Unknown'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-bg-main border border-border-subtle/80 flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[11px] text-text-muted block">Deduplication Fingerprint</span>
              <span className="font-mono text-[10px] text-text-secondary truncate max-w-[200px] block">
                {lead.lead_fingerprint}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-bg-main border border-border-subtle/80 flex items-center gap-2.5">
            <User className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[11px] text-text-muted block">Current Review Status</span>
              <span className="font-medium capitalize text-text-primary">{lead.status}</span>
            </div>
          </div>
        </div>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-border-subtle">
          <button
            onClick={handleOpenTikTok}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open TikTok Video</span>
          </button>

          {lead.profile_url && (
            <button
              onClick={handleOpenProfile}
              className="w-full sm:w-auto py-3 px-4 rounded-xl border border-border-subtle hover:bg-bg-elevated text-text-secondary hover:text-text-primary text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <User className="w-4 h-4" />
              <span>Commenter Profile</span>
            </button>
          )}

          {/* Status buttons */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => onStatusChange(lead.id, 'reviewed')}
              className={`flex-1 sm:flex-none py-2.5 px-3 rounded-xl border text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                lead.status === 'reviewed'
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                  : 'border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Reviewed</span>
            </button>

            <button
              onClick={() => onStatusChange(lead.id, 'saved')}
              className={`flex-1 sm:flex-none py-2.5 px-3 rounded-xl border text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                lead.status === 'saved'
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                  : 'border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved</span>
            </button>

            <button
              onClick={() => onStatusChange(lead.id, 'dismissed')}
              className={`flex-1 sm:flex-none py-2.5 px-3 rounded-xl border text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                lead.status === 'dismissed'
                  ? 'border-red-500/40 bg-red-500/10 text-red-400'
                  : 'border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Dismiss</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
