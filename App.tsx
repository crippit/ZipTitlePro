
import React, { useState, useEffect } from 'react';
import { AppState, ScriptLine, SurtitleSettings } from './types';
import SetupView from './components/SetupView';
import ControllerView from './components/ControllerView';
import ProjectorView from './components/ProjectorView';
import { Monitor, Layout, Play, FileText, Cpu } from 'lucide-react';

const DEFAULT_SETTINGS: SurtitleSettings = {
  fontSize: 56,
  fontFamily: 'Inter',
  textColor: '#D0BCFF',
  backgroundColor: '#000000',
  opacity: 1.0,
  lineHeight: 1.1,
  textTransform: 'uppercase',
  maxWidth: 85,
  padding: 40,
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    view: 'setup',
    script: [],
    currentIndex: -1,
    isListening: false,
    lastRecognized: '',
  });

  const [settings, setSettings] = useState<SurtitleSettings>(() => {
    const saved = localStorage.getItem('ziptitle_settings_md3');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('ziptitle_settings_md3', JSON.stringify(settings));
  }, [settings]);

  const handleScriptLoaded = (script: ScriptLine[]) => {
    setAppState(prev => ({ ...prev, script, view: 'controller', currentIndex: 0 }));
  };

  const renderView = () => {
    switch (appState.view) {
      case 'setup':
        return <SetupView onScriptLoaded={handleScriptLoaded} />;
      case 'controller':
        return (
          <ControllerView 
            state={appState} 
            settings={settings}
            onUpdateSettings={setSettings}
            onUpdateState={setAppState}
            onNavigate={(view) => setAppState(prev => ({ ...prev, view }))}
          />
        );
      case 'projector':
        return (
          <ProjectorView 
            line={appState.currentIndex >= 0 ? appState.script[appState.currentIndex] : null} 
            settings={settings}
            onClose={() => setAppState(prev => ({ ...prev, view: 'controller' }))}
          />
        );
      default:
        return <SetupView onScriptLoaded={handleScriptLoaded} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#1C1B1F] flex flex-col text-[#E6E1E5]">
      {/* MD3 Top App Bar */}
      <header className="h-20 px-8 flex items-center justify-between border-b border-[#49454F]/30 bg-[#1C1B1F]/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#D0BCFF] text-[#381E72] rounded-2xl flex items-center justify-center shadow-lg shadow-[#D0BCFF]/10">
            <Cpu size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">ZipTitle<span className="text-[#D0BCFF]">Pro</span></h1>
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#938F99] uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EFB8C8]" />
              A Smarter Surtitling Solution
            </div>
          </div>
        </div>

        <nav className="flex items-center p-1.5 bg-[#2B2930] rounded-[20px] border border-[#49454F]/50">
          {[
            { id: 'setup', icon: FileText, label: 'Script' },
            { id: 'controller', icon: Play, label: 'Live' },
            { id: 'projector', icon: Monitor, label: 'Project' }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setAppState(prev => ({ ...prev, view: item.id as any }))}
              disabled={item.id !== 'setup' && appState.script.length === 0}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-[16px] transition-all duration-300 ${
                appState.view === item.id 
                  ? 'bg-[#E8DEF8] text-[#1D192B] font-bold shadow-sm' 
                  : 'text-[#CAC4D0] hover:bg-[#49454F]/40'
              } disabled:opacity-30`}
            >
              <item.icon size={18} />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 relative overflow-hidden flex flex-col">
        {renderView()}
      </main>

      {/* MD3 Footer Status */}
      <footer className="h-12 bg-[#1C1B1F] border-t border-[#49454F]/20 px-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
            <div className={`w-2 h-2 rounded-full ${appState.isListening ? 'bg-[#B2FF59] shadow-[0_0_8px_#B2FF59]' : 'bg-[#F44336]'}`} />
            <span className="text-[#938F99]">Sync Status: {appState.isListening ? 'Active' : 'Offline'}</span>
          </div>
          <div className="h-4 w-px bg-[#49454F]" />
          <div className="text-[10px] font-bold text-[#938F99] uppercase tracking-wider">
            OBS Source: <span className="text-[#D0BCFF]">Ready</span>
          </div>
        </div>
        <div className="text-[10px] font-mono text-[#49454F]">
          ZIP-RT-ENGINE-V2
        </div>
      </footer>
    </div>
  );
};

export default App;
