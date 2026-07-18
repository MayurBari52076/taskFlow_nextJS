'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiGrid,
  FiCheckSquare,
  FiUsers,
  FiActivity,
  FiBarChart2,
  FiSettings,
  FiLogOut,
} from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: FiGrid },
  { href: '/dashboard/tasks', label: 'My Tasks', icon: FiCheckSquare },
  { href: '/dashboard/collaborative', label: 'Collaborative Tasks', icon: FiUsers },
  { href: '/dashboard/activity', label: 'Activity', icon: FiActivity },
  { href: '/dashboard/analytics', label: 'Analytics', icon: FiBarChart2 },
  { href: '/dashboard/settings', label: 'Settings', icon: FiSettings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside
      className="glass-surface"
      style={{
        width: '240px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        borderRadius: 0,
        borderRight: '1px solid var(--border-color)',
      }}
    >
      <div style={{ fontSize: '1.25rem', fontWeight: 800, padding: '0 8px', marginBottom: '32px' }}>
        TaskFlow
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                background: active ? 'var(--accent-soft)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--text-primary)',
                fontWeight: active ? 600 : 500,
                fontSize: '0.9rem',
              }}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={logout}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 12px',
          borderRadius: 'var(--radius-sm)',
          border: 'none',
          background: 'transparent',
          color: 'var(--danger)',
          fontWeight: 500,
          fontSize: '0.9rem',
        }}
      >
        <FiLogOut size={18} />
        Logout
      </button>
    </aside>
  );
}
