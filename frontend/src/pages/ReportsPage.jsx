import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { TrendingUp, ShoppingBag, DollarSign, Award, Download, Calendar, CreditCard, Banknote, QrCode } from 'lucide-react';

export function ReportsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    try {
      const res = await api.getDashboardStats();
      if (res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to load report stats', err);
    } finally {
      setLoading(false);
    }
  }

  const pdfExportUrl = api.getReportPdfUrl(startDate, endDate);

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header & PDF Exporter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Store Analytics & PDF Reports
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Comprehensive sales performance, payment breakdowns, and top item insights
          </p>
        </div>

        {/* Date Filter & Export Button */}
        <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            <Calendar size={16} color="var(--primary)" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
            />
            <span style={{ color: 'var(--text-dim)' }}>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
            />
          </div>

          <a
            href={pdfExportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', textDecoration: 'none' }}
          >
            <Download size={16} /> Export PDF Report
          </a>
        </div>
      </div>

      {loading || !stats ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dim)' }}>
          Computing store metrics & generating report analytics...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Top Metrics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            
            <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <span>Total Revenue</span>
                <TrendingUp size={20} color="var(--primary-hover)" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem' }}>
                ₹{parseFloat(stats.total_revenue).toFixed(2)}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                All-time revenue generated
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-green)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <span>Total Orders</span>
                <ShoppingBag size={20} color="var(--accent-green)" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem' }}>
                {stats.total_orders}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                Bills completed
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid #3B82F6' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <span>Average Order Value</span>
                <DollarSign size={20} color="#3B82F6" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem' }}>
                ₹{parseFloat(stats.avg_order_value).toFixed(2)}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                Per ticket average
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid #EC4899' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <span>Today's Sales</span>
                <Calendar size={20} color="#EC4899" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem' }}>
                ₹{parseFloat(stats.today_revenue).toFixed(2)}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                {stats.today_orders} orders placed today
              </div>
            </div>

          </div>

          {/* Grid: Top Selling Products & Payment Mode Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            
            {/* Top Products */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={20} color="var(--primary)" /> Top Selling Menu Items
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {stats.topProducts.length === 0 ? (
                  <div style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>No sales data recorded yet</div>
                ) : (
                  stats.topProducts.map((prod, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem',
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: idx === 0 ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                          color: '#FFF',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          #{idx + 1}
                        </span>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{prod.product_name}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: 'var(--primary-hover)' }}>₹{parseFloat(prod.total_sales).toFixed(2)}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{prod.total_qty} units sold</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Payment Method Distribution */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Banknote size={20} color="var(--accent-green)" /> Payment Methods Breakdown
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {stats.paymentBreakdown.map((pm, idx) => (
                  <div key={idx} style={{
                    padding: '0.85rem',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontWeight: 600 }}>
                      <span style={{ textTransform: 'uppercase', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {pm.payment_method === 'cash' && <Banknote size={16} color="var(--accent-green)" />}
                        {pm.payment_method === 'upi' && <QrCode size={16} color="var(--primary)" />}
                        {pm.payment_method === 'card' && <CreditCard size={16} color="#3B82F6" />}
                        {pm.payment_method}
                      </span>
                      <span style={{ color: 'var(--primary-hover)' }}>₹{parseFloat(pm.total).toFixed(2)}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <span>Transactions Count: {pm.count}</span>
                      <span>{((pm.total / (stats.total_revenue || 1)) * 100).toFixed(1)}% share</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
