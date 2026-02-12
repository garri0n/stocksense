// app/register/page.js
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    dob: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    router.push('/login')
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome to StockSense AI</h1>
          <p>Create your account</p>
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
            <label>Create Password</label>
            <input 
              type="password" 
              placeholder="Create Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Re-Type Password</label>
            <input 
              type="password" 
              placeholder="Re-Type Password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Date of Birth</label>
            <input 
              type="date" 
              value={formData.dob}
              onChange={(e) => setFormData({...formData, dob: e.target.value})}
            />
          </div>
          
          <button type="submit" className="login-btn">
            Create Account
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