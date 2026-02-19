// app/inventory/page.js
'use client'
import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import { formatPrice } from '../utils/currency'

export default function InventoryPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [categories, setCategories] = useState([])

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    current_stock: '',
    reorder_threshold: '10',
    description: ''
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      setProducts(data)
      
      const uniqueCategories = [...new Set(data.map(p => p.category).filter(Boolean))]
      setCategories(uniqueCategories)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setShowModal(false)
        resetForm()
        fetchProducts()
      }
    } catch (error) {
      console.error('Error adding product:', error)
    }
  }

  const handleEditProduct = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedProduct.id, ...formData })
      })
      
      if (response.ok) {
        setShowModal(false)
        resetForm()
        fetchProducts()
      }
    } catch (error) {
      console.error('Error updating product:', error)
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

  const openAddModal = () => {
    setModalMode('add')
    resetForm()
    setShowModal(true)
  }

  const openEditModal = (product) => {
    setModalMode('edit')
    setSelectedProduct(product)
    setFormData({
      name: product.name || '',
      sku: product.sku || '',
      category: product.category || '',
      price: product.price || '',
      current_stock: product.current_stock || '',
      reorder_threshold: product.reorder_threshold || '10',
      description: product.description || ''
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      category: '',
      price: '',
      current_stock: '',
      reorder_threshold: '10',
      description: ''
    })
    setSelectedProduct(null)
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const totalItems = filteredProducts.reduce((sum, p) => sum + (p.current_stock || 0), 0)
  const uniqueCategories = [...new Set(filteredProducts.map(p => p.category))].length
  const lowStock = filteredProducts.filter(p => (p.current_stock || 0) < (p.reorder_threshold || 10)).length
  const outOfStock = filteredProducts.filter(p => (p.current_stock || 0) === 0).length

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

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar title="Inventory Management" />
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-title">Total Items</div>
            <div className="stat-value">{totalItems}</div>
            <div className="stat-change">Across {products.length} products</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Categories</div>
            <div className="stat-value">{uniqueCategories}</div>
            <div className="stat-change">{categories.length} total categories</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Low Stock</div>
            <div className="stat-value">{lowStock}</div>
            <div className="stat-change" style={{ color: '#f59e0b' }}>⚠️ Needs reorder</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Out of Stock</div>
            <div className="stat-value">{outOfStock}</div>
            <div className="stat-change" style={{ color: '#ef4444' }}>❌ Critical</div>
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          marginBottom: '20px',
          background: 'white',
          padding: '20px',
          borderRadius: '15px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
        }}>
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid var(--gray-200)',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '12px',
              border: '1px solid var(--gray-200)',
              borderRadius: '8px',
              fontSize: '14px',
              minWidth: '150px'
            }}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button 
            onClick={openAddModal}
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
            + Add Product
          </button>
        </div>

        <div className="inventory-table">
          <div className="table-header">
            <h3 className="table-title">Inventory List ({filteredProducts.length} products)</h3>
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
              {filteredProducts.length > 0 ? (
                filteredProducts.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div>
                        <strong>{item.name}</strong>
                        {item.description && <div style={{ fontSize: '12px', color: '#666' }}>{item.description.substring(0, 30)}...</div>}
                      </div>
                    </td>
                    <td>{item.sku}</td>
                    <td>{item.category}</td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{item.current_stock}</div>
                      <div style={{ fontSize: '11px', color: '#666' }}>units</div>
                    </td>
                    <td>{formatPrice(item.price || 0)}</td>
                    <td>{item.reorder_threshold}</td>
                    <td>
                      {item.current_stock === 0 ? (
                        <span className="status-badge status-low">Out of Stock</span>
                      ) : item.current_stock < item.reorder_threshold ? (
                        <span className="status-badge status-low">Low Stock</span>
                      ) : (
                        <span className="status-badge status-ok">In Stock</span>
                      )}
                    </td>
                    <td>
                      <button 
                        onClick={() => openEditModal(item)}
                        style={{ 
                          marginRight: '10px', 
                          color: '#667eea',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(item.id)}
                        style={{ 
                          color: '#ef4444',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '16px', color: '#666', marginBottom: '10px' }}>
                      No products found
                    </div>
                    <button 
                      onClick={openAddModal}
                      style={{
                        padding: '10px 20px',
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      Add Your First Product
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Product Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '600px' }}>
              <h3 style={{ marginBottom: '20px' }}>
                {modalMode === 'add' ? 'Add New Product' : 'Edit Product'}
              </h3>
              <form onSubmit={modalMode === 'add' ? handleAddProduct : handleEditProduct}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>SKU *</label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      list="categories"
                    />
                    <datalist id="categories">
                      {categories.map(cat => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>
                  <div className="form-group">
                    <label>Price (₱) *</label>
                    <input
                      type="number"
                      step="0.01"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Current Stock *</label>
                    <input
                      type="number"
                      name="current_stock"
                      value={formData.current_stock}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Reorder Threshold</label>
                    <input
                      type="number"
                      name="reorder_threshold"
                      value={formData.reorder_threshold}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--gray-200)',
                      borderRadius: '8px',
                      resize: 'vertical'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      resetForm()
                    }}
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
                    {modalMode === 'add' ? 'Add Product' : 'Save Changes'}
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