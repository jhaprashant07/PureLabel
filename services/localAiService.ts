
import { createWorker } from "tesseract.js";
import { AnalysisResult, IngredientInsight, TradeOff, Uncertainty, SimpleTranslation } from "../types";

/**
 * PURELABEL LOCAL INTELLIGENCE ENGINE v2.1
 * Expanded knowledge base for common consumer products.
 */

interface IngredientData {
  simpleName: string;
  purpose: string;
  impact: 'positive' | 'negative' | 'neutral' | 'caution';
  explanation: string;
  tradeoff?: TradeOff;
}

const KNOWLEDGE_BASE: Record<string, IngredientData> = {
  // MAGGI & NOODLES
  "wheat flour": { simpleName: "Refined Wheat", purpose: "Base", impact: "neutral", explanation: "Standard refined flour, low in fiber." },
  "palm oil": { simpleName: "Palm Oil", purpose: "Cooking Fat", impact: "caution", explanation: "High in saturated fats; environmental concerns.", tradeoff: { benefit: "Shelf stability", cost: "High saturated fat load" } },
  "wheat gluten": { simpleName: "Wheat Protein", purpose: "Texture", impact: "neutral", explanation: "Natural protein from wheat that gives chewiness." },
  "potassium chloride": { simpleName: "Salt Substitute", purpose: "Mineral", impact: "neutral", explanation: "Often used to reduce sodium content." },
  "guar gum": { simpleName: "Guar Fiber", purpose: "Thickener", impact: "positive", explanation: "Natural fiber from guar beans used to bind." },
  "sodium tripolyphosphate": { simpleName: "STPP (Stabilizer)", purpose: "Texture", impact: "caution", explanation: "Helps retain moisture and improve noodle texture." },
  "potassium carbonate": { simpleName: "Alkaline Salt", purpose: "Acidity Regulator", impact: "neutral", explanation: "Used to give noodles their yellow color and springy texture." },
  "caramel color": { simpleName: "Caramel Dye", purpose: "Coloring", impact: "caution", explanation: "A common food dye; some classes are strictly regulated." },

  // REAL JUICE & BEVERAGES
  "mixed fruit juice concentrate": { simpleName: "Fruit Sugars", purpose: "Flavor/Base", impact: "neutral", explanation: "Fruit juice with water removed; natural but high in sugar." },
  "ins 330": { simpleName: "Citric Acid", purpose: "Tang/Preservative", impact: "neutral", explanation: "Naturally occurring acid providing tartness." },
  "citric acid": { simpleName: "Citric Acid", purpose: "Tang/Preservative", impact: "neutral", explanation: "Standard acidity regulator." },
  "ins 300": { simpleName: "Vitamin C", purpose: "Antioxidant", impact: "positive", explanation: "Essential nutrient used here to prevent oxidation." },
  "ascorbic acid": { simpleName: "Vitamin C", purpose: "Antioxidant", impact: "positive", explanation: "Pure Vitamin C." },
  "sugar": { simpleName: "Refined Sugar", purpose: "Sweetener", impact: "caution", explanation: "Adds calories without nutrition; spikes blood sugar." },

  // COCA COLA
  "carbonated water": { simpleName: "Fizzy Water", purpose: "Base", impact: "neutral", explanation: "Water infused with carbon dioxide." },
  "phosphoric acid": { simpleName: "Acidulant", purpose: "Sharp Flavor", impact: "caution", explanation: "Provides the signature 'bite'; can affect bone minerals in excess." },
  "caffeine": { simpleName: "Caffeine", purpose: "Stimulant", impact: "neutral", explanation: "Natural stimulant; provides energy boost but can cause jitters." },
  "natural flavors": { simpleName: "Aroma Compounds", purpose: "Flavor", impact: "neutral", explanation: "Proprietary flavor extracts from natural sources." },

  // KURKURE & SNACKS
  "rice meal": { simpleName: "Rice Flour", purpose: "Base", impact: "positive", explanation: "A gluten-free carbohydrate source." },
  "corn meal": { simpleName: "Corn Flour", purpose: "Base", impact: "neutral", explanation: "Standard grain-based snack base." },
  "gram meal": { simpleName: "Chickpea Flour", purpose: "Protein/Texture", impact: "positive", explanation: "High-protein flour made from ground chickpeas." },
  "palmolein oil": { simpleName: "Liquid Palm Fat", purpose: "Frying Oil", impact: "caution", explanation: "The liquid fraction of palm oil." },
  "onion powder": { simpleName: "Dried Onion", purpose: "Flavoring", impact: "positive", explanation: "Natural vegetable extract." },
  "chilli powder": { simpleName: "Spices", purpose: "Heat/Flavor", impact: "positive", explanation: "Natural spice providing antioxidants." },
  "amchur": { simpleName: "Mango Powder", purpose: "Tangy Spice", impact: "positive", explanation: "Dried green mango powder; a natural flavoring." },
  "ginger powder": { simpleName: "Dried Ginger", purpose: "Flavoring", impact: "positive", explanation: "Natural root extract with anti-inflammatory properties." },
  "salt": { simpleName: "Table Salt", purpose: "Seasoning", impact: "neutral", explanation: "Essential mineral, but best consumed in moderation." },
  
  // COMMON OTHERS
  "sucralose": { simpleName: "Splenda", purpose: "Sweetener", impact: "caution", explanation: "Zero-calorie, but affects gut health." },
  "carrageenan": { simpleName: "Seaweed Thickener", purpose: "Texture", impact: "caution", explanation: "May cause digestive inflammation." },
  "sodium benzoate": { simpleName: "Preservative", purpose: "Shelf-life", impact: "caution", explanation: "Common preservative." },
  "red 40": { simpleName: "Synthetic Red Dye", purpose: "Coloring", impact: "negative", explanation: "Purely aesthetic, linked to hyperactivity." },
};

