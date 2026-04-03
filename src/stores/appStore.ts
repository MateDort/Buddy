import { create } from 'zustand'

export type RoomId = 'home' | 'kitchen' | 'office' | 'settings'
export type BuddySpecies = 'mushroom' | 'dragon' | 'cat' | 'fox' | 'dog' | 'rabbit' | 'bear' | 'wolf' | 'owl' | 'unknown'
export type GrowthStage = 'baby' | 'teen' | 'adult'

export interface BuddyInfo {
  name: string
  species: BuddySpecies
  stage: GrowthStage
  xp: number
  hunger: number      // 0–100, decays over time
  happiness: number   // 0–100, decays when idle
  energy: number      // 0–100, replenished by coding activity
}

interface AppState {
  // null = not yet checked, false = CLI missing, true = ready
  claudeReady: boolean | null
  buddy: BuddyInfo | null
  currentRoom: RoomId
  isLoading: boolean

  setClaudeReady: (ready: boolean) => void
  setBuddy: (info: BuddyInfo) => void
  updateBuddy: (partial: Partial<BuddyInfo>) => void
  setRoom: (room: RoomId) => void
  setLoading: (loading: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  claudeReady: null,
  buddy: null,
  currentRoom: 'home',
  isLoading: false,

  setClaudeReady: (ready) => set({ claudeReady: ready }),
  setBuddy: (info) => set({ buddy: info }),
  updateBuddy: (partial) =>
    set((state) => {
      if (!state.buddy) return state
      const updated = { ...state.buddy, ...partial }
      // Clamp all stats to 0–100
      if ('hunger' in partial) updated.hunger = Math.max(0, Math.min(100, updated.hunger))
      if ('happiness' in partial) updated.happiness = Math.max(0, Math.min(100, updated.happiness))
      if ('energy' in partial) updated.energy = Math.max(0, Math.min(100, updated.energy))
      return { buddy: updated }
    }),
  setRoom: (room) => set({ currentRoom: room }),
  setLoading: (loading) => set({ isLoading: loading }),
}))
