// app/forgot-password/page.js
'use client'
import { useState } from 'react'
import Link from 'next/link'
import Logo from '../components/Logo'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Simulate password reset email
    setTimeout(() => {
      setSubmitted(true)
      setLoading(false)
    }, 1500)
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <Logo />
        </div>
        <div className="login-header">
          <h1>Reset Password</h1>
          <p>Enter your email to reset your password</p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <div className="login-footer">
              <Link href="/">Back to Login</Link>
            </div>
          </form>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px'
            }}>
              ✉️
            </div>
            <h3 style={{ marginBottom: '10px', color: 'var(--gray-800)' }}>Check Your Email</h3>
            <p style={{ marginBottom: '20px', color: 'var(--gray-600)' }}>
              We've sent a password reset link to:<br />
              <strong>{email}</strong>
            </p>
            <Link href="/" style={{
              color: '#667eea',
              textDecoration: 'none',
              fontWeight: '600'
            }}>
              Return to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}