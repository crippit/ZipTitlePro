
import { GoogleGenAI, Type } from "@google/genai";
import { ScriptLine } from "../types";

export const processDocumentWithGemini = async (
  content: string | { base64: string; mimeType: string }
): Promise<ScriptLine[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    You are a professional theater script supervisor and surtitle technician. 
    Your task is to take the provided input (text or image) and extract the dialogue into a structured script format for live surtitling.
    - Convert the input into a clean list of lines.
    - Each line should be short and readable (maximum 80 characters for legibility on stage screens).
    - If a character is speaking, identify them in the 'speaker' field.
    - Remove stage directions, parentheticals, or metadata unless they are critical for the spoken dialogue.
    - Ensure the 'id' is a unique string.
    - Return a JSON array of objects.
  `;

  const prompt = "Please process this script into a structured JSON array for surtitling.";

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
    model: 'gemini-3-pro-preview',
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
    const text = response.text || '[]';
    const result = JSON.parse(text);
    return result;
  } catch (e) {
    console.error("Failed to parse script JSON. Model returned:", response.text);
    return [];
  }
};
