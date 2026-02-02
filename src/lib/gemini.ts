import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Get Gemini API model instance
 * Uses environment variable for API key in server-side context
 */
export function getAIModel() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
}
