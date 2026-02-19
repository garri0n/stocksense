// app/api/dashboard/stats/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Get total products
    const [totalProducts] = await pool.query('SELECT COUNT(*) as count FROM products');
    
    // Get low stock items
    const [lowStock] = await pool.query(
      'SELECT COUNT(*) as count FROM products WHERE current_stock < reorder_threshold'
    );
    
    // Get total value
    const [totalValue] = await pool.query(
      'SELECT SUM(current_stock * price) as total FROM products'
    );
    
    // Get active orders (sales in last 7 days)
    const [activeOrders] = await pool.query(
      'SELECT COUNT(DISTINCT id) as count FROM sales WHERE sale_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)'
    );
    
    // Get recent inventory items
    const [recentItems] = await pool.query(
      'SELECT * FROM products ORDER BY updated_at DESC LIMIT 5'
    );

    return NextResponse.json({
      totalProducts: totalProducts[0].count,
      lowStock: lowStock[0].count,
      totalValue: totalValue[0].total || 0,
      activeOrders: activeOrders[0].count,
      recentItems
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}