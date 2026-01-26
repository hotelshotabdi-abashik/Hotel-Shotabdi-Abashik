
import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

// Initialize the Gemini API client using the environment variable
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a response from the AI concierge for Shotabdi Residential.
 * @param history The conversation history.
 * @param message The new user message.
 * @returns The AI's response text.
 */
export const getConciergeResponse = async (history: ChatMessage[], message: string) => {
  // Convert existing history to the format expected by the Gemini API
  const contents = history.map(m => ({
    role: m.role,
    parts: [{ text: m.text }]
  }));
  
  // Add the current user prompt to the contents array
  contents.push({ role: 'user', parts: [{ text: message }] });

  // The Gemini API requires that the conversation history begins with a 'user' turn.
  if (contents.length > 0 && contents[0].role === 'model') {
    contents.shift();
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction: "You are a helpful and polite AI concierge for Shotabdi Residential in Sylhet, Bangladesh. Provide information about available rooms (Deluxe Single, Deluxe Double, Family Suite, Super Deluxe), hotel facilities (Wi-Fi, AC, Parking, 24/7 Helpline), and local Sylhet attractions (Keane Bridge, tea gardens, Shah Jalal Mazar). Keep your responses professional, warm, and concise.",
      },
    });

    // Directly access the .text property from the GenerateContentResponse
    return response.text;
  } catch (error) {
    console.error("Gemini Concierge Error:", error);
    throw error;
  }
};

/**
 * Searches for tourist information using Google Search grounding.
 * @param query The search query provided by the user.
 * @returns An object containing the generated text and a list of extracted sources.
 */
export const searchTouristInfo = async (query: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    // Extract search grounding sources from the response metadata if available
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .map((chunk: any) => {
        if (chunk.web) {
          return {
            title: chunk.web.title,
            uri: chunk.web.uri,
          };
        }
        return null;
      })
      .filter((s: any) => s !== null);

    return {
      text: response.text,
      sources: sources
    };
  } catch (error) {
    console.error("Search Grounding Error:", error);
    return { 
      text: "I'm sorry, I encountered an error while searching for tourist information.", 
      sources: [] 
    };
  }
};
