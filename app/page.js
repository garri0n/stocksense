// app/page.js (Login Page)
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    router.push('/dashboard')
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome to StockSense AI</h1>
          <p>Login to your account</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              placeholder="Enter Username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="Enter Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            <div className="forgot-password">
              <Link href="/forgot-password">Forgot your password?</Link>
            </div>
          </div>
          
          <button type="submit" className="login-btn">
            LOGIN
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