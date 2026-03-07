// app/api/dashboard/stats/route.js
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(request) {
  try {
    // Get user ID from header
    const userId = request.headers.get('x-user-id');
    
    console.log('📊 Dashboard stats - User ID:', userId);

    if (!userId) {
      console.log('❌ No user ID found');
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

    // Get total number of products
    const [totalProductsResult] = await connection.execute(
      'SELECT COUNT(*) as count FROM products WHERE user_id = ?',
      [userId]
    );
    
    // Get total items in stock
    const [totalItemsResult] = await connection.execute(
      'SELECT COALESCE(SUM(current_stock), 0) as total FROM products WHERE user_id = ?',
      [userId]
    );
    
    // Get low stock items count
    const [lowStockResult] = await connection.execute(
      'SELECT COUNT(*) as count FROM products WHERE user_id = ? AND current_stock < reorder_threshold',
      [userId]
    );
    
    // Get total value
    const [totalValueResult] = await connection.execute(
      'SELECT COALESCE(SUM(current_stock * price), 0) as total FROM products WHERE user_id = ?',
      [userId]
    );
    
    // Get out of stock count
    const [outOfStockResult] = await connection.execute(
      'SELECT COUNT(*) as count FROM products WHERE user_id = ? AND current_stock = 0',
      [userId]
    );
    
    // Get recent items
    const [recentItems] = await connection.execute(
      'SELECT id, name, sku, category, current_stock, price, reorder_threshold FROM products WHERE user_id = ? ORDER BY id DESC LIMIT 5',
      [userId]
    );

    await connection.end();

    const totalProducts = totalProductsResult[0]?.count || 0;
    const totalItems = totalItemsResult[0]?.total || 0;
    const lowStock = lowStockResult[0]?.count || 0;
    const totalValue = totalValueResult[0]?.total || 0;
    const outOfStock = outOfStockResult[0]?.count || 0;

    console.log('📊 Stats:', { totalProducts, totalItems, lowStock, totalValue, outOfStock, recentItems: recentItems.length });

    return NextResponse.json({
      totalProducts: totalProducts,
      totalItems: totalItems,
      lowStock: lowStock,
      totalValue: totalValue,
      outOfStock: outOfStock,
      recentItems: recentItems || []
    });

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