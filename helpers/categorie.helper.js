import { db } from "../db.config.js";


const categorieHelper = {}

categorieHelper.existCategorie = async (categories) => {
    const valide = await db.query(`SELECT COUNT(*) = array_length($1::INT[], 1) AS all_exist FROM categories WHERE id = ANY($1::INT[]);`, [JSON.parse(categories)])

    if(valide.rows[0].all_exist == false){
        throw new Error(`Hay categorias que no existen`)
    }
}

export {categorieHelper}