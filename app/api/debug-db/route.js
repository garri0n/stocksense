// app/api/debug-db/route.js
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
  const rawUsername = process.env.TIDB_USER || 'not set';
  
  // Format username with quotes (same as in db.js)
  let formattedUser = rawUsername.replace(/'/g, '');
  formattedUser = `'${formattedUser}'`;
  
  const debug = {
    environment: process.env.NODE_ENV,
    variables: {
      TIDB_HOST: process.env.TIDB_HOST || '✗ Missing',
      TIDB_USER: {
        raw: rawUsername,
        formatted: formattedUser,
        length: formattedUser.length,
        charCodes: formattedUser.split('').map(c => c.charCodeAt(0))
      },
      TIDB_PASSWORD: process.env.TIDB_PASSWORD ? '✓ Set' : '✗ Missing',
      TIDB_DATABASE: process.env.TIDB_DATABASE || '✗ Missing',
      TIDB_PORT: process.env.TIDB_PORT || '✗ Missing',
    },
    connection: { success: false, error: null }
  };

  // Try direct connection without using the pool
  try {
    const connection = await mysql.createConnection({
      host: process.env.TIDB_HOST,
      user: formattedUser,
      password: process.env.TIDB_PASSWORD,
      database: process.env.TIDB_DATABASE,
      port: parseInt(process.env.TIDB_PORT) || 4000,
      ssl: { rejectUnauthorized: true }
    });
    
    const [rows] = await connection.execute('SELECT 1 + 1 as solution');
    await connection.end();
    
    debug.connection.success = true;
    debug.connection.result = rows;
    
  } catch (error) {
    debug.connection.error = {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    };
  }

  return NextResponse.json(debug);
}