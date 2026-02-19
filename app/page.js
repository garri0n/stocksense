// app/page.js (Login Page)
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from './components/Logo'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user))
        router.push('/dashboard')
      } else {
        setError(data.message || 'Invalid credentials')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <Logo />
        </div>
        <div className="login-header">
          <h1>Welcome Back!</h1>
          <p>Login to your account</p>
        </div>
        
        {error && (
          <div style={{
            padding: '10px',
            background: '#fef2f2',
            color: '#ef4444',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              placeholder="Enter Username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="Enter Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
            <div className="forgot-password">
              <Link href="/forgot-password">Forgot your password?</Link>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Logging in...' : 'LOGIN'}
          </button>
          
          <div className="login-footer">
            Don't have an account yet?{' '}
            <Link href="/register">Register</Link>
          </div>
        </form>
      </div>
    </div>
  )
}