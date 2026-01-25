import { db } from "../db.config.js";

const productCtrl = {};

productCtrl.getProducts = async (req, res) => {
    try {
        const { search, status, categorie, page = 1, limit = 10 } = req.query

        let filter = []
        let joins = []
        let params = []

        if (search) {
            filter.push(`p.code_reference ILIKE $${params.length + 1} OR p.name ILIKE $${params.length + 1}`)
            params.push(`${search}%`)
        }

        if (status) {
            filter.push(`p.status = $${params.length + 1}`)
            params.push(status)
        }

        if (categorie) {
            filter.push(`pc.categorie_id = $${params.length + 1}`)
            params.push(categorie)
        }

        let sql = `FROM products p LEFT JOIN product_categories pc ON pc.product_id = p.id LEFT JOIN categories c ON c.id = pc.categorie_id`
        if (filter.length > 0) {
            sql += ' WHERE ' + filter.join(` AND `)
        }

        const totalRows = await db.query(`SELECT (COUNT(DISTINCT p.id)::INT)  ${sql}`, params)

        sql += ' GROUP BY p.id'
        sql += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
        const offset = (page - 1) * limit
        params.push(Number(limit), Number(offset))

        const products = await db.query(`SELECT p.*, ARRAY_AGG(json) AS categories ${sql}`, params)

        res.status(200).json({ msg: { products: products.rows, totalRows: totalRows.rows[0].count } })
    }
    catch (error) {
        console.error(error)
        res.status(500).json({ msg: "Ha ocurrido un error en el servidor, Intenta mas tarde." });
    }
}

productCtrl.saveProducts = async (req, res) => {
    try {
        const { code_reference, name, price, categories, stock, unit_measure_id, standard_code_id, tax_rate, tribute_id, is_excluded } = req.body

        let product = await db.query(`INSERT INTO products (code_reference, name, price, stock, unit_measure_id,  standard_code_id, tax_rate, tribute_id, is_excluded) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING  id`, [code_reference, name, price, stock, unit_measure_id, standard_code_id, tax_rate, tribute_id, is_excluded])

        product = product.rows[0].id

        await db.query(' INSERT INTO product_categories (product_id, categorie_id) SELECT $1, categorie_id FROM UNNEST($2::INT[]) AS categorie_id', [product, categories])

        res.status(200).json({ msg: "Producto Registrado Existosamente." })
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ msg: "Ha ocurrido un error en el servidor, Intenta mas tarde." });
    }
}

productCtrl.activeProducts = async (req, res) => {
    try {
        const { id } = req.params
        await db.query(`UPDATE products SET status = 0 WHERE id = $1`, [id])

        res.status(200).json({msg: "Producto Activado Existosamente."})

    } catch (error) {
        res.status(500).json({ msg: "Ha ocurrido un error en el servidor, Intenta mas tarde." });
    }
}

productCtrl.inactiveProducts = async (req, res) => {
    try {
        const { id } = req.params
        await db.query(`UPDATE products SET status = 1 WHERE id = $1`, [id])

        res.status(200).json({msg: "Producto Desactivado Existosamente."})

    } catch (error) {
        res.status(500).json({ msg: "Ha ocurrido un error en el servidor, Intenta mas tarde." });
    }
}

productCtrl.updateProducts = async (req, res) => {
  const client = await db.connect();

  try {
    const { id } = req.params;
    const {name,price,stock,unit_measure_id,standard_code_id,tax_rate,tribute_id,is_excluded,categories // <-- array de IDs
    } = req.body;

    await client.query('BEGIN');

    await client.query(
      `
      UPDATE products SET
        name = $1,
        price = $2,
        stock = $3,
        unit_measure_id = $4,
        standard_code_id = $5,
        tax_rate = $6,
        tribute_id = $7,
        is_excluded = $8
      WHERE id = $9
      `,
      [
        name,
        price,
        stock,
        unit_measure_id,
        standard_code_id,
        tax_rate,
        tribute_id,
        is_excluded,
        id
      ]
    );


    await client.query(
      `
      DELETE FROM product_categories
      WHERE product_id = $1
      AND category_id NOT IN (SELECT UNNEST($2::int[]))
      `,
      [id, categories]
    );

    await client.query(
      `
      INSERT INTO product_categories (product_id, category_id)
      SELECT $1, UNNEST($2::int[])
      ON CONFLICT (product_id, category_id) DO NOTHING
      `,
      [id, categories]
    );

    await client.query('COMMIT');

    res.json({ msg: 'Producto actualizado correctamente' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({
      msg: 'Ha ocurrido un error en el servidor'
    });
  } finally {
    client.release();
  }
};


productCtrl.deleteProducts = async (req, res) => {
    try {
        const { id } = req.params
        await db.query(`DELETE FROM products WHERE id = $1`, [id])

        res.status(200).json({msg: "Producto Eliminado Existosamente."})
    } catch (error) {
        res.status(500).json({ msg: "Ha ocurrido un error en el servidor, Intenta mas tarde." });
    }
}

export { productCtrl }