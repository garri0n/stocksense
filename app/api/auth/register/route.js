// app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(request) {
  try {
    const { username, email, password, dateOfBirth } = await request.json();

    console.log('📝 Registration attempt:', { username, email });

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json({
        success: false,
        message: 'All fields are required'
      }, { status: 400 });
    }

    // Connect to TiDB
    const connection = await mysql.createConnection({
      host: process.env.TIDB_HOST,
      user: '2doub9SDN1b3FY2.root',
      password: process.env.TIDB_PASSWORD,
      database: process.env.TIDB_DATABASE || 'stocksense_ai',
      port: 4000,
      ssl: { rejectUnauthorized: false }
    });

    // Check which user table exists
    const [tables] = await connection.execute("SHOW TABLES LIKE 'users'");
    const [userTable] = await connection.execute("SHOW TABLES LIKE 'user'");
    
    let tableName = 'users';
    if (tables.length === 0 && userTable.length > 0) {
      tableName = 'user';
    }

    console.log(`📊 Using table: ${tableName}`);

    // Check if date_of_birth column exists
    const [columns] = await connection.execute(`SHOW COLUMNS FROM ${tableName} LIKE 'date_of_birth'`);
    const hasDateOfBirth = columns.length > 0;

    // Check if username or email exists
    const [existing] = await connection.execute(
      `SELECT username, email FROM ${tableName} WHERE username = ? OR email = ?`,
      [username, email]
    );

    if (existing.length > 0) {
      await connection.end();
      return NextResponse.json({
        success: false,
        message: 'Username or email already exists'
      }, { status: 400 });
    }

    // Insert new user - with or without date_of_birth
    let result;
    if (hasDateOfBirth && dateOfBirth) {
      [result] = await connection.execute(
        `INSERT INTO ${tableName} (username, email, password, date_of_birth) VALUES (?, ?, ?, ?)`,
        [username, email, password, dateOfBirth]
      );
    } else {
      [result] = await connection.execute(
        `INSERT INTO ${tableName} (username, email, password) VALUES (?, ?, ?)`,
        [username, email, password]
      );
    }

    console.log('✅ User inserted with ID:', result.insertId);
    await connection.end();

    return NextResponse.json({
      success: true,
      message: 'Registration successful!'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Registration error:', error);
    return NextResponse.json({
      success: false,
      message: 'Registration failed: ' + error.message
    }, { status: 500 });
  }
}