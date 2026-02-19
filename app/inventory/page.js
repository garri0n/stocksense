// app/inventory/page.js
'use client'
import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'

export default function InventoryPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    current_stock: '',
    reorder_threshold: ''
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      })
      if (response.ok) {
        setShowAddModal(false)
        fetchProducts()
        setNewProduct({
          name: '',
          sku: '',
          category: '',
          price: '',
          current_stock: '',
          reorder_threshold: ''
        })
      }
    } catch (error) {
      console.error('Error adding product:', error)
    }
  }

  const handleDeleteProduct = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`/api/products?id=${id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          fetchProducts()
        }
      } catch (error) {
        console.error('Error deleting product:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="main-content">
          <TopBar title="Inventory Management" />
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    )
  }

  const totalItems = products.reduce((sum, p) => sum + p.current_stock, 0)
  const categories = [...new Set(products.map(p => p.category))].length
  const lowStock = products.filter(p => p.current_stock < p.reorder_threshold).length
  const outOfStock = products.filter(p => p.current_stock === 0).length

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar title="Inventory Management" />
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-title">Total Items</div>
            <div className="stat-value">{totalItems}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Categories</div>
            <div className="stat-value">{categories}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Low Stock</div>
            <div className="stat-value">{lowStock}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Out of Stock</div>
            <div className="stat-value">{outOfStock}</div>
          </div>
        </div>

        <div className="inventory-table">
          <div className="table-header">
            <h3 className="table-title">Inventory List</h3>
            <button onClick={() => setShowAddModal(true)} className="login-btn" style={{ width: 'auto', padding: '10px 20px' }}>
              + Add Product
            </button>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Price</th>
                <th>Threshold</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.sku}</td>
                  <td>{item.category}</td>
                  <td>{item.current_stock}</td>
                  <td>${item.price}</td>
                  <td>{item.reorder_threshold}</td>
                  <td>
                    <span className={`status-badge ${item.current_stock === 0 ? 'status-low' : item.current_stock < item.reorder_threshold ? 'status-warning' : 'status-ok'}`}>
                      {item.current_stock === 0 ? 'Out of Stock' : item.current_stock < item.reorder_threshold ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td>
                    <button style={{ marginRight: '10px', color: '#667eea' }}>Edit</button>
                    <button onClick={() => handleDeleteProduct(item.id)} style={{ color: '#ef4444' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px' }}>
              <h3 style={{ marginBottom: '20px' }}>Add New Product</h3>
              <form onSubmit={handleAddProduct}>
                <div className="form-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    required
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>SKU</label>
                  <input
                    type="text"
                    required
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    required
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  >
                    <option value="">Select Category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Storage">Storage</option>
                    <option value="Components">Components</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Audio">Audio</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Price (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Current Stock</label>
                  <input
                    type="number"
                    required
                    value={newProduct.current_stock}
                    onChange={(e) => setNewProduct({...newProduct, current_stock: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Reorder Threshold</label>
                  <input
                    type="number"
                    required
                    value={newProduct.reorder_threshold}
                    onChange={(e) => setNewProduct({...newProduct, reorder_threshold: e.target.value})}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
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
                    type="submit"
                    style={{
                      padding: '10px 20px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    Add Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}