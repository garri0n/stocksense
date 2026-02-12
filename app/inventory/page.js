// app/inventory/page.js
'use client'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'

export default function InventoryPage() {
  const inventoryData = [
    { id: 1, product: 'Laptop Pro X', category: 'Electronics', stock: 45, price: '$1,299', status: 'low' },
    { id: 2, product: 'Wireless Mouse', category: 'Accessories', stock: 120, price: '$29', status: 'ok' },
    { id: 3, product: 'Mechanical Keyboard', category: 'Accessories', stock: 28, price: '$149', status: 'low' },
    { id: 4, product: '4K Monitor', category: 'Electronics', stock: 15, price: '$449', status: 'low' },
    { id: 5, product: 'USB-C Hub', category: 'Accessories', stock: 85, price: '$59', status: 'ok' },
    { id: 6, product: 'SSD 1TB', category: 'Storage', stock: 62, price: '$129', status: 'ok' },
    { id: 7, product: 'RAM 16GB', category: 'Components', stock: 34, price: '$89', status: 'low' },
    { id: 8, product: 'Gaming Chair', category: 'Furniture', stock: 12, price: '$299', status: 'low' },
  ]

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar title="Inventory Management" />
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-title">Total Items</div>
            <div className="stat-value">401</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Categories</div>
            <div className="stat-value">12</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Low Stock</div>
            <div className="stat-value">23</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Out of Stock</div>
            <div className="stat-value">8</div>
          </div>
        </div>

        <div className="inventory-table">
          <div className="table-header">
            <h3 className="table-title">Inventory List</h3>
            <button className="login-btn" style={{ width: 'auto', padding: '10px 20px' }}>
              + Add Product
            </button>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventoryData.map(item => (
                <tr key={item.id}>
                  <td>{item.product}</td>
                  <td>{item.category}</td>
                  <td>{item.stock}</td>
                  <td>{item.price}</td>
                  <td>
                    <span className={`status-badge ${item.status === 'low' ? 'status-low' : 'status-ok'}`}>
                      {item.status === 'low' ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td>
                    <button style={{ marginRight: '10px', color: '#667eea' }}>Edit</button>
                    <button style={{ color: '#ef4444' }}>Delete</button>
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