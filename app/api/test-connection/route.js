// app/api/test-connection/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [result] = await pool.query('SELECT 1 + 1 as solution');
    return NextResponse.json({
      success: true,
      message: '✅ Connected to TiDB!',
      test: result[0].solution
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}