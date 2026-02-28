// app/api/ai/with-fallback/route.js
export async function POST(request) {
  try {
    // Try AI first
    const result = await aiRateLimiter.schedule(aiFunction);
    return NextResponse.json({ source: 'ai', data: result });
  } catch (error) {
    if (error.message.includes('429')) {
      // Rate limited - return cached or simplified response
      return NextResponse.json({ 
        source: 'fallback',
        data: getDefaultInsights() // Your predefined insights
      });
    }
    throw error;
  }
}