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
  console.log('🔌 Connecting to TiDB Cloud...');
  console.log('Host:', process.env.TIDB_HOST);
  console.log('Database:', process.env.TIDB_DATABASE);
  
  // TiDB requires username WITH quotes
  const tidbUser = process.env.TIDB_USER || '';
  // Add quotes if they're not already there
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
    connectionLimit: 5,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    // 👇 CRITICAL: SSL configuration for TiDB
    ssl: {
      rejectUnauthorized: true, // Use false if you get SSL errors
      // For TiDB, sometimes you need:
      // minVersion: 'TLSv1.2'
    }
  });
}

export default pool;