'use client';

import { useEffect, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { getTasks, createTask, updateTask, deleteTask } from '@/services/taskService';
import TaskCard from '@/components/tasks/TaskCard';
import TaskModal from '@/components/tasks/TaskModal';
import TaskToolbar from '@/components/tasks/TaskToolbar';

const DEFAULT_FILTERS = { search: '', status: '', priority: '', overdue: false, sort: 'latest' };

export default function MyTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const loadTasks = async (activeFilters = filters) => {
    try {
      setLoading(true);
      const params = {
        ...(activeFilters.search && { search: activeFilters.search }),
        ...(activeFilters.status && { status: activeFilters.status }),
        ...(activeFilters.priority && { priority: activeFilters.priority }),
        ...(activeFilters.overdue && { overdue: 'true' }),
        sort: activeFilters.sort,
      };
      const data = await getTasks(params);
      setTasks(data);
    } catch (err) {
      setError('Could not load tasks.');
    } finally {
      setLoading(false);
    }
  };

  // Debounce so typing in search doesn't fire a request per keystroke
  useEffect(() => {
    const timeout = setTimeout(() => loadTasks(filters), 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const openCreate = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    if (editingTask) {
      const updated = await updateTask(editingTask._id, formData);
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
    } else {
      const created = await createTask(formData);
      setTasks((prev) => [created, ...prev]);
    }
    setModalOpen(false);
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    await deleteTask(task._id);
    setTasks((prev) => prev.filter((t) => t._id !== task._id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>My Tasks</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Everything you own, in one place.</p>
        </div>
        <button
          onClick={openCreate}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: 'var(--accent)',
            color: '#fff',
            fontWeight: 600,
          }}
        >
          <FiPlus size={16} /> New Task
        </button>
      </div>

      <TaskToolbar filters={filters} onChange={setFilters} />

      {loading && <p style={{ color: 'var(--text-secondary)' }}>Loading tasks…</p>}
      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
      {!loading && tasks.length === 0 && (
        <div className="glass-surface" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No tasks match your filters.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onEdit={openEdit}
            onDelete={handleDelete}
            onProgressChange={() => loadTasks(filters)}
          />
        ))}
      </div>

      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialTask={editingTask}
      />
    </div>
  );
}
