'use client';

import { useEffect, useRef, useState } from 'react';
import { FiBell } from 'react-icons/fi';
import { getSocket } from '@/services/socket';
import { listNotifications, markNotificationRead, markAllNotificationsRead } from '@/services/notificationService';

const TYPE_LABELS = {
  invitation: '🤝',
  message: '💬',
  file_upload: '📁',
  task_completed: '✅',
  task_assigned: '📌',
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    listNotifications().then((res) => {
      setNotifications(res.data);
      setUnreadCount(res.unreadCount);
    });

    const socket = getSocket();
    if (!socket.connected) socket.connect();

    const onNew = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };
    socket.on('notification:new', onNew);

    return () => socket.off('notification:new', onNew);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = async (notification) => {
    if (!notification.read) {
      await markNotificationRead(notification._id);
      setNotifications((prev) => prev.map((n) => (n._id === notification._id ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{ position: 'relative', border: 'none', background: 'transparent', color: 'var(--text-primary)', padding: '6px' }}
        aria-label="Notifications"
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              background: 'var(--danger)',
              color: '#fff',
              fontSize: '0.65rem',
              fontWeight: 700,
              borderRadius: '999px',
              minWidth: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 3px',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="glass-surface"
          style={{
            position: 'absolute',
            right: 0,
            top: '36px',
            width: '340px',
            maxHeight: '420px',
            overflowY: 'auto',
            padding: '12px',
            zIndex: 40,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Notifications</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAll} style={{ border: 'none', background: 'transparent', color: 'var(--accent)', fontSize: '0.75rem' }}>
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '8px 0' }}>You're all caught up.</p>
          )}

          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => handleItemClick(n)}
              style={{
                display: 'flex',
                gap: '8px',
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                background: n.read ? 'transparent' : 'var(--accent-soft)',
                cursor: 'pointer',
                marginBottom: '4px',
              }}
            >
              <span style={{ fontSize: '1rem' }}>{TYPE_LABELS[n.type] || '🔔'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8rem' }}>{n.message}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  {new Date(n.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
