import { Router } from "express";
import { userCtrl } from "../controllers/user.controller.js";
import { check } from "express-validator";
import { userHelper } from "../helpers/user.helper.js";
import { valideFields } from "../middleware/valideFields.js";
import { webToken } from "../middleware/webToken.middleware.js";

const routerUsers = Router();

routerUsers.post('/loginUsers', [
    check('email').notEmpty().withMessage('El nombre de usuario es obligatorio').custom(userHelper.notExistUser),
    check('password').notEmpty().withMessage('La contraseña es obligatoria'),
    valideFields
], userCtrl.loginUsers);

routerUsers.get('/getUsers', [
    webToken.verifyJwt()
], userCtrl.getUsers);

routerUsers.get('/getUser/:id', [
    webToken.verifyJwt(),
], userCtrl.getUserById);

routerUsers.get('/getMe', [
    webToken.verifyJwt(['admin', 'client']),
], userCtrl.getMe);

routerUsers.post('/saveUsers', [
    // webToken.verifyJwt(),
    check('document_number').notEmpty().withMessage('El numero de documento es obligatorio').bail()
        .isLength({ min: 6, max: 20 }).withMessage('El numero de documento debe tener entre 6 y 20 caracteres').bail()
        .custom(userHelper.existUser),
    check('first_name').notEmpty().withMessage('El nombre es obligatorio'),
    check('last_name').notEmpty().withMessage('El apellido es obligatorio'),
    check('email').notEmpty().withMessage('El correo es obligatorio').bail()
        .isEmail().withMessage('El correo no es valido'),
    check('address').notEmpty().withMessage('La direccion es obligatoria'),
    check('phone').notEmpty().withMessage('El telefono es obligatorio').bail()
        .isLength({ min: 7, max: 15 }).withMessage('El telefono debe tener entre 7 y 15 caracteres'),
    check('password').optional().notEmpty().withMessage('La contraseña es obligatoria').bail()
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    check('role').optional().notEmpty().withMessage('El rol es obligatorio'),
    valideFields
], userCtrl.saveUsers);


routerUsers.put('/updateUsers/:id', [
    webToken.verifyJwt(['admin', 'client']),
], userCtrl.updateUsers);

routerUsers.put('/activeUsers/:id', [
    webToken.verifyJwt(),
], userCtrl.activeUsers);

routerUsers.put('/inactiveUsers/:id', [
    webToken.verifyJwt(),
], userCtrl.inactiveUsers);

routerUsers.post('/logoutUsers', [
    webToken.verifyJwt(['admin', 'client']),
], userCtrl.logoutUsers);

routerUsers.post('/refreshToken', [
    webToken.verifyRefreshToken
], userCtrl.refreshToken);

routerUsers.delete('/deleteUser/:id', [
    webToken.verifyJwt(),
], userCtrl.deleteUser);



export { routerUsers };