'use client'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'

export default function InsightsPage() {
  const insights = [
    { id: 1, title: 'Low Stock Alert', description: 'Laptop Pro X is running low on stock', type: 'warning', icon: '⚠️' },
    { id: 2, title: 'Sales Trend', description: 'Electronics sales increased by 23% this week', type: 'success', icon: '📈' },
    { id: 3, title: 'Reorder Recommendation', description: 'Consider reordering Mechanical Keyboards', type: 'info', icon: '🔄' },
    { id: 4, title: 'Cost Optimization', description: 'Bulk purchase of USB-C Hubs could save 15%', type: 'info', icon: '💰' },
    { id: 5, title: 'Seasonal Trend', description: 'Monitor sales expected to rise next month', type: 'trend', icon: '🎯' },
  ]

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar title="AI Insights Overview" />
        
        <div className="stats-grid">
          <div className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ fontSize: '32px' }}>🤖</div>
              <div>
                <div className="stat-title">AI Recommendations</div>
                <div className="stat-value">12</div>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ fontSize: '32px' }}>⚠️⚠️⚠️</div>
              <div>
                <div className="stat-title">Critical Alerts</div>
                <div className="stat-value">3</div>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ fontSize: '32px' }}>📊</div>
              <div>
                <div className="stat-title">Predictions</div>
                <div className="stat-value">8</div>
              </div>
            </div>
          </div>
        </div>

        <div className="inventory-table">
          <div className="table-header">
            <h3 className="table-title">AI Generated Insights</h3>
            <span className="view-btn">Last updated: 2 min ago</span>
          </div>
          
          <ul className="insights-list">
            {insights.map(insight => (
              <li key={insight.id} className="insight-item">
                <div className="insight-icon">{insight.icon}</div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ marginBottom: '5px', color: '#1e293b' }}>{insight.title}</h4>
                  <p style={{ color: '#64748b', fontSize: '14px' }}>{insight.description}</p>
                </div>
                <button style={{ 
                  padding: '8px 16px', 
                  background: '#667eea', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}>
                  Apply
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="ai-threshold" style={{ marginTop: '20px' }}>
          <h4 style={{ color: 'white', marginBottom: '10px' }}>AI Threshold Settings</h4>
          <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '15px' }}>
            Current AI confidence level: 94%
          </p>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.3)', borderRadius: '4px' }}>
            <div style={{ width: '94%', height: '100%', background: 'white', borderRadius: '4px' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}