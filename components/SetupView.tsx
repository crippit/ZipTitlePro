
import React, { useState } from 'react';
import { Upload, FileText, Sparkles, Loader2, Cpu, Link, ArrowRight, AlertCircle } from 'lucide-react';
import { processDocumentWithGemini } from '../services/gemini';
import { ScriptLine } from '../types';

interface SetupViewProps {
  onScriptLoaded: (script: ScriptLine[]) => void;
}

const SetupView: React.FC<SetupViewProps> = ({ onScriptLoaded }) => {
  const [loading, setLoading] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [cloudUrl, setCloudUrl] = useState('');
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        const script = await processDocumentWithGemini({
          base64,
          mimeType: file.type || 'image/jpeg',
        });
        onScriptLoaded(script);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Analysis failed. Ensure document is clear.");
      setLoading(false);
    }
  };

  const handleUrlImport = async () => {
    if (!cloudUrl.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(cloudUrl);
      if (!response.ok) throw new Error("Could not reach the URL.");
      
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json') || contentType?.includes('text/plain')) {
        const text = await response.text();
        const script = await processDocumentWithGemini(text);
        onScriptLoaded(script);
      } else if (contentType?.includes('image/') || contentType?.includes('application/pdf')) {
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          const script = await processDocumentWithGemini({
            base64,
            mimeType: contentType || 'image/jpeg',
          });
          onScriptLoaded(script);
        };
        reader.readAsDataURL(blob);
      } else {
        // Fallback for unknown types - try as text
        const text = await response.text();
        const script = await processDocumentWithGemini(text);
        onScriptLoaded(script);
      }
    } catch (err) {
      setError("Cloud import failed. Please ensure the link is public and supports CORS (e.g., Raw GitHub or Pastebin).");
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-12 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,_rgba(208,188,255,0.03),_transparent)]">
      <div className="max-w-4xl w-full space-y-10">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-[#D0BCFF]/10 text-[#D0BCFF] rounded-full text-[10px] font-black uppercase tracking-widest border border-[#D0BCFF]/20">
            <Cpu size={14} /> Pipeline Version 2.4.0-Stable
          </div>
          <h2 className="text-5xl font-extrabold tracking-tighter text-[#E6E1E5]">A New Era in Surtitles</h2>
          <p className="text-[#938F99] text-lg max-w-xl mx-auto font-medium">ZipTitlePro automates the creation and presentation of surtitles from scripts using AI based tools.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Local Import Card */}
          <div className="relative group md3-card p-10 flex flex-col items-center justify-center gap-6 border-2 border-dashed border-[#49454F] hover:border-[#D0BCFF] hover:bg-[#D0BCFF]/5 transition-all cursor-pointer">
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={handleFileUpload} 
              accept="image/*,application/pdf" 
              disabled={loading}
            />
            <div className="w-20 h-20 bg-[#381E72] rounded-[32px] flex items-center justify-center text-[#D0BCFF] group-hover:scale-105 transition-transform shadow-xl shadow-black/20">
              <Upload size={36} />
            </div>
            <div className="text-center">
              <span className="block text-lg font-bold text-[#E6E1E5]">Local Document</span>
              <span className="text-sm text-[#938F99] font-medium tracking-tight">PDF, JPG, PNG or Text</span>
            </div>
          </div>

          {/* Cloud Import Card (Now Enabled) */}
          <div 
            onClick={() => !isUrlMode && setIsUrlMode(true)}
            className={`relative md3-card p-10 flex flex-col items-center justify-center transition-all border-2 ${
              isUrlMode 
                ? 'bg-[#2B2930] border-[#D0BCFF] cursor-default' 
                : 'bg-[#2B2930]/40 border-transparent hover:border-[#49454F] cursor-pointer group'
            }`}
          >
            {!isUrlMode ? (
              <>
                <div className="w-20 h-20 bg-[#49454F] rounded-[32px] flex items-center justify-center text-[#CAC4D0] group-hover:bg-[#D0BCFF] group-hover:text-[#381E72] transition-all">
                  <Link size={36} />
                </div>
                <div className="text-center mt-6">
                  <span className="block text-lg font-bold text-[#E6E1E5]">Cloud Import</span>
                  <span className="text-sm text-[#938F99] font-medium tracking-tight">Public URL / Web Link</span>
                </div>
              </>
            ) : (
              <div className="w-full space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-[#D0BCFF] uppercase tracking-widest">Enter Source Link</span>
                  <button onClick={(e) => { e.stopPropagation(); setIsUrlMode(false); }} className="text-[10px] font-bold text-[#938F99] hover:text-[#E6E1E5]">Cancel</button>
                </div>
                <div className="relative">
                  <input 
                    type="url"
                    value={cloudUrl}
                    onChange={(e) => setCloudUrl(e.target.value)}
                    placeholder="https://raw.githubusercontent.com/..."
                    className="w-full bg-[#1C1B1F] border border-[#49454F] rounded-2xl p-4 text-sm font-medium focus:outline-none focus:border-[#D0BCFF] text-[#E6E1E5]"
                    autoFocus
                  />
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleUrlImport(); }}
                  disabled={loading || !cloudUrl.trim()}
                  className="w-full py-3 bg-[#D0BCFF] text-[#381E72] rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-[#E8DEF8] transition-all disabled:opacity-30"
                >
                  Fetch Remote Script <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Text Entry Area */}
        <div className="relative md3-card p-2 overflow-hidden bg-[#2B2930] border border-[#49454F]/30 shadow-2xl">
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Drop raw text here to initiate instant parsing..."
            className="w-full h-48 bg-transparent p-8 text-xl font-medium text-[#E6E1E5] focus:outline-none resize-none custom-scrollbar placeholder-[#49454F]"
          />
          <div className="flex items-center justify-between p-6 border-t border-[#49454F]/30 bg-[#1C1B1F]/30">
            <div className="flex items-center gap-2 text-[#938F99]">
              <FileText size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Manual Entry Mode</span>
            </div>
            <button
              onClick={async () => {
                setLoading(true);
                const script = await processDocumentWithGemini(pastedText);
                onScriptLoaded(script);
              }}
              disabled={loading || !pastedText.trim()}
              className="px-10 py-4 bg-[#D0BCFF] text-[#381E72] rounded-[24px] font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-[#E8DEF8] transition-all disabled:opacity-30 shadow-lg shadow-[#D0BCFF]/10"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
              {loading ? 'Analyzing Content...' : 'Partition Script'}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-4 p-6 bg-[#F2B8B5]/5 border border-[#F2B8B5]/20 text-[#F2B8B5] rounded-[28px] animate-in slide-in-from-bottom-2">
            <AlertCircle size={24} className="shrink-0" />
            <div className="text-sm font-bold leading-relaxed">{error}</div>
          </div>
        )}

        <div className="pt-8 text-center">
           <p className="text-[10px] text-[#49454F] font-black uppercase tracking-[0.4em]">Integrated Intelligence Engine</p>
        </div>
      </div>
    </div>
  );
};

export default SetupView;
