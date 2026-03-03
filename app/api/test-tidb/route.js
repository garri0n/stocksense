// app/api/test-tidb/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  // Force using TiDB for this test
  process.env.USE_TIDB = 'true';
  
  try {
    // Test connection
    const [result] = await pool.query('SELECT 1 + 1 as solution');
    
    // Try to create database if not exists
    await pool.query('CREATE DATABASE IF NOT EXISTS stocksense_ai');
    await pool.query('USE stocksense_ai');
    
    // Check tables
    const [tables] = await pool.query('SHOW TABLES');
    
    return NextResponse.json({
      success: true,
      message: '✅ Connected to TiDB Cloud!',
      test: result[0].solution,
      tables: tables.map(t => Object.values(t)[0]),
      database: 'stocksense_ai'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code
    }, { status: 500 });
  }
}