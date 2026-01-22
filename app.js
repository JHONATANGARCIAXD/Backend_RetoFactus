import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from "cookie-parser";
import { db } from './db.config.js';

import { routerUsers } from './routes/user.route.js';

const app = express();

app.use(cors({
    origin: true,
    credentials: true,
}));


app.use(express.json());
app.use(cookieParser());

app.use('/api/users', routerUsers);

db.query('SELECT NOW()')
    .then(() => console.log('Database connected'))
    .catch(() => console.error('Database connection error'));


app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

