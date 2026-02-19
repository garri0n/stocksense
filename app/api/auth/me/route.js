// app/api/auth/me/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  // Get user from session/token
  // This is a simplified version
  const token = request.cookies.get('auth_token')?.value;
  
  if (!token) {
    return NextResponse.json({
      authenticated: false
    }, { status: 401 });
  }

  // In production, verify token and get user from database
  return NextResponse.json({
    authenticated: true,
    user: {
      id: 1,
      username: 'bro',
      email: 'bro@stocksense.ai'
    }
  });
}