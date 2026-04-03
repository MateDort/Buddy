import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { useAppStore } from '../../stores/appStore'

// ── 3D button (same style as Type/Record) ────────────────────────────────────

function ActionButton({
  label,
  sub,
  color = '#4e2810',
  onClick,
  loading,
}: {
  label: string
  sub?: string
  color?: string
  onClick: () => void
  loading?: boolean
}) {
  return (
    <>
      <style>{`
        .buddy-3d-btn {
          box-shadow: 0 1px 0 rgba(255,255,255,0.1) inset, 0 4px 0 #1a0a04, 0 6px 14px rgba(0,0,0,0.45);
          transform: translateY(0);
          transition: box-shadow 0.08s, transform 0.08s;
        }
        .buddy-3d-btn:active:not(:disabled) {
          box-shadow: 0 1px 0 rgba(255,255,255,0.06) inset, 0 1px 0 #1a0a04, 0 2px 6px rgba(0,0,0,0.35);
          transform: translateY(3px);
        }
      `}</style>
      <button
        onClick={onClick}
        disabled={loading}
        className="buddy-3d-btn"
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px',
          borderRadius: 12, width: '100%', textAlign: 'left',
          background: `linear-gradient(160deg, ${color === '#4e2810' ? '#7a4a28' : color} 0%, ${color} 100%)`,
          border: '1px solid rgba(217,119,87,0.3)',
          color: '#e8c8a8', cursor: loading ? 'wait' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.01em' }}>
            {label}
          </div>
          {sub && (
            <div style={{ fontSize: 9, color: 'rgba(232,200,168,0.55)', fontFamily: 'Geist Mono, monospace', marginTop: 1 }}>
              {sub}
            </div>
          )}
        </div>
        {loading && <span style={{ fontSize: 10, color: 'rgba(232,200,168,0.5)' }}>...</span>}
      </button>
    </>
  )
}

// ── Toggle row ───────────────────────────────────────────────────────────────

