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
        message: 'Username, email, and password are required'
      }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        message: 'Password must be at least 6 characters long'
      }, { status: 400 });
    }

    if (!email.includes('@')) {
      return NextResponse.json({
        success: false,
        message: 'Please enter a valid email address'
      }, { status: 400 });
    }

    // Connect to TiDB
    const connection = await mysql.createConnection({
      host: process.env.TIDB_HOST,
      user: '2doub9SDN1b3FY2.root', // From your working test
      password: process.env.TIDB_PASSWORD,
      database: process.env.TIDB_DATABASE || 'stocksense_ai',
      port: 4000,
      ssl: { rejectUnauthorized: false }
    });

    // Check if username or email already exists
    const [existingUsers] = await connection.execute(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      await connection.end();
      
      // Check which one exists
      const existingUser = existingUsers[0];
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
      message: 'Registration successful! You can now login.',
      userId: result.insertId
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Registration error:', error);
    return NextResponse.json({
      success: false,
      message: 'Registration failed. Please try again.'
    }, { status: 500 });
  }
}