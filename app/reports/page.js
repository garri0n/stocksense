// app/reports/page.js
'use client'
import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'

export default function ReportsPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [selectedReportType, setSelectedReportType] = useState('sales')
  const [dateRange, setDateRange] = useState('month')
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = () => {
    // Load reports from localStorage or generate based on actual data
    const savedReports = localStorage.getItem('reports')
    if (savedReports) {
      setReports(JSON.parse(savedReports))
    } else {
      // Generate sample reports based on current date
      generateSampleReports()
    }
    setLoading(false)
  }

  const generateSampleReports = () => {
    const now = new Date()
    const currentMonth = now.toLocaleString('default', { month: 'long', year: 'numeric' })
    const lastMonth = new Date(now.setMonth(now.getMonth() - 1)).toLocaleString('default', { month: 'long', year: 'numeric' })
    
    const sampleReports = [
      {
        id: 1,
        name: `Sales Report - ${currentMonth}`,
        type: 'Sales',
        date: new Date().toISOString().split('T')[0],
        size: '2.4 MB',
        format: 'PDF',
        status: 'completed'
      },
      {
        id: 2,
        name: `Inventory Summary - Q1 2025`,
        type: 'Inventory',
        date: new Date().toISOString().split('T')[0],
        size: '1.8 MB',
        format: 'Excel',
        status: 'completed'
      },
      {
        id: 3,
        name: `Low Stock Analysis - ${currentMonth}`,
        type: 'Analytics',
        date: new Date().toISOString().split('T')[0],
        size: '956 KB',
        format: 'PDF',
        status: 'completed'
      },
      {
        id: 4,
        name: `Monthly Revenue Report - ${lastMonth}`,
        type: 'Financial',
        date: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
        size: '3.1 MB',
        format: 'PDF',
        status: 'completed'
      }
    ]
    setReports(sampleReports)
    localStorage.setItem('reports', JSON.stringify(sampleReports))
  }

  const handleDownload = (report) => {
    // Create a simple CSV or JSON content based on report type
    let content = ''
    let filename = ''
    let type = ''

    if (report.type === 'Sales') {
      content = generateSalesReport()
      filename = `sales-report-${new Date().toISOString().split('T')[0]}.csv`
      type = 'text/csv'
    } else if (report.type === 'Inventory') {
      content = generateInventoryReport()
      filename = `inventory-summary-${new Date().toISOString().split('T')[0]}.csv`
      type = 'text/csv'
    } else {
      content = generateJSONReport(report)
      filename = `${report.name.replace(/\s+/g, '-').toLowerCase()}.json`
      type = 'application/json'
    }

    // Create download link
    const blob = new Blob([content], { type })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const generateSalesReport = () => {
    const headers = 'Date,Product,Quantity,Unit Price,Total\n'
    const rows = []
    for (let i = 0; i < 10; i++) {
      const date = new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
      rows.push(`${date},Product ${i+1},${Math.floor(Math.random() * 10 + 1)},$${(Math.random() * 100 + 20).toFixed(2)},$${(Math.random() * 1000 + 100).toFixed(2)}`)
    }
    return headers + rows.join('\n')
  }

  const generateInventoryReport = () => {
    const headers = 'SKU,Product,Category,Current Stock,Reorder Threshold,Unit Price,Total Value\n'
    const rows = []
    const products = ['Laptop Pro X', 'Wireless Mouse', 'Keyboard', 'Monitor', 'USB Hub']
    products.forEach((product, i) => {
      const stock = Math.floor(Math.random() * 100 + 10)
      const price = (Math.random() * 500 + 50).toFixed(2)
      rows.push(`SKU00${i+1},${product},Electronics,${stock},${Math.floor(stock * 0.3)},$${price},$${(stock * price).toFixed(2)}`)
    })
    return headers + rows.join('\n')
  }

  const generateJSONReport = (report) => {
    return JSON.stringify({
      reportName: report.name,
      generatedAt: new Date().toISOString(),
      type: report.type,
      data: {
        summary: 'Sample report data',
        metrics: {
          total: Math.floor(Math.random() * 10000),
          average: Math.floor(Math.random() * 1000),
          count: Math.floor(Math.random() * 100)
        }
      }
    }, null, 2)
  }

  const handleGenerateReport = () => {
    setGenerating(true)
    
    // Simulate report generation
    setTimeout(() => {
      const now = new Date()
      const newReport = {
        id: reports.length + 1,
        name: `${selectedReportType.charAt(0).toUpperCase() + selectedReportType.slice(1)} Report - ${dateRange === 'month' ? now.toLocaleString('default', { month: 'long' }) : 'Custom'}`,
        type: selectedReportType.charAt(0).toUpperCase() + selectedReportType.slice(1),
        date: now.toISOString().split('T')[0],
        size: `${(Math.random() * 3 + 1).toFixed(1)} MB`,
        format: 'PDF',
        status: 'completed'
      }
      
      const updatedReports = [newReport, ...reports]
      setReports(updatedReports)
      localStorage.setItem('reports', JSON.stringify(updatedReports))
      
      setGenerating(false)
      setShowGenerateModal(false)
    }, 2000)
  }

  // Calculate stats based on actual reports
  const totalReports = reports.length
  const generatedThisMonth = reports.filter(r => {
    const reportDate = new Date(r.date)
    const now = new Date()
    return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear()
  }).length
  const scheduledReports = 3 // This could be stored in localStorage

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="main-content">
          <TopBar title="Reports" />
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
        <TopBar title="Reports" />
        
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-title">Total Reports</div>
            <div className="stat-value">{totalReports}</div>
            <div className="stat-change">Lifetime reports</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Generated This Month</div>
            <div className="stat-value">{generatedThisMonth}</div>
            <div className="stat-change">
              {generatedThisMonth > 0 ? '↑ Active reporting' : 'No reports this month'}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Scheduled Reports</div>
            <div className="stat-value">{scheduledReports}</div>
            <div className="stat-change">Weekly, Monthly, Quarterly</div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="inventory-table">
          <div className="table-header">
            <h3 className="table-title">Recent Reports</h3>
            <button 
              onClick={() => setShowGenerateModal(true)}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>+</span> Generate Report
            </button>
          </div>
          
          {reports.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Report Name</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Size</th>
                  <th>Format</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>
                          {report.type === 'Sales' ? '📊' : 
                           report.type === 'Inventory' ? '📦' : 
                           report.type === 'Financial' ? '💰' : '📄'}
                        </span>
                        <strong>{report.name}</strong>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        background: report.type === 'Sales' ? '#667eea20' : 
                                   report.type === 'Inventory' ? '#22c55e20' : 
                                   report.type === 'Financial' ? '#f59e0b20' : '#64748b20',
                        color: report.type === 'Sales' ? '#667eea' : 
                               report.type === 'Inventory' ? '#22c55e' : 
                               report.type === 'Financial' ? '#f59e0b' : '#64748b',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {report.type}
                      </span>
                    </td>
                    <td>{new Date(report.date).toLocaleDateString()}</td>
                    <td>{report.size}</td>
                    <td>
                      <span style={{
                        padding: '2px 6px',
                        background: '#e2e8f0',
                        borderRadius: '4px',
                        fontSize: '11px'
                      }}>
                        {report.format || 'PDF'}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleDownload(report)}
                        style={{ 
                          padding: '6px 12px',
                          background: '#667eea',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <span>⬇️</span> Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>📄</div>
              <h3 style={{ marginBottom: '10px', color: '#1e293b' }}>No Reports Yet</h3>
              <p style={{ color: '#64748b', marginBottom: '20px' }}>
                Generate your first report to start tracking your business metrics.
              </p>
              <button 
                onClick={() => setShowGenerateModal(true)}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Generate First Report
              </button>
            </div>
          )}
        </div>

        {/* Generate Report Modal */}
        {showGenerateModal && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px' }}>
              <h3 style={{ marginBottom: '20px' }}>Generate New Report</h3>
              
              <div className="form-group">
                <label>Report Type</label>
                <select 
                  value={selectedReportType}
                  onChange={(e) => setSelectedReportType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--gray-200)',
                    borderRadius: '8px'
                  }}
                >
                  <option value="sales">Sales Report</option>
                  <option value="inventory">Inventory Report</option>
                  <option value="analytics">Analytics Report</option>
                  <option value="financial">Financial Report</option>
                </select>
              </div>

              <div className="form-group">
                <label>Date Range</label>
                <select 
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--gray-200)',
                    borderRadius: '8px'
                  }}
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              <div className="form-group">
                <label>Format</label>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <input type="radio" name="format" defaultChecked /> PDF
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <input type="radio" name="format" /> Excel
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <input type="radio" name="format" /> CSV
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                  onClick={() => setShowGenerateModal(false)}
                  style={{
                    padding: '10px 20px',
                    background: 'var(--gray-200)',
                    color: 'var(--gray-700)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateReport}
                  disabled={generating}
                  style={{
                    padding: '10px 20px',
                    background: generating ? '#94a3b8' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: generating ? 'not-allowed' : 'pointer'
                  }}
                >
                  {generating ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}