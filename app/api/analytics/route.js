// app/api/analytics/route.js
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(request) {
  try {
    const userId = request.headers.get('x-user-id') || 60001;
    
    console.log('📊 Analytics - User ID:', userId);

    const connection = await mysql.createConnection({
      host: process.env.TIDB_HOST,
      user: '2doub9SDN1b3FY2.root',
      password: process.env.TIDB_PASSWORD,
      database: process.env.TIDB_DATABASE || 'stocksense_ai',
      port: 4000,
      ssl: { rejectUnauthorized: false }
    });

    // Get stock distribution
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

    // Get top products (modify to match what your chart expects)
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
      // If sales table doesn't exist, return empty array
      salesByCategory = [];
    }

    // Get daily sales for last 7 days (if sales table exists)
    let dailySales = [];
    try {
      const [sales] = await connection.execute(`
        SELECT 
          DATE(s.sale_date) as date,
          COALESCE(SUM(s.total_amount), 0) as total
        FROM sales s
        WHERE s.user_id = ? AND s.sale_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(s.sale_date)
        ORDER BY date
      `, [userId]);
      
      // If no sales data, create empty entries for last 7 days
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
      // If sales table doesn't exist, create empty daily sales
      dailySales = [];
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

    console.log('📊 Analytics data prepared:', {
      dailySales: dailySales.length,
      topProducts: topProducts.length,
      stockDistribution: finalDistribution
    });

    return NextResponse.json({
      salesByCategory: salesByCategory || [],
      dailySales: dailySales || [],
      topProducts: topProducts || [],
      stockDistribution: finalDistribution
    });

  } catch (error) {
    console.error('❌ Analytics API error:', error);
    
    // Return empty data structure on error
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
}