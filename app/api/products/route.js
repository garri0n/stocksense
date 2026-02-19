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
    const { name, sku, category, price, current_stock, reorder_threshold } = body;
    
    const [result] = await pool.query(
      'INSERT INTO products (name, sku, category, price, current_stock, reorder_threshold) VALUES (?, ?, ?, ?, ?, ?)',
      [name, sku, category, price, current_stock || 0, reorder_threshold || 10]
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