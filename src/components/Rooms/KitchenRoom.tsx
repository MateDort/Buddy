import { useState, useEffect } from 'react'
import { useAppStore } from '../../stores/appStore'
import { BuddyCharacterRive as BuddyCharacter, type Expression } from '../BuddyCharacter/BuddyCharacterRive'

interface FoodItem {
  id: string
  name: string
  icon: React.ReactNode
  xpGain: number
  cooldownSec: number
  color: string
  messages: string[]
}

// ── SVG food icons (warm, hand-crafted style matching the mushroom) ──────────

function FishIcon({ color }: { color: string }) {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      {/* Tail */}
      <path d="M7 22 Q3 14 5 22 Q3 30 7 22Z" fill={color} opacity="0.85"/>
      {/* Body */}
      <ellipse cx="22" cy="22" rx="14" ry="9" fill={color}/>
      {/* Belly highlight */}
      <ellipse cx="20" cy="24" rx="8" ry="4" fill="rgba(255,255,255,0.18)"/>
      {/* Top fin */}
      <path d="M16 14 Q22 10 28 14" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Eye */}
      <circle cx="30" cy="19" r="3" fill="rgba(255,255,255,0.95)"/>
      <circle cx="30.5" cy="19.5" r="1.6" fill="#1a1410"/>
      <circle cx="29.5" cy="18.5" r="0.7" fill="white"/>
      {/* Scales */}
      <path d="M15 19 Q19 22 15 25" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      <path d="M20 17 Q24 20 20 23" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
    </svg>
  )
}


function AppleIcon({ color }: { color: string }) {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      {/* Stem */}
      <path d="M22 10 Q23 6 26 7" stroke="#5a7a2a" strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* Leaf */}
      <path d="M23 9 Q28 6 28 11 Q25 11 23 9Z" fill="#5a9a2a"/>
      {/* Apple body */}
      <path d="M12 20 Q11 12 18 11 Q22 10 22 14 Q22 10 26 11 Q33 12 32 20 Q33 32 27 36 Q24 38 22 35 Q20 38 17 36 Q11 32 12 20Z" fill={color}/>
      {/* Shine */}
      <ellipse cx="17" cy="18" rx="3.5" ry="5" fill="rgba(255,255,255,0.28)" transform="rotate(-15 17 18)"/>
      <ellipse cx="16" cy="17" rx="1.5" ry="2.5" fill="rgba(255,255,255,0.35)" transform="rotate(-15 16 17)"/>
      {/* Shadow at bottom */}
      <path d="M15 32 Q22 36 29 32" stroke="rgba(0,0,0,0.12)" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  )
}

function CookieIcon({ color }: { color: string }) {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      {/* Cookie body */}
      <circle cx="22" cy="23" r="14" fill={color}/>
      {/* Edge/crust ring */}
      <circle cx="22" cy="23" r="14" stroke="rgba(120,60,10,0.25)" strokeWidth="1.5" fill="none"/>
      {/* Texture bumps */}
      <path d="M11 19 Q14 15 18 17" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M24 15 Q28 14 30 17" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      {/* Chocolate chips */}
      <ellipse cx="16" cy="19" rx="2.5" ry="2" fill="#3a1a08" opacity="0.8"/>
      <ellipse cx="26" cy="18" rx="2.5" ry="2" fill="#3a1a08" opacity="0.8"/>
      <ellipse cx="15" cy="28" rx="2.5" ry="2" fill="#3a1a08" opacity="0.8"/>
      <ellipse cx="27" cy="28" rx="2.5" ry="2" fill="#3a1a08" opacity="0.7"/>
      <ellipse cx="22" cy="23" rx="2" ry="1.8" fill="#3a1a08" opacity="0.65"/>
      {/* Highlight */}
      <ellipse cx="16" cy="18" rx="4" ry="3" fill="rgba(255,255,255,0.12)" transform="rotate(-15 16 18)"/>
    </svg>
  )
}

