'use client';

import Link from 'next/link';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export default function Navbar() {
  const { user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className="glass-surface"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        borderRadius: 0,
        borderLeft: 'none',
        borderRight: 'none',
        borderTop: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 48px',
      }}
    >
      <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>TaskFlow</span>

      <nav style={{ display: 'flex', gap: '28px', fontSize: '0.9rem', fontWeight: 500 }}>
        <a href="#home">Home</a>
        <a href="#features">Features</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </nav>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: '1px solid var(--border-color)',
            background: 'transparent',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {theme === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />}
        </button>

        {!loading && user && (
          <Link
            href="/dashboard"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--accent)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.9rem',
            }}
          >
            {user.name?.[0]?.toUpperCase() || 'U'}
          </Link>
        )}

        {!loading && !user && (
          <>
            <Link href="/login" style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Log in
            </Link>
            <Link
              href="/register"
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--accent)',
                color: '#fff',
              }}
            >
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}