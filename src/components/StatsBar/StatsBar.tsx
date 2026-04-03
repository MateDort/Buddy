// Global stat bar shown at the top of every room
import { useAppStore } from '../../stores/appStore'

function MiniBar({ value, color, icon }: { value: number; color: string; icon: string }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 9, color: '#4a4845', fontFamily: 'Geist Mono, monospace', letterSpacing: '0.04em' }}>
          {icon}
        </span>
        <span style={{ fontSize: 8, color: '#4a4845', fontFamily: 'Geist Mono, monospace' }}>
          {Math.round(value)}
        </span>
      </div>
      <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${Math.max(0, Math.min(100, value))}%`,
          background: color,
          borderRadius: 2,
          transition: 'width 0.6s ease',
          boxShadow: value > 20 ? `0 0 4px ${color}88` : 'none',
        }} />
      </div>
    </div>
  )
}

export function StatsBar() {
  const buddy = useAppStore((s) => s.buddy)
  if (!buddy) return null

  return (
    <div
      data-tauri-drag-region
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 16px 6px',
        borderBottom: '1px solid rgba(217,119,87,0.08)',
        background: 'rgba(13,13,11,0.6)',
        flexShrink: 0,
        cursor: 'grab',
        userSelect: 'none',
      }}
    >
      {/* Buddy name chip */}
      <span style={{
        fontSize: 9, fontFamily: 'Geist Mono, monospace',
        color: '#d97757', letterSpacing: '0.05em', flexShrink: 0,
        fontWeight: 600,
      }}>
        {buddy.name.toUpperCase()}
      </span>

      <div style={{ width: 1, height: 16, background: 'rgba(217,119,87,0.15)', flexShrink: 0 }} />

      {/* Stat bars */}
      <div style={{ flex: 1, display: 'flex', gap: 10 }}>
        <MiniBar value={buddy.hunger}    color="#e8634a" icon="🍖" />
        <MiniBar value={buddy.happiness} color="#e8da4a" icon="☀" />
        <MiniBar value={buddy.energy}    color="#4ae88a" icon="⚡" />
      </div>
    </div>
  )
}
