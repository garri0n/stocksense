// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    console.log('Login attempt for username:', username);

    // Validate input
    if (!username || !password) {
      return NextResponse.json({
        success: false,
        message: 'Username and password are required'
      }, { status: 400 });
    }

    // Query the database
    const [users] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    console.log('Database result:', users);

    // Check if user exists
    if (!users || users.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Invalid username or password'
      }, { status: 401 });
    }

    const user = users[0];

    // Check password (in production, use bcrypt)
    if (user.password !== password) {
      return NextResponse.json({
        success: false,
        message: 'Invalid username or password'
      }, { status: 401 });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Return success with user data
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error details:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Database connection error. Please make sure MySQL is running in XAMPP.'
    }, { status: 500 });
  }
}