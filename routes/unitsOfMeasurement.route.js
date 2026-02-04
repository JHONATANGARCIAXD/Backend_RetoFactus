import { Router } from "express";
import { webToken } from "../middleware/webToken.middleware.js";
import { unitsOfMeasurementCtrl } from "../controllers/unitsOfMeasurement.controller.js";


const routerUnitsOfMeasurement = Router();

routerUnitsOfMeasurement.get('/getUnitsOfMeasurement', [
    webToken.verifyJwt(),
    webToken.verifyJwtFactus
], unitsOfMeasurementCtrl.getUnitsOfMeasurement);


export { routerUnitsOfMeasurement };