import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from "cookie-parser";
import { db } from './db.config.js';
import fileUpload from "express-fileupload";

import { routerUsers } from './routes/user.route.js';
import { routerCategories } from './routes/categorie.route.js';
import { routerProducts } from './routes/product.route.js';
import { routermunicipalities } from './routes/municipalities.route.js';
import { routerSales } from './routes/sale.route.js';
import { routerTypeDocuments } from './routes/typeDocument.route.js';
const app = express();

app.use(cors({
    origin: true,
    credentials: true,
}));



app.use(express.json());
app.use(cookieParser());


app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp/",
        createParentPath: true,
    })
);

app.use('/api/users', routerUsers);
app.use('/api/categories', routerCategories);
app.use('/api/products', routerProducts);
app.use('/api/municipalities', routermunicipalities)
app.use('/api/sales', routerSales);
app.use('/api/typeDocuments', routerTypeDocuments);

db.query('SELECT NOW()')
    .then(() => console.log('Database connected'))
    .catch(() => console.error('Database connection error'));


app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

