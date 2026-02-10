
import React, { useEffect } from 'react';
import { ScriptLine, SurtitleSettings } from '../types';
import { X, Fullscreen, ExternalLink } from 'lucide-react';

interface ProjectorViewProps {
  line: ScriptLine | null;
  settings: SurtitleSettings;
  onClose: () => void;
}

const ProjectorView: React.FC<ProjectorViewProps> = ({ line, settings, onClose }) => {
  useEffect(() => {
    // Enable transparency for OBS capture if needed
    document.body.style.backgroundColor = 'transparent';
    document.body.style.overflow = 'hidden';
    return () => { 
      document.body.style.backgroundColor = '';
      document.body.style.overflow = 'auto'; 
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-24 transition-all duration-700 ease-in-out"
      style={{ 
        backgroundColor: settings.backgroundColor,
        opacity: settings.opacity 
      }}
    >
      {/* Invisible OBS Capture Header (Visible on hover) */}
      <div className="absolute top-10 right-10 flex gap-4 opacity-0 hover:opacity-100 transition-all z-[210] transform hover:translate-y-0 translate-y-2">
        <div className="bg-[#1C1B1F]/90 backdrop-blur-xl border border-[#49454F] px-6 py-3 rounded-2xl text-[10px] font-black text-[#D0BCFF] uppercase tracking-[0.3em] flex items-center gap-3 shadow-2xl">
          <ExternalLink size={16} /> OBS BROWSER SOURCE ACTIVE
        </div>
        <button 
          onClick={onClose} 
          className="bg-[#F2B8B5] text-[#601410] p-4 rounded-2xl hover:scale-105 transition-all shadow-xl"
        >
          <X size={24} />
        </button>
      </div>

      {/* Expressive Title Output */}
      <div 
        className="text-center transition-all duration-500 transform will-change-transform"
        style={{
          color: settings.textColor,
          fontFamily: settings.fontFamily === 'Bebas Neue' ? 'Bebas Neue' : 'Plus Jakarta Sans',
          fontSize: `${settings.fontSize}px`,
          lineHeight: settings.lineHeight,
          textTransform: settings.textTransform,
          maxWidth: `${settings.maxWidth}%`,
          fontWeight: 800,
          letterSpacing: '-0.03em',
          textShadow: '0 8px 40px rgba(0,0,0,0.9)'
        }}
      >
        {line ? (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out">
            {line.text}
          </div>
        ) : (
          <div className="opacity-0">---</div>
        )}
      </div>

      {/* Aesthetic Metadata Layer */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 opacity-10 pointer-events-none flex flex-col items-center gap-4">
        <div className="w-12 h-0.5 bg-white/20 rounded-full" />
        <span className="text-[10px] font-black text-white tracking-[1.5em] uppercase">
          ZIPTITLEPRO RENDER
        </span>
      </div>
    </div>
  );
};

export default ProjectorView;
