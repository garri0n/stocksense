// app/api/debug-db/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  // Show what credentials we're using (without exposing full password)
  const rawUsername = process.env.TIDB_USER || 'not set';
  const formattedUsername = rawUsername.includes('.') && !rawUsername.startsWith("'") 
    ? `'${rawUsername}'` 
    : rawUsername;

  const debug = {
    environment: process.env.NODE_ENV,
    variables: {
      TIDB_HOST: process.env.TIDB_HOST ? process.env.TIDB_HOST : '✗ Missing',
      TIDB_USER: {
        raw: rawUsername,
        formatted: formattedUsername,
        length: rawUsername.length
      },
      TIDB_PASSWORD: process.env.TIDB_PASSWORD ? '✓ Set (hidden)' : '✗ Missing',
      TIDB_DATABASE: process.env.TIDB_DATABASE || '✗ Missing',
      TIDB_PORT: process.env.TIDB_PORT || '✗ Missing',
    },
    connection: { success: false, error: null, details: null }
  };

  try {
    // Test connection with a simple query
    const [result] = await pool.query('SELECT 1 + 1 as solution');
    const [version] = await pool.query('SELECT VERSION() as version');
    const [databases] = await pool.query('SHOW DATABASES');
    const [users] = await pool.query('SELECT COUNT(*) as count FROM users');
    
    debug.connection.success = true;
    debug.connection.details = {
      test: result[0].solution === 2 ? '✅ Query works' : '❌ Query failed',
      version: version[0].version,
      databases: databases.map(db => Object.values(db)[0]).slice(0, 5),
      userCount: users[0].count
    };
    
  } catch (error) {
    debug.connection.error = {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
      errno: error.errno
    };
  }

  return NextResponse.json(debug);
}