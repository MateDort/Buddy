import { useAppStore, type RoomId } from '../../stores/appStore'
import { HomeIcon, KitchenIcon, OfficeIcon, SettingsIcon } from './NavIcons'

interface NavItem {
  id: RoomId
  label: string
  Icon: React.FC<{ active: boolean }>
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from 'react'

const NAV_ITEMS: NavItem[] = [
  { id: 'home',     label: 'Home',     Icon: HomeIcon },
  { id: 'kitchen',  label: 'Kitchen',  Icon: KitchenIcon },
  { id: 'office',   label: 'Office',   Icon: OfficeIcon },
  { id: 'settings', label: 'Settings', Icon: SettingsIcon },
]

export function RoomNav() {
  const currentRoom = useAppStore((s) => s.currentRoom)
  const setRoom = useAppStore((s) => s.setRoom)

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      padding: '6px 8px 10px',
      borderTop: '1px solid rgba(217,119,87,0.10)',
      background: 'rgba(13,13,11,0.8)',
      flexShrink: 0,
      gap: 4,
    }}>
      {NAV_ITEMS.map(({ id, label, Icon }) => {
        const active = currentRoom === id
        return (
          <button
            key={id}
            onClick={() => setRoom(id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              padding: '7px 4px 5px',
              borderRadius: 10,
              background: active ? 'rgba(217,119,87,0.10)' : 'transparent',
              border: active ? '1px solid rgba(217,119,87,0.18)' : '1px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.18s',
            }}
          >
            <Icon active={active} />
            <span style={{
              fontSize: 9,
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: active ? 600 : 400,
              color: active ? '#d97757' : '#4a4845',
              letterSpacing: '0.04em',
              transition: 'color 0.18s',
            }}>
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
