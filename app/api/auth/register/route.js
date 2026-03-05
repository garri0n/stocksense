// app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(request) {
  try {
    const { username, email, password, dateOfBirth } = await request.json();

    console.log('📝 Registration attempt:', { username, email });

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json({
        success: false,
        message: 'All fields are required'
      }, { status: 400 });
    }

    if (username.length < 3) {
      return NextResponse.json({
        success: false,
        message: 'Username must be at least 3 characters'
      }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        message: 'Password must be at least 6 characters'
      }, { status: 400 });
    }

    if (!email.includes('@')) {
      return NextResponse.json({
        success: false,
        message: 'Please enter a valid email'
      }, { status: 400 });
    }

    // Connect to TiDB
    const connection = await mysql.createConnection({
      host: process.env.TIDB_HOST,
      user: '2doub9SDN1b3FY2.root',
      password: process.env.TIDB_PASSWORD,
      database: process.env.TIDB_DATABASE || 'stocksense_ai',
      port: 4000,
      ssl: { rejectUnauthorized: false }
    });

    // Check if username or email exists
    const [existing] = await connection.execute(
      'SELECT username, email FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      await connection.end();
      const existingUser = existing[0];
      if (existingUser.username === username) {
        return NextResponse.json({
          success: false,
          message: 'Username already taken'
        }, { status: 400 });
      } else {
        return NextResponse.json({
          success: false,
          message: 'Email already registered'
        }, { status: 400 });
      }
    }

    // Insert new user
    const [result] = await connection.execute(
      'INSERT INTO users (username, email, password, date_of_birth) VALUES (?, ?, ?, ?)',
      [username, email, password, dateOfBirth || null]
    );

    await connection.end();

    return NextResponse.json({
      success: true,
      message: 'Registration successful!'
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Check for specific MySQL errors
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({
        success: false,
        message: 'Username or email already exists'
      }, { status: 400 });
    }
    
    if (error.code === 'ER_BAD_NULL_ERROR') {
      return NextResponse.json({
        success: false,
        message: 'Please fill in all required fields'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: 'Registration failed. Please try again.'
    }, { status: 500 });
  }
}