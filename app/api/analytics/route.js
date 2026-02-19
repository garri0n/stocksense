// app/api/analytics/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Sales by category
    const [salesByCategory] = await pool.query(`
      SELECT p.category, SUM(s.quantity * s.unit_price) as total_sales
      FROM sales s
      JOIN products p ON s.product_id = p.id
      WHERE s.sale_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY p.category
    `);

    // Daily sales for last 7 days
    const [dailySales] = await pool.query(`
      SELECT DATE(sale_date) as date, SUM(total_amount) as total
      FROM sales
      WHERE sale_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(sale_date)
      ORDER BY date
    `);

    // Top products
    const [topProducts] = await pool.query(`
      SELECT p.name, SUM(s.quantity) as total_sold
      FROM sales s
      JOIN products p ON s.product_id = p.id
      WHERE s.sale_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
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

    return NextResponse.json({
      salesByCategory,
      dailySales,
      topProducts,
      stockDistribution
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}