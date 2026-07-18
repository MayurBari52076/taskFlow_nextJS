'use client';

import { useEffect, useRef, useState } from 'react';
import { FiX, FiSend } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { getSocket } from '@/services/socket';
import { getMessages } from '@/services/chatService';

const QUICK_EMOJIS = ['👍', '🎉', '✅', '😄', '🚀', '👀'];

export default function ChatModal({ open, onClose, taskId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [onlineCount, setOnlineCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!open || !taskId) return;

    const socket = getSocket();
    socketRef.current = socket;
    if (!socket.connected) socket.connect();

    setLoading(true);
    getMessages(taskId).then((history) => {
      setMessages(history);
      setLoading(false);
    });

    socket.emit('task:join', taskId);

    const onMessage = (message) => {
      setMessages((prev) => [...prev, message]);
      socket.emit('chat:read', { taskId, messageId: message._id });
    };
    const onTyping = ({ userId, isTyping }) => {
      if (userId === user?.id) return;
      setTypingUsers((prev) => {
        const next = new Set(prev);
        if (isTyping) next.add(userId);
        else next.delete(userId);
        return next;
      });
    };
    const onRead = ({ messageId, userId }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId && !m.readBy.includes(userId) ? { ...m, readBy: [...m.readBy, userId] } : m))
      );
    };
    const onOnlineUsers = (userIds) => setOnlineCount(userIds.length);

    socket.on('chat:message', onMessage);
    socket.on('chat:typing', onTyping);
    socket.on('chat:read', onRead);
    socket.on('task:online-users', onOnlineUsers);

    return () => {
      socket.emit('task:leave', taskId);
      socket.off('chat:message', onMessage);
      socket.off('chat:typing', onTyping);
      socket.off('chat:read', onRead);
      socket.off('task:online-users', onOnlineUsers);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, taskId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!open) return null;

  const handleTyping = (value) => {
    setDraft(value);
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit('chat:typing', { taskId, isTyping: true });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('chat:typing', { taskId, isTyping: false });
    }, 1500);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!draft.trim() || !socketRef.current) return;
    socketRef.current.emit('chat:message', { taskId, content: draft.trim() });
    setDraft('');
    socketRef.current.emit('chat:typing', { taskId, isTyping: false });
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div
        className="glass-surface"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '420px', height: '560px', display: 'flex', flexDirection: 'column', padding: '20px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Task Chat</h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {onlineCount} online
            </span>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', color: 'var(--text-secondary)' }}>
            <FiX size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
          {loading && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Loading chat…</p>}
          {!loading && messages.length === 0 && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No messages yet — say hi 👋</p>
          )}
          {messages.map((msg) => {
            const isOwn = msg.sender?._id === user?.id;
            return (
              <div key={msg._id} style={{ alignSelf: isOwn ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                {!isOwn && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                    {msg.sender?.name}
                  </div>
                )}
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: isOwn ? 'var(--accent)' : 'var(--bg-secondary)',
                    color: isOwn ? '#fff' : 'var(--text-primary)',
                    fontSize: '0.9rem',
                  }}
                >
                  {msg.content}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '2px', textAlign: isOwn ? 'right' : 'left' }}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {isOwn && msg.readBy?.length > 1 ? ' · Read' : ''}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {typingUsers.size > 0 && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '4px 0' }}>
            Someone is typing…
          </div>
        )}

        <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleTyping(draft + emoji)}
              style={{ border: 'none', background: 'transparent', fontSize: '1.1rem', padding: '2px' }}
            >
              {emoji}
            </button>
          ))}
        </div>

        <form onSubmit={sendMessage} style={{ display: 'flex', gap: '8px' }}>
          <input
            value={draft}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder="Type a message…"
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
            }}
          />
          <button
            type="submit"
            style={{
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--accent)',
              color: '#fff',
              padding: '0 14px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <FiSend size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 50,
};
