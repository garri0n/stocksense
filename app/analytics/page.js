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

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch('/api/analytics')
      const data = await response.json()
      setAnalyticsData(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
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

  // Calculate summary metrics
  const totalSales = analyticsData.dailySales.reduce((sum, day) => sum + parseFloat(day.total || 0), 0)
  const avgDailySales = totalSales / (analyticsData.dailySales.length || 1)
  const totalProducts = analyticsData.stockDistribution.reduce((sum, item) => sum + item.count, 0)
  const lowStockCount = analyticsData.stockDistribution.find(item => item.status === 'Low Stock')?.count || 0

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar title="Analytics Dashboard" />
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-title">Total Sales (30 Days)</div>
            <div className="stat-value">{formatPrice(totalSales)}</div>

            <div className="stat-change">↑ 15.3% from last period</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Avg Daily Sales</div>
            <div className="stat-value">{formatPrice(avgDailySales)}</div>
            <div className="stat-change">↗️ +8.2%</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Low Stock Items</div>
            <div className="stat-value">{lowStockCount}</div>
            <div className="stat-change">⚠️ Needs attention</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Stock Health</div>
            <div className="stat-value">
              {((totalProducts - lowStockCount) / totalProducts * 100).toFixed(0)}%
            </div>
            <div className="stat-change">✓ Good standing</div>
          </div>
        </div>

        <div className="analytics-grid">
          <div className="analytics-chart">
            <SalesChart data={analyticsData.dailySales} />
          </div>
          
          <div className="stat-card">
            <CategoryChart data={analyticsData.salesByCategory} />
          </div>
          
          <div className="stat-card">
            <StockPieChart data={analyticsData.stockDistribution} />
          </div>
          
          <div className="stat-card">
            <TopProductsChart data={analyticsData.topProducts} />
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
              {analyticsData.dailySales.slice(-7).reverse().map((day, index) => (
                <tr key={index}>
                  <td>{new Date(day.date).toLocaleDateString()}</td>
                  <td>₱{parseFloat(day.total || 0).toLocaleString()}</td>
                  <td>{Math.floor(day.total / 100) || 1}</td>
                  <td>
                    <div style={{ 
                      width: '100px', 
                      height: '8px', 
                      background: '#e2e8f0', 
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        width: `${(day.total / totalSales * 100).toFixed(2)}%`, 
                        height: '100%', 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '4px'
                      }}></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}