// Animated SVG mushroom character
// Placeholder until Rive .riv assets arrive
// All animation is CSS — compositor thread, no JS loops

export type Expression = 'idle' | 'happy' | 'hungry' | 'thinking' | 'speaking' | 'eating' | 'yawn'

interface Props {
  size?: number
  expression?: Expression
}

const MOUTH: Record<Expression, string> = {
  idle:     'M43 102 Q50 109 57 102',
  happy:    'M40 100 Q50 112 60 100',
  hungry:   'M44 106 Q50 104 56 106',
  thinking: 'M44 102 Q50 106 56 102',
  speaking: 'M44 100 Q50 112 56 100',
  eating:   'M43 100 Q50 114 57 100',   // open wide — chomped by animation
  yawn:     'M42 99 Q50 120 58 99',      // jaw-drop wide
}

const CSS = `
  @keyframes buddy-float {
    0%,100% { transform: translateY(0px) rotate(0deg); }
    25%      { transform: translateY(-10px) rotate(-1deg); }
    75%      { transform: translateY(-6px) rotate(1deg); }
  }
  @keyframes buddy-breathe {
    0%,100% { transform: scaleX(1) scaleY(1); }
    50%      { transform: scaleX(1.03) scaleY(0.98); }
  }
  @keyframes buddy-blink-l {
    0%,82%,100% { transform: scaleY(1); }
    86%,90%     { transform: scaleY(0.07); }
  }
  @keyframes buddy-blink-r {
    0%,72%,100% { transform: scaleY(1); }
    76%,80%     { transform: scaleY(0.07); }
  }
  @keyframes buddy-glow-pulse {
    0%,100% { opacity: 0.45; transform: translateX(-50%) scale(1); }
    50%      { opacity: 0.75; transform: translateX(-50%) scale(1.08); }
  }
  @keyframes buddy-spot  { 0%,100%{opacity:0.88} 50%{opacity:1} }
  @keyframes buddy-spot2 { 0%,100%{opacity:0.88} 50%{opacity:1} }

  /* Eating — mouth chomps open/closed */
  @keyframes buddy-chomp-open  { 0%,45%,100%{opacity:1} 50%,95%{opacity:0} }
  @keyframes buddy-chomp-close { 0%,45%,100%{opacity:0} 50%,95%{opacity:1} }
  .buddy-chomp-open  { animation: buddy-chomp-open  0.38s ease-in-out infinite; }
  .buddy-chomp-close { animation: buddy-chomp-close 0.38s ease-in-out infinite; }

  /* Yawn — eyes droop, jaw drops, then recovery */
  @keyframes buddy-yawn-eye {
    0%,25%,100% { transform: scaleY(1); }
    40%,70%     { transform: scaleY(0.28); }
  }
  @keyframes buddy-yawn-mouth {
    0%,20%  { d: path('M43 102 Q50 109 57 102'); }
    35%,65% { d: path('M42 99 Q50 120 58 99'); }
    85%,100%{ d: path('M43 102 Q50 109 57 102'); }
  }
  .buddy-yawn-eye-l {
    animation: buddy-yawn-eye 2.8s ease-in-out forwards;
    transform-box: fill-box; transform-origin: center;
  }
  .buddy-yawn-eye-r {
    animation: buddy-yawn-eye 2.8s ease-in-out forwards 0.08s;
    transform-box: fill-box; transform-origin: center;
  }
  .buddy-yawn-mouth-path {
    animation: buddy-yawn-mouth 2.8s ease-in-out forwards;
  }

  .buddy-float   { animation: buddy-float 3.6s ease-in-out infinite; }
  .buddy-breathe { animation: buddy-breathe 2.8s ease-in-out infinite; }
  .buddy-blink-l {
    animation: buddy-blink-l 5s ease-in-out infinite;
    transform-box: fill-box; transform-origin: center;
  }
  .buddy-blink-r {
    animation: buddy-blink-r 5s ease-in-out infinite 0.8s;
    transform-box: fill-box; transform-origin: center;
  }
  .buddy-glow  { animation: buddy-glow-pulse 3s ease-in-out infinite; }
  .buddy-spot1 { animation: buddy-spot  2.2s ease-in-out infinite; }
  .buddy-spot2 { animation: buddy-spot2 2.2s ease-in-out infinite 0.7s; }
  .buddy-spot3 { animation: buddy-spot  2.2s ease-in-out infinite 1.4s; }
`

