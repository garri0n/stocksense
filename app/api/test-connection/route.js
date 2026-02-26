// app/api/test-connection/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Simple query to test connection
    const [result] = await pool.query('SELECT 1 + 1 as solution');
    const [databases] = await pool.query('SHOW DATABASES');
    
    return NextResponse.json({
      success: true,
      message: '✅ Successfully connected to TiDB!',
      test: result[0].solution === 2 ? 'Query working' : 'Query failed',
      databases: databases.slice(0, 5) // Show first 5 databases
    });
  } catch (error) {
    console.error('Connection test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code
    }, { status: 500 });
  }
}