// app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(request) {
  try {
    const { username, email, password, dateOfBirth } = await request.json();

    console.log('📝 Registration attempt:', { username, email });

    // Validate input
    if (!username || !email || !password) {
      console.log('❌ Missing fields');
      return NextResponse.json({
        success: false,
        message: 'All fields are required'
      }, { status: 400 });
    }

    // Connect to TiDB
    console.log('🔌 Connecting to TiDB...');
    const connection = await mysql.createConnection({
      host: process.env.TIDB_HOST,
      user: '2doub9SDN1b3FY2.root',
      password: process.env.TIDB_PASSWORD,
      database: process.env.TIDB_DATABASE || 'stocksense_ai',
      port: 4000,
      ssl: { rejectUnauthorized: false }
    });

    console.log('✅ Connected to TiDB');

    // Check if username or email exists
    const [existing] = await connection.execute(
      'SELECT username, email FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      await connection.end();
      console.log('❌ User already exists:', existing[0]);
      return NextResponse.json({
        success: false,
        message: 'Username or email already exists'
      }, { status: 400 });
    }

    // Insert new user
    console.log('📝 Inserting new user...');
    const [result] = await connection.execute(
      'INSERT INTO users (username, email, password, date_of_birth) VALUES (?, ?, ?, ?)',
      [username, email, password, dateOfBirth || null]
    );

    console.log('✅ User inserted with ID:', result.insertId);
    await connection.end();

    return NextResponse.json({
      success: true,
      message: 'Registration successful!'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Registration error:', error);
    return NextResponse.json({
      success: false,
      message: 'Registration failed: ' + error.message
    }, { status: 500 });
  }
}