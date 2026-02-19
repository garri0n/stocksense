// lib/db.js
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', // XAMPP default user
  password: '', // XAMPP default password is empty
  database: 'stocksense_ai',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;