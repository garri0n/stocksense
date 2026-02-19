// app/dashboard/page.js
'use client'
import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import ProtectedRoute from '../components/ProtectedRoute'
import { useAuth } from '../context/AuthContext'

function DashboardContent() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    totalValue: 0,
    activeOrders: 0,
    recentItems: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats')
      }
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Safe username display
  const displayName = user?.username || 'Bro'

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="main-content">
          <TopBar title={`${displayName}'s Dashboard`} />
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="main-content">
          <TopBar title={`${displayName}'s Dashboard`} />
          <div style={{
            padding: '20px',
            background: '#fef2f2',
            color: '#991b1b',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            Error loading dashboard: {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar title={`${displayName}'s Dashboard`} />
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-title">Total Products</div>
            <div className="stat-value">{stats.totalProducts || 0}</div>
            <div className="stat-change">↑ 12% from last month</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Low Stock Items</div>
            <div className="stat-value">{stats.lowStock || 0}</div>
            <div className="stat-change">↑ 5% from last week</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Total Value</div>
            <div className="stat-value">${(stats.totalValue || 0).toLocaleString()}</div>
            <div className="stat-change">↑ 8% from last month</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Active Orders</div>
            <div className="stat-value">{stats.activeOrders || 0}</div>
            <div className="stat-change">↓ 3% from yesterday</div>
          </div>
        </div>

        <div className="inventory-table">
          <div className="table-header">
            <h3 className="table-title">Recent Inventory Updates</h3>
            <a href="/inventory" className="view-btn">View All →</a>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentItems && stats.recentItems.length > 0 ? (
                stats.recentItems.map(item => (
                  <tr key={item.id}>
                    <td>{item.name || 'Unknown'}</td>
                    <td>{item.sku || 'N/A'}</td>
                    <td>{item.category || 'N/A'}</td>
                    <td>{item.current_stock || 0}</td>
                    <td>${item.price || 0}</td>
                    <td>
                      <span className={`status-badge ${(item.current_stock || 0) < (item.reorder_threshold || 0) ? 'status-low' : 'status-ok'}`}>
                        {(item.current_stock || 0) < (item.reorder_threshold || 0) ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                    No inventory data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}