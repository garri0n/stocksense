// app/api/dashboard/stats/route.js
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({
        totalProducts: 0,
        lowStock: 0,
        totalValue: 0,
        activeOrders: 0,
        recentItems: []
      });
    }

    const connection = await mysql.createConnection({
      host: process.env.TIDB_HOST,
      user: '2doub9SDN1b3FY2.root',
      password: process.env.TIDB_PASSWORD,
      database: process.env.TIDB_DATABASE || 'stocksense_ai',
      port: 4000,
      ssl: { rejectUnauthorized: false }
    });

    // Get total products for this user
    const [totalProducts] = await connection.execute(
      'SELECT COUNT(*) as count FROM products WHERE user_id = ?',
      [userId]
    );
    
    // Get low stock items for this user
    const [lowStock] = await connection.execute(
      'SELECT COUNT(*) as count FROM products WHERE user_id = ? AND current_stock < reorder_threshold',
      [userId]
    );
    
    // Get total value for this user
    const [totalValue] = await connection.execute(
      'SELECT COALESCE(SUM(current_stock * price), 0) as total FROM products WHERE user_id = ?',
      [userId]
    );
    
    // Get recent items for this user
    const [recentItems] = await connection.execute(
      'SELECT * FROM products WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
      [userId]
    );
    
    await connection.end();

    return NextResponse.json({
      totalProducts: totalProducts[0].count || 0,
      lowStock: lowStock[0].count || 0,
      totalValue: totalValue[0].total || 0,
      activeOrders: 0,
      recentItems: recentItems || []
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({
      totalProducts: 0,
      lowStock: 0,
      totalValue: 0,
      activeOrders: 0,
      recentItems: []
    });
  }
}