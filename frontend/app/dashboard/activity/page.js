'use client';

import { useEffect, useState } from 'react';
import { FiPlusCircle, FiEdit2, FiCheckSquare, FiPaperclip, FiUserPlus, FiMessageCircle, FiBell } from 'react-icons/fi';
import { getActivity } from '@/services/activityService';

const ACTION_CONFIG = {
  task_created: { icon: FiPlusCircle, color: 'var(--accent)', text: (a, t) => `${a} created "${t}"` },
  task_edited: { icon: FiEdit2, color: 'var(--warning)', text: (a, t) => `${a} edited "${t}"` },
  subtask_completed: { icon: FiCheckSquare, color: 'var(--success)', text: (a, t) => `${a} completed a subtask on "${t}"` },
  file_uploaded: { icon: FiPaperclip, color: 'var(--accent)', text: (a, t) => `${a} uploaded a file to "${t}"` },
  collaborator_joined: { icon: FiUserPlus, color: 'var(--success)', text: (a, t) => `${a} joined "${t}"` },
  message_sent: { icon: FiMessageCircle, color: 'var(--accent)', text: (a, t) => `${a} sent a message in "${t}"` },
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
          const config = ACTION_CONFIG[log.action] || { icon: FiBell, color: 'var(--text-secondary)', text: () => log.action };
          const Icon = config.icon;
          return (
            <div
              key={log._id}
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
                padding: '12px 16px',
                borderBottom: '1px solid var(--border-color)',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--accent-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={15} color={config.color} />
              </div>
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