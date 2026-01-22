import pg from 'pg';
import 'dotenv/config';

const DATABASE = process.env.DATABASE_URL;

const db = new pg.Pool({ connectionString: DATABASE});

export {db};