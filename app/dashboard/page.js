// app/dashboard/page.js
'use client'
import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import ProtectedRoute from '../components/ProtectedRoute'
import { useAuth } from '../context/AuthContext'
import { formatPrice } from '../../utils/currency'

function DashboardContent() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalItems: 0,
    lowStock: 0,
    totalValue: 0,
    outOfStock: 0,
    recentItems: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      console.log('📡 Fetching dashboard stats...')
      
      const response = await fetch('/api/dashboard/stats')
      const data = await response.json()
      
      console.log('📊 Dashboard stats received:', data)
      
      if (data && typeof data === 'object') {
        setStats({
          totalProducts: data.totalProducts || 0,
          totalItems: data.totalItems || 0,
          lowStock: data.lowStock || 0,
          totalValue: data.totalValue || 0,
          outOfStock: data.outOfStock || 0,
          recentItems: Array.isArray(data.recentItems) ? data.recentItems : []
        })
      } else {
        setError('Invalid data format received')
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="main-content">
          <TopBar title={`${user?.username || 'User'}'s Dashboard`} />
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
          <TopBar title={`${user?.username || 'User'}'s Dashboard`} />
          <div style={{
            padding: '20px',
            background: '#fee',
            color: '#c00',
            borderRadius: '8px',
            margin: '20px'
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
        <TopBar title={`${user?.username || 'User'}'s Dashboard`} />
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-title">Total Products</div>
            <div className="stat-value">{stats.totalProducts}</div>
            <div className="stat-change">Different products</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Total Items in Stock</div>
            <div className="stat-value">{stats.totalItems}</div>
            <div className="stat-change">Across {stats.totalProducts} products</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Low Stock Items</div>
            <div className="stat-value">{stats.lowStock}</div>
            <div className="stat-change">⚠️ Needs attention</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Total Value</div>
            <div className="stat-value">{formatPrice(stats.totalValue)}</div>
            <div className="stat-change">Inventory worth</div>
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
                    <td>{formatPrice(item.price || 0)}</td>
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