import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Coffee, ShoppingBag, BarChart3, UtensilsCrossed, LogOut, User } from 'lucide-react';

export function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      background: 'rgba(28, 18, 13, 0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0.8rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Brand Logo */}
      <Link to="/pos" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-teak) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <Coffee size={24} color="#FFF" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text-main)', margin: 0 }}>
            CHAI POINT
          </h1>
          <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 500 }}>
            POS & Billing Station
          </span>
        </div>
      </Link>

      {/* Nav Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Link
          to="/pos"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1rem',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 500,
            fontSize: '0.9rem',
            background: isActive('/pos') ? 'var(--primary-glow)' : 'transparent',
            color: isActive('/pos') ? 'var(--primary-hover)' : 'var(--text-muted)',
            border: isActive('/pos') ? '1px solid var(--border-color)' : '1px solid transparent'
          }}
        >
          <ShoppingBag size={18} />
          POS Billing
        </Link>

        <Link
          to="/orders"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1rem',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 500,
            fontSize: '0.9rem',
            background: isActive('/orders') ? 'var(--primary-glow)' : 'transparent',
            color: isActive('/orders') ? 'var(--primary-hover)' : 'var(--text-muted)',
            border: isActive('/orders') ? '1px solid var(--border-color)' : '1px solid transparent'
          }}
        >
          <Coffee size={18} />
          Orders History
        </Link>

        {isAdmin && (
          <>
            <Link
              to="/menu"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 500,
                fontSize: '0.9rem',
                background: isActive('/menu') ? 'var(--primary-glow)' : 'transparent',
                color: isActive('/menu') ? 'var(--primary-hover)' : 'var(--text-muted)',
                border: isActive('/menu') ? '1px solid var(--border-color)' : '1px solid transparent'
              }}
            >
              <UtensilsCrossed size={18} />
              Manage Menu
            </Link>

            <Link
              to="/reports"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 500,
                fontSize: '0.9rem',
                background: isActive('/reports') ? 'var(--primary-glow)' : 'transparent',
                color: isActive('/reports') ? 'var(--primary-hover)' : 'var(--text-muted)',
                border: isActive('/reports') ? '1px solid var(--border-color)' : '1px solid transparent'
              }}
            >
              <BarChart3 size={18} />
              Sales & Reports
            </Link>
          </>
        )}
      </div>

      {/* User Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textAlign: 'right' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-color)'
          }}>
            <User size={18} color="var(--primary)" />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {user?.name || 'Cashier'}
            </div>
            <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-cashier'}`}>
              {user?.role || 'cashier'}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Logout"
          className="btn-secondary"
          style={{ padding: '0.55rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <LogOut size={18} color="var(--accent-red)" />
        </button>
      </div>
    </nav>
  );
}
