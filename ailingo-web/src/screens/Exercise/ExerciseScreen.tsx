"use client"
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '../../store/sessionStore'
import MultipleChoiceExercise from './types/MultipleChoiceExercise'
import TranslationExercise from './types/TranslationExercise'
import WordOrderExercise from './types/WordOrderExercise'
import FillBlankExercise from './types/FillBlankExercise'
import ListenWriteExercise from './types/ListenWriteExercise'
import SpeakingExercise from './types/SpeakingExercise'
import MatchPairsExercise from './types/MatchPairsExercise'
import type { Exercise } from '../../types'
import ContextReader from './components/ContextReader'
import ExerciseRenderer from './components/ExerciseRenderer'

export default function ExerciseScreen() {
    const router = useRouter()
    const { exercises, currentIndex, currentLesson, results, recordResult, nextExercise, endSession } = useSessionStore()
    const startTimeRef = useRef<number>(Date.now())
    const [showContext, setShowContext] = useState(!!currentLesson?.content_json)

    useEffect(() => {
        if (!exercises.length) {
            router.push('/course')
        }
        startTimeRef.current = Date.now()
    }, [currentIndex, exercises.length, router])

    if (!exercises.length) return null

    // Filter out exercises with null/empty prompts (bad DB data)
    const validExercises = exercises.filter(ex =>
        (ex.prompt_it && ex.prompt_it.trim() && ex.prompt_it !== 'null') ||
        (ex.prompt_en && ex.prompt_en.trim() && ex.prompt_en !== 'null')
    )

    if (!validExercises.length) {
        handleFinish()
        return null
    }

    const isFinished = currentIndex >= validExercises.length

    if (isFinished) {
        handleFinish()
        return null
    }

    const exercise = validExercises[currentIndex]
    const progress = Math.round((currentIndex / validExercises.length) * 100)

    async function handleFinish() {
        const { xp, accuracy } = await endSession()
        if (currentLesson) {
            await fetch('/api/progress/lesson', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lessonId: currentLesson.id, accuracy, xpEarned: xp })
            })
        }
        router.push('/results')
    }

    function handleAnswer(isCorrect: boolean, userAnswer: string) {
        const timeMs = Date.now() - startTimeRef.current
        recordResult(exercise, isCorrect, userAnswer, timeMs)
        // nextExercise is called inside exercise components after feedback
    }

    const correctCount = results.filter(r => r.isCorrect).length

    if (showContext && currentLesson?.content_json) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', padding: 'var(--space-6)', overflowY: 'auto' }}>
                <div className="flex flex-between" style={{ marginBottom: 'var(--space-6)', gap: 'var(--space-4)' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => router.push('/course')}>✕</button>
                    <div style={{ flex: 1, textAlign: 'center', fontWeight: 'bold' }}>{currentLesson.title}</div>
                </div>
                <ContextReader 
                    contentJson={currentLesson.content_json} 
                    onContinue={() => {
                        setShowContext(false)
                        startTimeRef.current = Date.now()
                    }} 
                />
            </div>
        )
    }

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', padding: 'var(--space-6)' }}>
            {/* Top bar */}
            <div className="flex flex-between" style={{ marginBottom: 'var(--space-6)', gap: 'var(--space-4)' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => router.push('/course')}>✕</button>
                <div style={{ flex: 1 }}>
                    <div className="progress-bar" style={{ height: 8 }}>
                        <div className="progress-bar__fill" style={{ width: `${progress}%` }} />
                    </div>
                </div>
                <div className="xp-chip">❤️ {validExercises.length - currentIndex}</div>
            </div>

            {/* Lesson title */}
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--clr-text-muted)', marginBottom: 'var(--space-4)', fontWeight: 600 }}>
                {currentLesson?.title} · {currentIndex + 1}/{validExercises.length}
            </div>

            {/* Exercise content */}
            <div style={{ flex: 1, overflow: 'auto' }}>
                <ExerciseRenderer
                    key={currentIndex}
                    exercise={exercise}
                    onAnswer={handleAnswer}
                    onNext={nextExercise}
                />
            </div>
        </div>
    )
}

