// app/api/products/route.js
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(request) {
  const body = await request.json();
  const userId = request.headers.get('x-user-id') || body.userId;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
  try {
    // Log all headers for debugging
    console.log('📋 All headers:', Object.fromEntries(request.headers));
    
    // Try to get user ID from different sources
    const userId = request.headers.get('x-user-id') || 
                   request.headers.get('user-id') || 
                   request.headers.get('userId');
    
    console.log('🆔 User ID from headers:', userId);

    if (!userId) {
      console.log('❌ No user ID found in headers');
      
      // Try to get from cookie manually
      const cookie = request.headers.get('cookie');
      console.log('🍪 Raw cookie:', cookie);
      
      return NextResponse.json({ 
        error: 'Unauthorized - No user ID' 
      }, { status: 401 });
    }

    const body = await request.json();
    console.log('📦 Product data:', body);

    const connection = await mysql.createConnection({
      host: process.env.TIDB_HOST,
      user: '2doub9SDN1b3FY2.root',
      password: process.env.TIDB_PASSWORD,
      database: process.env.TIDB_DATABASE || 'stocksense_ai',
      port: 4000,
      ssl: { rejectUnauthorized: false }
    });

    const { name, sku, category, price, current_stock, reorder_threshold, description } = body;

    const [result] = await connection.execute(
      'INSERT INTO products (name, sku, category, price, current_stock, reorder_threshold, description, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, sku, category || null, price, current_stock || 0, reorder_threshold || 10, description || null, userId]
    );

    await connection.end();

    console.log('✅ Product added with ID:', result.insertId);

    return NextResponse.json({ 
      success: true, 
      id: result.insertId 
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Product creation error:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}