export async function analyzeIngredients(input: string | File): Promise<AnalysisResult> {
  let text = "";
  if (typeof input === 'string') {
    text = input;
    // Tiny delay to simulate processing for better UX
    await new Promise(r => setTimeout(r, 800));
  } else {
    try {
      const worker = await createWorker('eng');
      const ret = await worker.recognize(input);
      text = ret.data.text;
      await worker.terminate();
    } catch (err) {
      throw new Error("Local OCR failed. Please ensure the label is well-lit.");
    }
  }

  const normalized = text.toLowerCase();
  const insights: IngredientInsight[] = [];
  const tradeoffs: TradeOff[] = [];
  const translations: SimpleTranslation[] = [];
  
  let posScore = 0;
  let negScore = 0;

  // Identify product by keywords if possible
  let detectedProduct = "Local Scan";
  if (normalized.includes("maggi")) detectedProduct = "Maggi Noodles";
  if (normalized.includes("real")) detectedProduct = "Real Fruit Juice";
  if (normalized.includes("cola")) detectedProduct = "Coca Cola";
  if (normalized.includes("kurkure")) detectedProduct = "Kurkure Snacks";

  Object.entries(KNOWLEDGE_BASE).forEach(([key, data]) => {
    if (normalized.includes(key)) {
      insights.push({ 
        category: "Ingredient Analysis", 
        title: data.simpleName, 
        explanation: data.explanation, 
        impact: data.impact 
      });
      translations.push({ 
        original: key, 
        simpleName: data.simpleName, 
        purpose: data.purpose 
      });
      if (data.tradeoff) tradeoffs.push(data.tradeoff);

      if (data.impact === 'positive') posScore++;
      if (data.impact === 'negative') negScore += 2;
      if (data.impact === 'caution') negScore += 1;
    }
  });

  // Synthesize verdict based on local logic
  let verdict = "Balanced Choice";
  let summary = "Standard commercial product with common ingredients.";
  let humanImpact = "Standard metabolic response expected.";

  if (negScore > 3) {
    verdict = "Highly Processed";
    summary = "Detected multiple additives and industrial fats designed for shelf-life over nutrition.";
    humanImpact = "Expect a rapid glucose response followed by potential energy dips. High sodium/sugar may drive thirst.";
  } else if (posScore > negScore && negScore < 2) {
    verdict = "Cleanish Choice";
    summary = "Features several whole-food components with minimal industrial additives.";
    humanImpact = "A safer bet for regular consumption; contains recognizable nutrients.";
  } else if (negScore > 0) {
    verdict = "Moderately Processed";
    summary = "Contains some stabilizers or refined sugars common in modern snacks.";
    humanImpact = "Generally fine for occasional use, though sensitive guts may react to stabilizers.";
  }

  // Deduplicate insights/translations
  const uniqueInsights = Array.from(new Map(insights.map(i => [i.title, i])).values());
  const uniqueTranslations = Array.from(new Map(translations.map(t => [t.simpleName, t])).values());

  return {
    productName: detectedProduct,
    verdict,
    summary,
    humanImpact,
    insights: uniqueInsights.slice(0, 5),
    tradeoffs: tradeoffs.slice(0, 3),
    uncertainties: [],
    translations: uniqueTranslations.slice(0, 8),
    suggestedQuestions: [
      "Is this okay for children?",
      "Are there better alternatives?",
      "What is the main health concern here?"
    ]
  };
}
