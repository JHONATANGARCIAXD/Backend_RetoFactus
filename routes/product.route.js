import { Router } from "express";
import { check } from "express-validator";
import { valideFields } from "../middleware/valideFields.js";
import { webToken } from "../middleware/webToken.middleware.js";
import { categorieHelper } from "../helpers/categorie.helper.js";
import { productCtrl } from "../controllers/product.controller.js";

const routerProducts = Router();

routerProducts.get("/getProducts", [
    webToken.verifyJwt(),
], productCtrl.getProducts)

routerProducts.post("/saveProducts", [
    webToken.verifyJwt(),
    check('categories').custom(categorieHelper.existCategorie),
    valideFields
], productCtrl.saveProducts)

routerProducts.put("/activeProducts/:id", [
    webToken.verifyJwt(),
], productCtrl.activeProducts)

routerProducts.put("/inactiveProducts/:id", [
    webToken.verifyJwt(),
], productCtrl.inactiveProducts)

routerProducts.delete("/deleteProducts/:id", [
    webToken.verifyJwt(),
], productCtrl.deleteProducts)


export { routerProducts }