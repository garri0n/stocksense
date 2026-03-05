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
  
  // Get the raw username from environment
  const rawUsername = process.env.TIDB_USER || '';
  
  // Remove any existing quotes first
  const cleanUsername = rawUsername.replace(/['`"]/g, '');
  
  // ⚠️⚠️⚠️ CRITICAL FIX ⚠️⚠️⚠️
  // Make SURE both quotes are present!
  const formattedUser = `'${cleanUsername}'`;  // ← Notice the closing quote after the variable
  
  console.log('Username format:', formattedUser); // Should show: '2doub9SDN1b3FY2.root'

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
    ssl: {
      rejectUnauthorized: false // Keep false for now
    }
  });
}

export default pool;