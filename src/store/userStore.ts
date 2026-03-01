import { create } from 'zustand'
import type { User, UserStats } from '../types'
import { api } from '../services/api'

interface UserStore {
    user: User | null
    stats: UserStats | null
    profiles: User[]
    isLoading: boolean
    loadUser: () => Promise<void>
    loadStats: () => Promise<void>
    loadProfiles: () => Promise<void>
    switchUser: (userId: number) => Promise<void>
    setUser: (user: User | null) => void
}

export const useUserStore = create<UserStore>((set) => ({
    user: null,
    stats: null,
    profiles: [],
    isLoading: false,

    loadUser: async () => {
        set({ isLoading: true })
        try {
            const user = await api.getUser()
            set({ user })
        } finally {
            set({ isLoading: false })
        }
    },

    loadStats: async () => {
        try {
            const stats = await api.getUserStats()
            set({ stats })
        } catch (e) {
            console.error('Failed to load stats', e)
        }
    },

    loadProfiles: async () => {
        try {
            const profiles = await api.getAllUsers()
            set({ profiles })
        } catch (e) {
            console.error('Failed to load profiles', e)
        }
    },

    switchUser: async (userId: number) => {
        set({ isLoading: true })
        try {
            const res = await api.switchUser(userId)
            if (res.ok) {
                const user = await api.getUser()
                set({ user })
            }
        } finally {
            set({ isLoading: false })
        }
    },

    setUser: (user) => set({ user }),
}))
