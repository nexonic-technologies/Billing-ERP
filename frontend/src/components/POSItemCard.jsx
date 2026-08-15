import React, { useState } from 'react';
import { Plus, Check, Coffee } from 'lucide-react';

export function POSItemCard({ product, onAddToCart }) {
  const [added, setAdded] = useState(false);
  const [customNote, setCustomNote] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);

  const handleAdd = (e) => {
    e.stopPropagation();
    onAddToCart(product, customNote);
    setAdded(true);
    setTimeout(() => setAdded(false), 900);
    setShowCustomModal(false);
  };

  return (
    <div
      className="glass-panel animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.25s ease',
        cursor: 'pointer'
      }}
      onClick={() => setShowCustomModal(!showCustomModal)}
    >
      {/* Product Image Banner */}
      <div style={{ height: '140px', width: '100%', overflow: 'hidden', position: 'relative', background: '#251710' }}>
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500'}
          alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500';
          }}
        />
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(18, 10, 7, 0.85)',
          backdropFilter: 'blur(8px)',
          padding: '0.25rem 0.6rem',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.85rem',
          fontWeight: 700,
          color: 'var(--primary-hover)',
          border: '1px solid var(--border-color)'
        }}>
          ₹{parseFloat(product.price).toFixed(2)}
        </div>
      </div>

      {/* Product Info Body */}
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            {product.name}
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.description || 'Freshly prepared tea shop special'}
          </p>
        </div>

        {/* Custom Note input toggle area */}
        {showCustomModal && (
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <input
              type="text"
              placeholder="Notes (e.g. Less Sugar, Strong)"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
            />
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
            {product.category_name || 'Beverage'}
          </span>

          <button
            onClick={handleAdd}
            className="btn-primary"
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.85rem',
              borderRadius: 'var(--radius-sm)',
              background: added ? 'var(--accent-green)' : undefined
            }}
          >
            {added ? <Check size={16} /> : <Plus size={16} />}
            {added ? 'Added' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
