import { Router } from "express";
import { check } from "express-validator";
import { valideFields } from "../middleware/valideFields.js";
import { webToken } from "../middleware/webToken.middleware.js";
import { categoriesCtrl } from "../controllers/categorie.controller.js";

const routerCategories = Router()

routerCategories.get('/getCategories', [
    webToken.verifyJwt()
], categoriesCtrl.getCategories)


routerCategories.post('/saveCategories', [
    webToken.verifyJwt(),
], categoriesCtrl.saveCategories)

routerCategories.put('/activeCategories/:id', [
    webToken.verifyJwt(),
], categoriesCtrl.activeCategories)

routerCategories.put('/inactiveCategories/:id', [
    webToken.verifyJwt(),
], categoriesCtrl.inactiveCategories)

routerCategories.delete('/deleteCategories/:id', [
    webToken.verifyJwt(),
], categoriesCtrl.deleteCategories)


export { routerCategories }