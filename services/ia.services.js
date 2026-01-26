import {
    GoogleGenAI,
    createUserContent,
    createPartFromUri,
} from "@google/genai";
import { db } from "../db.config.js";

const products = await db.query('SELECT p.name, p.stock FROM products p');


const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const pruebas = async () => {
    try {

        const image = await ai.files.upload({
            file: "./descarga.png",
        });

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [
                createUserContent([
                    "GENERE UN RESUMEN DE IMAGEN",
                    createPartFromUri(image.uri, image.mimeType),
                ]),
            ],
        });

        console.log(JSON.stringify(response.text, null, 2));
    }
    catch (error) {
        console.error(error);
    }
}


export { pruebas };