// app/insights/page.js
'use client'
import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'

export default function InsightsPage() {
  const [products, setProducts] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [aiThreshold, setAiThreshold] = useState(20)
  const [autoReorder, setAutoReorder] = useState('15')
  const [notifications, setNotifications] = useState({
    lowStock: true,
    priceChanges: true,
    weeklyReports: false
  })

  useEffect(() => {
    fetchData()
    // Load settings from localStorage
    const savedThreshold = localStorage.getItem('aiThreshold')
    const savedAutoReorder = localStorage.getItem('autoReorder')
    const savedNotifications = localStorage.getItem('notifications')
    
    if (savedThreshold) setAiThreshold(parseInt(savedThreshold))
    if (savedAutoReorder) setAutoReorder(savedAutoReorder)
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications))
  }, [])

  const fetchData = async () => {
    try {
      const [productsRes, analyticsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/analytics')
      ])
      
      const productsData = await productsRes.json()
      const analyticsData = await analyticsRes.json()
      
      setProducts(productsData)
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // AI Generated Insights based on real data
  const generateInsights = () => {
    const insights = []
    
    if (!products || products.length === 0) {
      return []
    }
    
    // Calculate total inventory value
    const totalValue = products.reduce((sum, p) => sum + (p.current_stock * p.price || 0), 0)
    
    // Low stock alerts
    const lowStockItems = products.filter(p => p.current_stock < p.reorder_threshold)
    lowStockItems.forEach(item => {
      insights.push({
        id: `lowstock-${item.id}`,
        title: 'Low Stock Alert',
        description: `${item.name} (${item.sku}) is running low. Current stock: ${item.current_stock}, Threshold: ${item.reorder_threshold}`,
        type: 'warning',
        icon: '⚠️',
        action: 'View Product',
        priority: 'high',
        link: '/inventory'
      })
    })

    // Out of stock alerts
    const outOfStock = products.filter(p => p.current_stock === 0)
    outOfStock.forEach(item => {
      insights.push({
        id: `outofstock-${item.id}`,
        title: 'Out of Stock',
        description: `${item.name} is out of stock. Consider restocking immediately.`,
        type: 'critical',
        icon: '❌',
        action: 'Restock Now',
        priority: 'critical',
        link: '/inventory'
      })
    })

    // High value inventory alert
    const highValueItems = products.filter(p => (p.current_stock * p.price) > 100000)
    highValueItems.forEach(item => {
      insights.push({
        id: `highvalue-${item.id}`,
        title: 'High Value Inventory',
        description: `${item.name} has inventory worth ${formatPrice(item.current_stock * item.price)}. Consider insurance or security.`,
        type: 'info',
        icon: '💰',
        action: 'Review',
        priority: 'medium',
        link: '/inventory'
      })
    })

    // Stock health insight
    const totalProducts = products.length
    const lowStockCount = lowStockItems.length
    const outOfStockCount = outOfStock.length
    const healthyStock = totalProducts - lowStockCount - outOfStockCount
    const healthPercentage = totalProducts > 0 ? (healthyStock / totalProducts * 100).toFixed(0) : 0
    
    if (healthPercentage < 50) {
      insights.push({
        id: 'health-warning',
        title: 'Stock Health Warning',
        description: `Only ${healthPercentage}% of your inventory is at healthy levels. Consider reordering soon.`,
        type: 'warning',
        icon: '📊',
        action: 'View Analytics',
        priority: 'high',
        link: '/analytics'
      })
    }

    return insights.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  }

  const insights = generateInsights()

  // Calculate AI metrics
  const criticalAlerts = insights.filter(i => i.priority === 'critical').length
  const recommendations = insights.filter(i => i.priority === 'high' || i.priority === 'medium').length
  const predictions = analytics?.lowStock || 0

  const handleApplyInsight = (insight) => {
    if (insight.link) {
      window.location.href = insight.link
    }
  }

  const handleThresholdChange = (value) => {
    setAiThreshold(value)
    localStorage.setItem('aiThreshold', value)
  }

  const handleAutoReorderChange = (value) => {
    setAutoReorder(value)
    localStorage.setItem('autoReorder', value)
  }

  const toggleNotification = (key) => {
    const updated = { ...notifications, [key]: !notifications[key] }
    setNotifications(updated)
    localStorage.setItem('notifications', JSON.stringify(updated))
  }

  const formatPrice = (price) => {
    return `₱${parseFloat(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
  }

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="main-content">
          <TopBar title="AI Insights Overview" />
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
        <TopBar title="AI Insights Overview" />
        
        {/* AI Metrics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ fontSize: '32px' }}>🤖</div>
              <div>
                <div className="stat-title">AI Recommendations</div>
                <div className="stat-value">{recommendations}</div>
                <div className="stat-change">Based on current inventory</div>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ fontSize: '32px' }}>⚠️</div>
              <div>
                <div className="stat-title">Critical Alerts</div>
                <div className="stat-value">{criticalAlerts}</div>
                <div className="stat-change" style={{ color: '#ef4444' }}>Immediate action needed</div>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ fontSize: '32px' }}>📊</div>
              <div>
                <div className="stat-title">Low Stock Items</div>
                <div className="stat-value">{analytics?.lowStock || 0}</div>
                <div className="stat-change">Need reordering</div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Generated Insights */}
        <div className="inventory-table">
          <div className="table-header">
            <h3 className="table-title">AI Generated Insights</h3>
            <span className="view-btn">Based on {products.length} products</span>
          </div>
          
          {insights.length > 0 ? (
            <ul className="insights-list">
              {insights.map(insight => (
                <li key={insight.id} className="insight-item">
                  <div className="insight-icon">{insight.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                      <h4 style={{ color: '#1e293b' }}>{insight.title}</h4>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: insight.priority === 'critical' ? '#ef444420' : 
                                   insight.priority === 'high' ? '#f59e0b20' : 
                                   insight.priority === 'medium' ? '#3b82f620' : '#64748b20',
                        color: insight.priority === 'critical' ? '#ef4444' :
                               insight.priority === 'high' ? '#f59e0b' :
                               insight.priority === 'medium' ? '#3b82f6' : '#64748b'
                      }}>
                        {insight.priority.toUpperCase()}
                      </span>
                    </div>
                    <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '5px' }}>
                      {insight.description}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleApplyInsight(insight)}
                    style={{ 
                      padding: '8px 16px', 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {insight.action}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              No insights available. Add more products to get AI recommendations.
            </div>
          )}
        </div>

        {/* AI Threshold Settings */}
        <div className="ai-threshold">
          <h4>AI Threshold Settings</h4>
          <p style={{ marginBottom: '20px' }}>
            Current AI confidence level: {Math.min(95, 50 + recommendations * 5)}%
          </p>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', color: 'white' }}>
              Low Stock Threshold: {aiThreshold}%
            </label>
            <input 
              type="range" 
              min="5" 
              max="50" 
              value={aiThreshold}
              onChange={(e) => handleThresholdChange(parseInt(e.target.value))}
              style={{ width: '100%', marginBottom: '10px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.8)' }}>
              <span>Conservative (5%)</span>
              <span>Aggressive (50%)</span>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', color: 'white' }}>
              Auto-Reorder Threshold
            </label>
            <select 
              value={autoReorder}
              onChange={(e) => handleAutoReorderChange(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '12px', 
                borderRadius: '8px', 
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.1)',
                color: 'white'
              }}
            >
              <option value="10">When stock reaches 10%</option>
              <option value="15">When stock reaches 15%</option>
              <option value="20">When stock reaches 20%</option>
              <option value="25">When stock reaches 25%</option>
              <option value="manual">Manual reorder only</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '10px', color: 'white' }}>
              AI Notifications
            </label>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
                <input 
                  type="checkbox" 
                  checked={notifications.lowStock}
                  onChange={() => toggleNotification('lowStock')}
                />
                Low Stock Alerts
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
                <input 
                  type="checkbox" 
                  checked={notifications.priceChanges}
                  onChange={() => toggleNotification('priceChanges')}
                />
                Price Change Alerts
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
                <input 
                  type="checkbox" 
                  checked={notifications.weeklyReports}
                  onChange={() => toggleNotification('weeklyReports')}
                />
                Weekly Reports
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}