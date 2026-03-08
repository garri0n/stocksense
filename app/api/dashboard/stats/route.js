// app/api/dashboard/stats/route.js
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(request) {
  try {
    // Get user ID from header - DON'T use a fallback
    const userId = request.headers.get('x-user-id');
    
    console.log('📊 Dashboard stats - User ID from header:', userId);

    // If no user ID, return empty data
    if (!userId) {
      console.log('❌ No user ID found in headers');
      return NextResponse.json({
        totalProducts: 0,
        totalItems: 0,
        lowStock: 0,
        totalValue: 0,
        outOfStock: 0,
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

    // Get total number of products for THIS user
    const [totalProducts] = await connection.execute(
      'SELECT COUNT(*) as count FROM products WHERE user_id = ?',
      [userId]
    );
    
    // Get total items in stock for THIS user
    const [totalItems] = await connection.execute(
      'SELECT COALESCE(SUM(current_stock), 0) as total FROM products WHERE user_id = ?',
      [userId]
    );
    
    // Get low stock items count for THIS user
    const [lowStock] = await connection.execute(
      'SELECT COUNT(*) as count FROM products WHERE user_id = ? AND current_stock < reorder_threshold',
      [userId]
    );
    
    // Get total value for THIS user
    const [totalValue] = await connection.execute(
      'SELECT COALESCE(SUM(current_stock * price), 0) as total FROM products WHERE user_id = ?',
      [userId]
    );
    
    // Get out of stock count for THIS user
    const [outOfStock] = await connection.execute(
      'SELECT COUNT(*) as count FROM products WHERE user_id = ? AND current_stock = 0',
      [userId]
    );
    
    // Get recent items for THIS user
    const [recentItems] = await connection.execute(
      'SELECT id, name, sku, category, current_stock, price, reorder_threshold FROM products WHERE user_id = ? ORDER BY updated_at DESC LIMIT 5',
      [userId]
    );

    await connection.end();

    const response = {
      totalProducts: totalProducts[0]?.count || 0,
      totalItems: totalItems[0]?.total || 0,
      lowStock: lowStock[0]?.count || 0,
      totalValue: totalValue[0]?.total || 0,
      outOfStock: outOfStock[0]?.count || 0,
      recentItems: recentItems || []
    };

    console.log(`📊 Dashboard stats for user ${userId}:`, response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    return NextResponse.json({
      totalProducts: 0,
      totalItems: 0,
      lowStock: 0,
      totalValue: 0,
      outOfStock: 0,
      recentItems: []
    });
  }
}