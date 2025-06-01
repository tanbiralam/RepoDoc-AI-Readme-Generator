import OpenAI from "openai";

export const OPENAI_API_KEY = process.env.OPEN_AI_API_KEY;

// Initialize OpenAI client
export const openAI = OPENAI_API_KEY
  ? new OpenAI({ apiKey: OPENAI_API_KEY })
  : null;
