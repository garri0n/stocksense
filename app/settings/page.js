// app/settings/page.js
'use client'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'

export default function SettingsPage() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar title="Settings" />
        
        <div className="settings-grid">
          <div className="settings-card">
            <h3>User Profile</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '24px'
              }}>
                B
              </div>
              <div>
                <h4 style={{ marginBottom: '5px' }}>Bro User</h4>
                <p style={{ color: '#64748b' }}>bro@stocksense.ai</p>
              </div>
            </div>
            <button style={{ 
              padding: '10px 20px', 
              background: '#667eea', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px',
              cursor: 'pointer'
            }}>
              Edit Profile
            </button>
          </div>

          <div className="settings-card">
            <h3>Security</h3>
            <div className="setting-item">
              <span className="setting-label">Two-Factor Authentication</span>
              <label className="switch">
                <input type="checkbox" />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <span className="setting-label">Login Notifications</span>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <span className="setting-label">Session Timeout</span>
              <select style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>2 hours</option>
              </select>
            </div>
          </div>

          <div className="settings-card">
            <h3>Notifications</h3>
            <div className="setting-item">
              <span className="setting-label">Low Stock Alerts</span>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <span className="setting-label">Price Change Alerts</span>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <span className="setting-label">Weekly Reports</span>
              <label className="switch">
                <input type="checkbox" />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          <div className="settings-card" style={{ gridColumn: 'span 2' }}>
            <h3>AI Threshold Settings</h3>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', color: '#475569' }}>
                Low Stock Threshold (%)
              </label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                defaultValue="20"
                style={{ width: '100%', marginBottom: '10px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Current: 20%</span>
                <span style={{ color: '#667eea', fontWeight: '600' }}>Recommended: 15-25%</span>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: '#475569' }}>
                Auto-Reorder Threshold
              </label>
              <select style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <option>When stock reaches 15%</option>
                <option>When stock reaches 20%</option>
                <option>When stock reaches 25%</option>
                <option>Manual reorder only</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}