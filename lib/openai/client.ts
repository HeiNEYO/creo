import OpenAI from "openai";

/** Client OpenAI côté serveur uniquement. */
export function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY doit être défini.");
  }
  return new OpenAI({ apiKey });
}
