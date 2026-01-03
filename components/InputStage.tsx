
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Type, Upload, ArrowRight, Loader2, ShieldCheck, Sparkles, BrainCircuit, HeartPulse, Tag } from 'lucide-react';

interface InputStageProps {
  onInput: (data: string | File) => void;
  isAnalyzing: boolean;
}

const RECOMMENDED_TESTS = [
  {
    name: "Maggi",
    ingredients: "Wheat flour, Palm oil, Salt, Wheat gluten, Potassium chloride, Garlic, Guar gum, Sodium tripolyphosphate, Potassium carbonate, Sodium carbonate, Caramel color."
  },
  {
    name: "Real Juice",
    ingredients: "Water, Mixed Fruit Juice Concentrate (Apple, Orange, Guava, Mango, Banana, Pineapple, Apricot, Peach), Sugar, Acidity Regulator (INS 330), Antioxidant (INS 300)."
  },
  {
    name: "Coca Cola",
    ingredients: "Carbonated Water, Sugar, Caramel Color, Phosphoric Acid, Natural Flavors, Caffeine."
  },
  {
    name: "Kurkure",
    ingredients: "Rice meal, Edible vegetable oil (palmolein oil), Corn meal, Gram meal, Spices (Onion powder, Chilli powder, Amchur, Ginger powder), Salt, Citric acid (330)."
  }
];

const InputStage: React.FC<InputStageProps> = ({ onInput, isAnalyzing }) => {
  const [textInput, setTextInput] = useState('');
  const [mode, setMode] = useState<'visual' | 'text'>('visual');
  const [cameraDenied, setCameraDenied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'camera' as PermissionName }).then((result) => {
        if (result.state === 'denied') {
          setCameraDenied(true);
          setMode('text');
        }
      }).catch(() => {});
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onInput(file);
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) onInput(textInput);
  };

  const handleQuickTest = (ingredients: string) => {
    setMode('text');
    setTextInput(ingredients);
    onInput(ingredients);
  };

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-emerald-400 blur-[80px] rounded-full opacity-20 animate-pulse"></div>
          <Loader2 className="w-20 h-20 text-emerald-600 animate-spin" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Analyzing Label...</h2>
        <p className="text-slate-500 max-w-sm mx-auto text-lg font-medium leading-relaxed">
          Translating chemical lines into human impact stories.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
      {/* Hero Section */}
      <div className="text-center mb-12 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-widest mb-6">
          <Sparkles className="w-3 h-3" />
          The Intelligence of Food
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tighter leading-[1.1]">
          Read between the <br />
          <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent italic">chemical lines.</span>
        </h1>
        
        {/* Quick Test Recommendation Buttons */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <span className="w-full text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Try a common product</span>
          {RECOMMENDED_TESTS.map((test) => (
            <button
              key={test.name}
              onClick={() => handleQuickTest(test.ingredients)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 transition-all shadow-sm active:scale-95"
            >
              <Tag className="w-3 h-3 text-emerald-500" />
              {test.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-12 items-start">
        <div className="md:col-span-7">
          <div className="bg-white rounded-[2.5rem] p-3 shadow-2xl shadow-slate-200/60 border border-slate-100/80">
            <div className="flex p-1.5 bg-slate-100/80 rounded-[2rem] mb-6">
              <button 
                onClick={() => setMode('visual')}
                className={`flex-1 flex items-center justify-center py-4 rounded-[1.75rem] transition-all font-bold text-sm ${mode === 'visual' ? 'bg-white shadow-md text-slate-900' : 'text-slate-500'}`}
              >
                <Camera className="w-4 h-4 mr-2" />
                Scan Label
              </button>
              <button 
                onClick={() => setMode('text')}
                className={`flex-1 flex items-center justify-center py-4 rounded-[1.75rem] transition-all font-bold text-sm ${mode === 'text' ? 'bg-white shadow-md text-slate-900' : 'text-slate-500'}`}
              >
                <Type className="w-4 h-4 mr-2" />
                Paste List
              </button>
            </div>

            <div className="p-4 pt-0">
              {mode === 'visual' ? (
                <div className="flex flex-col gap-6">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-video bg-slate-900 text-white rounded-[2rem] flex flex-col items-center justify-center gap-4 hover:bg-slate-800 transition-all relative group"
                  >
                    <Upload className="w-10 h-10 group-hover:scale-110 transition-transform" />
                    <div className="text-center">
                      <p className="font-bold text-xl">Upload Label</p>
                      <p className="text-slate-400 text-sm">Scan a photo for analysis</p>
                    </div>
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  <textarea 
                    className="w-full h-64 bg-slate-50 border border-slate-200 rounded-[2rem] p-6 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all text-lg placeholder:text-slate-300 resize-none"
                    placeholder="Enter ingredients list..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                  />
                  <button 
                    onClick={handleTextSubmit}
                    disabled={!textInput.trim()}
                    className="w-full bg-emerald-600 text-white rounded-[1.5rem] py-5 font-black text-lg flex items-center justify-center gap-3 hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
                  >
                    Interpret Label
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-5 space-y-6 pt-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Why PureLabel?</h3>
          <div className="flex gap-5 p-6 rounded-3xl bg-white border border-slate-100 group">
            <BrainCircuit className="text-emerald-600 w-6 h-6 group-hover:scale-110 transition-transform" />
            <div>
              <h4 className="font-bold text-slate-900 mb-1">AI Analysis</h4>
              <p className="text-slate-500 text-sm">We explain the metabolic impact, not just chemical names.</p>
            </div>
          </div>
          <div className="flex gap-5 p-6 rounded-3xl bg-white border border-slate-100 group">
            <HeartPulse className="text-rose-600 w-6 h-6 group-hover:scale-110 transition-transform" />
            <div>
              <h4 className="font-bold text-slate-900 mb-1">Human Health First</h4>
              <p className="text-slate-500 text-sm">Translating regulatory jargon into gut and heart health reality.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputStage;
