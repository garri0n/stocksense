// app/page.js
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from './components/Logo'
import { useAuth } from './context/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDemo, setShowDemo] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await login(formData.username, formData.password)
    
    if (result.success) {
      router.push('/dashboard')
    } else {
      setError(result.error || 'Login failed')
    }
    
    setLoading(false)
  }

  const fillDemoCredentials = () => {
    setFormData({
      username: 'bro',
      password: 'password123'
    })
    setShowDemo(false)
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
        
        {showDemo && (
          <div style={{
            padding: '15px',
            background: '#e0f2fe',
            color: '#0369a1',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            <p style={{ marginBottom: '10px', fontWeight: '600' }}>Demo Credentials:</p>
            <p>Username: bro</p>
            <p>Password: password123</p>
            <button
              onClick={fillDemoCredentials}
              style={{
                marginTop: '10px',
                padding: '8px 16px',
                background: '#0284c7',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Use Demo Account
            </button>
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
          
          <div style={{ textAlign: 'center', marginBottom: '15px' }}>
            <button
              type="button"
              onClick={() => setShowDemo(!showDemo)}
              style={{
                background: 'none',
                border: 'none',
                color: '#667eea',
                fontSize: '14px',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {showDemo ? 'Hide' : 'Show'} Demo Credentials
            </button>
          </div>
          
          <div className="login-footer">
            Don't have an account yet?{' '}
            <Link href="/register">Register</Link>
          </div>
        </form>
      </div>
    </div>
  )
}