function ToggleRow({ label, sub, enabled, onToggle, loading }: {
  label: string; sub?: string; enabled: boolean; onToggle: () => void; loading?: boolean
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
      background: 'rgba(26,24,20,0.9)',
      borderBottom: '1px solid rgba(217,119,87,0.06)',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: '#c8c4bc', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>
          {label}
        </div>
        {sub && (
          <div style={{ fontSize: 10, color: '#4a4845', fontFamily: 'Geist Mono, monospace', marginTop: 1 }}>
            {sub}
          </div>
        )}
      </div>
      <button onClick={onToggle} disabled={loading} style={{
        width: 42, height: 24, borderRadius: 12,
        background: enabled ? '#d97757' : 'rgba(74,72,69,0.4)',
        border: 'none', cursor: loading ? 'wait' : 'pointer',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
        boxShadow: enabled ? '0 0 8px rgba(217,119,87,0.35)' : 'none',
      }}>
        <div style={{
          position: 'absolute', top: 3, left: enabled ? 21 : 3,
          width: 18, height: 18, borderRadius: '50%', background: 'white',
          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
        }} />
      </button>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '11px 14px', background: 'rgba(26,24,20,0.9)',
      borderBottom: '1px solid rgba(217,119,87,0.06)',
    }}>
      <span style={{ fontSize: 12, color: '#c8c4bc', fontFamily: 'DM Sans, sans-serif' }}>{label}</span>
      <span style={{ fontSize: 11, color: '#87867f', fontFamily: 'Geist Mono, monospace' }}>{value}</span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontSize: 9, fontFamily: 'Geist Mono, monospace', color: '#4a4845',
        letterSpacing: '0.1em', marginBottom: 8,
      }}>
        {title}
      </div>
      <div style={{ borderRadius: 12, border: '1px solid rgba(217,119,87,0.1)', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

interface McpServer {
  name: string
  disabled: boolean
  command?: string
  description?: string
}

export function SettingsRoom() {
  const buddy = useAppStore((s) => s.buddy)
  const setRoom = useAppStore((s) => s.setRoom)

  const [mcpServers, setMcpServers] = useState<McpServer[]>([])
  const [skills, setSkills] = useState<string[]>([])
  const [buddyEnabled, setBuddyEnabled] = useState(true)
  const [buddyLoading, setBuddyLoading] = useState(false)
  const [mcpLoading, setMcpLoading] = useState<string | null>(null)
  const [runningSkill, setRunningSkill] = useState<string | null>(null)

  useEffect(() => {
    invoke<Record<string, { disabled?: boolean; command?: string; description?: string }>>('read_mcp_servers')
      .then((servers) => {
        setMcpServers(Object.entries(servers).map(([name, cfg]) => ({
          name, disabled: cfg.disabled === true,
          command: cfg.command, description: cfg.description,
        })))
      })
      .catch(() => setMcpServers([]))

    invoke<string[]>('list_skills').then(setSkills).catch(() => setSkills([]))
  }, [])

  const toggleBuddy = async () => {
    setBuddyLoading(true)
    try {
      await invoke('send_message', { message: buddyEnabled ? '/buddy off' : '/buddy on' })
      setBuddyEnabled(!buddyEnabled)
    } catch { /* ignore */ }
    setBuddyLoading(false)
  }

  const toggleMcp = async (serverName: string, currentlyDisabled: boolean) => {
    setMcpLoading(serverName)
    try {
      await invoke('toggle_mcp_server', { serverName, disabled: !currentlyDisabled })
      setMcpServers((prev) =>
        prev.map((s) => s.name === serverName ? { ...s, disabled: !currentlyDisabled } : s)
      )
    } catch { /* ignore */ }
    setMcpLoading(null)
  }

  // Run a skill: navigate to Office and send the /skill command
  const runSkill = (skillName: string) => {
    setRunningSkill(skillName)
    // Store the pending command so OfficeRoom picks it up
    sessionStorage.setItem('pending-command', `/${skillName}`)
    setRoom('office')
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', padding: '16px 16px 24px' }}>

      {/* Buddy info */}
      <Section title="BUDDY">
        <InfoRow label="Name" value={buddy?.name ?? '—'} />
        <InfoRow label="Species" value={buddy?.species ?? '—'} />
        <InfoRow label="Stage" value={buddy?.stage ?? '—'} />
        <InfoRow label="XP" value={String(buddy?.xp ?? 0)} />
        <ToggleRow
          label="Buddy active"
          sub="Enables buddy features in Claude Code"
          enabled={buddyEnabled}
          onToggle={toggleBuddy}
          loading={buddyLoading}
        />
      </Section>

      {/* MCP servers */}
      <Section title="MCP SERVERS">
        {mcpServers.length === 0 ? (
          <div style={{
            padding: '16px 14px', background: 'rgba(26,24,20,0.9)',
            fontSize: 11, color: '#4a4845', fontFamily: 'Geist Mono, monospace', textAlign: 'center',
          }}>
            no MCP servers configured
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {mcpServers.map((s, i) => (
              <div key={s.name} style={{
                padding: '10px 14px', background: 'rgba(26,24,20,0.9)',
                borderBottom: i < mcpServers.length - 1 ? '1px solid rgba(217,119,87,0.06)' : 'none',
                display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#c8c4bc', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>
                      {s.name}
                    </div>
                    {s.description && (
                      <div style={{ fontSize: 10, color: '#4a4845', fontFamily: 'Geist Mono, monospace', marginTop: 1 }}>
                        {s.description}
                      </div>
                    )}
                  </div>
                  {/* Enable/disable toggle */}
                  <button onClick={() => toggleMcp(s.name, s.disabled)} disabled={mcpLoading === s.name} style={{
                    width: 38, height: 22, borderRadius: 11,
                    background: !s.disabled ? '#d97757' : 'rgba(74,72,69,0.4)',
                    border: 'none', cursor: 'pointer', position: 'relative',
                    transition: 'background 0.2s', flexShrink: 0,
                    boxShadow: !s.disabled ? '0 0 8px rgba(217,119,87,0.35)' : 'none',
                  }}>
                    <div style={{
                      position: 'absolute', top: 2, left: !s.disabled ? 18 : 2,
                      width: 18, height: 18, borderRadius: '50%', background: 'white',
                      transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                    }} />
                  </button>
                </div>
                {/* Open in Office button */}
                <ActionButton
                  label={`Open ${s.name} in chat`}
                  sub={`/mcp ${s.name}`}
                  onClick={() => {
                    sessionStorage.setItem('pending-command', `/mcp ${s.name}`)
                    setRoom('office')
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Skills */}
      {skills.length > 0 && (
        <Section title={`INSTALLED SKILLS  ·  ${skills.length}`}>
          <div style={{
            padding: '10px 10px',
            background: 'rgba(26,24,20,0.9)',
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            {skills.map((s) => (
              <ActionButton
                key={s}
                label={`/${s}`}
                sub={`run in office chat`}
                loading={runningSkill === s}
                onClick={() => runSkill(s)}
              />
            ))}
          </div>
        </Section>
      )}

      {/* Claude Code info */}
      <Section title="CLAUDE CODE">
        <InfoRow label="Backend" value="claude CLI" />
        <InfoRow label="Auth" value="via Claude Code session" />
        <div style={{
          padding: '11px 14px', background: 'rgba(26,24,20,0.9)',
          fontSize: 11, color: '#4a4845', fontFamily: 'Geist Mono, monospace', lineHeight: 1.6,
        }}>
          Run <span style={{ color: '#d97757' }}>claude</span> in terminal to manage auth and models.
        </div>
      </Section>
    </div>
  )
}
