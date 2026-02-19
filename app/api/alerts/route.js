// app/api/alerts/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [alerts] = await pool.query(`
      SELECT a.*, p.name as product_name 
      FROM alerts a
      JOIN products p ON a.product_id = p.id
      WHERE a.status = 'active'
      ORDER BY a.created_at DESC
    `);
    
    return NextResponse.json(alerts);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { product_id, type, message } = await request.json();
    
    const [result] = await pool.query(
      'INSERT INTO alerts (product_id, type, message, status) VALUES (?, ?, ?, "active")',
      [product_id, type, message]
    );
    
    return NextResponse.json({ id: result.insertId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    await pool.query(
      'UPDATE alerts SET status = "resolved", resolved_at = NOW() WHERE id = ?',
      [id]
    );
    
    return NextResponse.json({ message: 'Alert resolved' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}