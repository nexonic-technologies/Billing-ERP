import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, QrCode, User, Phone, Tag, Percent, ArrowRight } from 'lucide-react';

export function CartDrawer({
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onCheckout,
  isSubmitting
}) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxPercent, setTaxPercent] = useState(5);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  // Billing Engine Calculations (Pure JavaScript)
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountAmount = (subtotal * (parseFloat(discountPercent) || 0)) / 100;
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxableSubtotal * (parseFloat(taxPercent) || 0)) / 100;
  const grandTotal = taxableSubtotal + taxAmount;

  const handleCompleteOrder = () => {
    if (cartItems.length === 0) return;

    onCheckout({
      customer_name: customerName || 'Walk-in Customer',
      customer_phone: customerPhone || '',
      items: cartItems.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        customization: item.customNote || ''
      })),
      discount_percentage: parseFloat(discountPercent) || 0,
      tax_percentage: parseFloat(taxPercent) || 0,
      payment_method: paymentMethod
    });
  };

  return (
    <div className="glass-panel" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '1.25rem',
      gap: '1rem',
      justifyContent: 'space-between'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShoppingCart size={20} color="var(--primary)" />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            Current Bill ({cartItems.reduce((a, b) => a + b.quantity, 0)})
          </h2>
        </div>
        {cartItems.length > 0 && (
          <button
            onClick={onClearCart}
            style={{ background: 'none', color: 'var(--accent-red)', fontSize: '0.8rem', fontWeight: 500 }}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.25rem' }}>
        {cartItems.length === 0 ? (
          <div style={{ textAlign: 'center', margin: 'auto 0', color: 'var(--text-dim)', padding: '2rem 1rem' }}>
            <ShoppingCart size={42} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
            <p style={{ fontSize: '0.95rem' }}>No items in current order cart</p>
            <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Click on menu items to add to bill</span>
          </div>
        ) : (
          cartItems.map((item, idx) => (
            <div key={`${item.id}-${idx}`} style={{
              background: 'rgba(0, 0, 0, 0.25)',
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  {item.name}
                </div>
                {item.customNote && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontStyle: 'italic' }}>
                    Note: {item.customNote}
                  </span>
                )}
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                  ₹{parseFloat(item.price).toFixed(2)} x {item.quantity} = <strong style={{ color: 'var(--primary-hover)' }}>₹{(item.price * item.quantity).toFixed(2)}</strong>
                </div>
              </div>

              {/* Quantity Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-sm)', padding: '0.2rem' }}>
                <button
                  onClick={() => onUpdateQty(item.id, item.quantity - 1, item.customNote)}
                  style={{ background: 'none', color: 'var(--text-main)', padding: '0.2rem', display: 'flex' }}
                >
                  <Minus size={14} />
                </button>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>
                  {item.quantity}
                </span>
                <button
                  onClick={() => onUpdateQty(item.id, item.quantity + 1, item.customNote)}
                  style={{ background: 'none', color: 'var(--text-main)', padding: '0.2rem', display: 'flex' }}
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                onClick={() => onRemoveItem(item.id, item.customNote)}
                style={{ background: 'none', color: 'var(--accent-red)', opacity: 0.7, padding: '0.2rem' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Customer Info Inputs */}
      {cartItems.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={{ width: '100%', fontSize: '0.8rem', paddingLeft: '2.2rem' }}
              />
              <User size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Phone Number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                style={{ width: '100%', fontSize: '0.8rem', paddingLeft: '2.2rem' }}
              />
              <Phone size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>
              Payment Mode
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
              <button
                onClick={() => setPaymentMethod('cash')}
                style={{
                  background: paymentMethod === 'cash' ? 'var(--primary-glow)' : 'rgba(0,0,0,0.3)',
                  border: paymentMethod === 'cash' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  color: paymentMethod === 'cash' ? 'var(--primary-hover)' : 'var(--text-muted)',
                  padding: '0.4rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3rem'
                }}
              >
                <Banknote size={14} /> Cash
              </button>
              <button
                onClick={() => setPaymentMethod('upi')}
                style={{
                  background: paymentMethod === 'upi' ? 'var(--primary-glow)' : 'rgba(0,0,0,0.3)',
                  border: paymentMethod === 'upi' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  color: paymentMethod === 'upi' ? 'var(--primary-hover)' : 'var(--text-muted)',
                  padding: '0.4rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3rem'
                }}
              >
                <QrCode size={14} /> UPI
              </button>
              <button
                onClick={() => setPaymentMethod('card')}
                style={{
                  background: paymentMethod === 'card' ? 'var(--primary-glow)' : 'rgba(0,0,0,0.3)',
                  border: paymentMethod === 'card' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  color: paymentMethod === 'card' ? 'var(--primary-hover)' : 'var(--text-muted)',
                  padding: '0.4rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3rem'
                }}
              >
                <CreditCard size={14} /> Card
              </button>
            </div>
          </div>

          {/* Billing Calculation Breakdown */}
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Percent size={12} /> Discount (%):
              </span>
              <input
                type="number"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                style={{ width: '60px', padding: '0.15rem 0.4rem', fontSize: '0.8rem', textAlign: 'right' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
              <span>GST Tax (%):</span>
              <input
                type="number"
                min="0"
                max="28"
                value={taxPercent}
                onChange={(e) => setTaxPercent(e.target.value)}
                style={{ width: '60px', padding: '0.15rem 0.4rem', fontSize: '0.8rem', textAlign: 'right' }}
              />
            </div>

            <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>Grand Total:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-hover)' }}>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleCompleteOrder}
            disabled={cartItems.length === 0 || isSubmitting}
            className="btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '0.25rem' }}
          >
            {isSubmitting ? 'Processing Bill...' : 'Generate Bill & Print'}
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
