import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Edit2, Trash2, Check, X, Coffee, Image, DollarSign, Layers } from 'lucide-react';

export function MenuManagePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State for Add / Edit
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    category_id: 1,
    name: '',
    price: '',
    description: '',
    image_url: '',
    is_available: true
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.getProducts('all', ''),
        api.getCategories()
      ]);
      if (prodRes.products) setProducts(prodRes.products);
      if (catRes.categories) {
        setCategories(catRes.categories);
        if (catRes.categories.length > 0) {
          setFormData(prev => ({ ...prev, category_id: catRes.categories[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load menu management data', err);
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({
      category_id: categories[0]?.id || 1,
      name: '',
      price: '',
      description: '',
      image_url: '',
      is_available: true
    });
  };

  const handleEditClick = (product) => {
    setIsEditing(true);
    setEditId(product.id);
    setFormData({
      category_id: product.category_id,
      name: product.name,
      price: product.price,
      description: product.description || '',
      image_url: product.image_url || '',
      is_available: Boolean(product.is_available)
    });
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await api.deleteProduct(id);
        loadData();
      } catch (err) {
        alert('Failed to delete item: ' + err.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.updateProduct(editId, formData);
      } else {
        await api.createProduct(formData);
      }
      resetForm();
      loadData();
    } catch (err) {
      alert('Operation failed: ' + err.message);
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
          Menu & Inventory Management (Admin)
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Add new beverages, update pricing, customize descriptions, or set availability
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Form: Add / Edit Product */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary-hover)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {isEditing ? <Edit2 size={18} /> : <Plus size={18} />}
            {isEditing ? 'Edit Menu Item' : 'Add New Item'}
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>
                Category
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                style={{ width: '100%' }}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>
                Item Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Masala Kulhad Chai"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>
                Price (₹) *
              </label>
              <input
                type="number"
                step="0.5"
                required
                placeholder="25.00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>
                Description
              </label>
              <textarea
                rows="2"
                placeholder="Short item description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ width: '100%', resize: 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>
                Image URL
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
              <input
                type="checkbox"
                id="is_available"
                checked={formData.is_available}
                onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="is_available" style={{ fontSize: '0.85rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                In Stock & Available
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                {isEditing ? 'Update Item' : 'Create Item'}
              </button>
              {isEditing && (
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Table: Product Inventory */}
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
              Loading product inventory...
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(0, 0, 0, 0.4)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Item</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Price</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((prod) => (
                    <tr key={prod.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={prod.image_url || 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500'}
                            alt={prod.name}
                            style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{prod.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{prod.description}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                        {prod.category_name}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--primary-hover)' }}>
                        ₹{parseFloat(prod.price).toFixed(2)}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span className={`badge ${prod.is_available ? 'badge-cashier' : 'badge-admin'}`}>
                          {prod.is_available ? 'Available' : 'Out of Stock'}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                          <button onClick={() => handleEditClick(prod)} className="btn-secondary" style={{ padding: '0.35rem' }}>
                            <Edit2 size={14} color="var(--primary)" />
                          </button>
                          <button onClick={() => handleDeleteClick(prod.id)} className="btn-secondary" style={{ padding: '0.35rem' }}>
                            <Trash2 size={14} color="var(--accent-red)" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
