import { iaService } from "../services/ia.service.js";

const iaCtrl = {};

iaCtrl.generateDescription = async (req, res) => {
    try {
        const { name } = req.body;
        const contexto = `Eres un experto redactor de descripciones de productos. Crea una descripción atractiva y persuasiva para un producto llamado "${name}". La descripción debe ser clara, concisa y destacar los beneficios del producto, corta, directo al grano, sin rodeos, sin palabras de relleno, sin frases innecesarias. Dame solo el texto de la descripción, sin encabezados ni formato adicional.`;
        const prompt = `Genera una descripción para el producto "${name}" `;
        const description = await iaService(contexto, prompt);
        res.json({msg: description});
    } catch (error) {
        console.error("Error generating description:", error);
        res.status(500).json({ error: "Failed to generate description" });
    }
}


export { iaCtrl }