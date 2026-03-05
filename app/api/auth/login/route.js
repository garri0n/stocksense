// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    console.log('Login attempt for username:', username);

    // First, ensure users table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        date_of_birth DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if user exists
    const [users] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    // If user doesn't exist, create it (for demo purposes)
    if (!users || users.length === 0) {
      console.log('User not found, creating demo user...');
      
      // Create the user
      await pool.query(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, 'bro@stocksense.ai', password]
      );
      
      // Fetch the newly created user
      const [newUsers] = await pool.query(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      
      const newUser = newUsers[0];
      const { password: _, ...userWithoutPassword } = newUser;
      
      return NextResponse.json({
        success: true,
        user: userWithoutPassword
      });
    }

    const user = users[0];

    // Check password
    if (user.password !== password) {
      return NextResponse.json({
        success: false,
        message: 'Invalid username or password'
      }, { status: 401 });
    }

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Database connection error'
    }, { status: 500 });
  }
}