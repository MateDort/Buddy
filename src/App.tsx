import { useEffect, useCallback, useRef } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { useAppStore, type BuddyInfo, type BuddySpecies } from './stores/appStore'
import { RoomNav } from './components/RoomNav/RoomNav'
import { StatsBar } from './components/StatsBar/StatsBar'
import { HomeRoom } from './components/Rooms/HomeRoom'
import { KitchenRoom } from './components/Rooms/KitchenRoom'
import { OfficeRoom } from './components/OfficeRoom/OfficeRoom'
import { SettingsRoom } from './components/Rooms/SettingsRoom'

// ── Setup screens ─────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16, background: '#0d0d0b',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: 'rgba(217,119,87,0.08)', border: '1px solid rgba(217,119,87,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
      }}>
        🍄
      </div>
      <div style={{ fontSize: 11, color: '#4a4845', fontFamily: 'Geist Mono, monospace', letterSpacing: '0.06em' }}>
        finding your buddy...
      </div>
    </div>
  )
}

function NoCLIScreen() {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16, background: '#0d0d0b',
    }}>
      <div style={{ fontSize: 36 }}>⚠️</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#f5f2ed', fontFamily: 'DM Sans, sans-serif' }}>
          Claude Code not found
        </div>
        <div style={{ fontSize: 11, color: '#87867f', marginTop: 8, lineHeight: 1.6, fontFamily: 'DM Sans, sans-serif' }}>
          Buddy uses your Claude Code login.<br />
          Install Claude Code first, then reopen.
        </div>
      </div>
      <div style={{
        padding: '8px 12px', borderRadius: 8,
        background: 'rgba(38,36,32,1)', border: '1px solid rgba(217,119,87,0.15)',
        fontSize: 10, color: '#87867f', fontFamily: 'Geist Mono, monospace', letterSpacing: '0.04em',
      }}>
        npm install -g @anthropic-ai/claude-code
      </div>
    </div>
  )
}

function ManualBuddyScreen({ onSave }: { onSave: (name: string, species: BuddySpecies) => void }) {
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 8,
    background: 'rgba(38,36,32,1)', border: '1px solid rgba(217,119,87,0.28)',
    color: '#f5f2ed', fontSize: 12, fontFamily: 'DM Sans, sans-serif', outline: 'none',
    boxSizing: 'border-box',
  }

  let nameVal = ''
  let speciesVal: BuddySpecies = 'mushroom'

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 24, gap: 20, background: '#0d0d0b',
    }}>
      <div style={{ fontSize: 40 }}>🍄</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#f5f2ed', fontFamily: 'DM Sans, sans-serif' }}>
          Who's your buddy?
        </div>
        <div style={{ fontSize: 11, color: '#87867f', marginTop: 4, fontFamily: 'DM Sans, sans-serif' }}>
          Couldn't read it from Claude Code — enter manually
        </div>
      </div>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input
          placeholder="Buddy's name (e.g. Biscuit)"
          onChange={(e) => { nameVal = e.target.value }}
          style={inputStyle}
        />
        <select
          defaultValue="mushroom"
          onChange={(e) => { speciesVal = e.target.value as BuddySpecies }}
          style={{ ...inputStyle, cursor: 'pointer' }}
        >
          <option value="mushroom">Mushroom</option>
          <option value="dragon">Dragon</option>
          <option value="cat">Cat</option>
          <option value="fox">Fox</option>
          <option value="dog">Dog</option>
          <option value="rabbit">Rabbit</option>
          <option value="bear">Bear</option>
          <option value="wolf">Wolf</option>
          <option value="owl">Owl</option>
          <option value="unknown">Other</option>
        </select>
        <button
          onClick={() => { if (nameVal.trim()) onSave(nameVal.trim(), speciesVal) }}
          style={{
            padding: '11px 0', borderRadius: 10, background: '#d97757', border: 'none',
            color: 'white', fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif',
            cursor: 'pointer', boxShadow: '0 0 16px rgba(217,119,87,0.3)',
          }}
        >
          Meet my Buddy →
        </button>
      </div>
    </div>
  )
}

// ── Stream event from Rust ─────────────────────────────────────────────────────
interface StreamChunk {
  event_type: 'delta' | 'done' | 'error'
  text: string
}

