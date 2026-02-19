// app/components/TopBar.js
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'

export default function TopBar({ title }) {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleLogout = async () => {
    await logout()
  }

  const getInitials = (username) => {
    return username ? username.charAt(0).toUpperCase() : 'U'
  }

  return (
    <div className="top-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div className="mobile-logo">
          <Logo showText={false} />
        </div>
        <h2 className="page-title">{title}</h2>
      </div>
      <div className="user-menu">
        <span>👋 Welcome, {user?.username || 'User'}!</span>
        <div className="user-avatar" title={user?.email}>
          {getInitials(user?.username)}
        </div>
        <button onClick={() => setShowConfirm(true)} className="logout-btn">
          <span className="logout-icon">🚪</span>
          Logout
        </button>
      </div>

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginBottom: '15px', color: 'var(--gray-800)' }}>Confirm Logout</h3>
            <p style={{ marginBottom: '20px', color: 'var(--gray-600)' }}>
              Are you sure you want to logout?
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowConfirm(false)}
                style={{
                  padding: '10px 20px',
                  background: 'var(--gray-200)',
                  color: 'var(--gray-700)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleLogout}
                style={{
                  padding: '10px 20px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}