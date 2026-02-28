// scripts/generate-insights.js
import { getAIResponse, aiRateLimiter } from '../lib/ai.js';
import pool from '../lib/db.js';

async function generateInsights() {
  console.log('🤖 Generating AI insights with Gemini...');
  
  try {
    // Fetch data
    const [lowStock] = await pool.query(`
      SELECT name, current_stock, reorder_threshold 
      FROM products 
      WHERE current_stock < reorder_threshold
    `);
    
    const [recentSales] = await pool.query(`
      SELECT SUM(total_amount) as total, DAYNAME(sale_date) as day
      FROM sales 
      WHERE sale_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DAYOFWEEK(sale_date)
    `);

    // Generate insights with rate limiting
    const insightsJSON = await aiRateLimiter.schedule(async () => {
      return await getAIResponse(
        "You are an AI business analyst. Generate 3-5 actionable insights.",
        `Generate insights as JSON array with: title, description, type (warning/success/info), action.
         Low stock: ${JSON.stringify(lowStock)}
         Sales trend: ${JSON.stringify(recentSales)}`
      );
    });

    if (insightsJSON) {
      const insights = JSON.parse(insightsJSON);
      
      // Store in database
      await pool.query('DELETE FROM ai_insights'); // Clear old ones
      
      for (const insight of insights) {
        await pool.query(
          'INSERT INTO ai_insights (title, description, type, action, created_at) VALUES (?, ?, ?, ?, NOW())',
          [insight.title, insight.description, insight.type, insight.action]
        );
      }
      
      console.log('✅ Insights generated and stored!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run every 6 hours (use cron-job.org to trigger)
generateInsights();