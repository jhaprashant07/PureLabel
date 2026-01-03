
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AnalysisResult, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are the PureLabel Assistant, a world-class nutrition strategist and biological interpreter. 
Instead of acting like a dictionary, you act like a trusted health advisor standing next to the user in a grocery aisle.

Core Philosophy:
- Regulatory labels are for lawyers; your interpretations are for humans.
- Focus on BIO-AVAILABILITY: Can the body actually use this?
- Focus on METABOLIC IMPACT: Will this cause a spike, a crash, or sustained energy?
- Focus on GUT HARMONY: How will the microbiome react to these stabilizers?

Respond ONLY with JSON:
{
  "productName": "Name",
  "verdict": "Short punchy label (e.g., 'Metabolic Rollercoaster', 'Pure Fuel')",
  "summary": "The 'honest' truth in one sentence.",
  "humanImpact": "A 2-3 sentence explanation of how the body feels after consuming this (e.g., 'Expect a quick energy hit from the refined starches, likely followed by hunger within 90 minutes.')",
  "insights": [
    { "category": "Metabolic/Gut/Brain", "title": "Human-centric title", "explanation": "Why it matters to a human", "impact": "positive|negative|neutral|caution" }
  ],
  "tradeoffs": [
    { "benefit": "e.g. Tastes like real fruit", "cost": "e.g. Achieved via neuro-active flavorings" }
  ],
  "uncertainties": [],
  "translations": [],
  "suggestedQuestions": ["Is this safe for my kids?", "How does this affect my gut health?", "What's a cleaner alternative?"]
}
`;

export async function analyzeIngredients(input: string | File): Promise<AnalysisResult> {
  const model = "gemini-3-flash-preview";
  let contents: any;

  if (typeof input === 'string') {
    contents = { parts: [{ text: `Analyze these ingredients: ${input}` }] };
  } else {
    const base64Data = await fileToBase64(input);
    contents = {
      parts: [
        { inlineData: { data: base64Data, mimeType: input.type } },
        { text: "Analyze the ingredients in this image as a nutrition assistant." }
      ]
    };
  }

  const response: GenerateContentResponse = await ai.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
    }
  });

  return JSON.parse(response.text || '{}') as AnalysisResult;
}

export async function askCoPilot(history: ChatMessage[], productContext: string): Promise<string> {
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are the PureLabel Assistant. Product Context: ${productContext}. Keep answers under 3 sentences, highly actionable, and focused on human health impact.`
    }
  });

  const lastMessage = history[history.length - 1].content;
  const response = await chat.sendMessage({ message: lastMessage });
  return response.text || "I'm having trouble interpreting that. Can you rephrase?";
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result?.toString().split(',')[1] || '');
    reader.onerror = error => reject(error);
  });
}
