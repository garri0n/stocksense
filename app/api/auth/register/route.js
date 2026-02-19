// app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const { username, password, email, dateOfBirth } = await request.json();

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
      [username, password, email, dateOfBirth]
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
      message: 'An error occurred during registration'
    }, { status: 500 });
  }
}