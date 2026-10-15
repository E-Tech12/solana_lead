import React from 'react';

export default function ScoreBadge({ score, size = 'md' }) {
  let colorClasses = 'bg-zinc-800/80 text-zinc-400 border-zinc-700/40';
  let label = 'Low';

  if (score >= 80) {
    colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    label = 'High Intent';
  } else if (score >= 60) {
    colorClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    label = 'Moderate';
  } else if (score >= 40) {
    colorClasses = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    label = 'Weak';
  }

  const sizeClasses = size === 'sm' 
    ? 'px-1.5 py-0.5 text-xs' 
    : size === 'lg'
    ? 'px-3 py-1.5 text-sm font-semibold'
    : 'px-2 py-0.5 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border font-mono ${sizeClasses} ${colorClasses}`}>
      <span className="font-bold">{score}</span>
      <span className="text-[10px] opacity-75 uppercase tracking-wider">/ 100</span>
    </span>
  );
}
