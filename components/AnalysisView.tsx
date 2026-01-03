
import React, { useState, useRef, useEffect } from 'react';
import { AnalysisResult, IngredientInsight, ChatMessage } from '../types';
import { 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRightLeft, 
  Search, 
  ArrowLeft,
  MessageSquare,
  Sparkles,
  Zap,
  Send,
  Loader2
} from 'lucide-react';
import { askCoPilot } from '../services/geminiService';

interface AnalysisViewProps {
  result: AnalysisResult;
  onReset: () => void;
  engine: 'local' | 'cloud';
}

const ImpactIcon = ({ impact }: { impact: IngredientInsight['impact'] }) => {
  switch (impact) {
    case 'positive': return <CheckCircle2 className="text-emerald-500 w-5 h-5" />;
    case 'negative': return <AlertCircle className="text-rose-500 w-5 h-5" />;
    case 'caution': return <AlertCircle className="text-amber-500 w-5 h-5" />;
    default: return <HelpCircle className="text-slate-400 w-5 h-5" />;
  }
};

const AnalysisView: React.FC<AnalysisViewProps> = ({ result, onReset, engine }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || engine === 'local') return;
    
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      const context = `Product: ${result.productName}. Verdict: ${result.verdict}. Ingredients: ${result.translations.map(t => t.original).join(', ')}`;
      const response = await askCoPilot(newMessages, context);
      setMessages([...newMessages, { role: 'assistant', content: response }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: "Sorry, I lost my connection. Try again?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-40">
      <button onClick={onReset} className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors group">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Analyze another
      </button>

      {/* Hero Section */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
          <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            AI Intelligence
          </div>
        </div>
        
        <h2 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">{result.productName}</h2>
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight leading-tight">{result.verdict}</h1>
        <p className="text-xl text-slate-600 mb-6 font-medium">{result.summary}</p>

        <div className="bg-slate-900 text-white rounded-3xl p-6 relative">
          <span className="absolute -top-3 left-6 bg-emerald-500 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Human Impact</span>
          <p className="text-sm italic text-slate-200">"{result.humanImpact}"</p>
        </div>
      </div>

      {/* Insights Section */}
      <section className="mb-12">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center">
          <Search className="w-4 h-4 mr-2 text-emerald-500" /> Breakdown
        </h3>
        <div className="space-y-4">
          {result.insights.map((insight, idx) => (
            <div key={idx} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex gap-4">
              <div className="mt-1"><ImpactIcon impact={insight.impact} /></div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{insight.category}</span>
                <h4 className="font-bold text-slate-900">{insight.title}</h4>
                <p className="text-slate-600 text-sm mt-1">{insight.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Chat */}
      {engine === 'cloud' && (
        <section className="mb-12">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center">
            <MessageSquare className="w-4 h-4 mr-2 text-blue-500" /> Ask PureLabel
          </h3>
          <div className="bg-blue-50/50 rounded-[2.5rem] border border-blue-100/50 p-6 flex flex-col">
            <div className="space-y-4 mb-6">
              {messages.length === 0 && (
                <div className="text-center p-8 text-blue-900/40 font-medium italic text-sm">Ask about specific health impacts or cleaner alternatives.</div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-sm font-medium ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 shadow-sm border border-blue-100 rounded-tl-none'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
              <div ref={chatEndRef} />
            </div>

            {messages.length === 0 && result.suggestedQuestions && (
              <div className="flex flex-wrap gap-2 mb-4">
                {result.suggestedQuestions.map((q, i) => (
                  <button key={i} onClick={() => handleSendMessage(q)} className="text-[10px] font-bold bg-white text-blue-700 border border-blue-100 px-3 py-1.5 rounded-full hover:bg-blue-600 hover:text-white transition-all">
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div className="relative">
              <input 
                type="text" 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                placeholder="Ask a question..."
                className="w-full bg-white border border-blue-200 rounded-2xl px-6 py-4 pr-14 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              />
              <button onClick={() => handleSendMessage(inputValue)} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Translations */}
      <section>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Human Translations</h3>
        <div className="bg-white rounded-[2rem] border border-slate-100 divide-y divide-slate-100 overflow-hidden">
          {result.translations.map((t, idx) => (
            <div key={idx} className="p-5 flex justify-between items-center gap-3">
              <div>
                <span className="text-[10px] text-slate-300 line-through block font-bold uppercase">{t.original}</span>
                <span className="font-bold text-slate-800">{t.simpleName}</span>
              </div>
              <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded">
                Role: {t.purpose}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AnalysisView;
