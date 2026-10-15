import React from 'react';
import { Compass, Users, Activity, Sliders } from 'lucide-react';

export default function Sidebar({ currentView, onViewChange, unreviewedCount = 0 }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Compass },
    { id: 'leads', label: 'Lead Feed', icon: Users, badge: unreviewedCount },
    { id: 'monitoring', label: 'Monitoring', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Sliders },
  ];

  return (
    <aside className="hidden md:flex flex-col w-56 border-r border-border-subtle bg-bg-main p-4 shrink-0 min-h-[calc(100vh-57px)]">
      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-bg-card border border-border-subtle text-emerald-400 font-semibold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-card/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-text-muted'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 font-mono">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-border-subtle text-[11px] text-text-muted">
        <p>Solana Memecoin Lead Finder</p>
        <p className="font-mono text-[10px] text-text-muted/60 mt-0.5">Local PC + Vercel PWA</p>
      </div>
    </aside>
  );
}
