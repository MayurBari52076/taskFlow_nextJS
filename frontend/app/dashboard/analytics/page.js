'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { FiCheckSquare, FiClock, FiAlertCircle, FiTrendingUp } from 'react-icons/fi';
import { getAnalytics } from '@/services/analyticsService';
import StatCard from '@/components/dashboard/StatCard';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

export default function AnalyticsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getAnalytics().then(setData);
  }, []);

  if (!data) return <p style={{ color: 'var(--text-secondary)' }}>Loading analytics…</p>;

  const { stats, priorityBreakdown, trend } = data;

  const trendData = {
    labels: trend.map((d) => d.date.slice(5)), // MM-DD
    datasets: [
      {
        label: 'Tasks created',
        data: trend.map((d) => d.count),
        borderColor: '#6355ff',
        backgroundColor: 'rgba(99, 85, 255, 0.15)',
        tension: 0.35,
        fill: true,
      },
    ],
  };

  const priorityData = {
    labels: ['Low', 'Medium', 'High'],
    datasets: [
      {
        data: [priorityBreakdown.low, priorityBreakdown.medium, priorityBreakdown.high],
        backgroundColor: ['#1fb975', '#ffb020', '#ff5c5c'],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Analytics</h1>
        <p style={{ color: 'var(--text-secondary)' }}>How your tasks are trending.</p>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <StatCard label="Total Tasks" value={stats.total} icon={FiCheckSquare} />
        <StatCard label="Pending" value={stats.pending} icon={FiClock} />
        <StatCard label="Overdue" value={stats.overdue} icon={FiAlertCircle} />
        <StatCard label="Productivity" value={`${stats.productivity}%`} icon={FiTrendingUp} />
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div className="glass-surface" style={{ padding: '20px', flex: 2, minWidth: '320px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px' }}>Tasks created (last 14 days)</h2>
          <Line data={trendData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>

        <div className="glass-surface" style={{ padding: '20px', flex: 1, minWidth: '240px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px' }}>Priority breakdown</h2>
          <Doughnut data={priorityData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
        </div>
      </div>
    </div>
  );
}
