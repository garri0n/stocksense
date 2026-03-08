// app/api/analytics/route.js
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(request) {
  try {
    // Log all headers for debugging
    console.log('📋 Analytics API - All headers:', Object.fromEntries(request.headers));
    
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
    
    console.log('📊 Analytics API - User ID from header:', userId);
    
    // If no header, try to get from cookie
    if (!userId) {
      userId = getUserIdFromCookie(request);
      console.log('📊 Analytics API - User ID from cookie:', userId);
    }
    
    // Also check cookie directly for debugging
    const cookieHeader = request.headers.get('cookie');
    console.log('🍪 Analytics API - Cookie header:', cookieHeader);

    // If no user ID found at all, return empty data
    if (!userId) {
      console.log('❌ Analytics API - No user ID found in header or cookie');
      
      // Create empty daily sales for last 7 days
      const emptyDailySales = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        emptyDailySales.push({
          date: date.toISOString().split('T')[0],
          total: 0
        });
      }

      return NextResponse.json({
        salesByCategory: [],
        dailySales: emptyDailySales,
        topProducts: [],
        stockDistribution: [
          { status: 'In Stock', count: 0 },
          { status: 'Low Stock', count: 0 },
          { status: 'Out of Stock', count: 0 }
        ]
      });
    }

    console.log(`📊 Analytics API - Final User ID: ${userId}`);

    const connection = await mysql.createConnection({
      host: process.env.TIDB_HOST,
      user: '2doub9SDN1b3FY2.root',
      password: process.env.TIDB_PASSWORD,
      database: process.env.TIDB_DATABASE || 'stocksense_ai',
      port: 4000,
      ssl: { rejectUnauthorized: false }
    });

    // Get total products count for THIS user
    const [totalProducts] = await connection.execute(
      'SELECT COUNT(*) as count FROM products WHERE user_id = ?',
      [userId]
    );

    // Get low stock count for THIS user
    const [lowStock] = await connection.execute(
      'SELECT COUNT(*) as count FROM products WHERE user_id = ? AND current_stock < reorder_threshold',
      [userId]
    );

    // Get out of stock count for THIS user
    const [outOfStock] = await connection.execute(
      'SELECT COUNT(*) as count FROM products WHERE user_id = ? AND current_stock = 0',
      [userId]
    );

    // Get total value for THIS user
    const [totalValue] = await connection.execute(
      'SELECT COALESCE(SUM(current_stock * price), 0) as total FROM products WHERE user_id = ?',
      [userId]
    );

    // Get stock distribution for THIS user
    const [stockDistribution] = await connection.execute(`
      SELECT 
        CASE 
          WHEN current_stock = 0 THEN 'Out of Stock'
          WHEN current_stock < reorder_threshold THEN 'Low Stock'
          ELSE 'In Stock'
        END as status,
        COUNT(*) as count
      FROM products
      WHERE user_id = ?
      GROUP BY status
    `, [userId]);

    // Get top products for THIS user
    const [topProducts] = await connection.execute(`
      SELECT name, current_stock as total_sold 
      FROM products 
      WHERE user_id = ? 
      ORDER BY current_stock DESC 
      LIMIT 5
    `, [userId]);

    // Get sales by category (if sales table exists)
    let salesByCategory = [];
    try {
      const [categorySales] = await connection.execute(`
        SELECT 
          p.category,
          COALESCE(SUM(s.quantity), 0) as total_sales
        FROM products p
        LEFT JOIN sales s ON p.id = s.product_id AND s.user_id = ?
        WHERE p.user_id = ?
        GROUP BY p.category
      `, [userId, userId]);
      salesByCategory = categorySales;
    } catch (e) {
      console.log('No sales table or data for user', userId);
    }

    // Get daily sales for THIS user
    let dailySales = [];
    try {
      const [sales] = await connection.execute(`
        SELECT 
        DATE(s.sale_date) as date,
        COALESCE(SUM(s.total_amount), 0) as total
        FROM sales s
        WHERE s.user_id = ? AND s.sale_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY DATE(s.sale_date)
        ORDER BY date
      `, [userId]);
      
      if (sales.length === 0) {
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          sales.push({
            date: date.toISOString().split('T')[0],
            total: 0
          });
        }
      }
      dailySales = sales;
    } catch (e) {
      // Create empty daily sales
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dailySales.push({
          date: date.toISOString().split('T')[0],
          total: 0
        });
      }
    }

    await connection.end();

    // Ensure stockDistribution always has all three statuses
    const finalDistribution = [
      { status: 'In Stock', count: 0 },
      { status: 'Low Stock', count: 0 },
      { status: 'Out of Stock', count: 0 }
    ];
    
    stockDistribution.forEach(item => {
      const index = finalDistribution.findIndex(d => d.status === item.status);
      if (index !== -1) {
        finalDistribution[index].count = item.count;
      }
    });

    // Calculate stock health percentage
    const total = totalProducts[0]?.count || 0;
    const low = lowStock[0]?.count || 0;
    const out = outOfStock[0]?.count || 0;
    const stockHealth = total > 0 ? Math.round(((total - low - out) / total) * 100) : 0;

    console.log(`📊 Analytics API - Response for user ${userId}:`, {
      totalProducts: total,
      lowStock: low,
      outOfStock: out,
      totalValue: totalValue[0]?.total || 0,
      stockHealth
    });

    return NextResponse.json({
      salesByCategory: salesByCategory || [],
      dailySales: dailySales || [],
      topProducts: topProducts || [],
      stockDistribution: finalDistribution,
      // Add these for the stats cards if needed
      totalProducts: total,
      lowStock: low,
      outOfStock: out,
      totalValue: totalValue[0]?.total || 0,
      stockHealth: stockHealth
    });

  } catch (error) {
    console.error('❌ Analytics API error:', error);
    
    // Create empty daily sales for last 7 days
    const emptyDailySales = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      emptyDailySales.push({
        date: date.toISOString().split('T')[0],
        total: 0
      });
    }

    return NextResponse.json({
      salesByCategory: [],
      dailySales: emptyDailySales,
      topProducts: [],
      stockDistribution: [
        { status: 'In Stock', count: 0 },
        { status: 'Low Stock', count: 0 },
        { status: 'Out of Stock', count: 0 }
      ],
      totalProducts: 0,
      lowStock: 0,
      outOfStock: 0,
      totalValue: 0,
      stockHealth: 0
    });
  }
}