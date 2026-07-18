'use client';

import { useEffect, useState } from 'react';
import { FiX, FiTrash2 } from 'react-icons/fi';
import { getTask } from '@/services/taskService';
import { listInvitations, createInvitation, revokeInvitation } from '@/services/invitationService';

export default function CollaborationModal({ open, onClose, taskId }) {
  const [task, setTask] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('collaborator');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const [taskData, inviteData] = await Promise.all([getTask(taskId), listInvitations(taskId)]);
    setTask(taskData);
    setInvitations(inviteData);
  };

  useEffect(() => {
    if (open && taskId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, taskId]);

  if (!open) return null;

  const handleInvite = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) return;
    try {
      setSubmitting(true);
      await createInvitation({ task: taskId, email: email.trim(), role });
      setEmail('');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send invitation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (id) => {
    await revokeInvitation(id);
    await load();
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div
        className="glass-surface"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '28px', width: '440px', maxHeight: '80vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Collaborators</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', color: 'var(--text-secondary)' }}>
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleInvite} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="email"
            placeholder="Invite by email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
          <select value={role} onChange={(e) => setRole(e.target.value)} style={inputStyle}>
            <option value="collaborator">Collaborator</option>
            <option value="viewer">Viewer</option>
          </select>
          <button type="submit" disabled={submitting} style={buttonStyle}>
            {submitting ? '…' : 'Invite'}
          </button>
        </form>
        {error && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{error}</span>}

        <div>
          <h3 style={sectionTitle}>Current access</h3>
          {task && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={rowStyle}>
                <span>{task.owner?.name || task.owner?.email}</span>
                <span style={roleTag}>owner</span>
              </div>
              {task.collaborators?.map((c) => (
                <div key={c.user?._id} style={rowStyle}>
                  <span>{c.user?.name || c.user?.email}</span>
                  <span style={roleTag}>{c.role}</span>
                </div>
              ))}
              {task.collaborators?.length === 0 && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No collaborators yet.</p>
              )}
            </div>
          )}
        </div>

        <div>
          <h3 style={sectionTitle}>Pending invitations</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {invitations.filter((i) => i.status === 'pending').map((inv) => (
              <div key={inv._id} style={rowStyle}>
                <span>{inv.invitedEmail}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={roleTag}>{inv.role}</span>
                  <button onClick={() => handleRevoke(inv._id)} style={{ border: 'none', background: 'transparent', color: 'var(--danger)' }}>
                    <FiTrash2 size={14} />
                  </button>
                </span>
              </div>
            ))}
            {invitations.filter((i) => i.status === 'pending').length === 0 && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No pending invitations.</p>
            )}
          </div>
        </div>
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

const inputStyle = {
  padding: '10px 12px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border-color)',
  background: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  fontSize: '0.85rem',
};

const buttonStyle = {
  padding: '10px 16px',
  borderRadius: 'var(--radius-sm)',
  border: 'none',
  background: 'var(--accent)',
  color: '#fff',
  fontWeight: 600,
  fontSize: '0.85rem',
};

const sectionTitle = { fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' };

const rowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '0.85rem',
  padding: '6px 0',
  borderBottom: '1px solid var(--border-color)',
};

const roleTag = {
  fontSize: '0.7rem',
  padding: '2px 8px',
  borderRadius: '999px',
  background: 'var(--accent-soft)',
  color: 'var(--accent)',
  textTransform: 'capitalize',
};
