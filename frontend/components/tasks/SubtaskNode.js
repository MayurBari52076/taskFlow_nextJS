'use client';

import { useState } from 'react';
import { FiChevronRight, FiChevronDown, FiPlus, FiTrash2 } from 'react-icons/fi';

export default function SubtaskNode({ node, childrenMap, depth, onToggle, onAddChild, onDelete }) {
  const [expanded, setExpanded] = useState(true);
  const [addingChild, setAddingChild] = useState(false);
  const [childTitle, setChildTitle] = useState('');

  const children = childrenMap.get(node._id) || [];
  const hasChildren = children.length > 0;

  const submitChild = (e) => {
    e.preventDefault();
    if (!childTitle.trim()) return;
    onAddChild(node._id, childTitle.trim());
    setChildTitle('');
    setAddingChild(false);
  };

  return (
    <div style={{ marginLeft: depth > 0 ? '20px' : 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
        <button
          onClick={() => setExpanded((v) => !v)}
          style={{ border: 'none', background: 'transparent', color: 'var(--text-secondary)', visibility: hasChildren ? 'visible' : 'hidden' }}
        >
          {expanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
        </button>

        <input
          type="checkbox"
          checked={node.completed}
          onChange={(e) => onToggle(node._id, e.target.checked)}
        />

        <span
          style={{
            fontSize: '0.9rem',
            textDecoration: node.completed ? 'line-through' : 'none',
            color: node.completed ? 'var(--text-secondary)' : 'var(--text-primary)',
            flex: 1,
          }}
        >
          {node.title}
        </span>

        <button
          onClick={() => setAddingChild((v) => !v)}
          style={{ border: 'none', background: 'transparent', color: 'var(--text-secondary)' }}
          aria-label="Add subtask"
        >
          <FiPlus size={14} />
        </button>
        <button
          onClick={() => onDelete(node._id)}
          style={{ border: 'none', background: 'transparent', color: 'var(--danger)' }}
          aria-label="Delete subtask"
        >
          <FiTrash2 size={14} />
        </button>
      </div>

      {addingChild && (
        <form onSubmit={submitChild} style={{ marginLeft: '38px', display: 'flex', gap: '6px', marginBottom: '6px' }}>
          <input
            autoFocus
            value={childTitle}
            onChange={(e) => setChildTitle(e.target.value)}
            placeholder="New subtask…"
            style={{
              flex: 1,
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
            }}
          />
        </form>
      )}

      {expanded &&
        children.map((child) => (
          <SubtaskNode
            key={child._id}
            node={child}
            childrenMap={childrenMap}
            depth={depth + 1}
            onToggle={onToggle}
            onAddChild={onAddChild}
            onDelete={onDelete}
          />
        ))}
    </div>
  );
}
