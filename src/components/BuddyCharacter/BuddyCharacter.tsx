// Animated SVG mushroom character
// Placeholder until Rive .riv assets arrive
// All animation is CSS — compositor thread, no JS loops

export type Expression = 'idle' | 'happy' | 'hungry' | 'thinking' | 'speaking' | 'eating' | 'yawn' | 'laugh'

interface Props {
  size?: number
  expression?: Expression
}

const MOUTH: Record<Expression, string> = {
  idle:     'M44 103 Q50 109 56 103',
  happy:    'M40 101 Q50 113 60 101',
  hungry:   'M44 106 Q50 104 56 106',
  thinking: 'M45 103 Q50 107 55 103',
  speaking: 'M44 101 Q50 111 56 101',  // base open — animated by CSS
  eating:   'M43 100 Q50 115 57 100',
  yawn:     'M42 99 Q50 121 58 99',
  laugh:    'M39 100 Q50 118 61 100',
}

const CSS = `
  @keyframes buddy-float {
    0%,100% { transform: translateY(0px) rotate(0deg); }
    30%      { transform: translateY(-9px) rotate(-1.2deg); }
    70%      { transform: translateY(-5px) rotate(1deg); }
  }
  @keyframes buddy-breathe {
    0%,100% { transform: scaleX(1) scaleY(1); }
    50%      { transform: scaleX(1.025) scaleY(0.982); }
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
    50%      { opacity: 0.72; transform: translateX(-50%) scale(1.07); }
  }
  @keyframes buddy-spot  { 0%,100%{opacity:0.88} 50%{opacity:1} }
  @keyframes buddy-spot2 { 0%,100%{opacity:0.88} 50%{opacity:1} }

  /* ── Speaking — mouth pulses between open and closed ── */
  @keyframes buddy-speak-path {
    0%    { d: path('M44 104 Q50 108 56 104'); }
    15%   { d: path('M44 101 Q50 114 56 101'); }
    30%   { d: path('M44 104 Q50 109 56 104'); }
    50%   { d: path('M44 100 Q50 116 56 100'); }
    65%   { d: path('M44 103 Q50 109 56 103'); }
    80%   { d: path('M44 101 Q50 113 56 101'); }
    100%  { d: path('M44 104 Q50 108 56 104'); }
  }
  @keyframes buddy-speak-fill {
    0%,25%,55%,85%,100% { opacity: 0; }
    15%,50%,80%         { opacity: 0.9; }
  }
  .buddy-speak-mouth {
    animation: buddy-speak-path 0.55s ease-in-out infinite;
  }
  .buddy-speak-fill {
    animation: buddy-speak-fill 0.55s ease-in-out infinite;
  }

  /* ── Eating — dramatic chomp with inner fill ── */
  @keyframes buddy-chomp-open  {
    0%,42%,100% { opacity: 1; }
    50%,92%     { opacity: 0; }
  }
  @keyframes buddy-chomp-close {
    0%,42%,100% { opacity: 0; }
    50%,92%     { opacity: 1; }
  }
  @keyframes buddy-chomp-inner {
    0%,42%,100% { opacity: 1; transform: scaleY(1); }
    50%,92%     { opacity: 0; transform: scaleY(0.3); }
  }
  .buddy-chomp-open  { animation: buddy-chomp-open  0.36s ease-in-out infinite; }
  .buddy-chomp-close { animation: buddy-chomp-close 0.36s ease-in-out infinite; }
  .buddy-chomp-inner {
    animation: buddy-chomp-inner 0.36s ease-in-out infinite;
    transform-box: fill-box; transform-origin: top center;
  }

  /* ── Laugh — wide open mouth bounces, body shakes ── */
  @keyframes buddy-laugh-mouth {
    0%    { d: path('M39 101 Q50 116 61 101'); }
    15%   { d: path('M38 99 Q50 120 62 99'); }
    30%   { d: path('M39 101 Q50 116 61 101'); }
    50%   { d: path('M38 98 Q50 122 62 98'); }
    65%   { d: path('M39 101 Q50 116 61 101'); }
    80%   { d: path('M38 99 Q50 119 62 99'); }
    100%  { d: path('M39 101 Q50 116 61 101'); }
  }
  @keyframes buddy-laugh-shake {
    0%,100% { transform: translateX(0) rotate(0deg); }
    20%     { transform: translateX(-2px) rotate(-1.5deg); }
    40%     { transform: translateX(2px) rotate(1.5deg); }
    60%     { transform: translateX(-1.5px) rotate(-1deg); }
    80%     { transform: translateX(1.5px) rotate(1deg); }
  }
  @keyframes buddy-laugh-body {
    0%,100% { transform: scaleX(1) scaleY(1); }
    25%     { transform: scaleX(1.04) scaleY(0.97); }
    50%     { transform: scaleX(0.97) scaleY(1.03); }
    75%     { transform: scaleX(1.03) scaleY(0.98); }
  }
  .buddy-laugh-mouth {
    animation: buddy-laugh-mouth 0.45s ease-in-out infinite;
  }
  .buddy-laugh-shake {
    animation: buddy-laugh-shake 0.45s ease-in-out infinite;
  }
  .buddy-laugh-body {
    animation: buddy-laugh-body 0.45s ease-in-out infinite;
    transform-box: fill-box; transform-origin: center bottom;
  }

  /* ── Yawn ── */
  @keyframes buddy-yawn-eye {
    0%,20%,100% { transform: scaleY(1); }
    35%,70%     { transform: scaleY(0.22); }
  }
  @keyframes buddy-yawn-mouth {
    0%,18%  { d: path('M44 103 Q50 109 56 103'); }
    32%,65% { d: path('M42 99 Q50 121 58 99'); }
    82%,100%{ d: path('M44 103 Q50 109 56 103'); }
  }
  @keyframes buddy-yawn-inner {
    0%,20%  { opacity: 0; }
    35%,65% { opacity: 0.88; }
    82%,100%{ opacity: 0; }
  }
  .buddy-yawn-eye-l {
    animation: buddy-yawn-eye 3s ease-in-out forwards;
    transform-box: fill-box; transform-origin: center;
  }
  .buddy-yawn-eye-r {
    animation: buddy-yawn-eye 3s ease-in-out forwards 0.09s;
    transform-box: fill-box; transform-origin: center;
  }
  .buddy-yawn-mouth-path {
    animation: buddy-yawn-mouth 3s ease-in-out forwards;
  }
  .buddy-yawn-inner {
    animation: buddy-yawn-inner 3s ease-in-out forwards;
  }

  /* ── Happy — eyebrows raise, then subtle bounce ── */
  @keyframes buddy-happy-bob {
    0%,100% { transform: translateY(0px); }
    40%     { transform: translateY(-3px); }
  }

  /* ── Base utils ── */
  .buddy-float   { animation: buddy-float 3.8s ease-in-out infinite; }
  .buddy-breathe { animation: buddy-breathe 2.9s ease-in-out infinite; }
  .buddy-blink-l {
    animation: buddy-blink-l 5.2s ease-in-out infinite;
    transform-box: fill-box; transform-origin: center;
  }
  .buddy-blink-r {
    animation: buddy-blink-r 5.2s ease-in-out infinite 0.85s;
    transform-box: fill-box; transform-origin: center;
  }
  .buddy-glow  { animation: buddy-glow-pulse 3.2s ease-in-out infinite; }
  .buddy-spot1 { animation: buddy-spot  2.4s ease-in-out infinite; }
  .buddy-spot2 { animation: buddy-spot2 2.4s ease-in-out infinite 0.8s; }
  .buddy-spot3 { animation: buddy-spot  2.4s ease-in-out infinite 1.6s; }
`

