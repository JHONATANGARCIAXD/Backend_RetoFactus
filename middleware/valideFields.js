import { validationResult } from "express-validator";

const valideFields = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const err = errors.array().map((error) => {
            return error.msg
        })
        return res.status(400).json({ errors: err });
    }
    next();
}

export { valideFields };