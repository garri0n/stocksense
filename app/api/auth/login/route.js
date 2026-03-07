// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    console.log('🔍 Login attempt for:', username);

    const connection = await mysql.createConnection({
      host: process.env.TIDB_HOST,
      user: '2doub9SDN1b3FY2.root',
      password: process.env.TIDB_PASSWORD,
      database: process.env.TIDB_DATABASE || 'stocksense_ai',
      port: 4000,
      ssl: { rejectUnauthorized: false }
    });

    // Find the user
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      await connection.end();
      return NextResponse.json({
        success: false,
        message: 'Invalid username or password'
      }, { status: 401 });
    }

    const user = users[0];

    // Check password
    if (user.password !== password) {
      await connection.end();
      return NextResponse.json({
        success: false,
        message: 'Invalid username or password'
      }, { status: 401 });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // After getting the user object
    const userForCookie = {
      id: user.id,
      username: user.username,
      email: user.email
    };

    // Set the cookie with proper options
    cookies().set({
      name: 'user',
      value: JSON.stringify(userForCookie),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    console.log('🍪 Set user cookie for:', user.username);
    
    // Return success with user data
    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Database error'
    }, { status: 500 });
  }
}