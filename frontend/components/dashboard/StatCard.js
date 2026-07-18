export default function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <div
      className="glass-surface"
      style={{
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flex: 1,
        minWidth: '180px',
      }}
    >
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: 'var(--radius-sm)',
          background: accent || 'var(--accent-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {Icon && <Icon size={20} color="var(--accent)" />}
      </div>
      <div>
        <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{value}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{label}</div>
      </div>
    </div>
  );
}
