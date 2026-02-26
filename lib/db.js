// lib/db.js
import mysql from 'mysql2/promise';

// Determine environment
const isProduction = process.env.NODE_ENV === 'production';

let pool;

if (!isProduction) {
  // Local development with XAMPP
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'stocksense_ai',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
} else {
  // PRODUCTION: Render + TiDB Cloud
  // TiDB requires username WITH quotes and SSL enabled
  const tidbUser = process.env.TIDB_USER || '';
  const formattedUser = tidbUser.includes('.') && !tidbUser.startsWith("'") 
    ? `'${tidbUser}'` 
    : tidbUser;

  pool = mysql.createPool({
    host: process.env.TIDB_HOST,
    user: formattedUser,
    password: process.env.TIDB_PASSWORD,
    database: process.env.TIDB_DATABASE || 'stocksense_ai',
    port: parseInt(process.env.TIDB_PORT) || 4000,
    waitForConnections: true,
    connectionLimit: 5, // Lower for free tier
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    // 👇 CRITICAL: SSL configuration for TiDB
    ssl: {
      rejectUnauthorized: true, // TiDB uses valid certificates
      // If you encounter SSL errors, you might need:
      // rejectUnauthorized: false (less secure, but sometimes needed)
    }
  });
}

export default pool;