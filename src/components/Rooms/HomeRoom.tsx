import { useState } from 'react'
import { useAppStore } from '../../stores/appStore'
import { BuddyCharacterRive as BuddyCharacter, type Expression } from '../BuddyCharacter/BuddyCharacterRive'


function ChatBubble({ text, onDismiss }: { text: string; onDismiss: () => void }) {
  return (
    <div
      onClick={onDismiss}
      style={{
        background: 'rgba(38,36,32,0.95)',
        border: '1px solid rgba(217,119,87,0.22)',
        borderRadius: 16, borderBottomLeftRadius: 4,
        padding: '12px 16px',
        fontSize: 13, color: '#c8c4bc', lineHeight: 1.55,
        cursor: 'pointer', maxWidth: 280,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(8px)',
        position: 'relative',
      }}
    >
      {text}
      <div style={{
        marginTop: 6, fontSize: 9,
        color: 'rgba(135,134,127,0.4)',
        fontFamily: 'Geist Mono, monospace',
      }}>
        tap to dismiss
      </div>
    </div>
  )
}

function getExpression(buddy: { hunger: number; happiness: number; energy: number } | null): Expression {
  if (!buddy) return 'idle'
  if (buddy.hunger < 30) return 'hungry'
  if (buddy.happiness > 80) return 'happy'
  return 'idle'
}

export function HomeRoom() {
  const buddy = useAppStore((s) => s.buddy)
  const [greeting] = useState(() => {
    const greetings = [
      "Hey! Ready when you are.",
      "Back already? 👀",
      "What are we building today?",
      "Looking good out there.",
    ]
    return greetings[Math.floor(Math.random() * greetings.length)]
  })
  const [showBubble, setShowBubble] = useState(true)

  const expression = getExpression(buddy)

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '24px 20px 16px',
      gap: 0,
      overflowY: 'auto',
      scrollbarWidth: 'none',
    }}>

      {/* Buddy name + status */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 16,
      }}>
        <span style={{
          fontSize: 20, fontWeight: 700, color: '#f5f2ed',
          fontFamily: 'DM Sans, sans-serif', letterSpacing: '-0.01em',
        }}>
          {buddy?.name ?? 'Buddy'}
        </span>
        <span style={{
          fontSize: 10, fontFamily: 'Geist Mono, monospace',
          color: '#2d9e6b', letterSpacing: '0.06em',
          background: 'rgba(45,158,107,0.12)',
          border: '1px solid rgba(45,158,107,0.2)',
          borderRadius: 6, padding: '2px 7px',
        }}>
          ● ready
        </span>
      </div>

      {/* Chat bubble */}
      {showBubble && (
        <div style={{ marginBottom: 12, width: '100%', maxWidth: 300 }}>
          <ChatBubble text={greeting} onDismiss={() => setShowBubble(false)} />
        </div>
      )}

      {/* Character — big and centered */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 240 }}>
        <BuddyCharacter size={240} expression={expression} />
      </div>

      {/* XP / stage */}
      {buddy && (
        <div style={{
          marginTop: 8,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{
            fontFamily: 'Geist Mono, monospace', fontSize: 10,
            color: '#4a4845', letterSpacing: '0.06em',
          }}>
            {buddy.stage.toUpperCase()}
          </span>
          <span style={{ color: 'rgba(217,119,87,0.3)', fontSize: 8 }}>·</span>
          <span style={{
            fontFamily: 'Geist Mono, monospace', fontSize: 10,
            color: '#d97757', letterSpacing: '0.04em',
          }}>
            {buddy.xp} XP
          </span>
          {/* XP bar */}
          <div style={{
            width: 80, height: 3, borderRadius: 2,
            background: 'rgba(217,119,87,0.1)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${Math.min(100, (buddy.xp % 500) / 5)}%`,
              background: '#d97757',
              borderRadius: 2,
            }} />
          </div>
        </div>
      )}
    </div>
  )
}
