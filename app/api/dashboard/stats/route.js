// app/api/dashboard/stats/route.js
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(request) {
  try {
    // Log all headers for debugging
    console.log('📋 Dashboard API - All headers:', Object.fromEntries(request.headers));
    
    // Helper function to get user ID from cookie
    const getUserIdFromCookie = (request) => {
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {});
        
        if (cookies.user) {
          try {
            const userData = JSON.parse(decodeURIComponent(cookies.user));
            return userData.id;
          } catch (e) {
            console.error('❌ Error parsing user cookie:', e);
          }
        }
      }
      return null;
    };

    // Get user ID from header first, then try cookie
    let userId = request.headers.get('x-user-id');
    
    console.log('📊 Dashboard API - User ID from header:', userId);
    
    // If no header, try to get from cookie
    if (!userId) {
      userId = getUserIdFromCookie(request);
      console.log('📊 Dashboard API - User ID from cookie:', userId);
    }
    
    // Also check cookie directly for debugging
    const cookieHeader = request.headers.get('cookie');
    console.log('🍪 Dashboard API - Cookie header:', cookieHeader);

    // If no user ID found at all, return empty data
    if (!userId) {
      console.log('❌ Dashboard API - No user ID found in header or cookie');
      return NextResponse.json({
        totalProducts: 0,
        totalItems: 0,
        lowStock: 0,
        totalValue: 0,
        outOfStock: 0,
        recentItems: []
      });
    }

    console.log(`📊 Dashboard API - Final User ID: ${userId}`);

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
    console.log(`📊 Dashboard API - Total products for user ${userId}:`, totalProducts[0]?.count);
    
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
      'SELECT id, name, sku, category, current_stock, price, reorder_threshold FROM products WHERE user_id = ? ORDER BY id DESC LIMIT 5',
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

    console.log(`📊 Dashboard API - Response for user ${userId}:`, response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Dashboard API error:', error);
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