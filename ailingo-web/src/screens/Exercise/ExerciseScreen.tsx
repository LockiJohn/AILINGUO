"use client"
import { useEffect, useRef } from 'react'
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

export default function ExerciseScreen() {
    const router = useRouter()
    const { exercises, currentIndex, currentLesson, results, recordResult, nextExercise, endSession } = useSessionStore()
    const startTimeRef = useRef<number>(Date.now())

    useEffect(() => {
        if (!exercises.length) {
            router.push('/course')
        }
        startTimeRef.current = Date.now()
    }, [currentIndex, exercises.length, router])

    if (!exercises.length) return null

    const isFinished = currentIndex >= exercises.length

    if (isFinished) {
        handleFinish()
        return null
    }

    const exercise = exercises[currentIndex]
    const progress = Math.round((currentIndex / exercises.length) * 100)

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
                <div className="xp-chip">❤️ {exercises.length - currentIndex}</div>
            </div>

            {/* Lesson title */}
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--clr-text-muted)', marginBottom: 'var(--space-4)', fontWeight: 600 }}>
                {currentLesson?.title} · {currentIndex + 1}/{exercises.length}
            </div>

            {/* Exercise content */}
            <div style={{ flex: 1, overflow: 'auto' }}>
                <ExerciseRenderer
                    exercise={exercise}
                    onAnswer={handleAnswer}
                    onNext={nextExercise}
                />
            </div>
        </div>
    )
}

function ExerciseRenderer({
    exercise,
    onAnswer,
    onNext,
}: {
    exercise: Exercise
    onAnswer: (correct: boolean, answer: string) => void
    onNext: () => void
}) {
    const props = { exercise, onAnswer, onNext }

    switch (exercise.type) {
        case 'multiple_choice':
            return <MultipleChoiceExercise {...props} />
        case 'translation_it_en':
        case 'translation_en_it':
            return <TranslationExercise {...props} />
        case 'word_order':
            return <WordOrderExercise {...props} />
        case 'fill_blank':
            return <FillBlankExercise {...props} />
        case 'listen_write':
            return <ListenWriteExercise {...props} />
        case 'speaking':
            return <SpeakingExercise {...props} />
        case 'match_pairs':
            return <MatchPairsExercise {...props} />
        default:
            return <TranslationExercise {...props} />
    }
}

