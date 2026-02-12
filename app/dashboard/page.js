// app/dashboard/page.js
'use client'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'

export default function Dashboard() {
  const inventoryData = [
    { id: 1, product: 'Laptop Pro X', sku: 'LPX-001', stock: 45, threshold: 50, status: 'low' },
    { id: 2, product: 'Wireless Mouse', sku: 'WM-002', stock: 120, threshold: 30, status: 'ok' },
    { id: 3, product: 'Mechanical Keyboard', sku: 'MK-003', stock: 28, threshold: 25, status: 'low' },
    { id: 4, product: '4K Monitor', sku: '4KM-004', stock: 15, threshold: 20, status: 'low' },
    { id: 5, product: 'USB-C Hub', sku: 'USB-005', stock: 85, threshold: 40, status: 'ok' },
  ]

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar title="Bro's Dashboard" />
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-title">Total Products</div>
            <div className="stat-value">1,284</div>
            <div className="stat-change">↑ 12% from last month</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Low Stock Items</div>
            <div className="stat-value">23</div>
            <div className="stat-change">↑ 5% from last week</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Total Value</div>
            <div className="stat-value">$284.5K</div>
            <div className="stat-change">↑ 8% from last month</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Active Orders</div>
            <div className="stat-value">156</div>
            <div className="stat-change">↓ 3% from yesterday</div>
          </div>
        </div>

        <div className="inventory-table">
          <div className="table-header">
            <h3 className="table-title">Inventory Data Summary</h3>
            <a href="/inventory" className="view-btn">View Stock Alert →</a>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Stock</th>
                <th>Threshold</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {inventoryData.map(item => (
                <tr key={item.id}>
                  <td>{item.product}</td>
                  <td>{item.sku}</td>
                  <td>{item.stock}</td>
                  <td>{item.threshold}</td>
                  <td>
                    <span className={`status-badge ${item.status === 'low' ? 'status-low' : 'status-ok'}`}>
                      {item.status === 'low' ? 'Low Stock' : 'In Stock'}
                    </span>
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