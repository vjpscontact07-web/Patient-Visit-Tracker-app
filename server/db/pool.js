import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is required when starting the server');
}

const poolConfig = { connectionString: DATABASE_URL };

if (process.env.DB_SSL === 'true') {
  poolConfig.ssl = {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
  };
}

const pool = new Pool(poolConfig);

export default pool;
