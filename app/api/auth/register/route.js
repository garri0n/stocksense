// app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const { username, password, email, dateOfBirth } = await request.json();

    console.log('Registration attempt:', { username, email });

    // Ensure users table exists
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

    // Check if user already exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Username or email already exists'
      }, { status: 400 });
    }

    // Insert new user
    const [result] = await pool.query(
      'INSERT INTO users (username, password, email, date_of_birth) VALUES (?, ?, ?, ?)',
      [username, password, email, dateOfBirth || null]
    );

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      userId: result.insertId
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({
      success: false,
      message: 'Registration failed'
    }, { status: 500 });
  }
}