// app/components/TopBar.js (Enhanced version with confirmation)
'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function TopBar({ title }) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleLogout = () => {
    // Clear any authentication state
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    sessionStorage.clear()
    // Redirect to login page
    router.push('/')
  }

  return (
    <div className="top-bar">
      <h2 className="page-title">{title}</h2>
      <div className="user-menu">
        <span>👋 Welcome, Bro!</span>
        <div className="user-avatar">B</div>
        <button 
          onClick={() => setShowConfirm(true)} 
          className="logout-btn"
        >
          <span className="logout-icon">🚪</span>
          Logout
        </button>
      </div>

      {/* Logout Confirmation Modal */}
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