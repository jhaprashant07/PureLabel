
import React, { useState } from 'react';
import { AppState, AnalysisResult } from './types';
import * as LocalService from './services/localAiService';
import * as GeminiService from './services/geminiService';
import InputStage from './components/InputStage';
import AnalysisView from './components/AnalysisView';
import { AlertCircle, RefreshCcw, ShieldCheck, Zap, Globe, Github } from 'lucide-react';

type EngineType = 'local' | 'cloud';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('idle');
  const [engine, setEngine] = useState<EngineType>('cloud');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInput = async (input: string | File) => {
    setState('analyzing');
    setError(null);
    try {
      let data: AnalysisResult;
      if (engine === 'local') {
        data = await LocalService.analyzeIngredients(input);
      } else {
        data = await GeminiService.analyzeIngredients(input);
      }
      setResult(data);
      setState('result');
    } catch (err) {
      console.error(err);
      setError(
        engine === 'local' 
          ? "Local analysis failed. Please ensure the image is clear."
          : "Cloud analysis failed. Check your internet connection."
      );
      setState('error');
    }
  };

  const reset = () => {
    setState('idle');
    setResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      <header className={`sticky top-0 z-50 w-full transition-all duration-300 border-b border-transparent ${state !== 'idle' ? 'bg-white/90 backdrop-blur-xl border-slate-200 shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <button onClick={reset} className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black italic shadow-lg shadow-emerald-600/20 group-hover:scale-110 transition-transform">P</div>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tighter">PureLabel</span>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-600 leading-none">Intelligence</span>
            </div>
          </button>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex bg-slate-200/50 p-1 rounded-2xl border border-slate-200">
              <button 
                onClick={() => setEngine('local')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${engine === 'local' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-500'}`}
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Local Engine
              </button>
              <button 
                onClick={() => setEngine('cloud')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${engine === 'cloud' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500'}`}
              >
                <Globe className="w-3.5 h-3.5" /> Cloud Engine
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {state === 'idle' || state === 'analyzing' ? (
          <InputStage onInput={handleInput} isAnalyzing={state === 'analyzing'} />
        ) : state === 'result' && result ? (
          <AnalysisView result={result} onReset={reset} engine={engine} />
        ) : state === 'error' ? (
          <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
            <div className="w-20 h-20 bg-rose-100 rounded-[2rem] flex items-center justify-center mb-8"><AlertCircle className="text-rose-600 w-10 h-10" /></div>
            <h2 className="text-3xl font-black mb-4 tracking-tight">Something went wrong</h2>
            <p className="text-slate-500 max-w-md mb-10 text-lg">{error}</p>
            <button onClick={reset} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-slate-900/20">
              <RefreshCcw className="w-4 h-4" /> Try Again
            </button>
          </div>
        ) : null}
      </main>

      <footer className="mt-20 border-t border-slate-200 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-slate-900 rounded-lg flex items-center justify-center text-white text-[10px] font-black italic">P</div>
              <span className="font-black text-sm">PureLabel AI</span>
            </div>
            <p className="text-xs text-slate-400">© 2025 PureLabel AI.</p>
          </div>
          <div className="flex gap-8 items-center">
            <Github className="w-5 h-5 text-slate-300 hover:text-slate-900 cursor-pointer transition-colors" />
          </div>
        </div>
      </footer>

      {/* Floating Mode Indicator */}
      <div className="fixed bottom-8 right-8 z-50 pointer-events-none sm:pointer-events-auto">
        <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl bg-white shadow-2xl border border-slate-100 transition-all duration-500 ${state === 'result' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${engine === 'local' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {engine === 'local' ? 'Local Engine' : 'Cloud Engine'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default App;
