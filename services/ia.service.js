import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});


const iaService = async (contexto, prompt) => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: prompt,
        config: {
            systemInstruction: `${contexto}`,
        },
    });

    return response.text;
}

export { iaService }