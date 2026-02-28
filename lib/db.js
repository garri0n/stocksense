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
  console.log('🔌 Connecting to TiDB Cloud...');

  const rawUsername = process.env.TIDB_USER || "'9C1L29w5262CsP2.root'";
  let formattedUser = rawUsername;
  if (rawUsername.includes('.')) {
    if (!rawUsername.startsWith("'") && !rawUsername.endsWith("'")) {
      formattedUser = `'${rawUsername}'`;
    }
  }
  
  console.log('📝 Username format:', formattedUser);

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
      rejectUnauthorized: true
    }
  });
}

export default pool;