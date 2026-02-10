
import { GoogleGenAI, Type } from "@google/genai";
import { ScriptLine } from "../types";

export const processDocumentWithGemini = async (
  content: string | { base64: string; mimeType: string }
): Promise<ScriptLine[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    You are a professional theater script supervisor. 
    Your task is to take the provided input (text or image) and extract the dialogue into a structured script format.
    Convert the input into a clean list of lines for surtitles.
    - Each line should be short and readable (max 80 characters).
    - If a character is speaking, identify them.
    - Remove stage directions unless they are critical for timing.
    - Return a JSON array of objects with 'id' (string), 'text' (string), and 'speaker' (string, optional).
  `;

  const prompt = "Please process this document into a structured theater script for surtitles.";

  let parts: any[] = [{ text: prompt }];
  
  if (typeof content === 'string') {
    parts.push({ text: `CONTENT:\n${content}` });
  } else {
    parts.push({
      inlineData: {
        data: content.base64,
        mimeType: content.mimeType,
      },
    });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts },
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            text: { type: Type.STRING },
            speaker: { type: Type.STRING },
          },
          required: ["id", "text"],
        },
      },
    },
  });

  try {
    const result = JSON.parse(response.text || '[]');
    return result;
  } catch (e) {
    console.error("Failed to parse script JSON", e);
    return [];
  }
};
