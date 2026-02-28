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
  console.log('🔌 Initializing TiDB Cloud connection...');
  
  // Format username correctly (should already have quotes from env)
  const rawUsername = process.env.TIDB_USER || '9C1L29w5262CsP2.root';
  
  // Log what we're using (without exposing full password)
  console.log('📝 Host:', process.env.TIDB_HOST);
  console.log('📝 Username format:', rawUsername);
  console.log('📝 Database:', process.env.TIDB_DATABASE);
  console.log('📝 Port:', process.env.TIDB_PORT);

  pool = mysql.createPool({
    host: process.env.TIDB_HOST,
    user: rawUsername,  // Use exactly what's in env (should include quotes)
    password: process.env.TIDB_PASSWORD,
    database: process.env.TIDB_DATABASE || 'stocksense_ai',
    port: parseInt(process.env.TIDB_PORT) || 4000,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    // TiDB requires SSL
    ssl: {
      rejectUnauthorized: false  // Set to false temporarily for debugging
    },
    // Add connection timeout
    connectTimeout: 10000,
    // Add debug info
    debug: true
  });
}

export default pool;