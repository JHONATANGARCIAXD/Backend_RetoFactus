import { db } from "../db.config.js";

const userHelper = {};

userHelper.existUser = async (document_number) => {
    const user = await db.query('SELECT EXISTS (SELECT u. FROM users u WHERE u.document_number = $1)', [document_number]);

    if (user) {
        throw new Error(`El numero de documento ya esta registrado`);
    }

    return true;
};

userHelper.notExistUser = async (document_number, { req }) => {

    const user = await db.query('SELECT u.* FROM users u WHERE u.document_number = $1', [document_number]);
    if (user.rowCount == 0) {
        throw new Error(`El numero de documento no esta registrado`);
    }

    req.user = user.rows[0];
    return true;
};

userHelper.existUserById = async (id) => {
    const user = await db.query('SELECT EXISTS (SELECT u.id FROM users u WHERE id = $1);', [id]);
    if (!user) {
        throw new Error(`El usuario con el id ${id} no existe`);
    }
    return true;
}


export { userHelper };