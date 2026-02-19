// app/api/auth/logout/route.js
import { NextResponse } from 'next/server';

export async function POST() {
  // Server-side logout (clear session if using cookies)
  return NextResponse.json({
    success: true,
    message: 'Logout successful'
  });
}