// app/api/products/route.js
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(request) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
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
    return NextResponse.json(rows);
    
  } catch (error) {
    console.error('Products fetch error:', error);
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