function PotionIcon({ color }: { color: string }) {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      {/* Cork/cap */}
      <rect x="17" y="6" width="10" height="8" rx="2" fill="#b89878"/>
      <rect x="16" y="12" width="12" height="3" rx="1" fill="#8a6848"/>
      {/* Neck */}
      <rect x="19" y="14" width="6" height="4" fill={color} opacity="0.5"/>
      {/* Flask body */}
      <path d="M14 18 Q9 22 9 28 Q9 38 22 38 Q35 38 35 28 Q35 22 30 18Z" fill={color} opacity="0.95"/>
      {/* Glow / shine */}
      <path d="M14 18 Q9 22 9 28 Q9 38 22 38" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none"/>
      <ellipse cx="16" cy="26" rx="4" ry="6" fill="rgba(255,255,255,0.22)" transform="rotate(-15 16 26)"/>
      {/* Bubbles */}
      <circle cx="18" cy="24" r="2.5" fill="rgba(255,255,255,0.35)"/>
      <circle cx="26" cy="20" r="1.8" fill="rgba(255,255,255,0.3)"/>
      <circle cx="23" cy="30" r="1.5" fill="rgba(255,255,255,0.25)"/>
      {/* Stars / sparkle */}
      <circle cx="29" cy="12" r="1.5" fill={color} opacity="0.7"/>
      <circle cx="33" cy="18" r="1" fill={color} opacity="0.5"/>
      <circle cx="31" cy="8" r="1" fill={color} opacity="0.4"/>
    </svg>
  )
}

function CodeIcon({ color }: { color: string }) {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      {/* Screen */}
      <rect x="5" y="8" width="34" height="24" rx="5" fill="#1a1714"/>
      <rect x="5" y="8" width="34" height="24" rx="5" stroke={color} strokeWidth="1.5" opacity="0.6"/>
      {/* Notch bar at top */}
      <rect x="5" y="8" width="34" height="6" rx="4" fill="#221e1a"/>
      <circle cx="11" cy="11" r="1.5" fill="#ff5f57" opacity="0.8"/>
      <circle cx="17" cy="11" r="1.5" fill="#febc2e" opacity="0.8"/>
      <circle cx="23" cy="11" r="1.5" fill="#28c840" opacity="0.8"/>
      {/* Code lines */}
      <path d="M16 20 L12 22.5 L16 25" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M28 20 L32 22.5 L28 25" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="21" y1="27" x2="23" y2="18" stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.7"/>
      {/* Stand */}
      <rect x="18" y="32" width="8" height="3" rx="1" fill="#2a2420"/>
      <rect x="14" y="35" width="16" height="2.5" rx="1.2" fill="#2a2420"/>
    </svg>
  )
}

const COOLDOWN = 5  // seconds for all foods

const FOODS: FoodItem[] = [
  {
    id: 'fish', name: 'Fish', icon: <FishIcon color="#4ab3d4" />,
    xpGain: 10, cooldownSec: COOLDOWN, color: '#4ab3d4',
    messages: ["Salty and good!", "My favorite catch!", "Brain food activated."],
  },
  {
    id: 'apple', name: 'Apple', icon: <AppleIcon color="#4ac85a" />,
    xpGain: 5, cooldownSec: COOLDOWN, color: '#4ac85a',
    messages: ["Crunch! So fresh.", "An apple a day...", "Crisp and clean!"],
  },
  {
    id: 'cookie', name: 'Cookie', icon: <CookieIcon color="#d4923a" />,
    xpGain: 8, cooldownSec: COOLDOWN, color: '#d4923a',
    messages: ["Okay just ONE more...", "Worth every calorie.", "The crumbs... everywhere."],
  },
  {
    id: 'potion', name: 'Potion', icon: <PotionIcon color="#a04ad4" />,
    xpGain: 50, cooldownSec: COOLDOWN, color: '#a04ad4',
    messages: ["*glug glug* WHOA.", "I can feel the XP!", "The power is too much!"],
  },
  {
    id: 'code', name: 'Code', icon: <CodeIcon color="#d97757" />,
    xpGain: 100, cooldownSec: COOLDOWN, color: '#d97757',
    messages: ["Let's ship something!", "This is what I live for.", "Claude Code, activated."],
  },
]

