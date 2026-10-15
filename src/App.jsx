import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { PushProvider } from './context/PushContext';
import Header from './components/common/Header';
import Sidebar from './components/navigation/Sidebar';
import BottomNav from './components/navigation/BottomNav';
import AuthPromptModal from './components/common/AuthPromptModal';
import OverviewView from './views/OverviewView';
import LeadsView from './views/LeadsView';
import MonitoringView from './views/MonitoringView';
import SettingsView from './views/SettingsView';

function MainApp() {
  const [currentView, setCurrentView] = useState('overview');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'overview':
        return <OverviewView onNavigateToLeads={() => setCurrentView('leads')} />;
      case 'leads':
        return <LeadsView />;
      case 'monitoring':
        return <MonitoringView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <OverviewView onNavigateToLeads={() => setCurrentView('leads')} />;
    }
  };

  return (
    <div className="min-h-screen bg-bg-main text-text-primary flex flex-col">
      {/* Top Header with live status and personal access trigger */}
      <Header onScanTriggered={() => {}} />

      {/* Main Body Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar Navigation */}
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
        />

        {/* View Content Area */}
        <main className="flex-1 p-4 sm:p-6 pb-20 md:pb-8 overflow-x-hidden min-w-0">
          {renderCurrentView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      {/* Personal Access Modal */}
      <AuthPromptModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PushProvider>
        <MainApp />
      </PushProvider>
    </AuthProvider>
  );
}
