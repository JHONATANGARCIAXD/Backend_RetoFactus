import jwt from 'jsonwebtoken';
import axios from 'axios';
import { db } from '../db.config.js';
import 'dotenv/config';


const webToken = {}

webToken.generateJwt = (user) => {
    return new Promise((resolve, reject) => {
        const payload = {
            id: user.id,
            role: user.role
        }

        jwt.sign(payload, process.env.WORKSECRET, {
            expiresIn: "4h"
        }, (error, token) => {
            if (error) {
                reject("Error al generar el token ")
            } else {
                console.log(token)
                resolve(token)
            }
        })
    })
}

webToken.verifyJwt = (rolesAllowed = ["admin"]) => {
    return async (req, res, next) => {
        try {
            const token = req.cookies.auth;
            if (!token) {
                return res.status(401).json({ msg: "No autenticado" });
            }

            const { id, role } = jwt.verify(token, process.env.WORKSECRET)
            const user = await db.query(`SELECT u.* FROM users u WHERE u.id = ${id}`)

            if (!rolesAllowed.includes(role) || user.rows[0].role !== role) {
                return res.status(403).json({ msg: "No Tiene Permisos Para Realizar Esta Acción." })
            }

            if (user.rowCount == 0) {
                return res.status(404).json({ msg: "Usuario No Encontrado" })
            }

            if (user.rows[0].status === 1) {
                return res.status(401).json({ msg: "Usuario Inactivo" })
            }

            req.user = user.rows[0]
            next();
        }
        catch (error) {
            console.error(error)
            res.status(401).json({ msg: "Token inválido o expirado" })
        }

    }

}

webToken.verifyJwtFactus = async (req, res, next) => {
    try {
        const user = req.user

        if (user.expires_in < Date.now()) {
            const response = await axios.post('https://api-sandbox.factus.com.co/oauth/token', {
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                grant_type: 'refresh_token',
                refresh_token: user.refresh_token,
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log("SE LOGUEO")

            await db.query(`UPDATE users SET access_token = $1, refresh_token = $2, expires_in = $3 WHERE id = ${user.id}`, [response.data.access_token, response.data.refresh_token, Date.now() + (response.data.expires_in * 1000)])

            req.user.access_token = response.data.access_token
        }

        next()

    }
    catch (error) {
        console.error(error)
        res.status(500).json({ msg: "Ha ocurrido un error en el servidor, Intenta mas tarde." });
    }
}

export { webToken }
