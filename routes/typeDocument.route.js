import { Router } from "express";
import { check } from "express-validator";
import { valideFields } from "../middleware/valideFields.js";
import { webToken } from "../middleware/webToken.middleware.js";
import { typeDocumentsCtrl } from "../controllers/typeDocument.controller.js";


const routerTypeDocuments = Router();

routerTypeDocuments.get('/getTypeDocuments', [
    webToken.verifyJwt(),
], typeDocumentsCtrl.getTypeDocuments);

routerTypeDocuments.post('/saveTypeDocuments', [
    webToken.verifyJwt(),
], typeDocumentsCtrl.saveTypeDocuments);

routerTypeDocuments.put('/updateTypeDocuments/:id', [
    webToken.verifyJwt(),
], typeDocumentsCtrl.updateTypeDocuments);

routerTypeDocuments.delete('/deleteTypeDocuments/:id', [
    webToken.verifyJwt(),
], typeDocumentsCtrl.deleteTypeDocuments);

export { routerTypeDocuments };