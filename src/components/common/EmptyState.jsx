import React from 'react';
import { AlertCircle, Search, ServerOff, Terminal } from 'lucide-react';

export default function EmptyState({
  type = 'default',
  title = 'No items found',
  description = 'There are no records matching your current filter criteria.',
  action = null
}) {
  const getIcon = () => {
    switch (type) {
      case 'offline':
        return <ServerOff className="w-10 h-10 text-amber-500/80 mb-3" />;
      case 'search':
        return <Search className="w-10 h-10 text-text-muted mb-3" />;
      case 'terminal':
        return <Terminal className="w-10 h-10 text-text-muted mb-3" />;
      default:
        return <AlertCircle className="w-10 h-10 text-text-muted mb-3" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-xl border border-border-subtle bg-bg-card/40 my-4">
      {getIcon()}
      <h3 className="text-base font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-sm text-text-secondary max-w-sm mb-5 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
