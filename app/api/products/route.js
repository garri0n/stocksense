// app/api/products/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY name');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, sku, category, price, current_stock, reorder_threshold } = body;
    
    const [result] = await pool.query(
      'INSERT INTO products (name, sku, category, price, current_stock, reorder_threshold) VALUES (?, ?, ?, ?, ?, ?)',
      [name, sku, category, price, current_stock, reorder_threshold]
    );
    
    return NextResponse.json({ id: result.insertId, ...body }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, sku, category, price, current_stock, reorder_threshold } = body;
    
    await pool.query(
      'UPDATE products SET name = ?, sku = ?, category = ?, price = ?, current_stock = ?, reorder_threshold = ? WHERE id = ?',
      [name, sku, category, price, current_stock, reorder_threshold, id]
    );
    
    return NextResponse.json({ message: 'Product updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}