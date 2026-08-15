import React from 'react';
import { Printer, Download, CheckCircle2, X } from 'lucide-react';
import { api } from '../services/api';

export function InvoiceModal({ order, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const pdfDownloadUrl = api.getInvoicePdfUrl(order.id);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        maxWidth: '520px',
        width: '100%',
        background: '#1A110C',
        border: '1px solid var(--primary)',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header Actions */}
        <div style={{
          padding: '1rem',
          background: 'rgba(217, 119, 6, 0.15)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={22} color="var(--accent-green)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
              Order Checkout Successful
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Invoice Printable Content Area */}
        <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
          <div className="printable-receipt" style={{ background: '#FFF', color: '#111', padding: '1.25rem', borderRadius: '8px', fontSize: '0.85rem', fontFamily: 'monospace' }}>
            
            {/* Store Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px dashed #333', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', margin: 0 }}>CHAI POINT & BAKERY</h2>
              <div style={{ fontSize: '0.75rem', color: '#555' }}>Authentic Artisanal Tea & Snacks</div>
              <div style={{ fontSize: '0.75rem', color: '#555' }}>Tax Invoice / Cash Receipt</div>
            </div>

            {/* Bill Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span>Bill No: <strong>{order.bill_number}</strong></span>
              <span>Date: {new Date(order.created_at || Date.now()).toLocaleDateString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Customer: {order.customer_name || 'Walk-in'}</span>
              <span>Payment: <strong>{(order.payment_method || 'CASH').toUpperCase()}</strong></span>
            </div>

            {/* Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', margin: '0.75rem 0' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #333', textAlign: 'left' }}>
                  <th style={{ padding: '4px 0' }}>Item</th>
                  <th style={{ textAlign: 'center', padding: '4px 0' }}>Qty</th>
                  <th style={{ textAlign: 'right', padding: '4px 0' }}>Price</th>
                  <th style={{ textAlign: 'right', padding: '4px 0' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items && order.items.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px dashed #DDD' }}>
                    <td style={{ padding: '4px 0' }}>
                      {item.product_name}
                      {item.customization && <div style={{ fontSize: '0.7rem', color: '#666' }}>({item.customization})</div>}
                    </td>
                    <td style={{ textAlign: 'center', padding: '4px 0' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right', padding: '4px 0' }}>₹{parseFloat(item.unit_price).toFixed(2)}</td>
                    <td style={{ textAlign: 'right', padding: '4px 0' }}>₹{parseFloat(item.total_price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Calculation Totals */}
            <div style={{ borderTop: '2px dashed #333', paddingTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal:</span>
                <span>₹{parseFloat(order.subtotal).toFixed(2)}</span>
              </div>
              {parseFloat(order.discount_amount) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#B45309' }}>
                  <span>Discount:</span>
                  <span>- ₹{parseFloat(order.discount_amount).toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tax (5% GST):</span>
                <span>₹{parseFloat(order.tax_amount).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 'bold', marginTop: '0.3rem', borderTop: '1px solid #000', paddingTop: '0.3rem' }}>
                <span>Grand Total:</span>
                <span>₹{parseFloat(order.grand_total).toFixed(2)}</span>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.75rem', color: '#555' }}>
              Thank you for visiting Chai Point! Have a great day!
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div style={{
          padding: '1rem',
          background: 'rgba(0, 0, 0, 0.4)',
          borderTop: '1px solid var(--border-color)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '0.5rem'
        }}>
          <button onClick={handlePrint} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            <Printer size={16} /> Print Receipt
          </button>
          
          <a
            href={pdfDownloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.85rem', textDecoration: 'none' }}
          >
            <Download size={16} /> Download PDF
          </a>

          <button onClick={onClose} className="btn-primary" style={{ fontSize: '0.85rem' }}>
            Done / Next Bill
          </button>
        </div>
      </div>
    </div>
  );
}
