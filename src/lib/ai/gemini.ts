import { GoogleGenAI } from '@google/genai';

let client: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (client) {
    return client;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key') {
    throw new Error('GEMINI_API_KEY is not defined or is set to placeholder.');
  }

  client = new GoogleGenAI({ apiKey });
  return client;
}

