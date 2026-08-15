import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { POSItemCard } from '../components/POSItemCard';
import { CartDrawer } from '../components/CartDrawer';
import { InvoiceModal } from '../components/InvoiceModal';
import { Search, Coffee, Sparkles } from 'lucide-react';

export function POSPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Cart State
  const [cartItems, setCartItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [activeCategory, searchQuery]);

  async function loadCategories() {
    try {
      const res = await api.getCategories();
      if (res.categories) {
        setCategories(res.categories);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  }

  async function loadProducts() {
    setLoading(true);
    try {
      const res = await api.getProducts(activeCategory, searchQuery);
      if (res.products) {
        setProducts(res.products);
      }
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  }

  // Cart Handlers (JavaScript calculation logic)
  const handleAddToCart = (product, customNote = '') => {
    setCartItems((prevItems) => {
      const existingIdx = prevItems.findIndex(
        (item) => item.id === product.id && item.customNote === customNote
      );

      if (existingIdx > -1) {
        const updated = [...prevItems];
        updated[existingIdx].quantity += 1;
        return updated;
      } else {
        return [...prevItems, { ...product, quantity: 1, customNote }];
      }
    });
  };

  const handleUpdateQty = (productId, newQty, customNote = '') => {
    if (newQty <= 0) {
      handleRemoveItem(productId, customNote);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId && item.customNote === customNote
          ? { ...item, quantity: newQty }
          : item
      )
    );
  };

  const handleRemoveItem = (productId, customNote = '') => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.id === productId && item.customNote === customNote)
      )
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleCheckout = async (orderPayload) => {
    setIsSubmitting(true);
    try {
      const res = await api.createOrder(orderPayload);
      if (res.success && res.order) {
        setCompletedOrder(res.order);
        setCartItems([]);
      }
    } catch (err) {
      alert('Order checkout failed: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.25rem', height: 'calc(100vh - 70px)', padding: '1.25rem', overflow: 'hidden' }}>
      
      {/* Left Column: Menu & Search */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
        
        {/* Top Controls: Search Bar & Category Filter Pills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="Search Chai, Snacks, Coffee by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.6rem', fontSize: '0.95rem' }}
              />
              <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600 }}>
              <Sparkles size={16} /> Instant POS Billing
            </div>
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            <button
              onClick={() => setActiveCategory('all')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                background: activeCategory === 'all' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.06)',
                color: activeCategory === 'all' ? '#FFF' : 'var(--text-muted)',
                border: activeCategory === 'all' ? '1px solid var(--primary-hover)' : '1px solid var(--border-color)'
              }}
            >
              All Items
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id.toString())}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  background: activeCategory === cat.id.toString() ? 'var(--primary)' : 'rgba(255, 255, 255, 0.06)',
                  color: activeCategory === cat.id.toString() ? '#FFF' : 'var(--text-muted)',
                  border: activeCategory === cat.id.toString() ? '1px solid var(--primary-hover)' : '1px solid var(--border-color)'
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.25rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dim)' }}>
              Loading Chai & Snack menu items...
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dim)' }}>
              <Coffee size={40} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
              <p>No products found matching criteria</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {products.map((prod) => (
                <POSItemCard
                  key={prod.id}
                  product={prod}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Live Billing Cart Drawer */}
      <div style={{ height: '100%', overflow: 'hidden' }}>
        <CartDrawer
          cartItems={cartItems}
          onUpdateQty={handleUpdateQty}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onCheckout={handleCheckout}
          isSubmitting={isSubmitting}
        />
      </div>

      {/* Invoice Receipt Modal */}
      {completedOrder && (
        <InvoiceModal
          order={completedOrder}
          onClose={() => setCompletedOrder(null)}
        />
      )}
    </div>
  );
}
