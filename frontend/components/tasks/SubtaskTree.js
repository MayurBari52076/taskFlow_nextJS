'use client';

import { useEffect, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { getSubtasks, createSubtask, updateSubtask, deleteSubtask } from '@/services/subtaskService';
import SubtaskNode from './SubtaskNode';

export default function SubtaskTree({ taskId, onChange }) {
  const [subtasks, setSubtasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRootTitle, setNewRootTitle] = useState('');

  const load = async () => {
    setLoading(true);
    const data = await getSubtasks(taskId);
    setSubtasks(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const notifyChange = () => {
    if (onChange) onChange();
  };

  const handleAddRoot = async (e) => {
    e.preventDefault();
    if (!newRootTitle.trim()) return;
    await createSubtask({ task: taskId, title: newRootTitle.trim() });
    setNewRootTitle('');
    await load();
    notifyChange();
  };

  const handleAddChild = async (parentSubtask, title) => {
    await createSubtask({ task: taskId, parentSubtask, title });
    await load();
    notifyChange();
  };

  const handleToggle = async (id, completed) => {
    await updateSubtask(id, { completed });
    await load();
    notifyChange();
  };

  const handleDelete = async (id) => {
    await deleteSubtask(id);
    await load();
    notifyChange();
  };

  // Build depth-based children map: parentId (or 'root') -> [subtasks]
  const childrenMap = new Map();
  subtasks.forEach((s) => {
    const key = s.parentSubtask || 'root';
    if (!childrenMap.has(key)) childrenMap.set(key, []);
    childrenMap.get(key).push(s);
  });
  const roots = childrenMap.get('root') || [];

  const total = subtasks.length;
  const completed = subtasks.filter((s) => s.completed).length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {total > 0 && (
        <div>
          <div style={{ height: '6px', borderRadius: '999px', background: 'var(--accent-soft)', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent)' }} />
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {completed}/{total} complete ({progress}%)
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Loading subtasks…</p>
      ) : (
        roots.map((node) => (
          <SubtaskNode
            key={node._id}
            node={node}
            childrenMap={childrenMap}
            depth={0}
            onToggle={handleToggle}
            onAddChild={handleAddChild}
            onDelete={handleDelete}
          />
        ))
      )}

      <form onSubmit={handleAddRoot} style={{ display: 'flex', gap: '6px' }}>
        <input
          value={newRootTitle}
          onChange={(e) => setNewRootTitle(e.target.value)}
          placeholder="Add a subtask…"
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
        <button
          type="submit"
          style={{
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--accent)',
            color: '#fff',
            padding: '0 12px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <FiPlus size={14} />
        </button>
      </form>
    </div>
  );
}
