'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { acceptInvitation } from '@/services/invitationService';

export default function AcceptInvitePage() {
  const { token } = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [status, setStatus] = useState('checking'); // checking | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (loading) return;

    if (!user) {
      // Preserve the invite link so login can bounce back here
      window.localStorage.setItem('taskflow-redirect-after-login', `/invite/${token}`);
      router.replace('/login');
      return;
    }

    acceptInvitation(token)
      .then(() => {
        setStatus('success');
        setTimeout(() => router.replace('/dashboard/collaborative'), 1500);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'This invitation could not be accepted.');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, token]);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-surface" style={{ padding: '40px', textAlign: 'center', maxWidth: '400px' }}>
        {status === 'checking' && <p>Checking your invitation…</p>}
        {status === 'success' && (
          <>
            <h2 style={{ fontWeight: 700, marginBottom: '8px' }}>You're in! 🎉</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Redirecting to your collaborative tasks…</p>
          </>
        )}
        {status === 'error' && (
          <>
            <h2 style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--danger)' }}>Couldn't accept invite</h2>
            <p style={{ color: 'var(--text-secondary)' }}>{message}</p>
          </>
        )}
      </div>
    </main>
  );
}
