import Router from 'express';
import { check } from 'express-validator';
import { valideFields } from '../middleware/valideFields.js';
import { webToken } from '../middleware/webToken.middleware.js';
import { saleCtrl } from '../controllers/sale.controller.js';
import { productHelper } from '../helpers/product.helper.js';
import { userHelper } from '../helpers/user.helper.js';
const routerSales = Router();


routerSales.get('/listSales', [
    webToken.verifyJwt(),
], saleCtrl.listSales);

routerSales.post('/generateSale', [
    webToken.verifyJwt(),
    webToken.verifyJwtFactus,
    check('user_id').optional().custom(userHelper.existUserById),
    check('products').notEmpty().withMessage('Los productos son obligatorios').bail().custom(productHelper.valideProduct)
        .isArray({ min: 1 }).withMessage('Debe haber al menos un producto en la venta'),
    valideFields
], saleCtrl.generateSale);

export { routerSales }