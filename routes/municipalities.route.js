import { Router } from "express";
import { webToken } from "../middleware/webToken.middleware.js";
import { municipalitiesCtrl } from "../controllers/municipalities.controller.js";


const routermunicipalities = Router()

routermunicipalities.get('/getMunicipalities', [
    webToken.verifyJwt(),
    webToken.verifyJwtFactus
], municipalitiesCtrl.getMunicipalities)

export { routermunicipalities }