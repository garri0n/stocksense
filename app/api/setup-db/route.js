// app/api/setup-db/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST() {
  try {
    // Create tables
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

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        sku VARCHAR(50) UNIQUE NOT NULL,
        category VARCHAR(50),
        price DECIMAL(10,2),
        current_stock INT DEFAULT 0,
        reorder_threshold INT DEFAULT 10,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id INT PRIMARY KEY AUTO_INCREMENT,
        product_id INT,
        quantity INT NOT NULL,
        unit_price DECIMAL(10,2),
        total_amount DECIMAL(10,2),
        sale_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    // Insert sample users
    await pool.query(`
      INSERT IGNORE INTO users (username, email, password, date_of_birth) VALUES
      ('bro', 'bro@stocksense.ai', 'password123', '1990-01-01'),
      ('admin', 'admin@stocksense.ai', 'admin123', '1985-05-15')
    `);

    // Insert sample products
    await pool.query(`
      INSERT IGNORE INTO products (name, sku, category, price, current_stock, reorder_threshold) VALUES
      ('Laptop Pro X', 'LPX-001', 'Electronics', 1299.99, 45, 50),
      ('Wireless Mouse', 'WM-002', 'Accessories', 29.99, 120, 30),
      ('Mechanical Keyboard', 'MK-003', 'Accessories', 149.99, 28, 25),
      ('4K Monitor', '4KM-004', 'Electronics', 449.99, 15, 20),
      ('USB-C Hub', 'USB-005', 'Accessories', 59.99, 85, 40)
    `);

    // Insert sample sales
    await pool.query(`
      INSERT INTO sales (product_id, quantity, unit_price, total_amount, sale_date)
      SELECT id, 5, price, price * 5, DATE_SUB(CURDATE(), INTERVAL 1 DAY)
      FROM products WHERE name = 'Laptop Pro X'
    `);

    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully!'
    });

  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}