// app/api/products/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY name');
    return NextResponse.json(rows || []);
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, sku, category, price, current_stock, reorder_threshold, description } = body;
    
    // Price is now in PHP, no conversion needed
    const [result] = await pool.query(
      'INSERT INTO products (name, sku, category, price, current_stock, reorder_threshold, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, sku, category, price, current_stock || 0, reorder_threshold || 10, description || null]
    );
    
    return NextResponse.json({ 
      success: true, 
      id: result.insertId, 
      ...body 
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
    const body = await request.json();
    const { id, name, sku, category, price, current_stock, reorder_threshold, description } = body;
    
    await pool.query(
      'UPDATE products SET name = ?, sku = ?, category = ?, price = ?, current_stock = ?, reorder_threshold = ?, description = ? WHERE id = ?',
      [name, sku, category, price, current_stock, reorder_threshold, description, id]
    );
    
    return NextResponse.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    
    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Product deletion error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}