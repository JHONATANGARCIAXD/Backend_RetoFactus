import { db } from "../db.config.js";

const categoriesCtrl = {}


categoriesCtrl.getCategories = async (req, res) => {
    try {
        const { search, status, page = 1, limit = 10 } = req.query

        let filter = []
        let params = []

        if (search) {
            filter.push(`c.name ILIKE $${params.length + 1}`)
            params.push(`${search}%`)
        }

        if (status) {
            filter.push(`c.status = ${params.length + 1}`)
            params.push(status)
        }

        let sql = `FROM categories c`
        if (filter.length > 0) {
            sql = ' WHERE ' + filter.join(' AND ')
        }

        let totalRows = await db.query(`SELECT (COUNT(DISTINCT c.id)::INT) ${sql} `, params)

        sql += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
        const offset = (page - 1) * limit
        params.push(Number(limit), Number(offset))


        const categories = await db.query(`SELECT c.* ${sql}`, params)

        res.status(200).json({ msg: { categories: categories.rows, totalRows: totalRows.rows[0].count } })

    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: "Ha ocurrido un error en el servidor, Intenta mas tarde." });
    }
}

categoriesCtrl.saveCategories = async (req, res) => {
    try {
        const { name, description } = req.body

        await db.query(`INSERT INTO categories (name, description) VALUES ($1, $2)`, [name, description])

        res.status(200).json({ msg: "Categoria Registrada Existosamente." })

    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: "Ha ocurrido un error en el servidor, Intenta mas tarde." });
    }
}

categoriesCtrl.activeCategories = async (req, res) => {
    try {
        const { id } = req.params
        await db.query(`UPDATE categories SET status = 0 WHERE id = $1`, [id])

        res.status(200).json({ msg: "Categoria Activada Existosamente." })
    } catch (error) {
        res.status(500).json({ msg: "Ha ocurrido un error en el servidor, Intenta mas tarde." });
    }
}

categoriesCtrl.inactiveCategories = async (req, res) => {
    try {
        const { id } = req.params
        await db.query(`UPDATE categories SET status = 1 WHERE id = $1`, [id])

        res.status(200).json({ msg: "Categoria Desactivada Existosamente." })
    }
    catch (error) {
        res.status(500).json({ msg: "Ha ocurrido un error en el servidor, Intenta mas tarde." });
    }
}

categoriesCtrl.deleteCategories = async (req, res) => {
    try {
        const { id } = req.params
        await db.query(`DELETE FROM categories WHERE id=$1`, [id])

        res.status(200).json({ msg: "Categoria Eliminada Existosamente." })
    }
    catch (error) {
        res.status(500).json({ msg: "Ha ocurrido un error en el servidor, Intenta mas tarde." });
    }
}

categoriesCtrl.updateCategories = async (req, res) => {
    try {
        const { id } = req.params
        const { name, description } = req.body
        
        await db.query(`UPDATE categories SET name=$1, description=$2 WHERE id=$3`, [name, description, id])
        res.status(200).json({ msg: "Categoria Actualizada Existosamente." })
    }
    catch (error) {
        res.status(500).json({ msg: "Ha ocurrido un error en el servidor, Intenta mas tarde." });
    }
}









export { categoriesCtrl }