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
      'SELECT COALESCE(SUM(current_stock * price), 0) as total FROM products'
    );
    
    // Get active orders (sales in last 7 days)
    const [activeOrders] = await pool.query(
      'SELECT COUNT(DISTINCT id) as count FROM sales WHERE sale_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)'
    );
    
    // Get recent inventory items
    const [recentItems] = await pool.query(
      'SELECT * FROM products ORDER BY created_at DESC LIMIT 5'
    );

    return NextResponse.json({
      totalProducts: totalProducts[0].count || 0,
      lowStock: lowStock[0].count || 0,
      totalValue: totalValue[0].total || 0,
      activeOrders: activeOrders[0].count || 0,
      recentItems: recentItems || []
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    
    // Return default values instead of error
    return NextResponse.json({
      totalProducts: 0,
      lowStock: 0,
      totalValue: 0,
      activeOrders: 0,
      recentItems: []
    });
  }
}