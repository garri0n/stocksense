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

    // Get total products
    const [totalProducts] = await connection.execute(
      'SELECT COUNT(*) as count FROM products WHERE user_id = ?',
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

    // Get sales by category (if you have sales data)
    const [salesByCategory] = await connection.execute(`
      SELECT 
        p.category,
        COALESCE(SUM(s.quantity * s.unit_price), 0) as total_sales
      FROM products p
      LEFT JOIN sales s ON p.id = s.product_id 
        AND s.sale_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        AND s.user_id = ?
      WHERE p.user_id = ?
      GROUP BY p.category
    `, [userId, userId]);

    // Get daily sales for last 7 days (if you have sales data)
    const [dailySales] = await connection.execute(`
      SELECT 
        COALESCE(DATE(s.sale_date), CURDATE()) as date,
        COALESCE(SUM(s.total_amount), 0) as total
      FROM (
        SELECT CURDATE() as date 
        UNION SELECT DATE_SUB(CURDATE(), INTERVAL 1 DAY)
        UNION SELECT DATE_SUB(CURDATE(), INTERVAL 2 DAY)
        UNION SELECT DATE_SUB(CURDATE(), INTERVAL 3 DAY)
        UNION SELECT DATE_SUB(CURDATE(), INTERVAL 4 DAY)
        UNION SELECT DATE_SUB(CURDATE(), INTERVAL 5 DAY)
        UNION SELECT DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      ) as dates
      LEFT JOIN sales s ON DATE(s.sale_date) = dates.date AND s.user_id = ?
      GROUP BY dates.date
      ORDER BY dates.date
    `, [userId]);

    // Get top products by stock value
    const [topProducts] = await connection.execute(
      'SELECT name, current_stock * price as total_value FROM products WHERE user_id = ? ORDER BY total_value DESC LIMIT 5',
      [userId]
    );

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

    await connection.end();

    const stockHealth = totalProducts[0].count > 0 
      ? ((totalProducts[0].count - lowStock[0].count - outOfStock[0].count) / totalProducts[0].count * 100).toFixed(0)
      : 0;

    return NextResponse.json({
      totalProducts: totalProducts[0].count,
      totalItems: totalProducts[0].count,
      lowStock: lowStock[0].count,
      outOfStock: outOfStock[0].count,
      totalValue: totalValue[0].total,
      stockHealth: stockHealth,
      salesByCategory: salesByCategory || [],
      dailySales: dailySales || [],
      topProducts: topProducts || [],
      stockDistribution: stockDistribution.length > 0 ? stockDistribution : [
        { status: 'In Stock', count: totalProducts[0].count },
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