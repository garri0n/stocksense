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
  // PRODUCTION: TiDB Cloud
  console.log('🔌 Connecting to TiDB Cloud...');
  
  // TiDB requires SSL and proper username formatting [citation:6]
  // Get the raw username from environment (without quotes)
  const rawUsername = process.env.TIDB_USER || '2doub9SDN1b3FY2.root';
  
  // Remove any existing quotes and add proper single quotes
  const cleanUsername = rawUsername.replace(/['`"]/g, '2doub9SDN1b3FY2.root');
  const formattedUser = `'${cleanUsername}'`; // Must have quotes!
  
  pool = mysql.createPool({
    host: process.env.TIDB_HOST,
    user: formattedUser,      // Format: 'your-cluster-id.root'
    password: process.env.TIDB_PASSWORD,
    database: process.env.TIDB_DATABASE || 'stocksense_ai',
    port: parseInt(process.env.TIDB_PORT) || 4000,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    // CRITICAL: TiDB requires SSL [citation:6]
    ssl: {
      rejectUnauthorized: true
    }
  });
}

export default pool;