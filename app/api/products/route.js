// app/api/products/route.js
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(request) {
  try {
    // Try to get user ID from multiple sources
    let userId = request.headers.get('x-user-id');
    
    console.log('📦 GET products - User ID from header:', userId);
    
    // If no header, try to get from cookie directly
    if (!userId) {
      const cookieHeader = request.headers.get('cookie');
      console.log('🍪 Cookie header:', cookieHeader);
      
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {});
        
        if (cookies.user) {
          try {
            const userData = JSON.parse(decodeURIComponent(cookies.user));
            userId = userData.id;
            console.log('👤 Got user ID from cookie:', userId);
          } catch (e) {
            console.error('❌ Failed to parse user cookie:', e);
          }
        }
      }
    }
    
    // If still no user ID, return empty array
    if (!userId) {
      console.log('❌ No user ID found in header or cookie');
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
      'SELECT * FROM products WHERE user_id = ? ORDER BY id DESC',
      [userId]
    );

    await connection.end();
    
    console.log(`✅ Found ${rows.length} products for user ${userId}`);
    return NextResponse.json(rows);
    
  } catch (error) {
    console.error('❌ Products fetch error:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const userId = request.headers.get('x-user-id') || body.userId;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, sku, category, price, current_stock, reorder_threshold, description } = body;

    const connection = await mysql.createConnection({
      host: process.env.TIDB_HOST,
      user: '2doub9SDN1b3FY2.root',
      password: process.env.TIDB_PASSWORD,
      database: process.env.TIDB_DATABASE || 'stocksense_ai',
      port: 4000,
      ssl: { rejectUnauthorized: false }
    });

    const [result] = await connection.execute(
      'INSERT INTO products (name, sku, category, price, current_stock, reorder_threshold, description, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [name, sku, category || null, price, current_stock || 0, reorder_threshold || 10, description || null, userId]
    );

    await connection.end();

    return NextResponse.json({ 
      success: true, 
      id: result.insertId 
    }, { status: 201 });

  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const userId = request.headers.get('x-user-id');
    
    const { id, name, sku, category, price, current_stock, reorder_threshold, description } = body;

    console.log('📝 PUT request - Product ID:', id, 'User ID:', userId);

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      'UPDATE products SET name = ?, sku = ?, category = ?, price = ?, current_stock = ?, reorder_threshold = ?, description = ?, updated_at = NOW() WHERE id = ? AND user_id = ?',
      [name, sku, category || null, price, current_stock || 0, reorder_threshold || 10, description || null, id, userId]
    );

    await connection.end();

    if (result.affectedRows === 0) {
      return NextResponse.json({ 
        error: 'Product not found or unauthorized' 
      }, { status: 404 });
    }

    console.log('✅ Product updated successfully');
    return NextResponse.json({ 
      success: true, 
      message: 'Product updated successfully' 
    });

  } catch (error) {
    console.error('❌ Product update error:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}


export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // Get user ID from header
    const userId = request.headers.get('x-user-id');
    
    console.log('🗑️ DELETE request - Product ID:', id, 'User ID:', userId);

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    if (result.affectedRows === 0) {
      return NextResponse.json({ 
        error: 'Product not found or unauthorized' 
      }, { status: 404 });
    }

    console.log('✅ Product deleted successfully');
    return NextResponse.json({ 
      success: true, 
      message: 'Product deleted successfully' 
    });

  } catch (error) {
    console.error('❌ Product deletion error:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}