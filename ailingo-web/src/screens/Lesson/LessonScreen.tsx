"use client"
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSessionStore } from '../../store/sessionStore'
import type { Lesson, Exercise } from '../../types'

export default function LessonScreen() {
    const { lessonId } = useParams<{ lessonId: string }>()
    const [lesson, setLesson] = useState<Lesson | null>(null)
    const [exercises, setExercises] = useState<Exercise[]>([])
    const [loading, setLoading] = useState(true)
    const { startSession, setLesson: setSessionLesson } = useSessionStore()
    const router = useRouter()

    useEffect(() => {
        if (!lessonId) return
        const id = parseInt(lessonId, 10)
        Promise.all([
            fetch('/api/content/lesson?id=' + id).then(r => r.json()),
            fetch('/api/content/exercises?lesson=' + id).then(r => r.json()),
        ]).then(([l, ex]) => {
            setLesson(l)
            setExercises(ex)
            setLoading(false)
        })
    }, [lessonId])

    const handleStart = async () => {
        if (!lesson) return
        await startSession()
        setSessionLesson({ id: lesson.id, title: lesson.title_it }, exercises)
        router.push('/exercise')
    }

    if (loading) {
        return (
            <div className="screen-container flex flex-center" style={{ height: '100%' }}>
                <p className="text-muted animate-pulse">Caricamento lezione…</p>
            </div>
        )
    }

    if (!lesson) {
        return (
            <div className="screen-container">
                <p className="text-error">Lezione non trovata.</p>
                <button className="btn btn-ghost" onClick={() => router.push('/course')}>← Torna al corso</button>
            </div>
        )
    }

    return (
        <div className="screen-container animate-fade-in">
            <button className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--space-6)' }} onClick={() => router.push('/course')}>
                ← Torna al corso
            </button>

            <div className="card card-glow" style={{ marginBottom: 'var(--space-6)', textAlign: 'center', padding: 'var(--space-8)' }}>
                <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>📖</div>
                <h2 style={{ marginBottom: 'var(--space-2)' }}>{lesson.title_it}</h2>
                <p className="text-secondary" style={{ marginBottom: 'var(--space-4)' }}>{lesson.title_en}</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)' }}>
                    <span className="badge badge-primary">⏱️ ~{lesson.estimated_minutes} min</span>
                    <span className="badge badge-accent">📝 {exercises.length} esercizi</span>
                    <span className="badge badge-warning">⭐ fino a {exercises.length * 15} XP</span>
                </div>
            </div>

            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                <h4 style={{ marginBottom: 'var(--space-3)' }}>Tipi di esercizi in questa lezione:</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    {[...new Set(exercises.map(e => e.type))].map(type => (
                        <span key={type} className="badge badge-primary">
                            {type.replace(/_/g, ' ')}
                        </span>
                    ))}
                </div>
            </div>

            <button className="btn btn-primary btn-lg btn-full" onClick={handleStart}>
                🚀 Inizia lezione
            </button>
        </div>
    )
}

