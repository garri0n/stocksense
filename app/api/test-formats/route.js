// app/api/test-formats/route.js
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
  const password = process.env.TIDB_PASSWORD;
  const results = [];

  // Try different username formats
  const formats = [
    "'2doub9SDN1b3FY2.root'",     // With single quotes (your current format)
    "2doub9SDN1b3FY2.root",        // Without quotes
    "2doub9SDN1b3FY2",             // Without .root
    "'2doub9SDN1b3FY2.root'@'%'", // With host
  ];

  for (const format of formats) {
    try {
      console.log(`Trying format: ${format}`);
      const connection = await mysql.createConnection({
        host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
        user: format,
        password: password,
        port: 4000,
        ssl: { rejectUnauthorized: false },
        connectTimeout: 5000
      });
      
      await connection.end();
      results.push({ format, success: true });
    } catch (e) {
      results.push({ 
        format, 
        success: false, 
        error: e.message 
      });
    }
  }

  return NextResponse.json({ results, note: "Make sure password is correct in Render env" });
}