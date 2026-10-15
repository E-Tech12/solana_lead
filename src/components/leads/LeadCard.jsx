import React from 'react';
import ScoreBadge from '../common/ScoreBadge';
import { ExternalLink, Check, Bookmark, X, Clock, MessageSquare, Tag } from 'lucide-react';

export default function LeadCard({ lead, onSelect, onStatusChange }) {
  const handleOpenTikTok = (e) => {
    e.stopPropagation();
    if (lead.video_url) {
      window.open(lead.video_url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleStatus = (e, newStatus) => {
    e.stopPropagation();
    onStatusChange(lead.id, newStatus);
  };

  // Format relative published time or discovered time
  const formatTime = (isoString) => {
    if (!isoString) return 'Unknown age';
    const date = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);
    if (diffSec < 60) return 'just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  };

  return (
    <div
      onClick={() => onSelect(lead)}
      className="group p-4 rounded-xl border border-border-subtle bg-bg-card hover:bg-bg-elevated hover:border-border-subtle/80 transition-all cursor-pointer relative"
    >
      {/* Top Meta Bar */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-xs text-text-primary group-hover:text-emerald-400 transition-colors">
            {lead.username ? `@${lead.username}` : 'anonymous'}
          </span>

          {lead.matched_keyword && (
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-text-secondary border border-border-subtle">
              <Tag className="w-3 h-3 text-text-muted" />
              {lead.matched_keyword}
            </span>
          )}

          <span className="inline-flex items-center gap-1 text-[11px] text-text-muted">
            <Clock className="w-3 h-3" />
            {formatTime(lead.published_at || lead.discovered_at)}
          </span>
        </div>

        <div className="shrink-0">
          <ScoreBadge score={lead.score} />
        </div>
      </div>

      {/* Comment Body */}
      <p className="text-sm text-text-primary font-normal leading-relaxed mb-3">
        "{lead.comment_text}"
      </p>

      {/* Explanation Reasoning */}
      <div className="text-xs text-text-secondary bg-bg-main/60 p-2.5 rounded-lg border border-border-subtle/60 mb-3">
        <span className="text-emerald-400 font-mono text-[11px] font-medium mr-1.5">REASONING:</span>
        <span className="text-text-secondary text-[12px]">{lead.score_explanation}</span>
      </div>

      {/* Card Actions Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border-subtle/60 text-xs">
        <button
          onClick={handleOpenTikTok}
          className="inline-flex items-center gap-1.5 text-text-secondary hover:text-emerald-400 text-xs font-medium transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Open Video on TikTok</span>
        </button>

        {/* Quick status actions */}
        <div className="flex items-center gap-1">
          {lead.status !== 'reviewed' && (
            <button
              onClick={(e) => handleStatus(e, 'reviewed')}
              className="p-1 rounded text-text-muted hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
              title="Mark as reviewed"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
          {lead.status !== 'saved' && (
            <button
              onClick={(e) => handleStatus(e, 'saved')}
              className="p-1 rounded text-text-muted hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
              title="Save lead"
            >
              <Bookmark className="w-3.5 h-3.5" />
            </button>
          )}
          {lead.status !== 'dismissed' && (
            <button
              onClick={(e) => handleStatus(e, 'dismissed')}
              className="p-1 rounded text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Dismiss lead"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
