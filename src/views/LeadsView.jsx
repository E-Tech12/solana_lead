import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import LeadCard from '../components/leads/LeadCard';
import LeadDetailModal from '../components/leads/LeadDetailModal';
import LeadFilters from '../components/leads/LeadFilters';
import EmptyState from '../components/common/EmptyState';
import { RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

export default function LeadsView() {
  const { isAuthenticated, setIsPromptOpen } = useAuth();
  const [leads, setLeads] = useState([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState([]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [minScore, setMinScore] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedKeyword, setSelectedKeyword] = useState('');

  // Selected Lead for Detail Modal
  const [selectedLead, setSelectedLead] = useState(null);

  const fetchLeads = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await api.getLeads({
        page,
        size: pageSize,
        min_score: minScore,
        keyword: selectedKeyword,
        status_filter: statusFilter,
        query: searchQuery
      });
      setLeads(res.items || []);
      setTotalLeads(res.total || 0);
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchKeywords = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.getKeywords();
      setKeywords(res || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchKeywords();
  }, [isAuthenticated]);

  useEffect(() => {
    fetchLeads();
  }, [isAuthenticated, page, minScore, statusFilter, selectedKeyword, searchQuery]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.updateLeadStatus(id, newStatus);
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
      if (selectedLead && selectedLead.id === id) {
        setSelectedLead(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const totalPages = Math.ceil(totalLeads / pageSize) || 1;

  return (
    <div className="space-y-4">
      {/* View Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight">
            Lead Intelligence Feed
          </h1>
          <p className="text-xs text-text-secondary">
            {totalLeads} total lead{totalLeads === 1 ? '' : 's'} matching criteria
          </p>
        </div>

        <button
          onClick={fetchLeads}
          disabled={loading}
          className="p-2 rounded-xl border border-border-subtle bg-bg-card hover:bg-bg-elevated text-text-secondary hover:text-text-primary text-xs font-medium transition-colors"
          title="Refresh feed"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
        </button>
      </div>

      {/* Filter Component */}
      <LeadFilters
        searchQuery={searchQuery}
        onSearchChange={(val) => { setSearchQuery(val); setPage(1); }}
        minScore={minScore}
        onMinScoreChange={(val) => { setMinScore(val); setPage(1); }}
        statusFilter={statusFilter}
        onStatusFilterChange={(val) => { setStatusFilter(val); setPage(1); }}
        selectedKeyword={selectedKeyword}
        onKeywordChange={(val) => { setSelectedKeyword(val); setPage(1); }}
        keywords={keywords}
      />

      {/* Main Content Area */}
      {!isAuthenticated ? (
        <EmptyState
          type="offline"
          title="Session Authentication Required"
          description="Enter your personal access key to unlock the live lead feed."
          action={
            <button
              onClick={() => setIsPromptOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
            >
              Enter Access Key
            </button>
          }
        />
      ) : loading && leads.length === 0 ? (
        <div className="py-20 text-center text-xs text-text-secondary font-mono flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
          <span>Loading leads...</span>
        </div>
      ) : leads.length === 0 ? (
        <EmptyState
          type="search"
          title="No matching leads found"
          description="Try adjusting your score filter, keyword selection, or search query."
        />
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onSelect={(l) => setSelectedLead(l)}
              onStatusChange={handleStatusChange}
            />
          ))}

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 pb-2 text-xs text-text-secondary border-t border-border-subtle">
              <span>
                Page <strong className="text-text-primary font-mono">{page}</strong> of{' '}
                <strong className="text-text-primary font-mono">{totalPages}</strong>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-1.5 rounded-lg border border-border-subtle bg-bg-card hover:bg-bg-elevated disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-1.5 rounded-lg border border-border-subtle bg-bg-card hover:bg-bg-elevated disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
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
