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

    // Get total products count
    const [totalProducts] = await connection.execute(
      'SELECT COUNT(*) as count FROM products WHERE user_id = ?',
      [userId]
    );

    // Get total items in stock (SUM of current_stock)
    const [totalItems] = await connection.execute(
      'SELECT COALESCE(SUM(current_stock), 0) as total FROM products WHERE user_id = ?',
      [userId]
    );

    // Get low stock count
    const [lowStock] = await connection.execute(
      'SELECT COUNT(*) as count FROM products WHERE user_id = ? AND current_stock < reorder_threshold',
      [userId]
    );

    // Get out of stock count
    const [outOfStock] = await connection.execute(
      'SELECT COUNT(*) as count FROM products WHERE user_id = ? AND current_stock = 0',
      [userId]
    );

    // Get total value
    const [totalValue] = await connection.execute(
      'SELECT COALESCE(SUM(current_stock * price), 0) as total FROM products WHERE user_id = ?',
      [userId]
    );

    // Get stock distribution for charts
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

    // Get top products by value
    const [topProducts] = await connection.execute(
      'SELECT name, current_stock as total_sold, (current_stock * price) as value FROM products WHERE user_id = ? ORDER BY value DESC LIMIT 5',
      [userId]
    );

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
      console.log('No sales table or data, using empty array');
    }

    // Get daily sales (if sales table exists)
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
      dailySales = sales;
    } catch (e) {
      console.log('No sales table or data, using empty array');
    }

    await connection.end();

    // Calculate stock health percentage
    const total = totalProducts[0]?.count || 0;
    const low = lowStock[0]?.count || 0;
    const out = outOfStock[0]?.count || 0;
    const stockHealth = total > 0 ? Math.round(((total - low - out) / total) * 100) : 0;

    console.log('📊 Analytics data:', {
      totalProducts: total,
      totalItems: totalItems[0]?.total || 0,
      lowStock: low,
      outOfStock: out,
      totalValue: totalValue[0]?.total || 0,
      stockHealth
    });

    return NextResponse.json({
      totalProducts: total,
      totalItems: totalItems[0]?.total || 0,
      lowStock: low,
      outOfStock: out,
      totalValue: totalValue[0]?.total || 0,
      stockHealth: stockHealth,
      salesByCategory: salesByCategory || [],
      dailySales: dailySales || [],
      topProducts: topProducts || [],
      stockDistribution: stockDistribution.length > 0 ? stockDistribution : [
        { status: 'In Stock', count: total },
        { status: 'Low Stock', count: 0 },
        { status: 'Out of Stock', count: 0 }
      ]
    });

  } catch (error) {
    console.error('❌ Analytics API error:', error);
    return NextResponse.json({
      totalProducts: 0,
      totalItems: 0,
      lowStock: 0,
      outOfStock: 0,
      totalValue: 0,
      stockHealth: 0,
      salesByCategory: [],
      dailySales: [],
      topProducts: [],
      stockDistribution: [
        { status: 'In Stock', count: 0 },
        { status: 'Low Stock', count: 0 },
        { status: 'Out of Stock', count: 0 }
      ]
    });
  }
}