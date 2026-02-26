// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    console.log('🔍 Login attempt for:', username);

    // Test database connection first
    try {
      await pool.query('SELECT 1');
      console.log('✅ Database connection OK');
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError);
      return NextResponse.json({
        success: false,
        message: 'Database connection error. Please check configuration.'
      }, { status: 500 });
    }

    // Check if users table exists
    try {
      const [tables] = await pool.query("SHOW TABLES LIKE 'users'");
      if (tables.length === 0) {
        console.log('📊 Users table does not exist, creating it...');
        await pool.query(`
          CREATE TABLE IF NOT EXISTS users (
            id INT PRIMARY KEY AUTO_INCREMENT,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            date_of_birth DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        // Insert demo user
        await pool.query(
          'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
          ['bro', 'bro@stocksense.ai', 'password123']
        );
        console.log('✅ Created users table and demo user');
      }
    } catch (tableError) {
      console.error('Error checking/creating table:', tableError);
    }

    // Query the database
    const [users] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    console.log(`📊 Found ${users.length} users`);

    if (!users || users.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Invalid username or password'
      }, { status: 401 });
    }

    const user = users[0];

    // Check password
    if (user.password !== password) {
      return NextResponse.json({
        success: false,
        message: 'Invalid username or password'
      }, { status: 401 });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('❌ Login error details:', error);
    
    return NextResponse.json({
      success: false,
      message: `Database error: ${error.message}`
    }, { status: 500 });
  }
}