// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Direct connection with NO quotes
    const connection = await mysql.createConnection({
      host: process.env.TIDB_HOST,
      user: '2doub9SDN1b3FY2.root', // Hardcode for testing, NO quotes!
      password: process.env.TIDB_PASSWORD,
      database: 'stocksense_ai',
      port: 4000,
      ssl: { rejectUnauthorized: false }
    });

    // Check if users table exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      )
    `);

    // Check if user exists
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    // If using 'stocksense' user, create it
    if (username === 'stocksense') {
      await connection.execute(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        ['stocksense', 'stocksense@example.com', password]
      );
      
      const [newUser] = await connection.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      
      await connection.end();
      
      return NextResponse.json({
        success: true,
        user: { id: newUser[0].id, username: newUser[0].username }
      });
    }

    // Regular login logic...
    const user = users[0];
    if (!user || user.password !== password) {
      await connection.end();
      return NextResponse.json({
        success: false,
        message: 'Invalid credentials'
      }, { status: 401 });
    }

    await connection.end();
    return NextResponse.json({ success: true, user });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: `Database error: ${error.message}`
    }, { status: 500 });
  }
}