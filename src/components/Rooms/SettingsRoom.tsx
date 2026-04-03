import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { useAppStore } from '../../stores/appStore'

// ── Shared components ─────────────────────────────────────────────────────────

function ActionButton({ label, sub, color = '#4e2810', onClick, loading }: {
  label: string; sub?: string; color?: string; onClick: () => void; loading?: boolean
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
      <button onClick={onClick} disabled={loading} className="buddy-3d-btn" style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 14px', borderRadius: 12, width: '100%', textAlign: 'left',
        background: `linear-gradient(160deg, ${color === '#4e2810' ? '#7a4a28' : color} 0%, ${color} 100%)`,
        border: '1px solid rgba(217,119,87,0.3)',
        color: '#e8c8a8', cursor: loading ? 'wait' : 'pointer',
        opacity: loading ? 0.6 : 1,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>{label}</div>
          {sub && <div style={{ fontSize: 9, color: 'rgba(232,200,168,0.55)', fontFamily: 'Geist Mono, monospace', marginTop: 1 }}>{sub}</div>}
        </div>
        {loading && <span style={{ fontSize: 10, color: 'rgba(232,200,168,0.5)' }}>...</span>}
      </button>
    </>
  )
}

function ToggleRow({ label, sub, enabled, onToggle, loading }: {
  label: string; sub?: string; enabled: boolean; onToggle: () => void; loading?: boolean
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
      background: 'rgba(26,24,20,0.9)', borderBottom: '1px solid rgba(217,119,87,0.06)',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: '#c8c4bc', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: '#4a4845', fontFamily: 'Geist Mono, monospace', marginTop: 1 }}>{sub}</div>}
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
      <div style={{ fontSize: 9, fontFamily: 'Geist Mono, monospace', color: '#4a4845', letterSpacing: '0.1em', marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ borderRadius: 12, border: '1px solid rgba(217,119,87,0.1)', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  )
}

function BackHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 16px 8px',
      borderBottom: '1px solid rgba(217,119,87,0.08)',
      background: 'rgba(13,13,11,0.5)',
      flexShrink: 0,
    }}>
      <button
        onClick={onBack}
        style={{
          width: 28, height: 28, borderRadius: 8, background: 'rgba(38,36,32,0.8)',
          border: '1px solid rgba(217,119,87,0.18)', color: '#87867f',
          fontSize: 13, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        ←
      </button>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#c8c4bc', fontFamily: 'DM Sans, sans-serif' }}>
        {title}
      </span>
    </div>
  )
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface McpServer {
  name: string
  disabled: boolean
  command?: string
  description?: string
}

type SettingsPage = 'main' | 'mcp' | 'skills'

// ── MCP Servers Page ──────────────────────────────────────────────────────────

function McpPage({ onBack }: { onBack: () => void }) {
  const setRoom = useAppStore((s) => s.setRoom)
  const [servers, setServers] = useState<McpServer[]>([])
  const [loading, setLoading] = useState<string | null>(null)

  useEffect(() => {
    invoke<Record<string, { disabled?: boolean; command?: string; description?: string }>>('read_mcp_servers')
      .then((data) => setServers(Object.entries(data).map(([name, cfg]) => ({
        name, disabled: cfg.disabled === true, command: cfg.command, description: cfg.description,
      })))
      ).catch(() => setServers([]))
  }, [])

  const toggleMcp = async (name: string, currentlyDisabled: boolean) => {
    setLoading(name)
    try {
      await invoke('toggle_mcp_server', { serverName: name, disabled: !currentlyDisabled })
      setServers((prev) => prev.map((s) => s.name === name ? { ...s, disabled: !currentlyDisabled } : s))
    } catch { /* ignore */ }
    setLoading(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <BackHeader title="MCP Servers" onBack={onBack} />
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', padding: '16px 16px 24px' }}>
        {servers.length === 0 ? (
          <div style={{
            padding: '32px 16px', textAlign: 'center',
            fontSize: 11, color: '#4a4845', fontFamily: 'Geist Mono, monospace',
          }}>
            no MCP servers configured
            <div style={{ marginTop: 8, fontSize: 10, color: '#3a3835', lineHeight: 1.6 }}>
              Add servers to ~/.claude/settings.json<br />
              or ~/.claude/mcp-configs/mcp-servers.json
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {servers.map((s) => (
              <div key={s.name} style={{
                borderRadius: 12, border: '1px solid rgba(217,119,87,0.1)',
                overflow: 'hidden',
              }}>
                {/* Header row */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'rgba(26,24,20,0.9)',
                  borderBottom: '1px solid rgba(217,119,87,0.06)',
                }}>
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
                  <button
                    onClick={() => toggleMcp(s.name, s.disabled)}
                    disabled={loading === s.name}
                    style={{
                      width: 38, height: 22, borderRadius: 11, flexShrink: 0,
                      background: !s.disabled ? '#d97757' : 'rgba(74,72,69,0.4)',
                      border: 'none', cursor: 'pointer', position: 'relative',
                      transition: 'background 0.2s',
                      boxShadow: !s.disabled ? '0 0 8px rgba(217,119,87,0.35)' : 'none',
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: 2, left: !s.disabled ? 18 : 2,
                      width: 18, height: 18, borderRadius: '50%', background: 'white',
                      transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                    }} />
                  </button>
                </div>
                {/* Open in chat */}
                <div style={{ padding: '8px 10px', background: 'rgba(20,18,14,0.8)' }}>
                  <ActionButton
                    label={`Open ${s.name} in chat`}
                    sub={`/mcp ${s.name}`}
                    onClick={() => {
                      sessionStorage.setItem('pending-command', `/mcp ${s.name}`)
                      setRoom('office')
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Skills Page ───────────────────────────────────────────────────────────────

function SkillsPage({ onBack }: { onBack: () => void }) {
  const setRoom = useAppStore((s) => s.setRoom)
  const [skills, setSkills] = useState<string[]>([])
  const [running, setRunning] = useState<string | null>(null)

  useEffect(() => {
    invoke<string[]>('list_skills').then(setSkills).catch(() => setSkills([]))
  }, [])

  const runSkill = (name: string) => {
    setRunning(name)
    sessionStorage.setItem('pending-command', `/${name}`)
    setRoom('office')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <BackHeader title={`Skills ${skills.length > 0 ? `· ${skills.length}` : ''}`} onBack={onBack} />
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', padding: '16px 16px 24px' }}>
        {skills.length === 0 ? (
          <div style={{
            padding: '32px 16px', textAlign: 'center',
            fontSize: 11, color: '#4a4845', fontFamily: 'Geist Mono, monospace',
          }}>
            no skills installed
            <div style={{ marginTop: 8, fontSize: 10, color: '#3a3835', lineHeight: 1.6 }}>
              Install skills to ~/.claude/skills/<br />
              then they'll appear here
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {skills.map((s) => (
              <ActionButton
                key={s}
                label={`/${s}`}
                sub="run in office chat"
                loading={running === s}
                onClick={() => runSkill(s)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Settings Page ────────────────────────────────────────────────────────

function MainPage({ onNavigate }: { onNavigate: (page: SettingsPage) => void }) {
  const buddy = useAppStore((s) => s.buddy)
  const [buddyEnabled, setBuddyEnabled] = useState(true)
  const [buddyLoading, setBuddyLoading] = useState(false)

  const toggleBuddy = async () => {
    setBuddyLoading(true)
    try {
      await invoke('send_message', { message: buddyEnabled ? '/buddy off' : '/buddy on' })
      setBuddyEnabled(!buddyEnabled)
    } catch { /* ignore */ }
    setBuddyLoading(false)
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

      {/* Navigation to sub-pages */}
      <Section title="TOOLS">
        <div style={{ padding: '10px 10px', background: 'rgba(26,24,20,0.9)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button
            onClick={() => onNavigate('mcp')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '11px 14px', borderRadius: 10,
              background: 'rgba(38,36,32,0.6)',
              border: '1px solid rgba(217,119,87,0.14)',
              color: '#c8c4bc', cursor: 'pointer', textAlign: 'left',
            }}
          >
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>MCP Servers</div>
              <div style={{ fontSize: 10, color: '#4a4845', fontFamily: 'Geist Mono, monospace', marginTop: 1 }}>
                Manage connected tools
              </div>
            </div>
            <span style={{ fontSize: 16, color: '#4a4845' }}>›</span>
          </button>
          <button
            onClick={() => onNavigate('skills')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '11px 14px', borderRadius: 10,
              background: 'rgba(38,36,32,0.6)',
              border: '1px solid rgba(217,119,87,0.14)',
              color: '#c8c4bc', cursor: 'pointer', textAlign: 'left',
            }}
          >
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>Skills</div>
              <div style={{ fontSize: 10, color: '#4a4845', fontFamily: 'Geist Mono, monospace', marginTop: 1 }}>
                Run installed Claude Code skills
              </div>
            </div>
            <span style={{ fontSize: 16, color: '#4a4845' }}>›</span>
          </button>
        </div>
      </Section>

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

// ── Root ──────────────────────────────────────────────────────────────────────

export function SettingsRoom() {
  const [page, setPage] = useState<SettingsPage>('main')

  if (page === 'mcp') return <McpPage onBack={() => setPage('main')} />
  if (page === 'skills') return <SkillsPage onBack={() => setPage('main')} />
  return <MainPage onNavigate={setPage} />
}
