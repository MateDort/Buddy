import { useRef, useEffect, useState } from 'react'
import { useAppStore } from '../../stores/appStore'
import { BuddyCharacterRive as BuddyCharacter } from '../BuddyCharacter/BuddyCharacterRive'
import { VoiceInput } from './VoiceInput'

interface Message {
  id: string
  role: 'user' | 'buddy'
  type: 'text' | 'voice'
  text: string
  voiceUrl?: string
}

interface Props {
  onSendText: (text: string, onChunk: (chunk: string, done: boolean) => void) => void
  onSendVoice: (blob: Blob, onChunk: (chunk: string, done: boolean) => void) => void
}

const INTROS = [
  "Hey! I'm here whenever you need me.",
  "Ready to help. Type or record a message.",
  "What are we building today?",
  "Ask me anything — I've got Claude Code powers.",
]

// ── Simple inline markdown → React elements ───────────────────────────────────
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n')
  return lines.map((line, li) => {
    // Bold: **text**
    const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
    const rendered = parts.map((part, pi) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={pi} style={{ color: '#e8c8a8', fontWeight: 700 }}>{part.slice(2, -2)}</strong>
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={pi} style={{
            background: 'rgba(217,119,87,0.15)', borderRadius: 4,
            padding: '1px 5px', fontSize: '0.88em',
            fontFamily: 'Geist Mono, monospace', color: '#d97757',
          }}>
            {part.slice(1, -1)}
          </code>
        )
      }
      return <span key={pi}>{part}</span>
    })
    return (
      <span key={li}>
        {rendered}
        {li < lines.length - 1 && <br />}
      </span>
    )
  })
}

