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
  console.log('🔌 Initializing TiDB Cloud connection pool...');
  
  // Log what we're using (without exposing full password)
  console.log('📝 Host:', process.env.TIDB_HOST);
  console.log('📝 Database:', process.env.TIDB_DATABASE);
  console.log('📝 Port:', process.env.TIDB_PORT);
  
  // Get the raw username from environment
  const rawUsername = process.env.TIDB_USER || '2doub9SDN1b3FY2.root';
  console.log('📝 Raw username:', rawUsername);
  
  // Remove any existing quotes
  const cleanUsername = rawUsername.replace(/['`"]/g, '');
  console.log('📝 Clean username:', cleanUsername);
  
  // Add single quotes (TiDB requirement)
  const formattedUser = `'${cleanUsername}'`;
  console.log('📝 Formatted username:', formattedUser);
  
  // Create connection pool
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
      rejectUnauthorized: false // Set to false for debugging
    },
    connectTimeout: 10000
  });
  
  // Test the connection immediately
  pool.getConnection()
    .then(conn => {
      console.log('✅ TiDB connection successful!');
      conn.release();
    })
    .catch(err => {
      console.error('❌ TiDB connection failed:', err.message);
      console.error('Full error:', err);
    });
}

export default pool;