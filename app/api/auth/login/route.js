// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    
    const [users] = await pool.query(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );
    
    if (users.length > 0) {
      const user = users[0];
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Invalid username or password'
      }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}