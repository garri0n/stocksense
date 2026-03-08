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
    recentItems: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      const data = await response.json()
      console.log('Dashboard stats:', data)
      setStats(data)
    } catch (error) {
      console.error('Error:', error)
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
                    <td>{item.name}</td>
                    <td>{item.sku}</td>
                    <td>{item.category}</td>
                    <td>{item.current_stock}</td>
                    <td>{formatPrice(item.price)}</td>
                    <td>
                      <span className={`status-badge ${item.current_stock < item.reorder_threshold ? 'status-low' : 'status-ok'}`}>
                        {item.current_stock < item.reorder_threshold ? 'Low Stock' : 'In Stock'}
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