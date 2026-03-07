// app/api/products/route.js
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(request) {
  try {
    // Get user ID from header
    const userId = request.headers.get('x-user-id');
    
    console.log('📦 GET products - User ID from header:', userId);
    
    // Also check if there's a user cookie directly
    const cookieHeader = request.headers.get('cookie');
    console.log('🍪 Cookie header:', cookieHeader);

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

    // Get ALL products first to see what's in DB
    const [allProducts] = await connection.execute('SELECT id, name, user_id FROM products');
    console.log('📊 All products in DB:', allProducts.map(p => ({ id: p.id, name: p.name, user_id: p.user_id })));

    // Get products for this user
    const [userProducts] = await connection.execute(
      'SELECT * FROM products WHERE user_id = ? ORDER BY name',
      [userId]
    );
    
    console.log(`👤 Products for user ${userId}:`, userProducts.length);

    await connection.end();
    
    return NextResponse.json(userProducts || []);
    
  } catch (error) {
    console.error('❌ Products fetch error:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request) {
  try {
    // Get user ID from multiple sources
    const body = await request.json();
    const userId = request.headers.get('x-user-id') || body.userId;
    
    console.log('📝 POST product - User ID from header:', request.headers.get('x-user-id'));
    console.log('📝 POST product - User ID from body:', body.userId);
    console.log('📝 POST product - Final User ID:', userId);

    if (!userId) {
      console.log('❌ No user ID found for product creation');
      return NextResponse.json({ 
        error: 'Unauthorized - No user ID' 
      }, { status: 401 });
    }

    const { name, sku, category, price, current_stock, reorder_threshold, description } = body;
    
    console.log('📦 Product data:', { name, sku, category, price, current_stock, reorder_threshold });

    // Validate required fields
    if (!name || !sku || !price) {
      return NextResponse.json({ 
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

    // Check if user_id column exists
    const [columns] = await connection.execute("SHOW COLUMNS FROM products LIKE 'user_id'");
    
    let result;
    if (columns.length > 0) {
      // User_id column exists, insert with user_id
      [result] = await connection.execute(
        'INSERT INTO products (name, sku, category, price, current_stock, reorder_threshold, description, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [name, sku, category || null, price, current_stock || 0, reorder_threshold || 10, description || null, userId]
      );
    } else {
      // User_id column doesn't exist, insert without user_id (temporary)
      console.log('⚠️ user_id column not found, inserting without user_id');
      [result] = await connection.execute(
        'INSERT INTO products (name, sku, category, price, current_stock, reorder_threshold, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, sku, category || null, price, current_stock || 0, reorder_threshold || 10, description || null]
      );
    }

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

export async function PUT(request) {
  try {
    const body = await request.json();
    const userId = request.headers.get('x-user-id') || body.userId;
    const { id, name, sku, category, price, current_stock, reorder_threshold, description } = body;

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

    // Check if user_id column exists
    const [columns] = await connection.execute("SHOW COLUMNS FROM products LIKE 'user_id'");
    
    let result;
    if (columns.length > 0) {
      [result] = await connection.execute(
        'UPDATE products SET name = ?, sku = ?, category = ?, price = ?, current_stock = ?, reorder_threshold = ?, description = ? WHERE id = ? AND user_id = ?',
        [name, sku, category, price, current_stock, reorder_threshold, description, id, userId]
      );
    } else {
      [result] = await connection.execute(
        'UPDATE products SET name = ?, sku = ?, category = ?, price = ?, current_stock = ?, reorder_threshold = ?, description = ? WHERE id = ?',
        [name, sku, category, price, current_stock, reorder_threshold, description, id]
      );
    }

    await connection.end();

    return NextResponse.json({ 
      success: true,
      affectedRows: result.affectedRows
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

    // Check if user_id column exists
    const [columns] = await connection.execute("SHOW COLUMNS FROM products LIKE 'user_id'");
    
    let result;
    if (columns.length > 0) {
      [result] = await connection.execute(
        'DELETE FROM products WHERE id = ? AND user_id = ?',
        [id, userId]
      );
    } else {
      [result] = await connection.execute(
        'DELETE FROM products WHERE id = ?',
        [id]
      );
    }

    await connection.end();

    return NextResponse.json({ 
      success: true,
      affectedRows: result.affectedRows
    });

  } catch (error) {
    console.error('❌ Product deletion error:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}