'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { updateProfile, changePassword } from '@/services/userService';

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [name, setName] = useState('');
  const [emailNotif, setEmailNotif] = useState(true);
  const [inAppNotif, setInAppNotif] = useState(true);
  const [profileMsg, setProfileMsg] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmailNotif(user.notificationPreferences?.email ?? true);
      setInAppNotif(user.notificationPreferences?.inApp ?? true);
    }
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    const updated = await updateProfile({
      name,
      notificationPreferences: { email: emailNotif, inApp: inAppNotif },
    });
    setUser(updated);
    setProfileMsg('Saved.');
    setTimeout(() => setProfileMsg(''), 2000);
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMsg('');
    try {
      await changePassword({ currentPassword, newPassword });
      setPasswordMsg('Password updated.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Could not update password.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '520px' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your profile, theme, and preferences.</p>
      </div>

      <form onSubmit={handleProfileSave} className="glass-surface" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h2 style={sectionTitle}>Profile</h2>

        <div>
          <label style={labelStyle}>Full name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Email</label>
          <input value={user?.email || ''} disabled style={{ ...inputStyle, opacity: 0.6 }} />
        </div>

        <div>
          <label style={labelStyle}>Notification preferences</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
            <label style={checkboxRow}>
              <input type="checkbox" checked={emailNotif} onChange={(e) => setEmailNotif(e.target.checked)} />
              Email notifications
            </label>
            <label style={checkboxRow}>
              <input type="checkbox" checked={inAppNotif} onChange={(e) => setInAppNotif(e.target.checked)} />
              In-app notifications
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button type="submit" style={buttonStyle}>Save profile</button>
          {profileMsg && <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>{profileMsg}</span>}
        </div>
      </form>

      <div className="glass-surface" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h2 style={sectionTitle}>Theme</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.9rem' }}>Currently: {theme === 'dark' ? 'Dark' : 'Light'} mode</span>
          <button onClick={toggleTheme} type="button" style={secondaryButtonStyle}>
            Switch to {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>

      <form onSubmit={handlePasswordSave} className="glass-surface" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h2 style={sectionTitle}>Password</h2>

        <div>
          <label style={labelStyle}>Current password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>New password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={inputStyle}
          />
        </div>

        {passwordError && <span style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>{passwordError}</span>}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button type="submit" style={buttonStyle}>Update password</button>
          {passwordMsg && <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>{passwordMsg}</span>}
        </div>
      </form>
    </div>
  );
}

const sectionTitle = { fontSize: '1rem', fontWeight: 700 };

const labelStyle = { fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' };

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border-color)',
  background: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
};

const checkboxRow = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' };

const buttonStyle = {
  padding: '10px 16px',
  borderRadius: 'var(--radius-sm)',
  border: 'none',
  background: 'var(--accent)',
  color: '#fff',
  fontWeight: 600,
  alignSelf: 'flex-start',
};

const secondaryButtonStyle = {
  padding: '8px 14px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border-color)',
  background: 'transparent',
  color: 'var(--text-primary)',
  fontSize: '0.85rem',
};
