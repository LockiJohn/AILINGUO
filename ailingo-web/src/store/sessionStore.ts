import { create } from 'zustand'
import type { Exercise } from '../types'

interface SessionStore {
    sessionId: number | null
    currentLesson: { id: number; title: string; content_json?: string } | null
    exercises: Exercise[]
    currentIndex: number
    results: Array<{ exercise: Exercise; isCorrect: boolean; userAnswer: string; timeMs: number }>
    startTime: number | null

    startSession: () => Promise<void>
    setLesson: (lesson: { id: number; title: string; content_json?: string }, exercises: Exercise[]) => void
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
        const res = await fetch('/api/session/start', { method: 'POST' })
        if (res.ok) {
            const { sessionId } = await res.json()
            set({ sessionId, startTime: Date.now() })
        }
    },

    setLesson: (lesson, exercises) => {
        set({ currentLesson: lesson, exercises, currentIndex: 0, results: [] })
    },

    recordResult: (exercise, isCorrect, userAnswer, timeMs) => {
        set((s) => {
            const newExercises = [...s.exercises]
            
            // Spaced Repetition (SRS): If incorrect, append to the end of the queue
            if (!isCorrect) {
                // We add a special flag to know it's a retry and avoid infinite XP loops
                newExercises.push({ ...exercise, isRetry: true } as any)
            }

            return {
                exercises: newExercises,
                results: [...s.results, { exercise, isCorrect, userAnswer, timeMs }],
            }
        })
        
        // Persist to DB
        fetch('/api/progress/exercise', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                exerciseId: exercise.id,
                userAnswer,
                isCorrect,
                responseTimeMs: timeMs,
            })
        })
    },

    nextExercise: () => {
        set((s) => ({ currentIndex: s.currentIndex + 1 }))
    },

    endSession: async () => {
        const { sessionId, results } = get()
        
        // Only count the FIRST attempt for accuracy and XP calculation
        const uniqueAttempts = new Map<number, boolean>()
        let xp = 0

        for (const r of results) {
            if (!uniqueAttempts.has(r.exercise.id)) {
                uniqueAttempts.set(r.exercise.id, r.isCorrect)
                
                if (r.isCorrect) {
                    xp += XP_PER_CORRECT
                    if (r.timeMs < 5000) xp += XP_BONUS_SPEED
                }
            }
        }

        const correctUniqueCount = Array.from(uniqueAttempts.values()).filter(Boolean).length
        const accuracy = uniqueAttempts.size > 0 ? Math.round((correctUniqueCount / uniqueAttempts.size) * 100) : 0

        if (sessionId) {
            await fetch('/api/session/end', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, xpEarned: xp, exerciseCount: uniqueAttempts.size, accuracy })
            })
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
