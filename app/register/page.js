// app/register/page.js
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '../components/Logo'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  const validateForm = () => {
    const errors = {}
    
    if (!formData.username || formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters'
    }
    
    if (!formData.email || !formData.email.includes('@')) {
      errors.email = 'Valid email is required'
    }
    
    if (!formData.password || formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
    
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setFieldErrors({})

    // Validate form
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          dateOfBirth: formData.dateOfBirth || null
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Registration successful! Redirecting to login...')
        setTimeout(() => {
          router.push('/')
        }, 2000)
      } else {
        setError(data.message || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear field error when user starts typing
    if (fieldErrors[e.target.name]) {
      setFieldErrors({
        ...fieldErrors,
        [e.target.name]: null
      })
    }
  }

  return (
    <div className="login-container">
      <div className="login-card" style={{ maxWidth: '450px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <Logo />
        </div>
        
        <div className="login-header">
          <h1>Create Account</h1>
          <p>Join StockSense AI today</p>
        </div>
        
        {error && (
          <div style={{
            padding: '12px',
            background: '#fef2f2',
            color: '#ef4444',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            textAlign: 'center',
            border: '1px solid #fee2e2'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            padding: '12px',
            background: '#f0fdf4',
            color: '#22c55e',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            textAlign: 'center',
            border: '1px solid #bbf7d0'
          }}>
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username *</label>
            <input 
              type="text"
              name="username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              className={fieldErrors.username ? 'error' : ''}
              style={{
                borderColor: fieldErrors.username ? '#ef4444' : undefined
              }}
            />
            {fieldErrors.username && (
              <small style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                {fieldErrors.username}
              </small>
            )}
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input 
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className={fieldErrors.email ? 'error' : ''}
              style={{
                borderColor: fieldErrors.email ? '#ef4444' : undefined
              }}
            />
            {fieldErrors.email && (
              <small style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                {fieldErrors.email}
              </small>
            )}
          </div>
          
          <div className="form-group">
            <label>Password *</label>
            <input 
              type="password"
              name="password"
              placeholder="Create password (min. 6 characters)"
              value={formData.password}
              onChange={handleChange}
              className={fieldErrors.password ? 'error' : ''}
              style={{
                borderColor: fieldErrors.password ? '#ef4444' : undefined
              }}
            />
            {fieldErrors.password && (
              <small style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                {fieldErrors.password}
              </small>
            )}
          </div>
          
          <div className="form-group">
            <label>Confirm Password *</label>
            <input 
              type="password"
              name="confirmPassword"
              placeholder="Re-type password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={fieldErrors.confirmPassword ? 'error' : ''}
              style={{
                borderColor: fieldErrors.confirmPassword ? '#ef4444' : undefined
              }}
            />
            {fieldErrors.confirmPassword && (
              <small style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                {fieldErrors.confirmPassword}
              </small>
            )}
          </div>
          
          <div className="form-group">
            <label>Date of Birth (Optional)</label>
            <input 
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
            />
          </div>

          <div style={{
            fontSize: '12px',
            color: 'var(--gray-500)',
            marginBottom: '20px',
            padding: '10px',
            background: 'var(--gray-50)',
            borderRadius: '8px',
            border: '1px solid var(--gray-200)'
          }}>
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </div>
          
          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
            style={{ 
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Creating Account...' : 'CREATE ACCOUNT'}
          </button>
          
          <div className="login-footer">
            Already have an account?{' '}
            <Link href="/">Login</Link>
          </div>
        </form>
      </div>
    </div>
  )
}