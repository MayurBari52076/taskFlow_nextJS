'use client';

import { useEffect, useState } from 'react';
import { getActivity } from '@/services/activityService';

const ACTION_LABELS = {
  task_created: { icon: '🆕', text: (a, t) => `${a} created "${t}"` },
  task_edited: { icon: '✏️', text: (a, t) => `${a} edited "${t}"` },
  subtask_completed: { icon: '☑️', text: (a, t) => `${a} completed a subtask on "${t}"` },
  file_uploaded: { icon: '📁', text: (a, t) => `${a} uploaded a file to "${t}"` },
  collaborator_joined: { icon: '🤝', text: (a, t) => `${a} joined "${t}"` },
  message_sent: { icon: '💬', text: (a, t) => `${a} sent a message in "${t}"` },
};

export default function ActivityPage() {
  const [logs, setLogs] = useState(null);

  useEffect(() => {
    getActivity().then(setLogs);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Activity</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Everything happening across your tasks.</p>
      </div>

      <div className="glass-surface" style={{ padding: '8px' }}>
        {logs === null && <p style={{ padding: '16px', color: 'var(--text-secondary)' }}>Loading…</p>}
        {logs?.length === 0 && <p style={{ padding: '16px', color: 'var(--text-secondary)' }}>No activity yet.</p>}
        {logs?.map((log) => {
          const config = ACTION_LABELS[log.action] || { icon: '🔔', text: () => log.action };
          return (
            <div
              key={log._id}
              style={{
                display: 'flex',
                gap: '10px',
                padding: '12px 16px',
                borderBottom: '1px solid var(--border-color)',
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>{config.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9rem' }}>
                  {config.text(log.actor?.name || log.actor?.email || 'Someone', log.task?.title || 'a task')}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {new Date(log.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
