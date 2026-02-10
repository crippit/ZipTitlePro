
import React from 'react';
import { SurtitleSettings } from '../types';
import { X, Type, Maximize, Palette, AlignLeft, MousePointer2 } from 'lucide-react';

interface SettingsPanelProps {
  settings: SurtitleSettings;
  onUpdate: (settings: SurtitleSettings) => void;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onUpdate, onClose }) => {
  const handleChange = (key: keyof SurtitleSettings, value: any) => {
    onUpdate({ ...settings, [key]: value });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end p-6">
      <div className="absolute inset-0 bg-[#1C1B1F]/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md h-full bg-[#1C1B1F] border border-[#49454F]/50 rounded-[40px] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-right-10 duration-500">
        <div className="px-10 py-8 border-b border-[#49454F]/30 flex items-center justify-between bg-[#2B2930]/30">
          <div>
            <h3 className="text-xl font-black flex items-center gap-3 text-[#E6E1E5]">
              <Palette className="text-[#D0BCFF]" size={24} />
              Visual Stylist
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#938F99]">Expressive Customization</span>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center hover:bg-[#49454F] rounded-2xl transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 p-10 space-y-10 overflow-y-auto custom-scrollbar">
          {/* Typography */}
          <section className="space-y-6">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D0BCFF] flex items-center gap-3">
              <Type size={16} /> Typeface & Scale
            </label>
            <div className="space-y-6">
              <div className="bg-[#2B2930] p-6 rounded-3xl space-y-4">
                <div className="flex justify-between text-xs font-bold text-[#CAC4D0]">
                  <span>Size</span>
                  <span className="text-[#D0BCFF]">{settings.fontSize}px</span>
                </div>
                <input 
                  type="range" min="20" max="180" value={settings.fontSize} 
                  onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
                  className="w-full accent-[#D0BCFF] h-2 bg-[#1C1B1F] rounded-full appearance-none"
                />
              </div>
              <div className="grid grid-cols-1 gap-3">
                {(['Inter', 'Bebas Neue', 'Serif', 'Monospace'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => handleChange('fontFamily', f)}
                    className={`px-6 py-4 rounded-2xl text-left font-bold text-sm transition-all border-2 ${
                      settings.fontFamily === f ? 'bg-[#EADDFF] border-[#D0BCFF] text-[#21005D]' : 'bg-[#2B2930] border-transparent text-[#CAC4D0] hover:bg-[#49454F]'
                    }`}
                  >
                    {f === 'Inter' ? 'Modern Jakarta' : f}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Color & Glass */}
          <section className="space-y-6">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#EFB8C8] flex items-center gap-3">
              <Palette size={16} /> Color & Chroma
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#2B2930] p-6 rounded-3xl space-y-4">
                <span className="text-[10px] font-bold text-[#938F99] uppercase tracking-widest block">Primary Text</span>
                <input 
                  type="color" value={settings.textColor} 
                  onChange={(e) => handleChange('textColor', e.target.value)}
                  className="w-full h-12 bg-[#1C1B1F] border-none rounded-xl p-1"
                />
              </div>
              <div className="bg-[#2B2930] p-6 rounded-3xl space-y-4">
                <span className="text-[10px] font-bold text-[#938F99] uppercase tracking-widest block">Backdrop</span>
                <input 
                  type="color" value={settings.backgroundColor} 
                  onChange={(e) => handleChange('backgroundColor', e.target.value)}
                  className="w-full h-12 bg-[#1C1B1F] border-none rounded-xl p-1"
                />
              </div>
            </div>
          </section>

          {/* Layout Dynamics */}
          <section className="space-y-6">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#B2FF59] flex items-center gap-3">
              <Maximize size={16} /> Stage Dynamics
            </label>
            <div className="bg-[#2B2930] p-8 rounded-3xl space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-bold text-[#CAC4D0]">
                  <span>Safe Area Width</span>
                  <span className="text-[#B2FF59]">{settings.maxWidth}%</span>
                </div>
                <input 
                  type="range" min="30" max="100" value={settings.maxWidth} 
                  onChange={(e) => handleChange('maxWidth', parseInt(e.target.value))}
                  className="w-full accent-[#B2FF59] h-2 bg-[#1C1B1F] rounded-full appearance-none"
                />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-bold text-[#CAC4D0]">
                  <span>Global Opacity</span>
                  <span className="text-[#B2FF59]">{Math.round(settings.opacity * 100)}%</span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.05" value={settings.opacity} 
                  onChange={(e) => handleChange('opacity', parseFloat(e.target.value))}
                  className="w-full accent-[#B2FF59] h-2 bg-[#1C1B1F] rounded-full appearance-none"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="p-10 bg-[#2B2930]/50 border-t border-[#49454F]/30 text-center">
          <p className="text-[10px] text-[#938F99] font-bold uppercase tracking-widest">Config Sync Enabled</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
