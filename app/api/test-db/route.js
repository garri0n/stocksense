// app/test-db/page.js
'use client'
import { useState, useEffect } from 'react'

export default function TestDB() {
  const [status, setStatus] = useState('Testing connection...')
  const [details, setDetails] = useState(null)

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      const response = await fetch('/api/test-db')
      const data = await response.json()
      
      if (data.success) {
        setStatus('✅ Database connected successfully!')
        setDetails(data)
      } else {
        setStatus('❌ Database connection failed')
        setDetails(data)
      }
    } catch (error) {
      setStatus('❌ Error connecting to database')
      setDetails({ error: error.message })
    }
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px' }}>Database Connection Test</h1>
      <div style={{ 
        padding: '20px', 
        background: status.includes('✅') ? '#d4edda' : '#f8d7da',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <strong>{status}</strong>
      </div>
      
      {details && (
        <pre style={{
          background: '#f4f4f4',
          padding: '20px',
          borderRadius: '8px',
          overflow: 'auto'
        }}>
          {JSON.stringify(details, null, 2)}
        </pre>
      )}

      <div style={{ marginTop: '30px' }}>
        <h2>Troubleshooting Steps:</h2>
        <ol style={{ marginTop: '10px', lineHeight: '1.8' }}>
          <li>Make sure XAMPP is running with MySQL started</li>
          <li>Check if database 'stocksense_ai' exists in phpMyAdmin</li>
          <li>Verify the users table has the test accounts</li>
          <li>Try logging in with: username 'bro', password 'password123'</li>
        </ol>
      </div>
    </div>
  )
}