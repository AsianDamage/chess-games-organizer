import { GameAnalysis } from '../types';

export const analyzeGame = async (pgn: string): Promise<GameAnalysis> => {
  try {
    // Dynamically import the SDK to ensure it doesn't block app initialization
    // and to ensure polyfills are fully active.
    const { GoogleGenAI, Type } = await import("@google/genai");

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze this chess game PGN. Provide a concise summary of the game narrative. Identify key moments (blunders, mistakes, brilliant moves). Return JSON.
      
      PGN:
      ${pgn}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            move_assessments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  move_number: { type: Type.INTEGER },
                  color: { type: Type.STRING, enum: ['white', 'black'] },
                  assessment: { type: Type.STRING, enum: ['brilliant', 'blunder', 'mistake', 'best'] },
                  explanation: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    
    if (response.text) {
        return JSON.parse(response.text) as GameAnalysis;
    }
    throw new Error("No analysis generated");
  } catch (error) {
    console.error("Analysis failed", error);
    return { summary: "Analysis unavailable at this time.", move_assessments: [] };
  }
};