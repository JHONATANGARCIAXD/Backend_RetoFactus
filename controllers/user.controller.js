import { db } from "../db.config.js"
import { webToken } from "../middleware/webToken.middleware.js";
import axios from "axios";
import 'dotenv/config'
import bcrypt from 'bcryptjs';
// import { pruebas } from "../services/ia.services.js";

const userCtrl = {};

userCtrl.loginUsers = async (req, res) => {
    try {
        const user = req.user
        const { password } = req.body;

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ msg: "Contraseña incorrecta" });
        }

        const response = await axios.post(`https://api-sandbox.factus.com.co/oauth/token`, {
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: 'password',
            username: `sandbox@factus.com.co`,
            password: `sandbox2024%`,
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const access_token = response.data.access_token


        const refresh_token = response.data.refresh_token
        const expires_in = Date.now() + (response.data.expires_in * 1000)



        await db.query(`UPDATE users SET access_token = $1, refresh_token = $2, expires_in = $3 WHERE id = ${user.id}`, [access_token, refresh_token, expires_in])


        const token = await webToken.generateJwt(user)

        res.cookie("auth", token, {
            httpOnly: true, // La cookie NO se puede leer
            secure: true, // La cookie solo se envía por HTTPS
            sameSite: "none", // Permite que la cookie se envíe en peticiones cross-site
            maxAge: 24 * 60 * 60 * 1000, // 1 día
            path: "/" // La cookie estará disponible para todas las rutas
        });

        res.status(200).json({ msg: "Logueado Existosamente." });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Ha ocurrido un error en el servidor, Intenta mas tarde." });
    }
}

userCtrl.getUsers = async (req, res) => {
    try {
        const { role, search, status, page = 1, limit = 10 } = req.query

        let filter = []
        let params = []

        if (role) {
            filter.push(`u.role = $${params.length + 1}`)
            params.push(role)
        }

        if (search) {
            filter.push(`(u.first_name ILIKE $${params.length + 1} OR u.document_number ILIKE $${params.length + 1})`)
            params.push(`${search}%`)
        }

        if (status) {
            filter.push(`u.status = $${params.length + 1}`)
            params.push(status)
        }

        let sql = 'FROM users u LEFT JOIN type_documents td ON u.type_document = td.id'
        if (filter.length > 0) {
            sql += ' WHERE ' + filter.join(' AND ')
        }

        
        const totalRows = await db.query(`SELECT (COUNT(DISTINCT u.id)::INT) ${sql}`, params);
        
        sql += ' ORDER BY u.status ASC, u.id DESC'
        sql += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
        const offset = (page - 1) * limit
        params.push(Number(limit), Number(offset))

        const users = await db.query(`SELECT u.id, u.first_name, u.last_name, u.email, 
            jsonb_build_object(
            'id', td.id,
            'name', td.description) AS type_document, u.document_number, u.address, u.phone, u.role, u.status ${sql}`, params)

        // await pruebas()

        res.json({ msg: { users: users.rows, totalRows: totalRows.rows[0].count } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Ha ocurrido un error en el servidor, Intenta mas tarde." });
    }
};

userCtrl.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await db.query(`SELECT u.id, u.first_name, u.last_name, u.email, 

            jsonb_build_object(
            'municipality_id', u.municipality_id,
            'municipality', u.municipality,
            'deparment', u.department) AS municipality,

            jsonb_build_object(
            'id', td.id,
            'name', td.name,
            'description', td.description) AS type_document, u.document_number, u.address, u.phone, u.role, u.status, u.legal_organization_id, u.tribute_id, u.company, u.trade_name
            FROM users u 
            LEFT JOIN type_documents td ON u.type_document = td.id
            WHERE u.id = $1`, [id]);

        res.json({ msg: user.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Ha ocurrido un error en el servidor, Intenta mas tarde." });
    }
}

userCtrl.saveUsers = async (req, res) => {
    try {
        let ramdomPassword = crypto.randomUUID().slice(0, 8);
        const { type_document, document_number, first_name, last_name, phone, email, address, password = "12345678", role = "client", legal_organization_id, tribute_id, company, municipality, trade_name } = req.body

        const passwordHash = await bcrypt.hash(password, 10);

        await db.query(`INSERT INTO users (type_document, document_number, first_name, last_name, email, address, phone, password, role, legal_organization_id, tribute_id, company, municipality_id, trade_name, department, municipality) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
            [type_document, document_number, first_name, last_name, email, address, phone, passwordHash, role, legal_organization_id, tribute_id, company, municipality.id, trade_name, municipality.department, municipality.name])
        res.json({ msg: "Usuario Registrado Existosamente." });
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ msg: "Ha ocurrido un error en el servidor, Intenta mas tarde." });
    }
}

userCtrl.activeUsers = async (req, res) => {
    try {
        const { id } = req.params
        await db.query(`UPDATE users SET status = 0 WHERE id = $1`, [id])

        res.status(200).json({ msg: "Usuario Activado Existosamente." })
    } catch (error) {
        res.status(500).json({ msg: "Ha ocurrido un error en el servidor, Intenta mas tarde." });
    }
}

userCtrl.inactiveUsers = async (req, res) => {
    try {
        const { id } = req.params
        await db.query(`UPDATE users SET status = 1 WHERE id = $1 `, [id])

        res.status(200).json({ msg: "Usuario Desactivado Existosamente." })
    } catch (error) {
        res.status(500).json({ msg: "Ha ocurrido un error en el servidor, Intenta mas tarde." });
    }
}

userCtrl.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ msg: "Usuario Eliminado Exitosamente." });
    }
    catch (error) {
        res.status(500).json({ msg: "Ha ocurrido un error en el servidor, Intenta mas tarde." });
    }
}



export { userCtrl };
