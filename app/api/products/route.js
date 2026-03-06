// app/api/products/route.js
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { cookies } from 'next/headers';

async function getUserId() {
  // For server components, we need to get user from session/cookie
  // This is simplified - in production, use proper JWT tokens
  const cookieStore = cookies();
  const userCookie = cookieStore.get('user');
  if (userCookie) {
    try {
      const user = JSON.parse(userCookie.value);
      return user.id;
    } catch (e) {
      return null;
    }
  }
  return null;
}

export async function GET(request) {
  try {
    // Get user ID from the request headers (set by middleware)
    const userId = request.headers.get('x-user-id');
    
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

    // Only get products for this user
    const [rows] = await connection.execute(
      'SELECT * FROM products WHERE user_id = ? ORDER BY name',
      [userId]
    );
    
    await connection.end();
    return NextResponse.json(rows || []);
    
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, sku, category, price, current_stock, reorder_threshold, description } = body;
    
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
      [name, sku, category, price, current_stock || 0, reorder_threshold || 10, description || null, userId]
    );
    
    await connection.end();
    
    return NextResponse.json({ 
      success: true, 
      id: result.insertId
    }, { status: 201 });
    
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

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