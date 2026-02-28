import { create } from 'zustand'
import type { Exercise } from '../types'

interface SessionStore {
    sessionId: number | null
    currentLesson: { id: number; title: string } | null
    exercises: Exercise[]
    currentIndex: number
    results: Array<{ exercise: Exercise; isCorrect: boolean; userAnswer: string; timeMs: number }>
    startTime: number | null

    startSession: () => Promise<void>
    setLesson: (lesson: { id: number; title: string }, exercises: Exercise[]) => void
    recordResult: (exercise: Exercise, isCorrect: boolean, userAnswer: string, timeMs: number) => void
    nextExercise: () => void
    endSession: () => Promise<{ xp: number; accuracy: number }>
    reset: () => void
}

const XP_PER_CORRECT = 10
const XP_BONUS_SPEED = 5 // bonus if answered < 5s

export const useSessionStore = create<SessionStore>((set, get) => ({
    sessionId: null,
    currentLesson: null,
    exercises: [],
    currentIndex: 0,
    results: [],
    startTime: null,

    startSession: async () => {
        const { sessionId } = await window.ailingo.startSession()
        set({ sessionId, startTime: Date.now() })
    },

    setLesson: (lesson, exercises) => {
        set({ currentLesson: lesson, exercises, currentIndex: 0, results: [] })
    },

    recordResult: (exercise, isCorrect, userAnswer, timeMs) => {
        set((s) => ({
            results: [...s.results, { exercise, isCorrect, userAnswer, timeMs }],
        }))
        // Persist to DB
        window.ailingo.saveExerciseResult({
            exerciseId: exercise.id,
            userAnswer,
            isCorrect,
            responseTimeMs: timeMs,
        })
    },

    nextExercise: () => {
        set((s) => ({ currentIndex: s.currentIndex + 1 }))
    },

    endSession: async () => {
        const { sessionId, results } = get()
        const correctCount = results.filter((r) => r.isCorrect).length
        const accuracy = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0

        let xp = 0
        for (const r of results) {
            if (r.isCorrect) {
                xp += XP_PER_CORRECT
                if (r.timeMs < 5000) xp += XP_BONUS_SPEED
            }
        }

        if (sessionId) {
            await window.ailingo.endSession(sessionId, xp, results.length, accuracy)
        }

        return { xp, accuracy }
    },

    reset: () => {
        set({
            sessionId: null,
            currentLesson: null,
            exercises: [],
            currentIndex: 0,
            results: [],
            startTime: null,
        })
    },
}))
