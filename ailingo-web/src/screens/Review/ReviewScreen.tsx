"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '../../store/sessionStore'
import type { Exercise } from '../../types'

import ExerciseRenderer from '../Exercise/components/ExerciseRenderer'

export default function ReviewScreen() {
    const [queue, setQueue] = useState<Exercise[]>([])
    const [currentIdx, setCurrentIdx] = useState(0)
    const [loading, setLoading] = useState(true)
    const [done, setDone] = useState(false)
    const router = useRouter()

    useEffect(() => {
        fetch('/api/review')
            .then(res => res.json())
            .then(q => {
                setQueue(q)
                setLoading(false)
            })
    }, [])

    if (loading) return (
        <div className="screen-container flex flex-center" style={{ height: '100%' }}>
            <p className="text-muted animate-pulse">Caricamento ripasso…</p>
        </div>
    )

    if (!queue.length || done) {
        return (
            <div className="flex flex-col flex-center" style={{ height: '100vh', padding: 'var(--space-8)' }}>
                <div style={{ textAlign: 'center', maxWidth: 400 }}>
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>{queue.length === 0 ? '✅' : '🎉'}</div>
                    <h2>{queue.length === 0 ? 'Nessun ripasso oggi!' : 'Ripasso completato!'}</h2>
                    <p className="text-secondary" style={{ margin: 'var(--space-4) 0 var(--space-6)' }}>
                        {queue.length === 0
                            ? 'Hai ripassato tutto. Torna domani per nuovi esercizi!'
                            : 'Ottimo lavoro! Il sistema terrà traccia dei tuoi progressi.'}
                    </p>
                    <button className="btn btn-primary btn-lg" onClick={() => router.push('/dashboard')}>🏠 Dashboard</button>
                </div>
            </div>
        )
    }

    const exercise = queue[currentIdx]

    const handleAnswer = async (correct: boolean, userAnswer: string) => {
        // Update SM-2: quality 5 = perfect, 2 = hard
        const quality = correct ? 5 : 2
        await fetch('/api/review', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ exerciseId: exercise.id, quality })
        })
    }

    const handleNext = () => {
        if (currentIdx + 1 >= queue.length) {
            setDone(true)
        } else {
            setCurrentIdx(i => i + 1)
        }
    }

    return (
        <div className="screen-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <div className="flex flex-between" style={{ marginBottom: 'var(--space-6)' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => router.push('/dashboard')}>✕</button>
                <div style={{ flex: 1, textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.25rem' }}>🔁 Ripasso</h2>
                    <p className="text-muted" style={{ fontSize: '0.8rem' }}>{currentIdx + 1} / {queue.length} esercizi</p>
                </div>
                <div style={{ width: 40 }}></div> {/* spacer */}
            </div>

            <div className="progress-bar" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="progress-bar__fill" style={{ width: `${((currentIdx) / queue.length) * 100}%` }} />
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
                <ExerciseRenderer 
                    key={currentIdx}
                    exercise={exercise}
                    onAnswer={handleAnswer}
                    onNext={handleNext}
                />
            </div>
        </div>
    )
}

