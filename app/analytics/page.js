// app/analytics/page.js
'use client'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'

export default function AnalyticsPage() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar title="Analytics Dashboard" />
        
        <div className="analytics-grid">
          <div className="analytics-chart">
            <h3 className="table-title" style={{ marginBottom: '20px' }}>Inventory Overview</h3>
            <div style={{ 
              height: '300px', 
              background: 'linear-gradient(45deg, #667eea15, #764ba215)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#667eea'
            }}>
              📊 Interactive Chart Coming Soon
            </div>
          </div>
          
          <div className="stat-card">
            <h3 className="table-title" style={{ marginBottom: '15px' }}>Top Categories</h3>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Electronics</span>
                <span style={{ fontWeight: '600' }}>45%</span>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px' }}>
                <div style={{ width: '45%', height: '100%', background: '#667eea', borderRadius: '4px' }}></div>
              </div>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Accessories</span>
                <span style={{ fontWeight: '600' }}>30%</span>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px' }}>
                <div style={{ width: '30%', height: '100%', background: '#764ba2', borderRadius: '4px' }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Components</span>
                <span style={{ fontWeight: '600' }}>25%</span>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px' }}>
                <div style={{ width: '25%', height: '100%', background: '#f59e0b', borderRadius: '4px' }}></div>
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <h3 className="table-title" style={{ marginBottom: '15px' }}>Stock Health</h3>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '48px', fontWeight: '700', color: '#22c55e' }}>94%</div>
              <div style={{ color: '#64748b' }}>Overall Stock Health</div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Optimal Stock</span>
                <span style={{ color: '#22c55e' }}>324 items</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Low Stock</span>
                <span style={{ color: '#f59e0b' }}>23 items</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Out of Stock</span>
                <span style={{ color: '#ef4444' }}>8 items</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}