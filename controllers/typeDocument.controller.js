import { db } from "../db.config.js";


const typeDocumentsCtrl = {}

typeDocumentsCtrl.getTypeDocuments = async (req, res) => {
    try {
        const typeDocuments = await db.query(`SELECT * FROM type_documents ORDER BY name ASC`)
        res.status(200).json({ msg: typeDocuments.rows })
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: "Ha ocurrido un error en el servidor, Intenta mas tarde." });
    }
}


typeDocumentsCtrl.saveTypeDocuments = async (req, res) => {
    try {
        const { id, name, description } = req.body
        await db.query(`INSERT INTO type_documents (id, name, description) VALUES ($1, $2, $3)`, [id, name, description])
        res.status(200).json({ msg: "Tipo de Documento Registrado Existosamente." })
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: "Ha ocurrido un error en el servidor, Intenta mas tarde." });
    }
}

typeDocumentsCtrl.updateTypeDocuments = async (req, res) => {
    try {
        const { id } = req.params
        const { name, description } = req.body
        await db.query(`UPDATE type_documents SET name = $1, description = $2 WHERE id = $3`, [name, description, id])
        res.status(200).json({ msg: "Tipo de Documento Actualizado Existosamente." })
    }

    catch (error) {
        console.log(error)
        res.status(500).json({ msg: "Ha ocurrido un error en el servidor, Intenta mas tarde." });
    }
}

typeDocumentsCtrl.deleteTypeDocuments = async (req, res) => {
    try {
        const { id } = req.params
        await db.query(`DELETE FROM type_documents WHERE id=$1`, [id])
        res.status(200).json({ msg: "Tipo de Documento Eliminado Existosamente." })
    }
    catch (error) {
        res.status(500).json({ msg: "Ha ocurrido un error en el servidor, Intenta mas tarde." });
    }
}


export { typeDocumentsCtrl };