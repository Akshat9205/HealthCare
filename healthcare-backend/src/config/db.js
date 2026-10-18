import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

// PostgreSQL connection pool
export const pool = new Pool({
  host: env.database.host,
  port: env.database.port,
  database: env.database.database,
  user: env.database.user,
  password: env.database.password,
  ssl: env.database.ssl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle pg client:', err.message);
});

// Helper for running queries
export const query = (text, params) => pool.query(text, params);

// Quick check for /api/health
export const testConnection = async () => {
  const result = await pool.query('SELECT 1 AS ok');
  return result.rows.length > 0;
};

// Graceful pool shutdown
export const closePool = () => pool.end();

export default {
  pool,
  query,
  testConnection,
  closePool,
};
