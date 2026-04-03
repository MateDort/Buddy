import { useRef, useState, useEffect, useCallback } from 'react'
import { invoke } from '@tauri-apps/api/core'

type InputMode = 'idle' | 'typing' | 'recording' | 'recorded' | 'mic-error'

interface Props {
  onSendText: (text: string) => void
  onSendVoice: (blob: Blob, transcript?: string) => void
  disabled?: boolean
}

const BAR_COUNT = 40
const TEAL = '#1aa087'
const CORAL = '#d97757'
const RED = '#d14f4f'

// ─── Builtin Claude Code slash commands ───────────────────────────────────────
interface SlashCommand {
  name: string
  description: string
  category: 'builtin' | 'skill' | 'mcp'
}

const BUILTIN_COMMANDS: SlashCommand[] = [
  { name: 'help',        description: 'Show available commands',        category: 'builtin' },
  { name: 'clear',       description: 'Clear conversation history',     category: 'builtin' },
  { name: 'model',       description: 'Switch Claude model',            category: 'builtin' },
  { name: 'compact',     description: 'Compact conversation memory',    category: 'builtin' },
  { name: 'memory',      description: 'Show project memory',            category: 'builtin' },
  { name: 'mcp',         description: 'List MCP tools & servers',       category: 'builtin' },
  { name: 'status',      description: 'Show session status',            category: 'builtin' },
  { name: 'config',      description: 'View/edit configuration',        category: 'builtin' },
  { name: 'cost',        description: 'Show session token cost',        category: 'builtin' },
  { name: 'doctor',      description: 'Run system health check',        category: 'builtin' },
  { name: 'review',      description: 'Review uncommitted changes',     category: 'builtin' },
  { name: 'bug',         description: 'Report a bug to Anthropic',      category: 'builtin' },
  { name: 'permissions', description: 'View tool permissions',          category: 'builtin' },
  { name: 'todo',        description: 'View and manage tasks',          category: 'builtin' },
  { name: 'init',        description: 'Initialize CLAUDE.md for project', category: 'builtin' },
  { name: 'login',       description: 'Log in to Claude',               category: 'builtin' },
  { name: 'logout',      description: 'Log out of Claude',              category: 'builtin' },
  { name: 'pr-comments', description: 'Show PR comments on current branch', category: 'builtin' },
  { name: 'release-notes', description: 'Show Claude Code release notes', category: 'builtin' },
  { name: 'vim',         description: 'Toggle vim keybindings',         category: 'builtin' },
]

const CATEGORY_COLOR: Record<SlashCommand['category'], string> = {
  builtin: '#4a4845',
  skill:   '#d97757',
  mcp:     '#2d9e6b',
}

