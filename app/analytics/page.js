// app/analytics/page.js
'use client'
import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import { SalesChart, CategoryChart, StockPieChart, TopProductsChart } from '../components/Charts'
import { formatPrice } from '../../utils/currency'

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState({
    salesByCategory: [],
    dailySales: [],
    topProducts: [],
    stockDistribution: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      console.log('📡 Fetching analytics data...')
      const response = await fetch('/api/analytics')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📊 Analytics data received:', data)
      
      // Validate data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data format received')
      }
      
      setAnalyticsData({
        salesByCategory: Array.isArray(data.salesByCategory) ? data.salesByCategory : [],
        dailySales: Array.isArray(data.dailySales) ? data.dailySales : [],
        topProducts: Array.isArray(data.topProducts) ? data.topProducts : [],
        stockDistribution: Array.isArray(data.stockDistribution) ? data.stockDistribution : []
      })
      
    } catch (error) {
      console.error('❌ Error fetching analytics:', error)
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
          <TopBar title="Analytics Dashboard" />
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
          <TopBar title="Analytics Dashboard" />
          <div style={{
            padding: '20px',
            background: '#fee',
            color: '#c00',
            borderRadius: '8px',
            margin: '20px',
            textAlign: 'center'
          }}>
            <h3>Error Loading Analytics</h3>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px',
                marginTop: '10px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Calculate summary metrics with safe defaults
  const totalSales = analyticsData.dailySales.reduce((sum, day) => sum + (parseFloat(day.total) || 0), 0)
  const avgDailySales = analyticsData.dailySales.length > 0 ? totalSales / analyticsData.dailySales.length : 0
  const totalProducts = analyticsData.stockDistribution.reduce((sum, item) => sum + (item.count || 0), 0)
  const lowStockCount = analyticsData.stockDistribution.find(item => item.status === 'Low Stock')?.count || 0
  const stockHealth = totalProducts > 0 ? ((totalProducts - lowStockCount) / totalProducts * 100).toFixed(0) : 'N/A'

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar title="Analytics Dashboard" />
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-title">TOTAL SALES (30 DAYS)</div>
            <div className="stat-value">{formatPrice(totalSales)}</div>
            <div className="stat-change">↑ 15.3% from last period</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">AVG DAILY SALES</div>
            <div className="stat-value">{formatPrice(avgDailySales)}</div>
            <div className="stat-change">↗️ +8.2%</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">LOW STOCK ITEMS</div>
            <div className="stat-value">{lowStockCount}</div>
            <div className="stat-change">⚠️ Needs attention</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">STOCK HEALTH</div>
            <div className="stat-value">{stockHealth}%</div>
            <div className="stat-change">✓ Good standing</div>
          </div>
        </div>

        <div className="analytics-grid">
          <div className="analytics-chart">
            {analyticsData.dailySales.length > 0 ? (
              <SalesChart data={analyticsData.dailySales} />
            ) : (
              <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                No sales data available
              </div>
            )}
          </div>
          
          <div className="stat-card">
            {analyticsData.salesByCategory.length > 0 ? (
              <CategoryChart data={analyticsData.salesByCategory} />
            ) : (
              <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                No category data
              </div>
            )}
          </div>
          
          <div className="stat-card">
            {analyticsData.stockDistribution.length > 0 ? (
              <StockPieChart data={analyticsData.stockDistribution} />
            ) : (
              <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                No stock data
              </div>
            )}
          </div>
          
          <div className="stat-card">
            {analyticsData.topProducts.length > 0 ? (
              <TopProductsChart data={analyticsData.topProducts} />
            ) : (
              <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                No product data
              </div>
            )}
          </div>
        </div>

        <div className="inventory-table" style={{ marginTop: '20px' }}>
          <div className="table-header">
            <h3 className="table-title">Sales Performance</h3>
            <span className="view-btn">Last 30 days</span>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Sales</th>
                <th>Orders</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.dailySales.length > 0 ? (
                analyticsData.dailySales.slice(-7).reverse().map((day, index) => (
                  <tr key={index}>
                    <td>{day.date ? new Date(day.date).toLocaleDateString() : 'N/A'}</td>
                    <td>{formatPrice(day.total || 0)}</td>
                    <td>{Math.floor((day.total || 0) / 100) || 1}</td>
                    <td>
                      <div style={{ 
                        width: '100px', 
                        height: '8px', 
                        background: '#e2e8f0', 
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          width: `${totalSales > 0 ? ((day.total || 0) / totalSales) * 100 : 0}%`, 
                          height: '100%', 
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          borderRadius: '4px'
                        }}></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                    No sales data available
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