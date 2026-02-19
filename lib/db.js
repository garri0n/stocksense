// lib/db.js
import mysql from 'mysql2/promise';

// Check if we're in production (Vercel) or development
const isProduction = process.env.NODE_ENV === 'production';

// For Vercel deployment, we'll use mock data
const mockDb = {
  query: async (sql, params) => {
    console.log('Mock DB Query:', sql, params);
    
    // Handle login queries
    if (sql.includes('SELECT * FROM users WHERE username = ?')) {
      const username = params[0];
      if (username === 'bro' || username === 'admin') {
        return [[{
          id: 1,
          username: username,
          password: username === 'bro' ? 'password123' : 'admin123',
          email: `${username}@stocksense.ai`,
          date_of_birth: '1990-01-01'
        }]];
      }
      return [[]];
    }
    
    // Handle registration check
    if (sql.includes('SELECT * FROM users WHERE username = ? OR email = ?')) {
      return [[]]; // Return empty - user doesn't exist
    }
    
    // Handle insert
    if (sql.includes('INSERT INTO users')) {
      return [{ insertId: 1 }];
    }
    
    return [[]];
  }
};

// Create connection pool for development
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
  // Production - use mock data
  pool = mockDb;
}

export default pool;