export function OfficeRoom({ onSendText, onSendVoice }: Props) {
  const buddy = useAppStore((s) => s.buddy)

  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingId, setStreamingId] = useState<string | null>(null)
  const [introText] = useState(() => INTROS[Math.floor(Math.random() * INTROS.length)])
  const scrollRef = useRef<HTMLDivElement>(null)

  const hasMessages = messages.length > 0

  // Pick up command fired from Settings room
  useEffect(() => {
    const cmd = sessionStorage.getItem('pending-command')
    if (cmd) {
      sessionStorage.removeItem('pending-command')
      setTimeout(() => handleSendText(cmd), 100)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const addUserMessage = (text: string, type: 'text' | 'voice' = 'text', voiceUrl?: string): string => {
    const userId = Date.now().toString()
    const buddyId = (Date.now() + 1).toString()
    setMessages((prev) => [
      ...prev,
      { id: userId, role: 'user', type, text, voiceUrl },
      { id: buddyId, role: 'buddy', type: 'text', text: '' },
    ])
    return buddyId
  }

  const makeChunkHandler = (buddyMsgId: string) => (chunk: string, done: boolean) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === buddyMsgId ? { ...msg, text: chunk } : msg
      )
    )
    if (done) {
      setIsStreaming(false)
      setStreamingId(null)
    }
  }

  const handleSendText = (text: string) => {
    const buddyId = addUserMessage(text)
    setIsStreaming(true)
    setStreamingId(buddyId)
    onSendText(text, makeChunkHandler(buddyId))
  }

  const handleSendVoice = (blob: Blob) => {
    const url = URL.createObjectURL(blob)
    const buddyId = addUserMessage('🎙 Voice message', 'voice', url)
    setIsStreaming(true)
    setStreamingId(buddyId)
    onSendVoice(blob, makeChunkHandler(buddyId))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Idle state: character centered ── */}
      {!hasMessages && (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 16, padding: '0 28px',
        }}>
          <BuddyCharacter size={200} expression="idle" />
          <div style={{
            background: 'rgba(38,36,32,0.95)',
            border: '1px solid rgba(217,119,87,0.18)',
            borderRadius: 18, borderBottomLeftRadius: 5,
            padding: '13px 16px',
            fontSize: 13, color: '#c8c4bc', lineHeight: 1.6,
            maxWidth: 280,
            boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
          }}>
            {introText}
          </div>
          <div style={{ fontSize: 9, color: '#3a3835', fontFamily: 'Geist Mono, monospace', letterSpacing: '0.06em' }}>
            try typing <span style={{ color: '#4a4845' }}>/help</span> for Claude Code commands
          </div>
        </div>
      )}

      {/* ── Chat ── */}
      {hasMessages && (
        <>
          {/* Thin buddy header when chatting */}
          <div style={{
            padding: '8px 14px 6px',
            display: 'flex', alignItems: 'center', gap: 8,
            borderBottom: '1px solid rgba(217,119,87,0.08)',
            background: 'rgba(13,13,11,0.5)', flexShrink: 0,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: isStreaming ? '#d97757' : '#2d9e6b',
              boxShadow: isStreaming ? '0 0 6px rgba(217,119,87,0.6)' : '0 0 6px rgba(45,158,107,0.5)',
              flexShrink: 0,
            }} />
            <span style={{ fontSize: 11, color: '#87867f', fontFamily: 'Geist Mono, monospace', letterSpacing: '0.04em' }}>
              {isStreaming ? `${buddy?.name ?? 'Buddy'} is thinking...` : `${buddy?.name ?? 'Buddy'} · ready`}
            </span>
          </div>

          <div
            ref={scrollRef}
            style={{
              flex: 1, overflowY: 'auto', padding: '14px 14px 8px',
              display: 'flex', flexDirection: 'column', gap: 10,
              scrollbarWidth: 'none',
            }}
          >
            {messages.map((msg) => (
              <div key={msg.id} style={{
                display: 'flex',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-end', gap: 8,
              }}>
                {/* Avatar dot for buddy */}
                {msg.role === 'buddy' && (
                  <div style={{
                    width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                    background: 'rgba(217,119,87,0.1)',
                    border: '1px solid rgba(217,119,87,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, marginBottom: 2,
                  }}>
                    🍄
                  </div>
                )}

                <div style={{ maxWidth: '78%' }}>
                  {msg.type === 'voice' && msg.voiceUrl ? (
                    <VoicePlaybackBubble url={msg.voiceUrl} />
                  ) : (
                    <div style={{
                      padding: '9px 13px',
                      borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: msg.role === 'user'
                        ? 'linear-gradient(135deg, #7a4a28 0%, #5a3018 100%)'
                        : 'rgba(32,30,26,0.97)',
                      border: msg.role === 'buddy' ? '1px solid rgba(217,119,87,0.14)' : 'none',
                      color: msg.role === 'user' ? '#f0d0b0' : '#c8c4bc',
                      fontSize: 13, lineHeight: 1.6,
                      boxShadow: msg.role === 'user'
                        ? '0 2px 12px rgba(122,74,40,0.4)'
                        : '0 2px 12px rgba(0,0,0,0.25)',
                      position: 'relative',
                    }}>
                      {/* Typing dots when empty and streaming */}
                      {msg.id === streamingId && !msg.text ? (
                        <span style={{ display: 'flex', gap: 4, alignItems: 'center', height: 18 }}>
                          {[0, 1, 2].map(i => (
                            <span key={i} style={{
                              width: 5, height: 5, borderRadius: '50%',
                              background: '#d97757', opacity: 0.6,
                              animation: `buddy-dot 1.2s ease-in-out infinite`,
                              animationDelay: `${i * 0.2}s`,
                            }} />
                          ))}
                        </span>
                      ) : (
                        <>
                          {renderMarkdown(msg.text)}
                          {/* Streaming cursor */}
                          {msg.id === streamingId && msg.text && (
                            <span style={{
                              display: 'inline-block', width: 2, height: 13,
                              background: '#d97757', marginLeft: 2,
                              animation: 'buddy-blink 0.75s ease-in-out infinite',
                              verticalAlign: 'middle',
                            }} />
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div style={{
                    fontSize: 9, color: '#3a3835',
                    fontFamily: 'Geist Mono, monospace',
                    marginTop: 3,
                    textAlign: msg.role === 'user' ? 'right' : 'left',
                    paddingLeft: msg.role === 'buddy' ? 2 : 0,
                    paddingRight: msg.role === 'user' ? 2 : 0,
                  }}>
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            <style>{`
              @keyframes buddy-blink { 0%,100%{opacity:1} 50%{opacity:0} }
              @keyframes buddy-dot { 0%,80%,100%{transform:scale(0.7);opacity:0.4} 40%{transform:scale(1);opacity:1} }
              div::-webkit-scrollbar { display: none; }
            `}</style>
          </div>
        </>
      )}

      {/* Input */}
      <VoiceInput
        onSendText={handleSendText}
        onSendVoice={handleSendVoice}
        disabled={isStreaming}
      />
    </div>
  )
}

// ─── Voice playback bubble ─────────────────────────────────────────────────────
function VoicePlaybackBubble({ url }: { url: string }) {
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const toggle = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(url)
      audioRef.current.onended = () => setPlaying(false)
    }
    if (playing) { audioRef.current.pause(); setPlaying(false) }
    else { audioRef.current.play(); setPlaying(true) }
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '9px 14px',
      borderRadius: '16px 16px 4px 16px',
      background: 'linear-gradient(135deg, #7a4a28 0%, #5a3018 100%)',
      cursor: 'pointer', minWidth: 140,
      boxShadow: '0 2px 12px rgba(122,74,40,0.4)',
    }} onClick={toggle}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        background: playing ? '#d97757' : 'rgba(255,255,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, color: 'white', transition: 'background 0.2s',
      }}>
        {playing ? '⏸' : '▶'}
      </div>
      <div style={{
        flex: 1, height: 24, borderRadius: 4,
        background: 'rgba(255,255,255,0.1)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(217,119,87,0.6)',
          width: playing ? '100%' : '0%',
          transition: playing ? 'width 2s linear' : 'none',
          borderRadius: 4,
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 2,
        }}>
          {[3, 5, 8, 6, 4, 7, 5, 3, 6, 8, 4, 5].map((h, i) => (
            <div key={i} style={{
              width: 2, height: h, borderRadius: 1,
              background: 'rgba(255,255,255,0.4)',
            }} />
          ))}
        </div>
      </div>
      <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 9, color: 'rgba(240,200,160,0.6)' }}>
        🎙
      </span>
    </div>
  )
}
