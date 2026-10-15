import React from 'react';
import { Search, Filter, Download, X } from 'lucide-react';
import { api } from '../../api/client';

export default function LeadFilters({
  searchQuery,
  onSearchChange,
  minScore,
  onMinScoreChange,
  statusFilter,
  onStatusFilterChange,
  selectedKeyword,
  onKeywordChange,
  keywords = []
}) {
  const statusTabs = [
    { id: '', label: 'All' },
    { id: 'new', label: 'New' },
    { id: 'reviewed', label: 'Reviewed' },
    { id: 'saved', label: 'Saved' },
    { id: 'dismissed', label: 'Dismissed' },
  ];

  const handleExportCsv = () => {
    const url = api.getExportCsvUrl({
      min_score: minScore,
      status_filter: statusFilter
    });
    window.open(url, '_blank');
  };

  const hasActiveFilters = searchQuery || minScore !== null || statusFilter || selectedKeyword;

  const handleReset = () => {
    onSearchChange('');
    onMinScoreChange(null);
    onStatusFilterChange('');
    onKeywordChange('');
  };

  return (
    <div className="space-y-3 mb-5">
      {/* Top Search & Actions */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search comment text, handle, or keywords..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-emerald-500/60 placeholder:text-text-muted transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Keyword Filter Dropdown */}
        <div className="w-full sm:w-56 shrink-0">
          <select
            value={selectedKeyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-emerald-500/60 transition-colors"
          >
            <option value="">All Topics & Keywords</option>
            {keywords.map((kw) => (
              <option key={kw.id} value={kw.phrase}>
                {kw.phrase}
              </option>
            ))}
          </select>
        </div>

        {/* CSV Export Button */}
        <button
          onClick={handleExportCsv}
          className="px-3.5 py-2 rounded-xl border border-border-subtle bg-bg-card hover:bg-bg-elevated text-text-secondary hover:text-text-primary text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shrink-0"
          title="Export filtered leads to CSV"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden xs:inline">Export CSV</span>
        </button>
      </div>

      {/* Filter Row: Status Tabs & Score Thresholds */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-bg-card border border-border-subtle overflow-x-auto max-w-full">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onStatusFilterChange(tab.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-bg-elevated text-emerald-400 font-semibold shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Score Threshold Pills */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-text-muted font-mono hidden sm:inline">Score:</span>
          <button
            onClick={() => onMinScoreChange(null)}
            className={`px-2.5 py-1 rounded-lg border text-xs font-mono transition-colors ${
              minScore === null
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-semibold'
                : 'border-border-subtle bg-bg-card text-text-secondary hover:text-text-primary'
            }`}
          >
            All
          </button>
          <button
            onClick={() => onMinScoreChange(60)}
            className={`px-2.5 py-1 rounded-lg border text-xs font-mono transition-colors ${
              minScore === 60
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-400 font-semibold'
                : 'border-border-subtle bg-bg-card text-text-secondary hover:text-text-primary'
            }`}
          >
            60+
          </button>
          <button
            onClick={() => onMinScoreChange(80)}
            className={`px-2.5 py-1 rounded-lg border text-xs font-mono transition-colors ${
              minScore === 80
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-semibold'
                : 'border-border-subtle bg-bg-card text-text-secondary hover:text-text-primary'
            }`}
          >
            80+ (High Intent)
          </button>

          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="text-xs text-text-muted hover:text-text-secondary underline ml-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
