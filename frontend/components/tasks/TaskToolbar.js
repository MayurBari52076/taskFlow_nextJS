'use client';

import { FiSearch } from 'react-icons/fi';

export default function TaskToolbar({ filters, onChange }) {
  const update = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div className="glass-surface" style={{ padding: '12px 16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '200px' }}>
        <FiSearch size={16} color="var(--text-secondary)" />
        <input
          value={filters.search}
          onChange={(e) => update('search', e.target.value)}
          placeholder="Search title, description, tags, subtasks…"
          style={{ ...selectStyle, border: 'none', background: 'transparent', flex: 1, padding: '4px 0' }}
        />
      </div>

      <select value={filters.status} onChange={(e) => update('status', e.target.value)} style={selectStyle}>
        <option value="">All statuses</option>
        <option value="pending">Pending</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
      </select>

      <select value={filters.priority} onChange={(e) => update('priority', e.target.value)} style={selectStyle}>
        <option value="">All priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <input
          type="checkbox"
          checked={filters.overdue}
          onChange={(e) => update('overdue', e.target.checked)}
        />
        Overdue only
      </label>

      <select value={filters.sort} onChange={(e) => update('sort', e.target.value)} style={selectStyle}>
        <option value="latest">Latest</option>
        <option value="oldest">Oldest</option>
        <option value="alphabetical">Alphabetical</option>
        <option value="dueDate">Due Date</option>
      </select>
    </div>
  );
}

const selectStyle = {
  padding: '8px 12px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border-color)',
  background: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  fontSize: '0.85rem',
};
