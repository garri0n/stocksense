// app/api/ai/analytics/route.js
import { getAIResponse, aiRateLimiter } from '@/lib/ai';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    // Fetch your data
    const [salesData] = await pool.query(`
      SELECT DATE(sale_date) as date, SUM(total_amount) as daily_total
      FROM sales 
      WHERE sale_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(sale_date)
    `);
    
    const [productData] = await pool.query(`
      SELECT category, COUNT(*) as count, SUM(current_stock * price) as value
      FROM products 
      GROUP BY category
    `);

    // Use rate limiter to stay within free tier
    const insights = await aiRateLimiter.schedule(async () => {
      return await getAIResponse(
        "You are a senior data analyst for an inventory management system. Provide concise, actionable insights.",
        `Analyze this sales and inventory data and return a JSON object with:
         - topPerformingCategory: string
         - salesTrend: "up" | "down" | "stable"
         - recommendation: string
         - alertLevel: "low" | "medium" | "high"
         
         Data: Sales=${JSON.stringify(salesData)}, Products=${JSON.stringify(productData)}`
      );
    });

    if (!insights) {
      return NextResponse.json({ 
        success: false, 
        message: "AI temporarily unavailable" 
      });
    }

    // Parse the JSON response (Gemini is good at JSON!)
    const parsed = JSON.parse(insights);
    
    return NextResponse.json({
      success: true,
      ...parsed,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Analytics AI error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}