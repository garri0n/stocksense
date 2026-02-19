// app/api/test-db/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Test the connection
    const [result] = await pool.query('SELECT 1 + 1 as solution');
    
    // Get some actual data
    const [users] = await pool.query('SELECT id, username, email FROM users LIMIT 5');
    const [products] = await pool.query('SELECT COUNT(*) as count FROM products');
    const [sales] = await pool.query('SELECT SUM(total_amount) as total FROM sales');
    
    return NextResponse.json({
      success: true,
      message: 'Database connected successfully!',
      test: result[0].solution === 2 ? 'Connection test passed' : 'Connection test failed',
      stats: {
        users: users.length,
        totalProducts: products[0].count,
        totalSales: sales[0].total || 0
      },
      sampleUsers: users
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}