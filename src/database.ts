import dotenv from 'dotenv';
dotenv.config();
import { Pool } from 'pg';

const { POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD } = process.env;
let POSTGRES_DB = process.env.POSTGRES_DB;

if (process.env.NODE_ENV === 'test') {
  const sanitizedDbName = process.env.POSTGRES_DB!.replace(/"/g, '""').replace(/-/g, '_');
  POSTGRES_DB = sanitizedDbName + '_test';
}
const pool = new Pool({
  user: POSTGRES_USER,
  host: POSTGRES_HOST,
  database: POSTGRES_DB,
  password: POSTGRES_PASSWORD,
  port: parseInt(POSTGRES_PORT as string)
});

export { pool, POSTGRES_DB };
