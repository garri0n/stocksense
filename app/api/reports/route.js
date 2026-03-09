// app/api/reports/route.js
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(request) {
  try {
    // Get user ID from header or cookie
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
          } catch (e) {}
        }
      }
      return null;
    };

    let userId = request.headers.get('x-user-id') || getUserIdFromCookie(request);

    if (!userId) {
      console.log('❌ Reports API - No user ID found');
      return NextResponse.json({ reports: [], stats: { total: 0, monthly: 0, scheduled: 3 } });
    }

    console.log('📊 Reports API - User ID:', userId);

    const connection = await mysql.createConnection({
      host: process.env.TIDB_HOST,
      user: '2doub9SDN1b3FY2.root',
      password: process.env.TIDB_PASSWORD,
      database: process.env.TIDB_DATABASE || 'stocksense_ai',
      port: 4000,
      ssl: { rejectUnauthorized: false }
    });

    // Get real inventory data
    const [products] = await connection.execute(
      'SELECT COUNT(*) as total, COALESCE(SUM(current_stock), 0) as totalItems, COALESCE(SUM(current_stock * price), 0) as totalValue FROM products WHERE user_id = ?',
      [userId]
    );

    const [lowStock] = await connection.execute(
      'SELECT COUNT(*) as count FROM products WHERE user_id = ? AND current_stock < reorder_threshold',
      [userId]
    );

    const [outOfStock] = await connection.execute(
      'SELECT COUNT(*) as count FROM products WHERE user_id = ? AND current_stock = 0',
      [userId]
    );

    // Get real sales data
    const [sales] = await connection.execute(
      `SELECT COALESCE(SUM(total_amount), 0) as total, COUNT(*) as count 
       FROM sales WHERE user_id = ? AND sale_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`,
      [userId]
    );

    // Get sales by category
    const [categorySales] = await connection.execute(
      `SELECT 
         p.category, 
         COALESCE(SUM(s.quantity), 0) as quantity, 
         COALESCE(SUM(s.total_amount), 0) as amount
       FROM products p
       LEFT JOIN sales s ON p.id = s.product_id AND s.user_id = ? AND s.sale_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       WHERE p.user_id = ?
       GROUP BY p.category`,
      [userId, userId]
    );

    await connection.end();

    const now = new Date();
    const currentMonth = now.toLocaleString('default', { month: 'long' });
    const currentYear = now.getFullYear();
    const lastMonth = new Date(now.setMonth(now.getMonth() - 1)).toLocaleString('default', { month: 'long' });

    // Generate reports with REAL data
    const reports = [
      {
        id: 1,
        name: `Sales Report - ${currentMonth} ${currentYear}`,
        type: 'Sales',
        date: new Date().toISOString().split('T')[0],
        size: '2.4 MB',
        format: 'PDF',
        data: {
          totalSales: sales[0]?.total || 0,
          totalTransactions: sales[0]?.count || 0,
          averageSale: sales[0]?.count > 0 ? (sales[0]?.total / sales[0]?.count) : 0,
          categoryBreakdown: categorySales,
          period: 'Last 30 Days'
        }
      },
      {
        id: 2,
        name: `Inventory Summary - Q1 ${currentYear}`,
        type: 'Inventory',
        date: new Date().toISOString().split('T')[0],
        size: '1.8 MB',
        format: 'Excel',
        data: {
          totalProducts: products[0]?.total || 0,
          totalItems: products[0]?.totalItems || 0,
          totalValue: products[0]?.totalValue || 0,
          lowStockItems: lowStock[0]?.count || 0,
          outOfStockItems: outOfStock[0]?.count || 0,
          healthScore: products[0]?.total > 0 
            ? Math.round(((products[0]?.total - lowStock[0]?.count - outOfStock[0]?.count) / products[0]?.total) * 100)
            : 0
        }
      },
      {
        id: 3,
        name: `Low Stock Analysis - ${currentMonth} ${currentYear}`,
        type: 'Analytics',
        date: new Date().toISOString().split('T')[0],
        size: '956 KB',
        format: 'PDF',
        data: {
          lowStockCount: lowStock[0]?.count || 0,
          outOfStockCount: outOfStock[0]?.count || 0,
          recommendations: generateRestockRecommendations(lowStock[0]?.count, outOfStock[0]?.count)
        }
      },
      {
        id: 4,
        name: `Monthly Revenue Report - ${lastMonth} ${currentYear}`,
        type: 'Financial',
        date: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
        size: '3.1 MB',
        format: 'PDF',
        data: {
          revenue: sales[0]?.total || 0,
          transactions: sales[0]?.count || 0,
          averageOrderValue: sales[0]?.count > 0 ? (sales[0]?.total / sales[0]?.count) : 0,
          projectedNextMonth: (sales[0]?.total || 0) * 1.1
        }
      }
    ];

    // Calculate stats
    const monthlyReports = reports.filter(r => {
      const reportDate = new Date(r.date);
      return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear();
    });

    console.log('📊 Reports generated:', reports.length);

    return NextResponse.json({
      reports: reports,
      stats: {
        total: reports.length,
        monthly: monthlyReports.length,
        scheduled: 3
      }
    });

  } catch (error) {
    console.error('❌ Reports API error:', error);
    return NextResponse.json({ 
      reports: [], 
      stats: { total: 0, monthly: 0, scheduled: 3 } 
    });
  }
}

function generateRestockRecommendations(lowStock, outOfStock) {
  const recommendations = [];
  
  if (lowStock > 0) {
    recommendations.push(`Reorder ${lowStock} low stock items to prevent stockouts`);
  }
  
  if (outOfStock > 0) {
    recommendations.push(`Urgently restock ${outOfStock} out-of-stock items`);
  }
  
  if (lowStock === 0 && outOfStock === 0) {
    recommendations.push('Inventory levels are healthy');
  }
  
  return recommendations;
}