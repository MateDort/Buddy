// SVG nav icons — sharp, minimal, Duolingo-style

export function HomeIcon({ active }: { active: boolean }) {
  const c = active ? '#d97757' : '#4a4845'
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      {/* Roof */}
      <path
        d="M11 3L3 9.5V19h5.5v-5h5v5H19V9.5L11 3Z"
        fill={active ? 'rgba(217,119,87,0.15)' : 'transparent'}
        stroke={c}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{ transition: 'all 0.2s' }}
      />
      {/* Door */}
      <rect
        x="8.5" y="13.5" width="5" height="5.5"
        rx="1"
        fill={active ? 'rgba(217,119,87,0.3)' : 'transparent'}
        stroke={c}
        strokeWidth="1.4"
        style={{ transition: 'all 0.2s' }}
      />
    </svg>
  )
}

export function KitchenIcon({ active }: { active: boolean }) {
  const c = active ? '#d97757' : '#4a4845'
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      {/* Fork */}
      <path
        d="M7 3v4c0 1.1.9 2 2 2v8"
        stroke={c}
        strokeWidth="1.6"
        strokeLinecap="round"
        style={{ transition: 'all 0.2s' }}
      />
      <line
        x1="7" y1="3" x2="7" y2="7"
        stroke={c}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <line
        x1="8.5" y1="3" x2="8.5" y2="5.5"
        stroke={c}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* Knife */}
      <path
        d="M14 3c0 0 2 2 2 5h-2v9"
        stroke={c}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={active ? 'rgba(217,119,87,0.15)' : 'transparent'}
        style={{ transition: 'all 0.2s' }}
      />
    </svg>
  )
}

export function OfficeIcon({ active }: { active: boolean }) {
  const c = active ? '#d97757' : '#4a4845'
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      {/* Laptop base */}
      <rect
        x="3" y="12" width="16" height="6" rx="1.5"
        fill={active ? 'rgba(217,119,87,0.15)' : 'transparent'}
        stroke={c}
        strokeWidth="1.5"
        style={{ transition: 'all 0.2s' }}
      />
      {/* Laptop screen */}
      <path
        d={active
          ? 'M5 12V7a1 1 0 011-1h10a1 1 0 011 1v5'   // lid open
          : 'M6.5 12V9.5a.5.5 0 01.5-.5h8a.5.5 0 01.5.5V12'  // lid more closed
        }
        stroke={c}
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill={active ? 'rgba(217,119,87,0.08)' : 'transparent'}
        style={{ transition: 'd 0.2s, all 0.2s' }}
      />
      {active && (
        <>
          <circle cx="8" cy="15" r="0.8" fill={c} />
          <circle cx="11" cy="15" r="0.8" fill={c} />
          <circle cx="14" cy="15" r="0.8" fill={c} />
        </>
      )}
    </svg>
  )
}

export function SettingsIcon({ active }: { active: boolean }) {
  const c = active ? '#d97757' : '#4a4845'
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="2.5"
        fill={active ? 'rgba(217,119,87,0.2)' : 'transparent'}
        stroke={c} strokeWidth="1.5"
        style={{ transition: 'all 0.2s' }}
      />
      <path
        d="M11 3.5v1.8M11 16.7v1.8M3.5 11h1.8M16.7 11h1.8M5.6 5.6l1.3 1.3M15.1 15.1l1.3 1.3M5.6 16.4l1.3-1.3M15.1 6.9l1.3-1.3"
        stroke={c} strokeWidth="1.5" strokeLinecap="round"
        style={{ transition: 'all 0.2s' }}
      />
    </svg>
  )
}
