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
  
  // Get the raw username from environment variables
  const rawUsername = process.env.TIDB_USER || "'9C1L29w5262CsP2.root'";
  
  // CRITICAL: TiDB requires username in format: 'cluster-id.root' (with quotes)
  // If the username doesn't already have quotes, add them
  let formattedUser = rawUsername;
  
  // Check if username contains a dot (cluster-id.root format)
  if (rawUsername.includes('.')) {
    // Add quotes if they're not already there
    if (!rawUsername.startsWith("'") && !rawUsername.endsWith("'")) {
      formattedUser = `'${rawUsername}'`;
    }
  }
  
  console.log('📝 Username format:', formattedUser);

  pool = mysql.createPool({
    host: process.env.TIDB_HOST,
    user: formattedUser,  // Use the formatted username with quotes
    password: process.env.TIDB_PASSWORD,
    database: process.env.TIDB_DATABASE || 'stocksense_ai',
    port: parseInt(process.env.TIDB_PORT) || 4000,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    ssl: {
      rejectUnauthorized: true
    }
  });
}

export default pool;