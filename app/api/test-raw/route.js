// app/api/test-raw/route.js
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
  const results = {
    step1: null,
    step2: null,
    step3: null,
    error: null
  };

  try {
    // STEP 1: Just try to connect with minimal config
    console.log('STEP 1: Basic connection attempt...');
    const connection = await mysql.createConnection({
      host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
      user: "'2doub9SDN1b3FY2.root'",
      password: process.env.TIDB_PASSWORD,
      port: 4000,
      ssl: { rejectUnauthorized: false },
      connectTimeout: 10000
    });
    
    results.step1 = '✅ Connection established';
    
    // STEP 2: Try a simple query
    const [version] = await connection.execute('SELECT VERSION() as version');
    results.step2 = `✅ Query worked - MySQL version: ${version[0].version}`;
    
    // STEP 3: List databases
    const [databases] = await connection.execute('SHOW DATABASES');
    results.step3 = {
      message: '✅ Databases listed',
      databases: databases.map(d => Object.values(d)[0])
    };
    
    await connection.end();
    
  } catch (error) {
    console.error('CONNECTION ERROR:', error);
    results.error = {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState
    };
  }

  return NextResponse.json(results);
}