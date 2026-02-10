
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AppState, SurtitleSettings, ScriptLine } from '../types';
import { Mic, MicOff, Settings, SkipForward, SkipBack, Zap, Eye, EyeOff, LayoutTemplate, Volume2, Copy, Share2, Info } from 'lucide-react';
import SettingsPanel from './SettingsPanel';

interface ControllerViewProps {
  state: AppState;
  settings: SurtitleSettings;
  onUpdateSettings: (settings: SurtitleSettings) => void;
  onUpdateState: (state: (prev: AppState) => AppState) => void;
  onNavigate: (view: any) => void;
}

const ControllerView: React.FC<ControllerViewProps> = ({ state, settings, onUpdateSettings, onUpdateState, onNavigate }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [blackout, setBlackout] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const recognitionRef = useRef<any>(null);
  const scriptListRef = useRef<HTMLDivElement>(null);

  const normalize = (text: string) => text.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim();

  const handleStreamingMatch = useCallback((transcript: string) => {
    const spoken = normalize(transcript);
    const spokenWords = spoken.split(" ").slice(-15); // Last 15 words of context
    
    onUpdateState(prev => {
      const currentIdx = prev.currentIndex;
      if (currentIdx === -1 || currentIdx >= prev.script.length - 1) return { ...prev, lastRecognized: transcript };

      const currentLine = prev.script[currentIdx];
      const nextLine = prev.script[currentIdx + 1];
      
      const currentWords = normalize(currentLine.text).split(" ");
      const nextWords = normalize(nextLine.text).split(" ");

      // EXIT ZONE: Final 3 words of current line
      const exitZone = currentWords.slice(-3);
      // ENTRY ZONE: First 3 words of next line
      const entryZone = nextWords.slice(0, 3);

      let shouldAdvance = false;

      // 1. Check if we are in the Entry Zone of the NEXT line (strong trigger)
      const entryMatches = entryZone.filter(w => spokenWords.includes(w)).length;
      if (entryMatches >= 2) shouldAdvance = true;

      // 2. Check if we have hit the Exit Zone of the CURRENT line (anticipatory trigger)
      const exitMatches = exitZone.filter(w => spokenWords.includes(w)).length;
      if (exitMatches >= 2 && currentWords.length > 3) shouldAdvance = true;

      if (shouldAdvance) {
        return { ...prev, currentIndex: currentIdx + 1, lastRecognized: transcript };
      }

      return { ...prev, lastRecognized: transcript };
    });
  }, [onUpdateState]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        handleStreamingMatch(transcript);
      };

      recognition.onend = () => {
        if (state.isListening) try { recognition.start(); } catch(e) {}
      };

      recognitionRef.current = recognition;
    }
  }, [handleStreamingMatch, state.isListening]);

  const toggleListening = () => {
    if (state.isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    onUpdateState(prev => ({ ...prev, isListening: !prev.isListening }));
  };

  const copyProjectorUrl = () => {
    const url = window.location.href; // In a real app, this would be a filtered URL
    navigator.clipboard.writeText(url);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  useEffect(() => {
    const activeLine = scriptListRef.current?.querySelector('[data-active="true"]');
    activeLine?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [state.currentIndex]);

  return (
    <div className="flex-1 flex overflow-hidden bg-[#1C1B1F]">
      {/* Script Section */}
      <div className="flex-1 flex flex-col border-r border-[#49454F]/30 shadow-[4px_0_24px_rgba(0,0,0,0.3)] z-10">
        <div className="h-16 px-8 flex items-center justify-between bg-[#1C1B1F]/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[#D0BCFF] text-[#381E72] flex items-center justify-center shadow-lg shadow-[#D0BCFF]/10">
              <Zap size={20} fill="currentColor" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#938F99] block leading-none mb-1">Live Tracking</span>
              <span className="text-sm font-bold text-[#E6E1E5]">Predictive Multi-Zone Engine</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-4 py-1.5 bg-[#2B2930] rounded-full text-[10px] font-bold text-[#D0BCFF] border border-[#49454F]">
              {state.currentIndex + 1} / {state.script.length}
            </div>
          </div>
        </div>

        <div ref={scriptListRef} className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar bg-[radial-gradient(circle_at_top_right,_rgba(208,188,255,0.05),_transparent)]">
          {state.script.map((line, idx) => (
            <div 
              key={line.id}
              data-active={idx === state.currentIndex}
              onClick={() => onUpdateState(prev => ({ ...prev, currentIndex: idx }))}
              className={`relative p-8 rounded-[32px] transition-all duration-500 cursor-pointer border-2 ${
                idx === state.currentIndex 
                  ? 'bg-[#EADDFF] border-[#D0BCFF] text-[#21005D] shadow-[0_12px_32px_rgba(0,0,0,0.4)] scale-[1.02] z-20' 
                  : 'bg-[#2B2930]/40 border-transparent text-[#CAC4D0] hover:bg-[#2B2930] hover:border-[#49454F]'
              } ${idx < state.currentIndex ? 'opacity-20 grayscale' : 'opacity-100'}`}
            >
              <div className="flex gap-8">
                <span className={`text-xs font-black mt-1.5 transition-colors ${idx === state.currentIndex ? 'text-[#6750A4]' : 'text-[#49454F]'}`}>
                  {String(idx + 1).padStart(3, '0')}
                </span>
                <div className="flex-1">
                  {line.speaker && (
                    <div className={`text-[10px] font-black uppercase tracking-[0.3em] mb-3 ${idx === state.currentIndex ? 'text-[#6750A4]' : 'text-[#D0BCFF]/40'}`}>
                      {line.speaker}
                    </div>
                  )}
                  <p className={`text-2xl font-bold leading-tight tracking-tight ${idx === state.currentIndex ? 'text-[#21005D]' : ''}`}>
                    {line.text}
                  </p>
                </div>
              </div>
              {idx === state.currentIndex && (
                <div className="absolute top-4 right-8">
                  <div className="w-2 h-2 rounded-full bg-[#6750A4] animate-ping" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Predictive Monitor */}
        <div className="h-24 px-10 bg-[#2B2930] border-t border-[#49454F]/50 flex items-center gap-8">
          <div className={`p-3 rounded-2xl ${state.isListening ? 'bg-[#D0BCFF] text-[#381E72] shadow-lg shadow-[#D0BCFF]/20' : 'bg-[#49454F] text-[#938F99]'}`}>
            <Volume2 size={28} className={state.isListening ? 'animate-pulse' : ''} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#938F99]">Streaming Speech Context</div>
              {state.isListening && <div className="text-[10px] font-bold text-[#B2FF59] flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-[#B2FF59]" /> SENSITIVE</div>}
            </div>
            <p className="text-sm font-semibold text-[#E6E1E5] truncate italic opacity-80">
              {state.isListening ? (state.lastRecognized || "Analyzing room audio for exit cues...") : "Voice detection idle."}
            </p>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="w-[440px] bg-[#1C1B1F] flex flex-col p-10 gap-10 overflow-y-auto custom-scrollbar">
        {/* Playback Controls */}
        <section className="space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#938F99]">Performance Ops</h3>
              <div className="flex gap-1">
                {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-[#49454F]" />)}
              </div>
           </div>
           <div className="grid grid-cols-2 gap-5">
              <button 
                onClick={() => onUpdateState(prev => ({ ...prev, currentIndex: Math.max(0, prev.currentIndex - 1) }))}
                className="h-28 bg-[#2B2930] rounded-[32px] flex flex-col items-center justify-center gap-3 hover:bg-[#322F37] transition-all group border border-[#49454F]/30"
              >
                <div className="p-3 rounded-2xl bg-[#49454F]/50 text-[#D0BCFF] group-hover:scale-110 transition-transform">
                  <SkipBack size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#CAC4D0]">Previous</span>
              </button>
              <button 
                onClick={() => onUpdateState(prev => ({ ...prev, currentIndex: Math.min(prev.script.length - 1, prev.currentIndex + 1) }))}
                className="h-28 bg-[#D0BCFF] text-[#381E72] rounded-[32px] flex flex-col items-center justify-center gap-3 hover:bg-[#EADDFF] transition-all group shadow-xl shadow-[#D0BCFF]/10"
              >
                <div className="p-3 rounded-2xl bg-[#381E72] text-[#D0BCFF] group-hover:scale-110 transition-transform">
                  <SkipForward size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Next Cue</span>
              </button>
           </div>
        </section>

        {/* Global States */}
        <section className="space-y-4">
          <button 
            onClick={toggleListening}
            className={`w-full h-20 rounded-[24px] flex items-center justify-between px-8 transition-all border-2 ${
              state.isListening 
                ? 'bg-[#F2B8B5]/5 border-[#F2B8B5] text-[#F2B8B5]' 
                : 'bg-[#B2FF59]/5 border-[#B2FF59]/40 text-[#B2FF59]'
            }`}
          >
            <div className="flex items-center gap-4">
              {state.isListening ? <MicOff size={24} /> : <Mic size={24} />}
              <span className="font-black text-sm tracking-widest uppercase">
                {state.isListening ? 'Stop Auto-Track' : 'Start Auto-Track'}
              </span>
            </div>
            <div className={`w-3 h-3 rounded-full ${state.isListening ? 'bg-[#F2B8B5] animate-pulse' : 'bg-[#B2FF59]'}`} />
          </button>

          <button 
            onClick={() => setBlackout(!blackout)}
            className={`w-full h-20 rounded-[24px] flex items-center justify-between px-8 transition-all ${
              blackout ? 'bg-[#E6E1E5] text-[#1C1B1F] shadow-2xl' : 'bg-[#2B2930] text-[#E6E1E5] hover:bg-[#49454F]'
            }`}
          >
            <div className="flex items-center gap-4">
              {blackout ? <Eye size={24} /> : <EyeOff size={24} />}
              <span className="font-black text-sm tracking-widest uppercase">
                {blackout ? 'Restore Titles' : 'Blackout'}
              </span>
            </div>
            <span className="text-[10px] font-bold opacity-40">ALT+B</span>
          </button>
        </section>

        {/* Broadcast Tools */}
        <section className="bg-[#2B2930] rounded-[32px] p-8 border border-[#49454F]/50 space-y-6">
           <div className="flex items-center justify-between">
              <h5 className="text-[10px] font-black text-[#D0BCFF] uppercase tracking-[0.3em]">Broadcast Hub</h5>
              <Info size={14} className="text-[#938F99]" />
           </div>
           
           <div className="space-y-4">
             <button 
               onClick={copyProjectorUrl}
               className="w-full py-4 bg-[#1C1B1F] rounded-2xl flex items-center justify-center gap-3 text-sm font-bold hover:bg-black transition-colors"
             >
               {copyFeedback ? <span className="text-[#B2FF59]">Link Copied!</span> : <><Copy size={16} className="text-[#D0BCFF]" /> Copy Projector URL</>}
             </button>
             
             <button 
               onClick={() => onNavigate('projector')}
               className="w-full py-4 bg-[#D0BCFF]/10 text-[#D0BCFF] rounded-2xl flex items-center justify-center gap-3 text-sm font-bold border border-[#D0BCFF]/20 hover:bg-[#D0BCFF]/20 transition-all"
             >
               <Share2 size={16} /> Launch OBS Source
             </button>
           </div>

           <p className="text-[10px] text-[#938F99] leading-relaxed text-center italic">
             "To use with NDI, add the URL as a Browser Source in OBS and use the NDI virtual output plugin."
           </p>
        </section>

        <button 
          onClick={() => setShowSettings(true)}
          className="w-full p-6 bg-[#2B2930] rounded-[24px] flex items-center justify-between hover:bg-[#49454F] transition-all border border-transparent hover:border-[#D0BCFF]/30"
        >
          <div className="flex items-center gap-4 text-[#D0BCFF]">
            <Settings size={22} />
            <span className="font-black text-sm tracking-widest uppercase text-[#E6E1E5]">Appearance Editor</span>
          </div>
          <LayoutTemplate size={18} className="text-[#938F99]" />
        </button>
      </div>

      {showSettings && <SettingsPanel settings={settings} onUpdate={onUpdateSettings} onClose={() => setShowSettings(false)} />}
    </div>
  );
};

export default ControllerView;
