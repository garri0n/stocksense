// lib/db.js
import mysql from 'mysql2/promise';

// Single connection pool for all environments
const pool = mysql.createPool({
  host: process.env.TIDB_HOST || 'localhost',
  user: process.env.TIDB_USER || 'root',
  password: process.env.TIDB_PASSWORD || '',
  database: process.env.TIDB_DATABASE || 'stocksense_ai',
  port: parseInt(process.env.TIDB_PORT) || 4000,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : undefined
});

export default pool;