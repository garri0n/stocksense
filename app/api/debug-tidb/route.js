// app/api/debug-tidb/route.js
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
  const results = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    variables: {
      NODE_ENV: process.env.NODE_ENV,
      TIDB_HOST: process.env.TIDB_HOST,
      TIDB_USER: process.env.TIDB_USER ? '✓ Set' : '✗ Missing',
      TIDB_PASSWORD: process.env.TIDB_PASSWORD ? '✓ Set' : '✗ Missing',
      TIDB_DATABASE: process.env.TIDB_DATABASE,
      TIDB_PORT: process.env.TIDB_PORT,
    },
    tests: []
  };

  // Test 1: Try without any database (just connect)
  try {
    console.log('Test 1: Connecting without database...');
    const conn1 = await mysql.createConnection({
      host: process.env.TIDB_HOST,
      user: `'${process.env.TIDB_USER?.replace(/['`"]/g, '')}'`,
      password: process.env.TIDB_PASSWORD,
      port: parseInt(process.env.TIDB_PORT) || 4000,
      ssl: { rejectUnauthorized: false },
      connectTimeout: 5000
    });
    
    const [version] = await conn1.execute('SELECT VERSION() as version');
    await conn1.end();
    
    results.tests.push({
      name: 'Basic Connection',
      success: true,
      version: version[0].version
    });
  } catch (e) {
    results.tests.push({
      name: 'Basic Connection',
      success: false,
      error: e.message,
      code: e.code
    });
  }

  // Test 2: Try with database
  if (results.tests[0]?.success) {
    try {
      console.log('Test 2: Connecting with database...');
      const conn2 = await mysql.createConnection({
        host: process.env.TIDB_HOST,
        user: `'${process.env.TIDB_USER?.replace(/['`"]/g, '')}'`,
        password: process.env.TIDB_PASSWORD,
        database: process.env.TIDB_DATABASE,
        port: parseInt(process.env.TIDB_PORT) || 4000,
        ssl: { rejectUnauthorized: false },
        connectTimeout: 5000
      });
      
      const [tables] = await conn2.execute('SHOW TABLES');
      await conn2.end();
      
      results.tests.push({
        name: 'With Database',
        success: true,
        tables: tables.map(t => Object.values(t)[0])
      });
    } catch (e) {
      results.tests.push({
        name: 'With Database',
        success: false,
        error: e.message
      });
    }
  }

  // Test 3: Check if users table exists and has data
  if (results.tests[1]?.success) {
    try {
      console.log('Test 3: Checking users table...');
      const conn3 = await mysql.createConnection({
        host: process.env.TIDB_HOST,
        user: `'${process.env.TIDB_USER?.replace(/['`"]/g, '')}'`,
        password: process.env.TIDB_PASSWORD,
        database: process.env.TIDB_DATABASE,
        port: parseInt(process.env.TIDB_PORT) || 4000,
        ssl: { rejectUnauthorized: false }
      });
      
      const [users] = await conn3.execute('SELECT COUNT(*) as count FROM users');
      await conn3.end();
      
      results.tests.push({
        name: 'Users Table',
        success: true,
        userCount: users[0].count
      });
    } catch (e) {
      results.tests.push({
        name: 'Users Table',
        success: false,
        error: e.message
      });
    }
  }

  return NextResponse.json(results);
}