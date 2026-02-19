// app/api/analytics/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Sales by category
    const [salesByCategory] = await pool.query(`
      SELECT p.category, COALESCE(SUM(s.quantity * s.unit_price), 0) as total_sales
      FROM products p
      LEFT JOIN sales s ON p.id = s.product_id AND s.sale_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY p.category
    `);

    // Daily sales for last 7 days
    const [dailySales] = await pool.query(`
      SELECT 
        COALESCE(DATE(s.sale_date), CURDATE()) as date, 
        COALESCE(SUM(s.total_amount), 0) as total
      FROM (SELECT CURDATE() as date UNION SELECT DATE_SUB(CURDATE(), INTERVAL 1 DAY) UNION
            SELECT DATE_SUB(CURDATE(), INTERVAL 2 DAY) UNION SELECT DATE_SUB(CURDATE(), INTERVAL 3 DAY) UNION
            SELECT DATE_SUB(CURDATE(), INTERVAL 4 DAY) UNION SELECT DATE_SUB(CURDATE(), INTERVAL 5 DAY) UNION
            SELECT DATE_SUB(CURDATE(), INTERVAL 6 DAY)) as dates
      LEFT JOIN sales s ON DATE(s.sale_date) = dates.date
      GROUP BY dates.date
      ORDER BY dates.date
    `);

    // Top products
    const [topProducts] = await pool.query(`
      SELECT p.name, COALESCE(SUM(s.quantity), 0) as total_sold
      FROM products p
      LEFT JOIN sales s ON p.id = s.product_id AND s.sale_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY p.id, p.name
      ORDER BY total_sold DESC
      LIMIT 5
    `);

    // Stock distribution
    const [stockDistribution] = await pool.query(`
      SELECT 
        CASE 
          WHEN current_stock = 0 THEN 'Out of Stock'
          WHEN current_stock < reorder_threshold THEN 'Low Stock'
          ELSE 'In Stock'
        END as status,
        COUNT(*) as count
      FROM products
      GROUP BY status
    `);

    // If no distribution data, provide defaults
    if (stockDistribution.length === 0) {
      stockDistribution.push(
        { status: 'In Stock', count: 0 },
        { status: 'Low Stock', count: 0 },
        { status: 'Out of Stock', count: 0 }
      );
    }

    return NextResponse.json({
      salesByCategory: salesByCategory || [],
      dailySales: dailySales || [],
      topProducts: topProducts || [],
      stockDistribution: stockDistribution || []
    });

  } catch (error) {
    console.error('Analytics error:', error);
    
    // Return default data
    return NextResponse.json({
      salesByCategory: [],
      dailySales: Array(7).fill().map((_, i) => ({
        date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
        total: 0
      })),
      topProducts: [],
      stockDistribution: [
        { status: 'In Stock', count: 0 },
        { status: 'Low Stock', count: 0 },
        { status: 'Out of Stock', count: 0 }
      ]
    });
  }
}