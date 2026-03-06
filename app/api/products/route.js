// app/api/products/route.js
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(request) {
  try {
    // Get user ID from header (set by middleware)
    const userId = request.headers.get('x-user-id');
    
    console.log('📦 Fetching products for user:', userId);

    if (!userId) {
      console.log('❌ No user ID found');
      return NextResponse.json([]);
    }

    const connection = await mysql.createConnection({
      host: process.env.TIDB_HOST,
      user: '2doub9SDN1b3FY2.root',
      password: process.env.TIDB_PASSWORD,
      database: process.env.TIDB_DATABASE || 'stocksense_ai',
      port: 4000,
      ssl: { rejectUnauthorized: false }
    });

    const [rows] = await connection.execute(
      'SELECT * FROM products WHERE user_id = ? ORDER BY name',
      [userId]
    );
    
    await connection.end();
    console.log(`✅ Found ${rows.length} products for user ${userId}`);
    return NextResponse.json(rows || []);
    
  } catch (error) {
    console.error('❌ Products fetch error:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request) {
  try {
    // Get user ID from header
    const userId = request.headers.get('x-user-id');
    
    console.log('📝 Adding product for user:', userId);

    if (!userId) {
      console.log('❌ No user ID found for product creation');
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const body = await request.json();
    console.log('📦 Product data:', body);
    
    const { name, sku, category, price, current_stock, reorder_threshold, description } = body;
    
    // Validate required fields
    if (!name || !sku || !price) {
      return NextResponse.json({ 
        success: false, 
        error: 'Name, SKU, and price are required' 
      }, { status: 400 });
    }

    const connection = await mysql.createConnection({
      host: process.env.TIDB_HOST,
      user: '2doub9SDN1b3FY2.root',
      password: process.env.TIDB_PASSWORD,
      database: process.env.TIDB_DATABASE || 'stocksense_ai',
      port: 4000,
      ssl: { rejectUnauthorized: false }
    });
    
    // Insert with user_id
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
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// ... (PUT and DELETE methods remain the same)

export async function PUT(request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, sku, category, price, current_stock, reorder_threshold, description } = body;
    
    const connection = await mysql.createConnection({
      host: process.env.TIDB_HOST,
      user: '2doub9SDN1b3FY2.root',
      password: process.env.TIDB_PASSWORD,
      database: process.env.TIDB_DATABASE || 'stocksense_ai',
      port: 4000,
      ssl: { rejectUnauthorized: false }
    });
    
    // Update only if product belongs to this user
    const [result] = await connection.execute(
      'UPDATE products SET name = ?, sku = ?, category = ?, price = ?, current_stock = ?, reorder_threshold = ?, description = ? WHERE id = ? AND user_id = ?',
      [name, sku, category, price, current_stock, reorder_threshold, description, id, userId]
    );
    
    await connection.end();
    
    return NextResponse.json({ 
      success: true,
      affectedRows: result.affectedRows
    });
    
  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    const connection = await mysql.createConnection({
      host: process.env.TIDB_HOST,
      user: '2doub9SDN1b3FY2.root',
      password: process.env.TIDB_PASSWORD,
      database: process.env.TIDB_DATABASE || 'stocksense_ai',
      port: 4000,
      ssl: { rejectUnauthorized: false }
    });
    
    // Delete only if product belongs to this user
    const [result] = await connection.execute(
      'DELETE FROM products WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    await connection.end();
    
    return NextResponse.json({ 
      success: true,
      affectedRows: result.affectedRows
    });
    
  } catch (error) {
    console.error('Product deletion error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}