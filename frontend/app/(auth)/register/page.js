'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const { setUser } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const res = await api.post('/auth/register', data);
      window.localStorage.setItem('taskflow-token', res.data.accessToken);
      setUser(res.data.user);
      router.push('/dashboard');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="glass-surface"
        style={{ padding: '40px', width: '360px', display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Create your account</h1>

        <div>
          <input
            type="text"
            placeholder="Full name"
            {...register('name', { required: 'Name is required' })}
            style={inputStyle}
          />
          {errors.name && <span style={errorStyle}>{errors.name.message}</span>}
        </div>

        <div>
          <input
            type="email"
            placeholder="Email"
            {...register('email', { required: 'Email is required' })}
            style={inputStyle}
          />
          {errors.email && <span style={errorStyle}>{errors.email.message}</span>}
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'At least 8 characters' },
            })}
            style={inputStyle}
          />
          {errors.password && <span style={errorStyle}>{errors.password.message}</span>}
        </div>

        {serverError && <span style={errorStyle}>{serverError}</span>}

        <button type="submit" disabled={isSubmitting} style={buttonStyle}>
          {isSubmitting ? 'Creating account…' : 'Register'}
        </button>

        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
          Already have an account? <a href="/login" style={{ color: 'var(--accent)' }}>Log in</a>
        </p>
      </form>
    </main>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border-color)',
  background: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
};

const buttonStyle = {
  padding: '10px 14px',
  borderRadius: 'var(--radius-sm)',
  border: 'none',
  background: 'var(--accent)',
  color: '#fff',
  fontWeight: 600,
};

const errorStyle = { color: 'var(--danger)', fontSize: '0.8rem' };
