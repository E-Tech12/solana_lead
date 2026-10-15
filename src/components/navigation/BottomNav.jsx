import React from 'react';
import { Compass, Users, Activity, Sliders } from 'lucide-react';

export default function BottomNav({ currentView, onViewChange, unreviewedCount = 0 }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Compass },
    { id: 'leads', label: 'Leads', icon: Users, badge: unreviewedCount },
    { id: 'monitoring', label: 'Status', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Sliders },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-main/95 backdrop-blur-lg border-t border-border-subtle safe-bottom">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors relative ${
                isActive ? 'text-emerald-400 font-medium' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-text-muted'}`} />
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full text-[9px] bg-emerald-500 text-bg-main font-bold font-mono">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
