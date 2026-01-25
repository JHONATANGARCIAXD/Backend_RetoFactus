import { db } from "../db.config.js";

const productHelper = {}

productHelper.valideProduct = async (products) => {
    const valide = await db.query(`
        SELECT 
        pr.id IS NULL AS not_exist,
        pr.name,
        pr.stock < p.quantity AS has_stock
        
        FROM jsonb_to_recordset($1::jsonb) AS p(
            product_id INT,
            quantity INT
        )  

        LEFT JOIN products pr ON pr.id = p.product_id
        
        `, [JSON.stringify(products)])

    if (valide.rows.some(row => row.not_exist)) {
        throw new Error(`Hay 1 producto que no existe`);
    }

    if (valide.rows.some(row => row.has_stock == true)) {
        throw new Error(`El producto ${valide.rows[0].name} no tiene stock suficiente`);
    }

}


export { productHelper };