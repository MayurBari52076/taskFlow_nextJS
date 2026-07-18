'use client';

import { useEffect, useRef, useState } from 'react';
import { FiX, FiDownload, FiTrash2, FiUpload, FiFile } from 'react-icons/fi';
import { listFiles, uploadFile, deleteFile } from '@/services/fileService';

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function FilesModal({ open, onClose, taskId }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const load = async () => {
    setLoading(true);
    const data = await listFiles(taskId);
    setFiles(data);
    setLoading(false);
  };

  useEffect(() => {
    if (open && taskId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, taskId]);

  if (!open) return null;

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    try {
      setUploading(true);
      const uploaded = await uploadFile(taskId, file);
      setFiles((prev) => [uploaded, ...prev]);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id) => {
    await deleteFile(id);
    setFiles((prev) => prev.filter((f) => f._id !== id));
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div
        className="glass-surface"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '440px', maxHeight: '80vh', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Files</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', color: 'var(--text-secondary)' }}>
            <FiX size={20} />
          </button>
        </div>

        <input ref={inputRef} type="file" onChange={handleFileSelect} style={{ display: 'none' }} />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px dashed var(--border-color)',
            background: 'transparent',
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
          }}
        >
          <FiUpload size={16} /> {uploading ? 'Uploading…' : 'Upload a file'}
        </button>
        {error && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{error}</span>}

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {loading && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Loading files…</p>}
          {!loading && files.length === 0 && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No files yet.</p>
          )}
          {files.map((file) => (
            <div key={file._id} style={rowStyle}>
              <FiFile size={18} color="var(--text-secondary)" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {file.originalName}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  {file.uploadedBy?.name} · {formatSize(file.size)} · {new Date(file.createdAt).toLocaleDateString()}
                </div>
              </div>
              <a href={file.url} target="_blank" rel="noopener noreferrer" style={iconLinkStyle} aria-label="Download">
                <FiDownload size={15} />
              </a>
              <button onClick={() => handleDelete(file._id)} style={{ ...iconLinkStyle, color: 'var(--danger)' }} aria-label="Delete">
                <FiTrash2 size={15} />
              </button>
            </div>
          ))}
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

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '8px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border-color)',
};

const iconLinkStyle = {
  border: 'none',
  background: 'transparent',
  color: 'var(--text-secondary)',
  display: 'flex',
  alignItems: 'center',
};