export function BuddyCharacter({ size = 200, expression = 'idle' }: Props) {
  const h = size * 1.25
  const isEating = expression === 'eating'
  const isYawning = expression === 'yawn'

  // Eye class: yawn droops both; otherwise normal blink
  const eyeLClass = isYawning ? 'buddy-yawn-eye-l' : 'buddy-blink-l'
  const eyeRClass = isYawning ? 'buddy-yawn-eye-r' : 'buddy-blink-r'

  return (
    <div style={{ position: 'relative', width: size, height: h, flexShrink: 0 }}>
      <style>{CSS}</style>

      {/* Ambient glow */}
      <div className="buddy-glow" style={{
        position: 'absolute', bottom: h * 0.04, left: '50%',
        width: size * 0.85, height: size * 0.45,
        background: 'radial-gradient(ellipse, rgba(217,119,87,0.35) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(14px)', pointerEvents: 'none',
      }} />

      <div className="buddy-float" style={{ width: size, height: h }}>
        <div className="buddy-breathe" style={{ width: size, height: h, transformOrigin: 'bottom center' }}>
          <svg viewBox="0 0 100 125" width={size} height={h} xmlns="http://www.w3.org/2000/svg">

            <ellipse cx="50" cy="121" rx="22" ry="4" fill="rgba(0,0,0,0.22)" />

            {/* Body */}
            <rect x="31" y="70" width="38" height="46" rx="17" fill="#f2debb" />
            <rect x="31" y="96" width="38" height="20" rx="12" fill="#e5c9a0" />
            <ellipse cx="50" cy="76" rx="14" ry="6" fill="rgba(255,255,255,0.15)" />

            {/* Arms */}
            <ellipse cx="23" cy="88" rx="10" ry="7" fill="#f2debb" transform="rotate(-25 23 88)" />
            <ellipse cx="77" cy="88" rx="10" ry="7" fill="#f2debb" transform="rotate(25 77 88)" />
            <ellipse cx="23" cy="90" rx="7" ry="5" fill="#e5c9a0" transform="rotate(-25 23 90)" />
            <ellipse cx="77" cy="90" rx="7" ry="5" fill="#e5c9a0" transform="rotate(25 77 90)" />

            {/* Cap */}
            <ellipse cx="50" cy="71" rx="43" ry="12" fill="#7a3018" />
            <ellipse cx="50" cy="71" rx="35" ry="8" fill="#9c4022" />
            <path d="M7 71 Q7 18 50 12 Q93 18 93 71 Z" fill="#d97757" />
            <path d="M7 71 Q9 44 50 38 Q91 44 93 71" fill="#b85838" opacity="0.55" />
            <path d="M20 56 Q33 28 50 22" stroke="rgba(255,255,255,0.22)" strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M50 12 Q80 20 90 50" stroke="rgba(255,255,255,0.08)" strokeWidth="4" strokeLinecap="round" fill="none" />

            {/* Spots */}
            <ellipse className="buddy-spot1" cx="28" cy="46" rx="11" ry="9" fill="rgba(255,255,255,0.9)" />
            <ellipse className="buddy-spot2" cx="52" cy="36" rx="10" ry="9" fill="rgba(255,255,255,0.9)" />
            <ellipse className="buddy-spot3" cx="74" cy="44" rx="11" ry="9" fill="rgba(255,255,255,0.9)" />
            <ellipse cx="28" cy="47" rx="7" ry="6" fill="rgba(240,220,200,0.4)" />
            <ellipse cx="52" cy="37" rx="6" ry="5.5" fill="rgba(240,220,200,0.4)" />
            <ellipse cx="74" cy="45" rx="7" ry="6" fill="rgba(240,220,200,0.4)" />
            <ellipse cx="40" cy="60" rx="6.5" ry="5.5" fill="rgba(255,255,255,0.75)" />
            <ellipse cx="62" cy="59" rx="6.5" ry="5.5" fill="rgba(255,255,255,0.75)" />

            {/* ── Eyes ── */}
            <g className={eyeLClass}>
              <ellipse cx="40" cy="85" rx="9.5" ry="10.5" fill="#fdfaf6" />
              <ellipse cx="40" cy="86.5" rx="6" ry="6.5" fill="#2a1f14" />
              <ellipse cx="37" cy="83.5" rx="2.5" ry="2.5" fill="white" />
              <ellipse cx="43" cy="90" rx="1.5" ry="1" fill="rgba(255,255,255,0.4)" />
            </g>
            <path d="M31 82 Q40 78 49 82" stroke="#d4a87a" strokeWidth="1.5" strokeLinecap="round" fill="none" />

            <g className={eyeRClass}>
              <ellipse cx="60" cy="85" rx="9.5" ry="10.5" fill="#fdfaf6" />
              <ellipse cx="60" cy="86.5" rx="6" ry="6.5" fill="#2a1f14" />
              <ellipse cx="57" cy="83.5" rx="2.5" ry="2.5" fill="white" />
              <ellipse cx="63" cy="90" rx="1.5" ry="1" fill="rgba(255,255,255,0.4)" />
            </g>
            <path d="M51 82 Q60 78 69 82" stroke="#d4a87a" strokeWidth="1.5" strokeLinecap="round" fill="none" />

            {/* Blush */}
            <ellipse cx="27" cy="96" rx="9" ry="5" fill="rgba(240,110,90,0.28)" />
            <ellipse cx="73" cy="96" rx="9" ry="5" fill="rgba(240,110,90,0.28)" />

            {/* ── Mouth ── */}
            {isEating ? (
              // Chomp: two paths alternating — open wide / closed
              <>
                <path className="buddy-chomp-open"
                  d="M43 100 Q50 114 57 100"
                  stroke="#7a3525" strokeWidth="3" strokeLinecap="round" fill="none" />
                <path className="buddy-chomp-open"
                  d="M45 104 Q50 112 55 104" fill="#4a2010" />
                <path className="buddy-chomp-close"
                  d="M44 106 Q50 104 56 106"
                  stroke="#7a3525" strokeWidth="3" strokeLinecap="round" fill="none" />
              </>
            ) : isYawning ? (
              <>
                <path className="buddy-yawn-mouth-path"
                  d={MOUTH.yawn}
                  stroke="#7a3525" strokeWidth="3" strokeLinecap="round" fill="none" />
                <path d="M43 103 Q50 116 57 103" fill="#4a2010" opacity="0.85" />
              </>
            ) : (
              <path d={MOUTH[expression]} stroke="#7a3525" strokeWidth="3" strokeLinecap="round" fill="none" />
            )}

            {/* Speaking mouth fill */}
            {expression === 'speaking' && (
              <path d="M45 104 Q50 112 55 104" fill="#4a2010" />
            )}

            {/* Hungry eyebrows */}
            {expression === 'hungry' && (
              <>
                <path d="M32 76 Q40 73 47 77" stroke="#c4905a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M53 77 Q60 73 68 76" stroke="#c4905a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </>
            )}

            {/* Thinking squint */}
            {expression === 'thinking' && (
              <path d="M51 82 Q60 88 69 82" stroke="#d4a87a" strokeWidth="3" strokeLinecap="round" fill="#d4a87a" />
            )}

            {/* Yawn — ZZZ particles */}
            {isYawning && (
              <>
                <text x="66" y="78" fontSize="7" fill="rgba(217,119,87,0.6)" fontFamily="serif" style={{ animation: 'buddy-spot 2.8s ease-in-out forwards' }}>z</text>
                <text x="72" y="70" fontSize="5" fill="rgba(217,119,87,0.4)" fontFamily="serif">z</text>
              </>
            )}

          </svg>
        </div>
      </div>
    </div>
  )
}
