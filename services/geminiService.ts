import { GoogleGenAI, Tool } from "@google/genai";
import { BAAZAR_SATHI_SYSTEM_PROMPT } from '../constants';
import { GroundingChunk, SearchSource } from '../types';

let genAI: GoogleGenAI | null = null;

export const initializeGemini = () => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is missing from environment variables.");
    throw new Error("API Key not found");
  }
  genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const streamSearchResponse = async (
  query: string,
  onChunk: (text: string) => void,
  onSources: (sources: SearchSource[]) => void
): Promise<string> => {
  if (!genAI) initializeGemini();
  if (!genAI) throw new Error("Failed to initialize Gemini Client");

  try {
    const model = 'gemini-2.5-flash';
    
    // Enable Google Search tool
    const tools: Tool[] = [{ googleSearch: {} }];

    const responseStream = await genAI.models.generateContentStream({
      model,
      contents: [
        {
          role: 'user',
          parts: [{ text: query }]
        }
      ],
      config: {
        systemInstruction: BAAZAR_SATHI_SYSTEM_PROMPT,
        tools: tools,
        temperature: 0.3, // Lower temperature for more factual answers
      }
    });

    let fullText = "";
    
    for await (const chunk of responseStream) {
      // Handle text content
      const text = chunk.text;
      if (text) {
        fullText += text;
        onChunk(fullText);
      }

      // Handle grounding metadata (sources)
      const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] | undefined;
      
      if (groundingChunks && groundingChunks.length > 0) {
        const sources: SearchSource[] = groundingChunks
          .map((c) => c.web)
          .filter((w): w is { uri: string; title: string } => !!w)
          .map((w) => ({
            title: w.title,
            uri: w.uri
          }));
        
        if (sources.length > 0) {
            // Deduplicate sources by URI
            const uniqueSources = Array.from(new Map(sources.map(item => [item.uri, item])).values());
            onSources(uniqueSources);
        }
      }
    }

    return fullText;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
};