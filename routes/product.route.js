import { Router } from "express";
import { check } from "express-validator";
import { valideFields } from "../middleware/valideFields.js";
import { webToken } from "../middleware/webToken.middleware.js";
import { categorieHelper } from "../helpers/categorie.helper.js";
import { productCtrl } from "../controllers/product.controller.js";
import { productHelper } from "../helpers/product.helper.js";

const routerProducts = Router();

routerProducts.get("/getProducts", [
    webToken.verifyJwt(),
], productCtrl.getProducts)

routerProducts.post("/saveProducts", [
    webToken.verifyJwt(),
    check('name').notEmpty().withMessage('El nombre del producto es obligatorio'),
    check('code_reference').notEmpty().withMessage('La referencia del producto es obligatoria'),
    check('price').notEmpty().withMessage('El precio del producto es obligatorio').bail().isInt({ gt: -1 }).withMessage('El precio del producto debe ser un numero mayor a 0'),
    check('stock').notEmpty().withMessage('El stock del producto es obligatorio').bail().isInt({ gt: -1 }).withMessage('El stock del producto debe ser un numero entero igual o mayor a 0'),
    check('unit_measure_id').notEmpty().withMessage('La unidad de medida es obligatoria'),
    check('standard_code_id').notEmpty().withMessage('El codigo estandar es obligatorio'),
    check('tax_rate').notEmpty().withMessage('La tasa de impuesto es obligatoria'),
    check('tribute_id').notEmpty().withMessage('El tributo es obligatorio'),
    check('is_excluded').notEmpty().withMessage('El valor de excluido de IVA es obligatorio'),
    check('categories').custom(categorieHelper.existCategorie),
    valideFields
], productCtrl.saveProducts)

routerProducts.put("/updateProducts/:id", [
    webToken.verifyJwt(),
    check('id').custom(productHelper.existProduct),
    valideFields
], productCtrl.updateProducts)


routerProducts.put("/activeProducts/:id", [
    webToken.verifyJwt(),
    check('id').custom(productHelper.existProduct),
    valideFields
], productCtrl.activeProducts)

routerProducts.put("/inactiveProducts/:id", [
    webToken.verifyJwt(),
    check('id').custom(productHelper.existProduct),
    valideFields
], productCtrl.inactiveProducts)

routerProducts.delete("/deleteProducts/:id", [
    webToken.verifyJwt(),
    check('id').custom(productHelper.existProduct),
    valideFields
], productCtrl.deleteProducts)


export { routerProducts }