// ─── Waveform canvas ──────────────────────────────────────────────────────────
function WaveformCanvas({
  analyser,
  barHeights,
  isLive,
  playProgress = 0,
}: {
  analyser?: AnalyserNode
  barHeights?: number[]
  isLive: boolean
  playProgress?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const dataRef = useRef<Uint8Array | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const dpr = window.devicePixelRatio || 1
    const W = canvas.offsetWidth
    const H = canvas.offsetHeight
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.scale(dpr, dpr)

    if (!isLive) {
      const bars = barHeights ?? []
      const gap = 2
      const barW = Math.max(2, (W - gap * (bars.length - 1)) / bars.length)
      const splitIdx = Math.floor(bars.length * playProgress)
      ctx.clearRect(0, 0, W, H)
      bars.forEach((h, i) => {
        const x = i * (barW + gap)
        const bh = Math.max(3, h * H)
        const y = (H - bh) / 2
        ctx.fillStyle = i < splitIdx ? TEAL : 'rgba(74,72,69,0.6)'
        ctx.beginPath()
        ctx.roundRect(x, y, barW, bh, barW / 2)
        ctx.fill()
      })
      return
    }

    if (!analyser) return
    dataRef.current = new Uint8Array(analyser.frequencyBinCount)

    const draw = () => {
      analyser.getByteFrequencyData(dataRef.current!)
      ctx.clearRect(0, 0, W, H)
      const gap = 2
      const barW = Math.max(2, (W - gap * (BAR_COUNT - 1)) / BAR_COUNT)
      const step = Math.floor(dataRef.current!.length / BAR_COUNT)

      for (let i = 0; i < BAR_COUNT; i++) {
        const val = dataRef.current![i * step] / 255
        const minH = 3
        const bh = minH + val * (H - minH)
        const x = i * (barW + gap)
        const y = (H - bh) / 2
        const alpha = 0.4 + (i / BAR_COUNT) * 0.6
        ctx.fillStyle = `rgba(217,119,87,${alpha})`
        ctx.beginPath()
        ctx.roundRect(x, y, barW, bh, barW / 2)
        ctx.fill()
      }
      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [analyser, isLive, barHeights, playProgress])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block', cursor: isLive ? 'default' : 'pointer' }}
    />
  )
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// ─── Main component ────────────────────────────────────────────────────────────
export function VoiceInput({ onSendText, onSendVoice, disabled = false }: Props) {
  const [mode, setMode] = useState<InputMode>('idle')
  const [text, setText] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [playProgress, setPlayProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [savedBars, setSavedBars] = useState<number[]>([])

  // Slash command palette
  const [allCommands, setAllCommands] = useState<SlashCommand[]>(BUILTIN_COMMANDS)
  const [showPalette, setShowPalette] = useState(false)
  const [paletteIdx, setPaletteIdx] = useState(0)
  const paletteRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load skills + MCP servers once for the palette
  useEffect(() => {
    Promise.all([
      invoke<string[]>('list_skills').catch(() => [] as string[]),
      invoke<Record<string, unknown>>('read_mcp_servers').catch(() => ({})),
    ]).then(([skills, mcp]) => {
      const skillCmds: SlashCommand[] = skills.map((s) => ({
        name: s, description: 'Run skill in chat', category: 'skill',
      }))
      const mcpCmds: SlashCommand[] = Object.keys(mcp).map((s) => ({
        name: `mcp__${s}`, description: `Use ${s} MCP tools`, category: 'mcp',
      }))
      setAllCommands([...BUILTIN_COMMANDS, ...skillCmds, ...mcpCmds])
    })
  }, [])

  // Compute filtered commands based on text after `/`
  const slashFilter = text.startsWith('/') ? text.slice(1).toLowerCase() : ''
  const filteredCmds = showPalette
    ? allCommands.filter((c) => c.name.toLowerCase().startsWith(slashFilter)).slice(0, 8)
    : []

  // Handle text changes — show palette when starts with /
  const handleTextChange = (val: string) => {
    setText(val)
    if (val.startsWith('/')) {
      setShowPalette(true)
      setPaletteIdx(0)
    } else {
      setShowPalette(false)
    }
  }

  const selectCommand = useCallback((cmd: SlashCommand) => {
    setText(`/${cmd.name} `)
    setShowPalette(false)
    textareaRef.current?.focus()
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showPalette && filteredCmds.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setPaletteIdx((i) => Math.min(i + 1, filteredCmds.length - 1))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setPaletteIdx((i) => Math.max(i - 1, 0))
        return
      }
      if (e.key === 'Tab' || (e.key === 'Enter' && showPalette)) {
        e.preventDefault()
        selectCommand(filteredCmds[paletteIdx])
        return
      }
      if (e.key === 'Escape') {
        setShowPalette(false)
        return
      }
    }
    if (e.key === 'Enter' && !e.shiftKey && !showPalette) {
      e.preventDefault()
      sendText()
    }
  }, [showPalette, filteredCmds, paletteIdx, selectCommand])

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const audioBlobRef = useRef<Blob | null>(null)
  const audioElRef = useRef<HTMLAudioElement | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const barSnapshotRef = useRef<number[]>([])

  const snapshotBars = useCallback(() => {
    if (!analyserRef.current) return
    const data = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(data)
    const step = Math.floor(data.length / BAR_COUNT)
    barSnapshotRef.current = Array.from({ length: BAR_COUNT }, (_, i) => data[i * step] / 255)
  }, [])

  const startRecording = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setMode('mic-error')
        return
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 }
      })
      streamRef.current = stream

      const ctx = new AudioContext()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      const source = ctx.createMediaStreamSource(stream)
      source.connect(analyser)
      audioCtxRef.current = ctx
      analyserRef.current = analyser

      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        audioBlobRef.current = blob
        setSavedBars([...barSnapshotRef.current])
        setMode('recorded')
        setIsPlaying(false)
        setPlayProgress(0)
      }
      recorder.start()
      mediaRecorderRef.current = recorder

      setElapsed(0)
      setMode('recording')

      timerRef.current = setInterval(() => {
        setElapsed((t) => t + 1)
        snapshotBars()
      }, 1000)
    } catch (err) {
      console.error('Microphone error:', err)
      setMode('mic-error')
    }
  }, [snapshotBars])

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    mediaRecorderRef.current?.stop()
    streamRef.current?.getTracks().forEach((t) => t.stop())
    audioCtxRef.current?.close()
    analyserRef.current = null
  }, [])

  const deleteRecording = useCallback(() => {
    audioBlobRef.current = null
    audioElRef.current?.pause()
    audioElRef.current = null
    setSavedBars([])
    setElapsed(0)
    setPlayProgress(0)
    setIsPlaying(false)
    setMode('idle')
  }, [])

  const togglePlayback = useCallback(() => {
    if (!audioBlobRef.current) return
    if (!audioElRef.current) {
      const url = URL.createObjectURL(audioBlobRef.current)
      const audio = new Audio(url)
      audio.ontimeupdate = () => setPlayProgress(audio.currentTime / audio.duration)
      audio.onended = () => { setIsPlaying(false); setPlayProgress(0) }
      audioElRef.current = audio
    }
    if (isPlaying) { audioElRef.current.pause(); setIsPlaying(false) }
    else { audioElRef.current.play(); setIsPlaying(true) }
  }, [isPlaying])

  const sendVoice = useCallback(() => {
    if (!audioBlobRef.current) return
    onSendVoice(audioBlobRef.current)
    deleteRecording()
  }, [onSendVoice, deleteRecording])

  const sendText = useCallback(() => {
    if (!text.trim()) return
    onSendText(text.trim())
    setText('')
    setMode('idle')
    setShowPalette(false)
  }, [text, onSendText])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
      audioCtxRef.current?.close()
      audioElRef.current?.pause()
    }
  }, [])

  return (
    <div style={{ background: 'var(--bg-2, #1a1917)', borderTop: '1px solid rgba(217,119,87,0.12)', position: 'relative' }}>

      {/* ── SLASH COMMAND PALETTE ── */}
      {showPalette && filteredCmds.length > 0 && (
        <div
          ref={paletteRef}
          style={{
            position: 'absolute', bottom: '100%', left: 0, right: 0,
            background: '#181714',
            border: '1px solid rgba(217,119,87,0.18)',
            borderBottom: 'none',
            borderRadius: '12px 12px 0 0',
            overflow: 'hidden',
            boxShadow: '0 -8px 24px rgba(0,0,0,0.5)',
            zIndex: 100,
          }}
        >
          {filteredCmds.map((cmd, i) => (
            <div
              key={cmd.name}
              onMouseDown={(e) => { e.preventDefault(); selectCommand(cmd) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px',
                background: i === paletteIdx ? 'rgba(217,119,87,0.1)' : 'transparent',
                borderBottom: i < filteredCmds.length - 1 ? '1px solid rgba(217,119,87,0.06)' : 'none',
                cursor: 'pointer',
              }}
            >
              {/* Category dot */}
              <div style={{
                width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                background: CATEGORY_COLOR[cmd.category],
              }} />
              <span style={{
                fontFamily: 'Geist Mono, monospace', fontSize: 12,
                color: i === paletteIdx ? '#e8c8a8' : '#c8c4bc',
                fontWeight: 600, flexShrink: 0,
              }}>
                /{cmd.name}
              </span>
              <span style={{
                fontSize: 10, color: '#4a4845',
                fontFamily: 'Geist Mono, monospace',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {cmd.description}
              </span>
              {i === 0 && slashFilter.length > 0 && (
                <span style={{
                  marginLeft: 'auto', flexShrink: 0,
                  fontSize: 9, color: '#3a3835', fontFamily: 'Geist Mono, monospace',
                }}>
                  Tab ↹
                </span>
              )}
            </div>
          ))}
          {/* Footer hint */}
          <div style={{
            padding: '5px 12px',
            background: 'rgba(13,13,11,0.8)',
            display: 'flex', gap: 12, alignItems: 'center',
          }}>
            <span style={{ fontSize: 9, color: '#3a3835', fontFamily: 'Geist Mono, monospace' }}>
              ↑↓ navigate · Tab/Enter select · Esc dismiss
            </span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <span style={{ fontSize: 9, color: CATEGORY_COLOR.skill, fontFamily: 'Geist Mono, monospace' }}>● skills</span>
              <span style={{ fontSize: 9, color: CATEGORY_COLOR.mcp, fontFamily: 'Geist Mono, monospace' }}>● mcp</span>
              <span style={{ fontSize: 9, color: CATEGORY_COLOR.builtin, fontFamily: 'Geist Mono, monospace' }}>● built-in</span>
            </div>
          </div>
        </div>
      )}

      {/* ── IDLE ── */}
      {mode === 'idle' && (
        <div style={{ display: 'flex', gap: 10, padding: '12px 14px' }}>
          <button
            disabled={disabled}
            onClick={() => setMode('typing')}
            className="buddy-3d-btn"
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '11px 0', borderRadius: 12,
              background: 'linear-gradient(170deg, #7a4a28 0%, #4e2810 100%)',
              border: '1px solid rgba(217,119,87,0.35)',
              color: '#e8c8a8', fontSize: 13, fontWeight: 600,
              cursor: disabled ? 'not-allowed' : 'pointer',
              letterSpacing: '0.01em', fontFamily: 'DM Sans, sans-serif',
              opacity: disabled ? 0.5 : 1,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="3" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.2"/>
              <rect x="3" y="5.5" width="2" height="1.5" rx="0.5" fill="currentColor"/>
              <rect x="6" y="5.5" width="2" height="1.5" rx="0.5" fill="currentColor"/>
              <rect x="9" y="5.5" width="2" height="1.5" rx="0.5" fill="currentColor"/>
              <rect x="4.5" y="8" width="5" height="1.5" rx="0.5" fill="currentColor"/>
            </svg>
            Type
          </button>
          <button
            disabled={disabled}
            onClick={startRecording}
            className="buddy-3d-btn"
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '11px 0', borderRadius: 12,
              background: 'linear-gradient(170deg, #7a4a28 0%, #4e2810 100%)',
              border: '1px solid rgba(217,119,87,0.35)',
              color: '#e8c8a8', fontSize: 13, fontWeight: 600,
              cursor: disabled ? 'not-allowed' : 'pointer',
              letterSpacing: '0.01em', fontFamily: 'DM Sans, sans-serif',
              opacity: disabled ? 0.5 : 1,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="4" y="1" width="6" height="8" rx="3" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M2 7.5C2 10.5 12 10.5 12 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="7" y1="10.5" x2="7" y2="13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            Record
          </button>
        </div>
      )}

      {/* ── MIC ERROR ── */}
      {mode === 'mic-error' && (
        <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>🎙</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: '#e8634a', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>
                Microphone access denied
              </div>
              <div style={{ fontSize: 9, color: '#4a4845', fontFamily: 'Geist Mono, monospace', marginTop: 2, lineHeight: 1.5 }}>
                Dev mode: run <span style={{ color: '#d97757' }}>npm run setup-mic</span> in terminal,<br />
                then restart the app. Or open System Settings below.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => invoke('open_mic_settings').catch(() => {})}
              style={{
                flex: 1, padding: '7px 0', borderRadius: 8,
                background: '#d97757', border: 'none',
                color: 'white', fontSize: 11, fontWeight: 600,
                fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
              }}
            >
              Open Settings
            </button>
            <button
              onClick={() => setMode('idle')}
              style={{
                padding: '7px 12px', borderRadius: 8,
                background: 'rgba(74,72,69,0.3)', border: '1px solid rgba(217,119,87,0.15)',
                color: '#87867f', fontSize: 10, cursor: 'pointer',
                fontFamily: 'Geist Mono, monospace',
              }}
            >
              dismiss
            </button>
          </div>
        </div>
      )}

      {/* ── TYPING ── */}
      {mode === 'typing' && (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, padding: '8px 10px' }}>
          <button
            onClick={() => { setMode('idle'); setText(''); setShowPalette(false) }}
            style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: '#262420', border: '1px solid rgba(217,119,87,0.18)',
              color: '#87867f', fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ←
          </button>
          <div style={{ flex: 1, position: 'relative' }}>
            <textarea
              ref={textareaRef}
              autoFocus
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => setTimeout(() => setShowPalette(false), 150)}
              placeholder="Ask Biscuit anything… or type / for commands"
              rows={1}
              style={{
                width: '100%', minHeight: 36, maxHeight: 96,
                background: '#262420',
                border: `1px solid ${showPalette ? 'rgba(217,119,87,0.45)' : 'rgba(217,119,87,0.28)'}`,
                borderRadius: showPalette ? '0 0 9px 9px' : 9,
                padding: '8px 10px',
                fontSize: 12, color: '#f5f2ed',
                fontFamily: 'DM Sans, sans-serif',
                outline: 'none', resize: 'none', lineHeight: 1.4,
                transition: 'border-color 0.15s',
              }}
            />
            {/* Slash hint */}
            {text === '' && (
              <span style={{
                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                fontSize: 9, color: '#3a3835', fontFamily: 'Geist Mono, monospace',
                pointerEvents: 'none',
              }}>
                / for commands
              </span>
            )}
          </div>
          <button
            onClick={sendText}
            disabled={!text.trim()}
            style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: text.trim() ? CORAL : '#262420',
              border: 'none', color: 'white', fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: text.trim() ? '0 0 8px rgba(217,119,87,0.35)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            ↑
          </button>
        </div>
      )}

      {/* ── RECORDING ── */}
      {mode === 'recording' && (
        <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: RED, flexShrink: 0,
              boxShadow: `0 0 6px ${RED}`,
              animation: 'buddy-blink 1s ease-in-out infinite',
            }} />
            <span style={{
              fontFamily: 'Geist Mono, monospace', fontSize: 13,
              color: '#f5f2ed', flexShrink: 0, minWidth: 36,
            }}>
              {formatTime(elapsed)}
            </span>
            <div style={{ flex: 1, height: 36 }}>
              <WaveformCanvas analyser={analyserRef.current ?? undefined} isLive />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
            <button onClick={deleteRecording} title="Discard" style={iconBtnStyle}>🗑</button>
            <button onClick={stopRecording} title="Stop & review" style={{ ...iconBtnStyle, border: `2px solid ${RED}`, color: RED }}>⏸</button>
            <button
              onClick={() => { stopRecording(); setTimeout(sendVoice, 200) }}
              title="Send now"
              style={{ ...iconBtnStyle, borderRadius: 10, background: CORAL, border: 'none', color: 'white', boxShadow: `0 0 10px rgba(217,119,87,0.4)` }}
            >
              ↑
            </button>
          </div>
        </div>
      )}

      {/* ── RECORDED ── */}
      {mode === 'recorded' && (
        <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={togglePlayback} style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              background: TEAL, border: 'none', color: 'white', fontSize: 11,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: `0 0 8px rgba(26,160,135,0.35)`,
            }}>
              {isPlaying ? '⏸' : '▶'}
            </button>
            <div style={{ flex: 1, height: 32 }}>
              <WaveformCanvas isLive={false} barHeights={savedBars} playProgress={playProgress} />
            </div>
            <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 11, color: '#87867f', flexShrink: 0 }}>
              {formatTime(elapsed)}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
            <button onClick={deleteRecording} title="Discard" style={iconBtnStyle}>🗑</button>
            <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 10, color: '#4a4845' }}>tap ▶ to preview</span>
            <button onClick={sendVoice} title="Send" style={{ ...iconBtnStyle, borderRadius: '50%', background: CORAL, border: 'none', color: 'white', boxShadow: `0 0 10px rgba(217,119,87,0.4)` }}>▶</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes buddy-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.15; }
        }
        .buddy-3d-btn {
          box-shadow: 0 1px 0 rgba(255,255,255,0.1) inset, 0 5px 0 #2a1208, 0 8px 18px rgba(0,0,0,0.5);
          transform: translateY(0);
          transition: box-shadow 0.08s, transform 0.08s;
        }
        .buddy-3d-btn:hover:not(:disabled) {
          box-shadow: 0 1px 0 rgba(255,255,255,0.1) inset, 0 5px 0 #2a1208, 0 10px 22px rgba(0,0,0,0.55);
        }
        .buddy-3d-btn:active:not(:disabled) {
          box-shadow: 0 1px 0 rgba(255,255,255,0.06) inset, 0 2px 0 #2a1208, 0 3px 8px rgba(0,0,0,0.4);
          transform: translateY(3px);
        }
      `}</style>
    </div>
  )
}

const iconBtnStyle: React.CSSProperties = {
  width: 36, height: 36, borderRadius: '50%', cursor: 'pointer',
  background: 'transparent', border: '1.5px solid rgba(74,72,69,0.6)',
  color: '#4a4845', fontSize: 14,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}
