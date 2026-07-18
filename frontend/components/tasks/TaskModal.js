'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

export default function TaskModal({ open, onClose, onSubmit, initialTask }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      dueDate: '',
      tags: '',
    },
  });

  useEffect(() => {
    if (initialTask) {
      reset({
        title: initialTask.title || '',
        description: initialTask.description || '',
        priority: initialTask.priority || 'medium',
        status: initialTask.status || 'pending',
        dueDate: initialTask.dueDate ? initialTask.dueDate.slice(0, 10) : '',
        tags: (initialTask.tags || []).join(', '),
      });
    } else {
      reset({ title: '', description: '', priority: 'medium', status: 'pending', dueDate: '', tags: '' });
    }
  }, [initialTask, open, reset]);

  if (!open) return null;

  const submit = (data) => {
    const tags = data.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    onSubmit({ ...data, tags, dueDate: data.dueDate || undefined });
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <form
        onSubmit={handleSubmit(submit)}
        className="glass-surface"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '28px', width: '420px', display: 'flex', flexDirection: 'column', gap: '14px' }}
      >
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{initialTask ? 'Edit Task' : 'New Task'}</h2>

        <div>
          <input
            placeholder="Title"
            {...register('title', { required: 'Title is required' })}
            style={inputStyle}
          />
          {errors.title && <span style={errorStyle}>{errors.title.message}</span>}
        </div>

        <textarea
          placeholder="Description"
          rows={3}
          {...register('description')}
          style={{ ...inputStyle, resize: 'vertical' }}
        />

        <div style={{ display: 'flex', gap: '10px' }}>
          <select {...register('priority')} style={inputStyle}>
            <option value="low">Low priority</option>
            <option value="medium">Medium priority</option>
            <option value="high">High priority</option>
          </select>

          <select {...register('status')} style={inputStyle}>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <input type="date" {...register('dueDate')} style={inputStyle} />
        <input placeholder="Tags (comma separated)" {...register('tags')} style={inputStyle} />

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button type="button" onClick={onClose} style={secondaryButtonStyle}>
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} style={buttonStyle}>
            {isSubmitting ? 'Saving…' : initialTask ? 'Save changes' : 'Create task'}
          </button>
        </div>
      </form>
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
  width: '100%',
  padding: '10px 14px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border-color)',
  background: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  fontFamily: 'inherit',
};

const buttonStyle = {
  padding: '10px 16px',
  borderRadius: 'var(--radius-sm)',
  border: 'none',
  background: 'var(--accent)',
  color: '#fff',
  fontWeight: 600,
};

const secondaryButtonStyle = {
  padding: '10px 16px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border-color)',
  background: 'transparent',
  color: 'var(--text-primary)',
};

const errorStyle = { color: 'var(--danger)', fontSize: '0.8rem' };
