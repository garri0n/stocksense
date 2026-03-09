// app/reports/page.js
'use client'
import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'

export default function ReportsPage() {
  const [reports, setReports] = useState([])
  const [stats, setStats] = useState({ total: 0, monthly: 0, scheduled: 3 })
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports')
      const data = await response.json()
      console.log('📊 Reports data:', data)
      setReports(data.reports || [])
      setStats(data.stats || { total: 0, monthly: 0, scheduled: 3 })
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (report) => {
    setDownloading(true)
    try {
      // For PDF files, we need to handle them differently
      if (report.format === 'PDF') {
        // Create a simple text representation since we can't generate real PDFs
        const content = generateReportContent(report)
        const blob = new Blob([content], { type: 'text/plain' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${report.name.replace(/\s+/g, '-').toLowerCase()}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      } else {
        // For CSV/Excel files
        const response = await fetch('/api/reports/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ report })
        })

        if (response.ok) {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${report.name.replace(/\s+/g, '-').toLowerCase()}.csv`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          window.URL.revokeObjectURL(url)
        }
      }
    } catch (error) {
      console.error('Download error:', error)
    } finally {
      setDownloading(false)
    }
  }

  const generateReportContent = (report) => {
    let content = `${report.name}\n`
    content += `Generated: ${new Date().toLocaleString()}\n`
    content += `Type: ${report.type}\n`
    content += '='.repeat(50) + '\n\n'

    if (report.data) {
      content += JSON.stringify(report.data, null, 2)
    } else {
      content += 'Report data not available'
    }

    return content
  }

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
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-title">Total Reports</div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-change">Lifetime reports</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Generated This Month</div>
            <div className="stat-value">{stats.monthly}</div>
            <div className="stat-change">
              {stats.monthly > 0 ? '↑ Active reporting' : 'No reports this month'}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Scheduled Reports</div>
            <div className="stat-value">{stats.scheduled}</div>
            <div className="stat-change">Weekly, Monthly, Quarterly</div>
          </div>
        </div>

        <div className="inventory-table">
          <div className="table-header">
            <h3 className="table-title">Recent Reports</h3>
          </div>
          
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
                      disabled={downloading}
                      style={{ 
                        padding: '6px 12px',
                        background: downloading ? '#94a3b8' : '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: downloading ? 'not-allowed' : 'pointer',
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
        </div>
      </div>
    </div>
  )
}