function FoodCard({ food, onFeed }: { food: FoodItem; onFeed: (msg: string) => void }) {
  const [cooldown, setCooldown] = useState(0)
  const [justFed, setJustFed] = useState(false)

  const handleFeed = () => {
    if (cooldown > 0) return
    const msg = food.messages[Math.floor(Math.random() * food.messages.length)]
    onFeed(msg)
    setJustFed(true)
    setTimeout(() => setJustFed(false), 1400)
    if (food.cooldownSec > 0) {
      setCooldown(food.cooldownSec)
      const interval = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1) { clearInterval(interval); return 0 }
          return c - 1
        })
      }, 1000)
    }
  }

  // Fill goes from 0% (just clicked) → 100% (ready) over cooldownSec seconds
  // fillPct = fraction of cooldown elapsed
  const fillPct = food.cooldownSec > 0 && cooldown > 0
    ? ((food.cooldownSec - cooldown) / food.cooldownSec) * 100
    : 100

  return (
    <button
      onClick={handleFeed}
      disabled={cooldown > 0}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 5, padding: '12px 6px 9px', borderRadius: 16,
        background: 'rgba(22,20,18,0.95)',
        border: `1px solid ${justFed ? food.color + '55' : 'rgba(217,119,87,0.1)'}`,
        cursor: cooldown > 0 ? 'default' : 'pointer',
        transition: 'border-color 0.2s',
        position: 'relative', overflow: 'hidden',
        transform: justFed ? 'scale(0.94)' : 'scale(1)',
      }}
    >
      {/* Clash Royale fill — rises from bottom over 5 seconds */}
      {cooldown > 0 && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: `${fillPct}%`,
          background: `linear-gradient(to top, ${food.color}33, ${food.color}18)`,
          borderTop: `1px solid ${food.color}44`,
          transition: 'height 1s linear',
          pointerEvents: 'none',
        }} />
      )}

      {/* Dimmed overlay when on cooldown */}
      {cooldown > 0 && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.45)',
          pointerEvents: 'none',
        }} />
      )}

      <div style={{ lineHeight: 1, position: 'relative', zIndex: 1 }}>{food.icon}</div>

      <span style={{
        fontSize: 10, fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
        color: cooldown > 0 ? '#4a4845' : '#87867f',
        letterSpacing: '0.02em', position: 'relative', zIndex: 1,
        transition: 'color 0.3s',
      }}>
        {food.name}
      </span>

      <span style={{
        fontSize: 9, fontFamily: 'Geist Mono, monospace',
        color: cooldown > 0 ? food.color + 'aa' : food.color,
        letterSpacing: '0.03em', position: 'relative', zIndex: 1,
      }}>
        {cooldown > 0 ? `${cooldown}s` : `+${food.xpGain} xp`}
      </span>
    </button>
  )
}


export function KitchenRoom() {
  const buddy = useAppStore((s) => s.buddy)
  const [feedMsg, setFeedMsg] = useState<string | null>(null)
  const [expression, setExpression] = useState<Expression>('idle')
  const hunger = buddy?.hunger ?? 85
  const energy = buddy?.energy ?? 100

  // Periodic yawn when energy < 25
  useEffect(() => {
    if (energy >= 25) return
    const id = setInterval(() => {
      setExpression((cur) => {
        if (cur === 'idle' || cur === 'hungry') {
          setTimeout(() => setExpression(hunger < 40 ? 'hungry' : 'idle'), 3000)
          return 'yawn'
        }
        return cur
      })
    }, 8000)
    return () => clearInterval(id)
  }, [energy, hunger])

  const handleFeed = (msg: string) => {
    setFeedMsg(msg)
    setExpression('eating')
    setTimeout(() => {
      setExpression(hunger < 40 ? 'hungry' : 'happy')
      setTimeout(() => setExpression(hunger < 40 ? 'hungry' : 'idle'), 1200)
    }, 1600)
    setTimeout(() => setFeedMsg(null), 3200)
  }

  const displayExpression: Expression =
    expression === 'eating' || expression === 'happy' || expression === 'yawn'
      ? expression
      : hunger < 40
        ? 'hungry'
        : 'idle'

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      height: '100%', overflow: 'hidden',
    }}>
      {/* Character section — takes all remaining space, centers Biscuit */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 10, minHeight: 0,
      }}>
        <BuddyCharacter size={200} expression={displayExpression} />

        {/* Status / feed message */}
        <div style={{
          fontSize: 12,
          fontFamily: feedMsg ? 'DM Sans, sans-serif' : 'Geist Mono, monospace',
          fontWeight: feedMsg ? 500 : 400,
          color: feedMsg
            ? '#c8c4bc'
            : displayExpression === 'hungry' ? '#e8634a' : '#4a4845',
          letterSpacing: feedMsg ? '0' : '0.05em',
          transition: 'color 0.3s',
          minHeight: 18, textAlign: 'center',
          padding: '0 16px',
        }}>
          {feedMsg ?? (
            displayExpression === 'hungry'
              ? `${buddy?.name ?? 'Buddy'} is hungry...`
              : `feed ${buddy?.name ?? 'Buddy'}`
          )}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(217,119,87,0.08)', flexShrink: 0 }} />

      {/* Food grid — pinned to bottom, fixed height */}
      <div style={{ flexShrink: 0, padding: '10px 14px 16px' }}>
        <div style={{
          fontSize: 9, fontFamily: 'Geist Mono, monospace',
          color: '#4a4845', letterSpacing: '0.08em',
          marginBottom: 8, textAlign: 'center',
        }}>
          FEED {(buddy?.name ?? 'BUDDY').toUpperCase()}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {FOODS.map((food) => (
            <FoodCard key={food.id} food={food} onFeed={handleFeed} />
          ))}
        </div>
      </div>
    </div>
  )
}
