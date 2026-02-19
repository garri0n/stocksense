// app/test-db/page.js
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function TestDBPage() {
  const [status, setStatus] = useState('Testing connection...')
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      const response = await fetch('/api/test-db')
      const result = await response.json()
      
      if (result.success) {
        setStatus('✅ Database connected successfully!')
        setData(result)
      } else {
        setStatus('❌ Database connection failed')
        setError(result.error)
      }
    } catch (err) {
      setStatus('❌ Error connecting to database')
      setError(err.message)
    }
  }

  const runSetup = async () => {
    try {
      const response = await fetch('/api/setup-db', { method: 'POST' })
      const result = await response.json()
      alert(result.message)
      testConnection() // Refresh status
    } catch (err) {
      alert('Error setting up database: ' + err.message)
    }
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px' }}>Database Connection Test</h1>
      
      <div style={{ 
        padding: '20px', 
        background: status.includes('✅') ? '#d4edda' : '#f8d7da',
        borderRadius: '8px',
        marginBottom: '20px',
        border: status.includes('✅') ? '1px solid #c3e6cb' : '1px solid #f5c6cb'
      }}>
        <strong>{status}</strong>
      </div>

      {error && (
        <div style={{
          padding: '15px',
          background: '#fff3cd',
          border: '1px solid #ffeeba',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <strong>Error Details:</strong>
          <pre style={{ marginTop: '10px', whiteSpace: 'pre-wrap' }}>{error}</pre>
        </div>
      )}

      {data && (
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3>Database Stats:</h3>
          <ul style={{ marginTop: '10px', lineHeight: '2' }}>
            <li>📊 Users: {data.stats?.users || 0}</li>
            <li>📦 Products: {data.stats?.totalProducts || 0}</li>
            <li>💰 Total Sales: ₱{data.stats?.totalSales || 0}</li>
          </ul>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <button
          onClick={runSetup}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          🚀 Run Database Setup
        </button>
        
        <Link href="/dashboard">
          <button
            style={{
              padding: '12px 24px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Go to Dashboard
          </button>
        </Link>
      </div>

      <div style={{
        background: '#e9ecef',
        padding: '20px',
        borderRadius: '8px'
      }}>
        <h3>Troubleshooting Steps:</h3>
        <ol style={{ marginTop: '10px', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>Make sure XAMPP is running with MySQL started</li>
          <li>Check if database 'stocksense_ai' exists in phpMyAdmin</li>
          <li>Click "Run Database Setup" to create tables and sample data</li>
          <li>Verify the connection at http://localhost/phpmyadmin</li>
          <li>Check that your .env.local file has correct database credentials</li>
        </ol>
      </div>
    </div>
  )
}