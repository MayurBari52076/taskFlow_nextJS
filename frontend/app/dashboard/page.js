'use client';

import { useEffect, useState } from 'react';
import { FiCheckSquare, FiClock, FiAlertCircle, FiTrendingUp } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { getAnalytics } from '@/services/analyticsService';
import StatCard from '@/components/dashboard/StatCard';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getAnalytics().then((data) => setStats(data.stats));
  }, []);

  const statCards = [
    { label: 'Total Tasks', value: stats ? stats.total : '—', icon: FiCheckSquare },
    { label: 'Pending', value: stats ? stats.pending : '—', icon: FiClock },
    { label: 'Overdue', value: stats ? stats.overdue : '—', icon: FiAlertCircle },
    { label: 'Productivity', value: stats ? `${stats.productivity}%` : '—', icon: FiTrendingUp },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Welcome back{user?.name ? `, ${user.name}` : ''}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Here's what's happening across your tasks.</p>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="glass-surface" style={{ padding: '20px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px' }}>Recent Activity</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          See the full picture on the <a href="/dashboard/activity" style={{ color: 'var(--accent)' }}>Activity</a> page.
        </p>
      </div>
    </div>
  );
}