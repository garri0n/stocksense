// app/api/debug-db/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const debug = {
    environment: process.env.NODE_ENV,
    variables: {
      TIDB_HOST: process.env.TIDB_HOST ? '✓ Set' : '✗ Missing',
      TIDB_USER: process.env.TIDB_USER ? '✓ Set' : '✗ Missing',
      TIDB_PASSWORD: process.env.TIDB_PASSWORD ? '✓ Set' : '✗ Missing',
      TIDB_DATABASE: process.env.TIDB_DATABASE ? '✓ Set' : '✗ Missing',
      TIDB_PORT: process.env.TIDB_PORT ? '✓ Set' : '✗ Missing',
    },
    connection: { success: false, error: null }
  };

  try {
    // Test connection
    const [result] = await pool.query('SELECT 1 + 1 as solution');
    const [users] = await pool.query('SELECT COUNT(*) as count FROM users');
    
    debug.connection.success = true;
    debug.connection.data = {
      test: result[0].solution === 2 ? '✅ Query works' : '❌ Query failed',
      userCount: users[0].count
    };
    
  } catch (error) {
    debug.connection.error = {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage
    };
  }

  return NextResponse.json(debug);
}