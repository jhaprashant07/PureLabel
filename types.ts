
export interface IngredientInsight {
  category: string;
  title: string;
  explanation: string;
  impact: 'positive' | 'negative' | 'neutral' | 'caution';
}

export interface TradeOff {
  benefit: string;
  cost: string;
}

export interface Uncertainty {
  item: string;
  reason: string;
  suggestion: string;
}

export interface SimpleTranslation {
  original: string;
  simpleName: string;
  purpose: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AnalysisResult {
  productName: string;
  verdict: string;
  summary: string;
  humanImpact: string;
  insights: IngredientInsight[];
  tradeoffs: TradeOff[];
  uncertainties: Uncertainty[];
  translations: SimpleTranslation[];
  suggestedQuestions?: string[];
}

export type AppState = 'idle' | 'analyzing' | 'result' | 'error';
