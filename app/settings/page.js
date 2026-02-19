// app/settings/page.js
'use client'
import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import { useAuth } from '../context/AuthContext'

export default function SettingsPage() {
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Profile settings
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    fullName: '',
    company: '',
    phone: '',
    timezone: 'America/New_York'
  })

  // Security settings
  const [security, setSecurity] = useState({
    twoFactor: false,
    loginNotifications: true,
    sessionTimeout: '30',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Notification settings
  const [notifications, setNotifications] = useState({
    lowStockAlerts: true,
    priceChangeAlerts: true,
    weeklyReports: false,
    monthlyReports: true,
    emailNotifications: true,
    smsNotifications: false
  })

  // AI Threshold settings
  const [aiSettings, setAiSettings] = useState({
    lowStockThreshold: 20,
    autoReorder: '15',
    aiConfidence: 85,
    predictiveAnalytics: true,
    autoSuggestions: true
  })

  // Appearance settings
  const [appearance, setAppearance] = useState({
    theme: 'light',
    compactView: false,
    showAnimations: true
  })

  useEffect(() => {
    // Load user data
    if (user) {
      setProfile({
        username: user.username || '',
        email: user.email || '',
        fullName: user.fullName || '',
        company: user.company || '',
        phone: user.phone || '',
        timezone: user.timezone || 'America/New_York'
      })
    }

    // Load settings from localStorage
    const savedSecurity = localStorage.getItem('securitySettings')
    const savedNotifications = localStorage.getItem('notificationSettings')
    const savedAiSettings = localStorage.getItem('aiSettings')
    const savedAppearance = localStorage.getItem('appearanceSettings')

    if (savedSecurity) setSecurity(prev => ({ ...prev, ...JSON.parse(savedSecurity) }))
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications))
    if (savedAiSettings) setAiSettings(JSON.parse(savedAiSettings))
    if (savedAppearance) setAppearance(JSON.parse(savedAppearance))
  }, [user])

  const saveSettings = (type, settings) => {
    localStorage.setItem(type, JSON.stringify(settings))
    setMessage({ type: 'success', text: 'Settings saved successfully!' })
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const handleProfileSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      if (user) {
        const updatedUser = { ...user, ...profile }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        if (updateUser) updateUser(updatedUser)
      }
      saveSettings('profileSettings', profile)
      setLoading(false)
    }, 1000)
  }

  const handleSecuritySubmit = (e) => {
    e.preventDefault()
    if (security.newPassword && security.newPassword !== security.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match!' })
      return
    }
    if (security.newPassword && security.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters!' })
      return
    }
    
    setLoading(true)
    setTimeout(() => {
      saveSettings('securitySettings', security)
      setSecurity({
        ...security,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setLoading(false)
    }, 1000)
  }

  const handleNotificationChange = (key) => {
    const updated = { ...notifications, [key]: !notifications[key] }
    setNotifications(updated)
    saveSettings('notificationSettings', updated)
  }

  const handleAiThresholdChange = (value) => {
    const updated = { ...aiSettings, lowStockThreshold: value }
    setAiSettings(updated)
    saveSettings('aiSettings', updated)
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'ai', name: 'AI Thresholds', icon: '🤖' },
    { id: 'appearance', name: 'Appearance', icon: '🎨' }
  ]

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar title="Settings" />

        {/* Settings Header */}
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '12px 24px',
                  background: activeTab === tab.id ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                  color: activeTab === tab.id ? 'white' : 'var(--gray-600)',
                  border: activeTab === tab.id ? 'none' : '1px solid var(--gray-200)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <span>{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div style={{
            padding: '15px',
            background: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
            borderRadius: '8px',
            marginBottom: '20px',
            border: message.type === 'success' ? '1px solid #c3e6cb' : '1px solid #f5c6cb'
          }}>
            {message.text}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="settings-grid">
            <div className="settings-card">
              <h3>Profile Information</h3>
              <form onSubmit={handleProfileSubmit}>
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    value={profile.username}
                    onChange={(e) => setProfile({...profile, username: e.target.value})}
                    disabled
                    style={{ background: '#f1f5f9' }}
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Company</label>
                  <input
                    type="text"
                    value={profile.company}
                    onChange={(e) => setProfile({...profile, company: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Timezone</label>
                  <select
                    value={profile.timezone}
                    onChange={(e) => setProfile({...profile, timezone: e.target.value})}
                  >
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '12px 24px',
                    background: loading ? '#94a3b8' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    width: '100%',
                    fontSize: '16px'
                  }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>

            <div className="settings-card">
              <h3>Profile Summary</h3>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '50%',
                  margin: '0 auto 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '40px',
                  fontWeight: '600'
                }}>
                  {profile.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <h4 style={{ marginBottom: '5px' }}>{profile.fullName || profile.username}</h4>
                <p style={{ color: '#64748b', marginBottom: '5px' }}>{profile.email}</p>
                <p style={{ color: '#64748b' }}>{profile.company || 'No company set'}</p>
              </div>
              <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '20px' }}>
                <div className="setting-item">
                  <span className="setting-label">Member since</span>
                  <span style={{ fontWeight: '500' }}>January 2025</span>
                </div>
                <div className="setting-item">
                  <span className="setting-label">Last login</span>
                  <span style={{ fontWeight: '500' }}>{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="settings-grid">
            <div className="settings-card">
              <h3>Security Settings</h3>
              <form onSubmit={handleSecuritySubmit}>
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={security.currentPassword}
                    onChange={(e) => setSecurity({...security, currentPassword: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={security.newPassword}
                    onChange={(e) => setSecurity({...security, newPassword: e.target.value})}
                    minLength="6"
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={security.confirmPassword}
                    onChange={(e) => setSecurity({...security, confirmPassword: e.target.value})}
                  />
                </div>
                
                <div className="setting-item">
                  <span className="setting-label">Two-Factor Authentication</span>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={security.twoFactor}
                      onChange={(e) => setSecurity({...security, twoFactor: e.target.checked})}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <span className="setting-label">Login Notifications</span>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={security.loginNotifications}
                      onChange={(e) => setSecurity({...security, loginNotifications: e.target.checked})}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <span className="setting-label">Session Timeout (minutes)</span>
                  <select
                    value={security.sessionTimeout}
                    onChange={(e) => setSecurity({...security, sessionTimeout: e.target.value})}
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                    <option value="240">4 hours</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '12px 24px',
                    background: loading ? '#94a3b8' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    width: '100%',
                    marginTop: '20px'
                  }}
                >
                  {loading ? 'Updating...' : 'Update Security Settings'}
                </button>
              </form>
            </div>

            <div className="settings-card">
              <h3>Recent Activity</h3>
              <ul style={{ listStyle: 'none' }}>
                <li className="setting-item">
                  <div>
                    <div style={{ fontWeight: '500' }}>Login from new device</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Chrome on Windows - 2 hours ago</div>
                  </div>
                  <span style={{ color: '#22c55e' }}>✓</span>
                </li>
                <li className="setting-item">
                  <div>
                    <div style={{ fontWeight: '500' }}>Password changed</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>3 days ago</div>
                  </div>
                </li>
                <li className="setting-item">
                  <div>
                    <div style={{ fontWeight: '500' }}>Profile updated</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>1 week ago</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="settings-grid">
            <div className="settings-card">
              <h3>Notification Preferences</h3>
              
              <h4 style={{ margin: '20px 0 10px', color: '#475569' }}>Inventory Alerts</h4>
              <div className="setting-item">
                <span className="setting-label">Low Stock Alerts</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={notifications.lowStockAlerts}
                    onChange={() => handleNotificationChange('lowStockAlerts')}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <span className="setting-label">Price Change Alerts</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={notifications.priceChangeAlerts}
                    onChange={() => handleNotificationChange('priceChangeAlerts')}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <h4 style={{ margin: '20px 0 10px', color: '#475569' }}>Reports</h4>
              <div className="setting-item">
                <span className="setting-label">Weekly Reports</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={notifications.weeklyReports}
                    onChange={() => handleNotificationChange('weeklyReports')}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <span className="setting-label">Monthly Reports</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={notifications.monthlyReports}
                    onChange={() => handleNotificationChange('monthlyReports')}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <h4 style={{ margin: '20px 0 10px', color: '#475569' }}>Delivery Methods</h4>
              <div className="setting-item">
                <span className="setting-label">Email Notifications</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={notifications.emailNotifications}
                    onChange={() => handleNotificationChange('emailNotifications')}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <span className="setting-label">SMS Notifications</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={notifications.smsNotifications}
                    onChange={() => handleNotificationChange('smsNotifications')}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-card">
              <h3>Notification Schedule</h3>
              <div className="form-group">
                <label>Quiet Hours Start</label>
                <input type="time" defaultValue="22:00" />
              </div>
              <div className="form-group">
                <label>Quiet Hours End</label>
                <input type="time" defaultValue="08:00" />
              </div>
              <div className="form-group">
                <label>Notification Digest</label>
                <select>
                  <option>Real-time</option>
                  <option>Hourly digest</option>
                  <option>Daily digest</option>
                  <option>Weekly digest</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* AI Thresholds Tab */}
        {activeTab === 'ai' && (
          <div className="settings-grid">
            <div className="settings-card" style={{ gridColumn: 'span 2' }}>
              <h3>AI Threshold Settings</h3>
              
              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', marginBottom: '10px', color: '#475569', fontWeight: '500' }}>
                  Low Stock Alert Threshold: {aiSettings.lowStockThreshold}%
                </label>
                <input 
                  type="range" 
                  min="5" 
                  max="50" 
                  value={aiSettings.lowStockThreshold}
                  onChange={(e) => handleAiThresholdChange(parseInt(e.target.value))}
                  style={{ width: '100%', marginBottom: '10px' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Conservative (5%)</span>
                  <span style={{ color: '#667eea', fontWeight: '600' }}>
                    Current: {aiSettings.lowStockThreshold}%
                  </span>
                  <span style={{ color: '#64748b' }}>Aggressive (50%)</span>
                </div>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', marginBottom: '10px', color: '#475569', fontWeight: '500' }}>
                  Auto-Reorder Threshold
                </label>
                <select 
                  value={aiSettings.autoReorder}
                  onChange={(e) => setAiSettings({...aiSettings, autoReorder: e.target.value})}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    border: '1px solid var(--gray-200)'
                  }}
                >
                  <option value="10">When stock reaches 10% of threshold</option>
                  <option value="15">When stock reaches 15% of threshold</option>
                  <option value="20">When stock reaches 20% of threshold</option>
                  <option value="25">When stock reaches 25% of threshold</option>
                  <option value="manual">Manual reorder only</option>
                </select>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <div className="setting-item">
                  <span className="setting-label">Predictive Analytics</span>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={aiSettings.predictiveAnalytics}
                      onChange={(e) => setAiSettings({...aiSettings, predictiveAnalytics: e.target.checked})}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <span className="setting-label">AI Auto-Suggestions</span>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={aiSettings.autoSuggestions}
                      onChange={(e) => setAiSettings({...aiSettings, autoSuggestions: e.target.checked})}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '20px',
                borderRadius: '10px',
                color: 'white'
              }}>
                <h4 style={{ marginBottom: '15px', color: 'white' }}>AI Confidence Score</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: '10px', background: 'rgba(255,255,255,0.3)', borderRadius: '5px' }}>
                      <div style={{ 
                        width: `${aiSettings.aiConfidence}%`, 
                        height: '100%', 
                        background: 'white', 
                        borderRadius: '5px' 
                      }}></div>
                    </div>
                  </div>
                  <span style={{ fontSize: '24px', fontWeight: '700' }}>{aiSettings.aiConfidence}%</span>
                </div>
                <p style={{ marginTop: '15px', fontSize: '14px', opacity: '0.9' }}>
                  Based on {aiSettings.lowStockThreshold}% threshold and historical data
                </p>
              </div>

              <button
                onClick={() => saveSettings('aiSettings', aiSettings)}
                style={{
                  marginTop: '20px',
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Save AI Settings
              </button>
            </div>
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <div className="settings-grid">
            <div className="settings-card">
              <h3>Theme Settings</h3>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', color: '#475569' }}>Color Theme</label>
                <div style={{ display: 'flex', gap: '15px' }}>
                  {['light', 'dark', 'system'].map(theme => (
                    <label key={theme} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <input
                        type="radio"
                        name="theme"
                        value={theme}
                        checked={appearance.theme === theme}
                        onChange={(e) => setAppearance({...appearance, theme: e.target.value})}
                      />
                      {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </label>
                  ))}
                </div>
              </div>

              <div className="setting-item">
                <span className="setting-label">Compact View</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={appearance.compactView}
                    onChange={(e) => setAppearance({...appearance, compactView: e.target.checked})}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <span className="setting-label">Show Animations</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={appearance.showAnimations}
                    onChange={(e) => setAppearance({...appearance, showAnimations: e.target.checked})}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <button
                onClick={() => saveSettings('appearanceSettings', appearance)}
                style={{
                  marginTop: '20px',
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Save Appearance
              </button>
            </div>

            <div className="settings-card">
              <h3>Preview</h3>
              <div style={{
                padding: '20px',
                background: appearance.theme === 'dark' ? '#1e293b' : '#f8fafc',
                borderRadius: '10px',
                color: appearance.theme === 'dark' ? 'white' : 'inherit',
                transition: 'all 0.3s'
              }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                  <div style={{ width: '40px', height: '40px', background: '#667eea', borderRadius: '8px' }}></div>
                  <div>
                    <div style={{ fontWeight: '600' }}>Sample Card</div>
                    <div style={{ fontSize: '12px', opacity: '0.8' }}>This is how your theme will look</div>
                  </div>
                </div>
                <div style={{
                  height: '4px',
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '2px'
                }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}