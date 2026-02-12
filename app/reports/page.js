// app/reports/page.js
'use client'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'

export default function ReportsPage() {
  const reports = [
    { id: 1, name: 'Sales Report - March 2024', type: 'Sales', date: '2024-03-15', size: '2.4 MB' },
    { id: 2, name: 'Inventory Summary - Q1 2024', type: 'Inventory', date: '2024-03-31', size: '1.8 MB' },
    { id: 3, name: 'Low Stock Analysis', type: 'Analytics', date: '2024-03-14', size: '956 KB' },
    { id: 4, name: 'Supplier Performance', type: 'Procurement', date: '2024-03-10', size: '1.2 MB' },
    { id: 5, name: 'Monthly Revenue Report', type: 'Financial', date: '2024-03-01', size: '3.1 MB' },
  ]

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar title="Sales Report" />
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-title">Total Reports</div>
            <div className="stat-value">24</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Generated This Month</div>
            <div className="stat-value">12</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Scheduled Reports</div>
            <div className="stat-value">5</div>
          </div>
        </div>

        <div className="inventory-table">
          <div className="table-header">
            <h3 className="table-title">Recent Reports</h3>
            <button className="login-btn" style={{ width: 'auto', padding: '10px 20px' }}>
              + Generate Report
            </button>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Report Name</th>
                <th>Type</th>
                <th>Date</th>
                <th>Size</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(report => (
                <tr key={report.id}>
                  <td>{report.name}</td>
                  <td>{report.type}</td>
                  <td>{report.date}</td>
                  <td>{report.size}</td>
                  <td>
                    <button style={{ marginRight: '10px', color: '#667eea' }}>Download</button>
                    <button style={{ color: '#64748b' }}>Share</button>
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