// ── App shell ──────────────────────────────────────────────────────────────────
export default function App() {
  const { claudeReady, buddy, setClaudeReady, setBuddy, updateBuddy } = useAppStore()
  const currentRoom = useAppStore((s) => s.currentRoom)
  const lastActiveRef = useRef<number>(Date.now())

  // Bootstrap: check CLI + load buddy on first mount
  useEffect(() => {
    async function bootstrap() {
      const cliOk = await invoke<boolean>('check_claude_cli')
      setClaudeReady(cliOk)
      if (!cliOk) return

      try {
        const info = await invoke<{ name: string; species: string }>('read_buddy_info')
        const stateJson = await invoke<string>('read_buddy_state')
        const state = JSON.parse(stateJson)
        setBuddy({
          name: info.name,
          species: info.species as BuddyInfo['species'],
          stage: state.stage ?? 'baby',
          xp: state.xp ?? 0,
          hunger: state.hunger ?? 100,
          happiness: state.happiness ?? 100,
          energy: state.energy ?? 100,
        })
      } catch {
        // buddy stays null → ManualBuddyScreen shows
      }
    }
    bootstrap()
  }, [setClaudeReady, setBuddy])

  // ── Stat timers ───────────────────────────────────────────────────────────────
  // Happiness goes up while user is active in the app, down when away
  // Energy slowly regenerates over time (it drains when sending messages)
  useEffect(() => {
    if (!buddy) return

    const tick = setInterval(() => {
      const awayMs = Date.now() - lastActiveRef.current
      const isAway = awayMs > 5 * 60 * 1000 // >5 min = "away"

      updateBuddy({
        happiness: buddy.happiness + (isAway ? -1 : 0.5),
        energy: buddy.energy + 0.3,  // slow regen when not messaging
      })
    }, 30_000) // tick every 30s

    // Track activity
    const markActive = () => { lastActiveRef.current = Date.now() }
    window.addEventListener('mousemove', markActive)
    window.addEventListener('keydown', markActive)
    window.addEventListener('click', markActive)

    return () => {
      clearInterval(tick)
      window.removeEventListener('mousemove', markActive)
      window.removeEventListener('keydown', markActive)
      window.removeEventListener('click', markActive)
    }
  }, [buddy, updateBuddy])

  // ── Streaming: invoke claude CLI, relay events to OfficeRoom via onChunk callback
  const handleSendText = useCallback(
    async (text: string, onChunk: (chunk: string, done: boolean) => void) => {
      let accumulated = ''

      const unlisten = await listen<StreamChunk>('stream-chunk', (event) => {
        const { event_type, text: chunk } = event.payload
        if (event_type === 'delta') {
          // Rust emits the full accumulated text — just replace, don't append
          accumulated = chunk
          onChunk(accumulated, false)
        } else if (event_type === 'done') {
          onChunk(accumulated || '...', true)
          unlisten()
        } else if (event_type === 'error') {
          onChunk(chunk || 'Something went wrong. Run `claude` in terminal to check auth.', true)
          unlisten()
        }
      })

      try {
        // Drain energy on each message (simulates token usage)
        updateBuddy({ energy: (buddy?.energy ?? 100) - 12 })
        await invoke('send_message', { message: text })
      } catch (e) {
        onChunk(`Error: ${e}`, true)
        unlisten()
      }
    },
    [buddy, updateBuddy]
  )

  const handleSendVoice = useCallback(
    (_blob: Blob, onChunk: (chunk: string, done: boolean) => void) => {
      // TODO: transcribe via Whisper, then forward as text
      handleSendText('[voice message — transcription coming soon]', onChunk)
    },
    [handleSendText]
  )

  const handleManualBuddy = useCallback(
    (name: string, species: BuddySpecies) => {
      setBuddy({ name, species, stage: 'baby', xp: 0, hunger: 100, happiness: 100, energy: 100 })
    },
    [setBuddy]
  )

  // ── Render ─────────────────────────────────────────────────────────────────

  if (claudeReady === null) {
    return <Screen><LoadingScreen /></Screen>
  }
  if (claudeReady === false) {
    return <Screen><NoCLIScreen /></Screen>
  }
  if (!buddy) {
    return <Screen><ManualBuddyScreen onSave={handleManualBuddy} /></Screen>
  }

  return (
    <div style={{
      width: '100%', height: '100vh', borderRadius: 16, overflow: 'hidden',
      display: 'flex', flexDirection: 'column', background: '#0d0d0b', fontFamily: 'DM Sans, sans-serif',
    }}>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <StatsBar />
        {currentRoom === 'home' && <HomeRoom />}
        {currentRoom === 'kitchen' && <KitchenRoom />}
        {currentRoom === 'office' && (
          <OfficeRoom onSendText={handleSendText} onSendVoice={handleSendVoice} />
        )}
        {currentRoom === 'settings' && <SettingsRoom />}
      </div>
      <RoomNav />
    </div>
  )
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: '100%', height: '100vh', borderRadius: 16, overflow: 'hidden' }}>
      {children}
    </div>
  )
}
