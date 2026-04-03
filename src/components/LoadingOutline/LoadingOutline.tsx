import { useEffect, useRef, useState } from 'react'

interface Props {
  onRevealReady: () => void   // call this when animation is done and 3D can take over
  buddyColor?: string
}

// Dragon silhouette as SVG — Biscuit style
// viewBox 200×260
const BUDDY_COLOR = '#8b5cf6'
const FILL_COLOR = '#7c3aed'
const BELLY_COLOR = '#a78bfa'

export function LoadingOutline({ onRevealReady, buddyColor = BUDDY_COLOR }: Props) {
  // fillProgress: 0 = no fill, 1 = fully filled (bottom → top)
  const [fillProgress, setFillProgress] = useState(0)
  const [strokeDone, setStrokeDone] = useState(false)
  const [done, setDone] = useState(false)
  const fillRef = useRef<number>(0)
  const rafRef = useRef<number>(0)

  // Phase 1: stroke draws in via CSS animation (1.4s)
  // Phase 2: fill reveals bottom→top (1.2s)
  // Phase 3: signal ready
  useEffect(() => {
    const strokeTimer = setTimeout(() => {
      setStrokeDone(true)

      const start = performance.now()
      const duration = 1200

      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1)
        // ease in-out
        const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
        fillRef.current = eased
        setFillProgress(eased)
        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick)
        } else {
          setDone(true)
          onRevealReady()
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }, 1500) // wait for stroke animation

    return () => {
      clearTimeout(strokeTimer)
      cancelAnimationFrame(rafRef.current)
    }
  }, [onRevealReady])

  // clipPath rect grows from bottom: y goes from 260→0 as fillProgress 0→1
  const clipY = 260 - fillProgress * 260

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-4">
      <style>{`
        @keyframes draw-stroke {
          from { stroke-dashoffset: 1; }
          to   { stroke-dashoffset: 0; }
        }
        .stroke-draw {
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        /* each shape animates its own dash */
        .s-body   { stroke-dasharray: 1; animation: draw-stroke 0.55s ease-out 0.05s forwards; }
        .s-head   { stroke-dasharray: 1; animation: draw-stroke 0.45s ease-out 0.3s  forwards; }
        .s-belly  { stroke-dasharray: 1; animation: draw-stroke 0.35s ease-out 0.6s  forwards; }
        .s-wing-l { stroke-dasharray: 1; animation: draw-stroke 0.35s ease-out 0.55s forwards; }
        .s-wing-r { stroke-dasharray: 1; animation: draw-stroke 0.35s ease-out 0.65s forwards; }
        .s-tail   { stroke-dasharray: 1; animation: draw-stroke 0.3s  ease-out 0.8s  forwards; }
        .s-foot-l { stroke-dasharray: 1; animation: draw-stroke 0.2s  ease-out 0.9s  forwards; }
        .s-foot-r { stroke-dasharray: 1; animation: draw-stroke 0.2s  ease-out 0.95s forwards; }
        .s-eye-l  { stroke-dasharray: 1; animation: draw-stroke 0.15s ease-out 1.05s forwards; }
        .s-eye-r  { stroke-dasharray: 1; animation: draw-stroke 0.15s ease-out 1.1s  forwards; }
        .s-horn-l { stroke-dasharray: 1; animation: draw-stroke 0.15s ease-out 1.15s forwards; }
        .s-horn-r { stroke-dasharray: 1; animation: draw-stroke 0.15s ease-out 1.2s  forwards; }
      `}</style>

      <svg
        viewBox="0 0 200 260"
        width="200"
        height="260"
        style={{ filter: 'drop-shadow(0 0 12px rgba(139, 92, 246, 0.5))' }}
      >
        <defs>
          {/* Fill reveal: rect grows from bottom up */}
          <clipPath id="fill-reveal">
            <rect x="0" y={clipY} width="200" height="260" />
          </clipPath>
        </defs>

        {/* ── OUTLINE LAYER (always on top, no fill) ── */}
        <g stroke={buddyColor} strokeWidth="2.5" fill="none">
          {/* Body */}
          <ellipse className="stroke-draw s-body" cx="100" cy="158" rx="58" ry="65" />
          {/* Head */}
          <circle className="stroke-draw s-head" cx="100" cy="75" r="42" />
          {/* Belly */}
          <ellipse className="stroke-draw s-belly" cx="100" cy="162" rx="32" ry="40" />
          {/* Left wing */}
          <path className="stroke-draw s-wing-l"
            d="M 48 128 C 15 100 5 70 20 55 C 30 65 38 90 48 128 Z" />
          {/* Right wing */}
          <path className="stroke-draw s-wing-r"
            d="M 152 128 C 185 100 195 70 180 55 C 170 65 162 90 152 128 Z" />
          {/* Tail */}
          <path className="stroke-draw s-tail"
            d="M 148 195 C 175 210 185 235 165 248 C 150 258 135 245 145 232" />
          {/* Left foot */}
          <ellipse className="stroke-draw s-foot-l" cx="74" cy="215" rx="22" ry="12" />
          {/* Right foot */}
          <ellipse className="stroke-draw s-foot-r" cx="126" cy="215" rx="22" ry="12" />
          {/* Left eye */}
          <circle className="stroke-draw s-eye-l" cx="84" cy="68" r="11" />
          {/* Right eye */}
          <circle className="stroke-draw s-eye-r" cx="116" cy="68" r="11" />
          {/* Left horn */}
          <path className="stroke-draw s-horn-l" d="M 82 37 L 74 18 L 90 30 Z" />
          {/* Right horn */}
          <path className="stroke-draw s-horn-r" d="M 118 37 L 126 18 L 110 30 Z" />
        </g>

        {/* ── FILL LAYER (revealed bottom→top via clipPath) ── */}
        {strokeDone && (
          <g clipPath="url(#fill-reveal)">
            {/* Wings (behind body) */}
            <path fill={buddyColor} opacity="0.7"
              d="M 48 128 C 15 100 5 70 20 55 C 30 65 38 90 48 128 Z" />
            <path fill={buddyColor} opacity="0.7"
              d="M 152 128 C 185 100 195 70 180 55 C 170 65 162 90 152 128 Z" />
            {/* Body */}
            <ellipse fill={buddyColor} cx="100" cy="158" rx="58" ry="65" />
            {/* Belly */}
            <ellipse fill={BELLY_COLOR} cx="100" cy="162" rx="32" ry="40" />
            {/* Head */}
            <circle fill={buddyColor} cx="100" cy="75" r="42" />
            {/* Horns */}
            <path fill={FILL_COLOR} d="M 82 37 L 74 18 L 90 30 Z" />
            <path fill={FILL_COLOR} d="M 118 37 L 126 18 L 110 30 Z" />
            {/* Eyes white */}
            <circle fill="white" cx="84" cy="68" r="11" />
            <circle fill="white" cx="116" cy="68" r="11" />
            {/* Pupils */}
            <circle fill="#1a1a1a" cx="86" cy="69" r="6" />
            <circle fill="#1a1a1a" cx="118" cy="69" r="6" />
            {/* Eye shine */}
            <circle fill="white" cx="88" cy="66" r="2.5" />
            <circle fill="white" cx="120" cy="66" r="2.5" />
            {/* Snout */}
            <ellipse fill={FILL_COLOR} opacity="0.6" cx="100" cy="90" rx="12" ry="8" />
            {/* Cheeks */}
            <ellipse fill="rgba(233,69,96,0.3)" cx="70" cy="82" rx="10" ry="7" />
            <ellipse fill="rgba(233,69,96,0.3)" cx="130" cy="82" rx="10" ry="7" />
            {/* Feet */}
            <ellipse fill={buddyColor} cx="74" cy="215" rx="22" ry="12" />
            <ellipse fill={buddyColor} cx="126" cy="215" rx="22" ry="12" />
            {/* Tail */}
            <path fill="none" stroke={buddyColor} strokeWidth="10" strokeLinecap="round"
              d="M 148 195 C 175 210 185 235 165 248 C 150 258 135 245 145 232" />
          </g>
        )}
      </svg>

      {/* Loading label */}
      {!done && (
        <p className="text-sm text-white/40 tracking-widest uppercase animate-pulse">
          {strokeDone ? 'Summoning Biscuit…' : 'Drawing…'}
        </p>
      )}
    </div>
  )
}
