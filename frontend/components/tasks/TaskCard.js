'use client';

import { useState } from 'react';
import { FiCalendar, FiEdit2, FiTrash2, FiChevronDown, FiChevronUp, FiUsers, FiMessageCircle, FiPaperclip } from 'react-icons/fi';
import SubtaskTree from './SubtaskTree';
import CollaborationModal from '../collaboration/CollaborationModal';
import ChatModal from '../chat/ChatModal';
import FilesModal from '../files/FilesModal';

const PRIORITY_COLORS = {
  low: '#1fb975',
  medium: '#ffb020',
  high: '#ff5c5c',
};

const STATUS_LABELS = {
  pending: 'Pending',
  active: 'Active',
  completed: 'Completed',
};

export default function TaskCard({ task, onEdit, onDelete, onProgressChange }) {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [showCollab, setShowCollab] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showFiles, setShowFiles] = useState(false);

  return (
    <div
      className="glass-surface"
      style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{task.title}</h3>
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium,
            textTransform: 'uppercase',
          }}
        >
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{task.description}</p>
      )}

      {task.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {task.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: '0.7rem',
                padding: '2px 8px',
                borderRadius: '999px',
                background: 'var(--accent-soft)',
                color: 'var(--accent)',
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '4px',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FiCalendar size={14} />
          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
        </span>
        <span>{STATUS_LABELS[task.status] || task.status}</span>
      </div>

      {task.progress > 0 && (
        <div>
          <div style={{ height: '5px', borderRadius: '999px', background: 'var(--accent-soft)', overflow: 'hidden' }}>
            <div style={{ width: `${task.progress}%`, height: '100%', background: 'var(--accent)' }} />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginTop: '6px', alignItems: 'center' }}>
        <button onClick={() => onEdit(task)} style={iconButtonStyle} aria-label="Edit task">
          <FiEdit2 size={15} />
        </button>
        <button onClick={() => onDelete(task)} style={{ ...iconButtonStyle, color: 'var(--danger)' }} aria-label="Delete task">
          <FiTrash2 size={15} />
        </button>
        <button onClick={() => setShowCollab(true)} style={iconButtonStyle} aria-label="Manage collaborators">
          <FiUsers size={15} />
        </button>
        <button onClick={() => setShowChat(true)} style={iconButtonStyle} aria-label="Open chat">
          <FiMessageCircle size={15} />
        </button>
        <button onClick={() => setShowFiles(true)} style={iconButtonStyle} aria-label="View files">
          <FiPaperclip size={15} />
        </button>
        <button
          onClick={() => setShowSubtasks((v) => !v)}
          style={{ ...iconButtonStyle, marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
        >
          Subtasks {showSubtasks ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
        </button>
      </div>

      {showSubtasks && (
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '4px' }}>
          <SubtaskTree taskId={task._id} onChange={onProgressChange} />
        </div>
      )}

      <CollaborationModal open={showCollab} onClose={() => setShowCollab(false)} taskId={task._id} />
      <ChatModal open={showChat} onClose={() => setShowChat(false)} taskId={task._id} />
      <FilesModal open={showFiles} onClose={() => setShowFiles(false)} taskId={task._id} />
    </div>
  );
}

const iconButtonStyle = {
  border: 'none',
  background: 'transparent',
  color: 'var(--text-secondary)',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
};