export function BuddyCharacter({ size = 200, expression = 'idle' }: Props) {
  const h = size * 1.25
  const isEating   = expression === 'eating'
  const isYawning  = expression === 'yawn'
  const isSpeaking = expression === 'speaking'
  const isHappy    = expression === 'happy'
  const isLaughing = expression === 'laugh'

  const eyeLClass = isYawning ? 'buddy-yawn-eye-l' : 'buddy-blink-l'
  const eyeRClass = isYawning ? 'buddy-yawn-eye-r' : 'buddy-blink-r'

  return (
    <div style={{ position: 'relative', width: size, height: h, flexShrink: 0 }}>
      <style>{CSS}</style>

      {/* Ambient glow */}
      <div className="buddy-glow" style={{
        position: 'absolute', bottom: h * 0.04, left: '50%',
        width: size * 0.85, height: size * 0.44,
        background: 'radial-gradient(ellipse, rgba(217,119,87,0.35) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(14px)', pointerEvents: 'none',
      }} />

      <div
        className={isLaughing ? 'buddy-laugh-shake' : 'buddy-float'}
        style={{
          width: size, height: h,
          animation: isHappy ? 'buddy-happy-bob 0.55s ease-in-out 3, buddy-float 3.8s ease-in-out infinite 1.65s' : undefined,
        }}
      >
        <div
          className={isLaughing ? 'buddy-laugh-body' : 'buddy-breathe'}
          style={{ width: size, height: h, transformOrigin: 'bottom center' }}
        >
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
            {/* Left eyebrow */}
            <path
              d={isHappy
                ? 'M31 78 Q40 74 49 78'
                : expression === 'hungry'
                ? 'M32 76 Q40 73 47 77'
                : 'M31 82 Q40 78 49 82'}
              stroke="#d4a87a" strokeWidth="1.5" strokeLinecap="round" fill="none"
              style={{ transition: 'd 0.4s ease' }}
            />

            <g className={eyeRClass}>
              <ellipse cx="60" cy="85" rx="9.5" ry="10.5" fill="#fdfaf6" />
              <ellipse cx="60" cy="86.5" rx="6" ry="6.5" fill="#2a1f14" />
              <ellipse cx="57" cy="83.5" rx="2.5" ry="2.5" fill="white" />
              <ellipse cx="63" cy="90" rx="1.5" ry="1" fill="rgba(255,255,255,0.4)" />
            </g>
            {/* Right eyebrow */}
            <path
              d={isHappy
                ? 'M51 78 Q60 74 69 78'
                : expression === 'hungry'
                ? 'M53 77 Q60 73 68 76'
                : '51 82 Q60 78 69 82'}
              stroke="#d4a87a" strokeWidth="1.5" strokeLinecap="round" fill="none"
              style={{ transition: 'd 0.4s ease' }}
            />

            {/* Blush */}
            <ellipse cx="27" cy="96" rx="9" ry="5" fill={(isHappy || isLaughing) ? 'rgba(240,90,80,0.42)' : 'rgba(240,110,90,0.26)'} />
            <ellipse cx="73" cy="96" rx="9" ry="5" fill={(isHappy || isLaughing) ? 'rgba(240,90,80,0.42)' : 'rgba(240,110,90,0.26)'} />

            {/* Laugh — squinted closed eyes */}
            {isLaughing && (
              <>
                <path d="M31 85 Q40 82 49 85" stroke="#2a1f14" strokeWidth="4" strokeLinecap="round" fill="none" />
                <path d="M51 85 Q60 82 69 85" stroke="#2a1f14" strokeWidth="4" strokeLinecap="round" fill="none" />
                {/* Eye crinkle */}
                <path d="M33 88 Q40 86 47 88" stroke="#e5c9a0" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
                <path d="M53 88 Q60 86 67 88" stroke="#e5c9a0" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
              </>
            )}

            {/* Thinking one-eye squint */}
            {expression === 'thinking' && (
              <path d="M51.5 83 Q60 89 68.5 83" stroke="#d4a87a" strokeWidth="3" strokeLinecap="round" fill="#d4a87a" />
            )}

            {/* ── Mouth ── */}
            {isEating ? (
              <>
                {/* Open chomp — wide jaw */}
                <path className="buddy-chomp-open"
                  d="M43 100 Q50 115 57 100"
                  stroke="#7a3525" strokeWidth="3" strokeLinecap="round" fill="none" />
                {/* Inner mouth when open */}
                <path className="buddy-chomp-inner"
                  d="M45 105 Q50 113 55 105" fill="#3a1a0c" />
                <path className="buddy-chomp-inner"
                  d="M46 101 Q50 104 54 101" fill="#f2debb" opacity="0.6" />
                {/* Closed */}
                <path className="buddy-chomp-close"
                  d="M44 106 Q50 104 56 106"
                  stroke="#7a3525" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </>
            ) : isYawning ? (
              <>
                <path className="buddy-yawn-mouth-path"
                  d={MOUTH.yawn}
                  stroke="#7a3525" strokeWidth="3" strokeLinecap="round" fill="none" />
                {/* Inner mouth — fades in with yawn */}
                <path className="buddy-yawn-inner"
                  d="M43 103 Q50 117 57 103" fill="#3a1a0c" />
              </>
            ) : isSpeaking ? (
              <>
                <path
                  className="buddy-speak-mouth"
                  d={MOUTH.speaking}
                  stroke="#7a3525" strokeWidth="3" strokeLinecap="round" fill="none"
                />
                <path
                  className="buddy-speak-fill"
                  d="M45 105 Q50 113 55 105"
                  fill="#3a1a0c"
                />
              </>
            ) : isLaughing ? (
              <>
                {/* Wide laugh mouth — animated open */}
                <path
                  className="buddy-laugh-mouth"
                  d={MOUTH.laugh}
                  stroke="#7a3525" strokeWidth="3.5" strokeLinecap="round" fill="none"
                />
                {/* Inner mouth — always visible when laughing */}
                <path d="M41 104 Q50 117 59 104" fill="#3a1a0c" />
                {/* Teeth top row */}
                <path d="M42 103 Q50 103 58 103" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </>
            ) : (
              <path d={MOUTH[expression]} stroke="#7a3525" strokeWidth="3" strokeLinecap="round" fill="none" />
            )}

            {/* Hungry eyebrows (redundant path kept for compat) */}
            {expression === 'hungry' && (
              <>
                <path d="M32 76 Q40 73 47 77" stroke="#c4905a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M53 77 Q60 73 68 76" stroke="#c4905a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </>
            )}

            {/* Happy sparkle */}
            {isHappy && (
              <>
                <text x="18" y="74" fontSize="7" fill="rgba(232,218,74,0.85)" style={{ animation: 'buddy-spot 1.2s ease-in-out 3' }}>✦</text>
                <text x="76" y="70" fontSize="5" fill="rgba(232,218,74,0.65)" style={{ animation: 'buddy-spot 1.2s ease-in-out 3 0.3s' }}>✦</text>
              </>
            )}

            {/* Yawn ZZZ */}
            {isYawning && (
              <>
                <text x="66" y="76" fontSize="7" fill="rgba(217,119,87,0.6)" fontFamily="serif" style={{ animation: 'buddy-spot 3s ease-in-out forwards' }}>z</text>
                <text x="73" y="67" fontSize="5" fill="rgba(217,119,87,0.38)" fontFamily="serif">z</text>
              </>
            )}

          </svg>
        </div>
      </div>
    </div>
  )
}
