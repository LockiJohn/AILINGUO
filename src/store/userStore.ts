import { create } from 'zustand'
import type { User, UserStats } from '../types'

interface UserStore {
    user: User | null
    stats: UserStats | null
    isLoading: boolean
    loadUser: () => Promise<void>
    loadStats: () => Promise<void>
    setUser: (user: User) => void
}

export const useUserStore = create<UserStore>((set) => ({
    user: null,
    stats: null,
    isLoading: false,

    loadUser: async () => {
        set({ isLoading: true })
        try {
            const user = await window.ailingo.getUser()
            set({ user })
        } finally {
            set({ isLoading: false })
        }
    },

    loadStats: async () => {
        try {
            const stats = await window.ailingo.getUserStats()
            set({ stats })
        } catch (e) {
            console.error('Failed to load stats', e)
        }
    },

    setUser: (user) => set({ user }),
}))
