// app/api/debug-db/route.js
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
  const results = {
    environment: process.env.NODE_ENV,
    variables: {
      host: process.env.TIDB_HOST,
      user: process.env.TIDB_USER,
      database: process.env.TIDB_DATABASE,
      port: process.env.TIDB_PORT,
      passwordSet: !!process.env.TIDB_PASSWORD
    },
    tests: []
  };

  // Test 1: Try with NO special formatting, just what's in env
  try {
    const conn1 = await mysql.createConnection({
      host: process.env.TIDB_HOST,
      user: process.env.TIDB_USER,
      password: process.env.TIDB_PASSWORD,
      database: process.env.TIDB_DATABASE,
      port: parseInt(process.env.TIDB_PORT) || 4000,
      ssl: { rejectUnauthorized: false }
    });
    await conn1.end();
    results.tests.push({ method: 'Raw env user', success: true });
  } catch (e) {
    results.tests.push({ method: 'Raw env user', success: false, error: e.message });
  }

  // Test 2: Try connecting without database specified
  try {
    const conn2 = await mysql.createConnection({
      host: process.env.TIDB_HOST,
      user: process.env.TIDB_USER,
      password: process.env.TIDB_PASSWORD,
      port: parseInt(process.env.TIDB_PORT) || 4000,
      ssl: { rejectUnauthorized: false }
    });
    await conn2.end();
    results.tests.push({ method: 'No database specified', success: true });
  } catch (e) {
    results.tests.push({ method: 'No database specified', success: false, error: e.message });
  }

  // Test 3: Try with SSL disabled (not recommended but for testing)
  try {
    const conn3 = await mysql.createConnection({
      host: process.env.TIDB_HOST,
      user: process.env.TIDB_USER,
      password: process.env.TIDB_PASSWORD,
      database: process.env.TIDB_DATABASE,
      port: parseInt(process.env.TIDB_PORT) || 4000,
      ssl: false
    });
    await conn3.end();
    results.tests.push({ method: 'SSL disabled', success: true });
  } catch (e) {
    results.tests.push({ method: 'SSL disabled', success: false, error: e.message });
  }

  return NextResponse.json(results);
}