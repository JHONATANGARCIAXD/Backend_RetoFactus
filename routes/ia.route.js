import { Router } from "express";
import { webToken } from "../middleware/webToken.middleware.js";
import { check } from "express-validator";
import { valideFields } from "../middleware/valideFields.js";
import { iaCtrl } from "../controllers/ia.controller.js";

const iaRouter = Router();


iaRouter.post("/generateDescription", [
    webToken.verifyJwt(),
    check('name').notEmpty().withMessage('El nombre del producto es obligatorio'),
    valideFields
],iaCtrl.generateDescription);

export { iaRouter }
