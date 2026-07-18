'use client';

import { useEffect, useState } from 'react';
import { getTasks, updateTask, deleteTask } from '@/services/taskService';
import { useAuth } from '@/context/AuthContext';
import TaskCard from '@/components/tasks/TaskCard';
import TaskModal from '@/components/tasks/TaskModal';

export default function CollaborativeTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const loadTasks = async () => {
    setLoading(true);
    const all = await getTasks({ sort: 'latest' });
    const collaborative = all.filter((t) => t.owner !== user?.id && t.owner?._id !== user?.id);
    setTasks(collaborative);
    setLoading(false);
  };

  useEffect(() => {
    if (user) loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const openEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    const updated = await updateTask(editingTask._id, formData);
    setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
    setModalOpen(false);
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    try {
      await deleteTask(task._id);
      setTasks((prev) => prev.filter((t) => t._id !== task._id));
    } catch (err) {
      alert(err.response?.data?.message || 'Only the owner can delete this task.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Collaborative Tasks</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Tasks you've been invited to work on.</p>
      </div>

      {loading && <p style={{ color: 'var(--text-secondary)' }}>Loading…</p>}
      {!loading && tasks.length === 0 && (
        <div className="glass-surface" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No collaborative tasks yet — once someone invites you and you accept, it'll show up here.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        {tasks.map((task) => (
          <TaskCard key={task._id} task={task} onEdit={openEdit} onDelete={handleDelete} onProgressChange={loadTasks} />
        ))}
      </div>

      <TaskModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} initialTask={editingTask} />
    </div>
  );
}