// app/api/debug-db/route.js
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
  const results = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    variables: {
      TIDB_HOST: process.env.TIDB_HOST || '❌ MISSING',
      TIDB_USER: {
        value: process.env.TIDB_USER || '❌ MISSING',
        length: (process.env.TIDB_USER || '').length,
        containsQuotes: (process.env.TIDB_USER || '').includes("'"),
        firstChar: (process.env.TIDB_USER || '').charAt(0),
        lastChar: (process.env.TIDB_USER || '').slice(-1)
      },
      TIDB_DATABASE: process.env.TIDB_DATABASE || '❌ MISSING',
      TIDB_PORT: process.env.TIDB_PORT || '❌ MISSING',
      PASSWORD_SET: process.env.TIDB_PASSWORD ? '✅ Yes' : '❌ No'
    },
    tests: []
  };

  // Test 1: Simple DNS resolution
  try {
    const dns = require('dns');
    await new Promise((resolve, reject) => {
      dns.lookup(process.env.TIDB_HOST, (err, address) => {
        if (err) reject(err);
        else resolve(address);
      });
    });
    results.tests.push({ name: 'DNS Resolution', success: true });
  } catch (e) {
    results.tests.push({ name: 'DNS Resolution', success: false, error: e.message });
  }

  // Test 2: Try connection with minimal options
  try {
    const connection = await mysql.createConnection({
      host: process.env.TIDB_HOST,
      user: process.env.TIDB_USER,
      password: process.env.TIDB_PASSWORD,
      port: parseInt(process.env.TIDB_PORT) || 4000,
      ssl: { rejectUnauthorized: false },
      connectTimeout: 5000
    });
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 + 1 as solution');
    await connection.end();
    
    results.tests.push({ 
      name: 'Basic Connection', 
      success: true, 
      result: rows[0].solution 
    });
  } catch (e) {
    results.tests.push({ 
      name: 'Basic Connection', 
      success: false, 
      error: e.message,
      code: e.code,
      errno: e.errno
    });
  }

  // Test 3: Try with database selected
  if (results.tests[1]?.success) {
    try {
      const connection = await mysql.createConnection({
        host: process.env.TIDB_HOST,
        user: process.env.TIDB_USER,
        password: process.env.TIDB_PASSWORD,
        database: process.env.TIDB_DATABASE,
        port: parseInt(process.env.TIDB_PORT) || 4000,
        ssl: { rejectUnauthorized: false },
        connectTimeout: 5000
      });
      
      // Try to list tables
      const [tables] = await connection.execute('SHOW TABLES');
      await connection.end();
      
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

  return NextResponse.json(results);
}