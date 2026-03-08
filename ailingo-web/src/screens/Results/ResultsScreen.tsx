"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '../../store/sessionStore'
import { useUserStore } from '../../store/userStore'

export default function ResultsScreen() {
    const { results, currentLesson, reset } = useSessionStore()
    const { loadStats } = useUserStore()
    const router = useRouter()
    const [xpGained] = useState(() => {
        let xp = 0
        for (const r of results) {
            if (r.isCorrect) {
                xp += 10
                if (r.timeMs < 5000) xp += 5
            }
        }
        return xp
    })

    const correctCount = results.filter(r => r.isCorrect).length
    const accuracy = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0

    useEffect(() => {
        loadStats()
    }, [loadStats])

    const getPerformanceText = () => {
        if (accuracy === 100) return { msg: '🏆 Perfetto! Non hai sbagliato nulla!', cls: 'text-success' }
        if (accuracy >= 80) return { msg: '⭐ Ottimo lavoro! Stai migliorando!', cls: 'text-accent' }
        if (accuracy >= 60) return { msg: '👍 Bel tentativo! Continua così.', cls: 'text-purple' }
        return { msg: '💪 Non mollare! La pratica fa la perfezione.', cls: 'text-warning' }
    }

    const perf = getPerformanceText()

    const handleContinue = () => {
        reset()
        router.push('/course')
    }

    const handleReview = () => {
        const wrongExercises = results.filter(r => !r.isCorrect).map(r => r.exercise)
        reset()
        router.push('/review')
    }

    const handleHome = () => {
        reset()
        router.push('/dashboard')
    }

    return (
        <div className="flex flex-col flex-center" style={{ height: '100vh', padding: 'var(--space-8)' }}>
            <div className="animate-scale-in" style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
                {/* Trophy */}
                <div className="celebration-circle" style={{ margin: '0 auto var(--space-6)' }}>
                    {accuracy === 100 ? '🏆' : accuracy >= 80 ? '⭐' : '📖'}
                </div>

                <h2 style={{ marginBottom: 'var(--space-2)' }}>Lezione Completata!</h2>
                {currentLesson && (
                    <p className="text-secondary" style={{ marginBottom: 'var(--space-4)' }}>{currentLesson.title}</p>
                )}
                <div className={perf.cls} style={{ fontWeight: 600, marginBottom: 'var(--space-6)' }}>{perf.msg}</div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                    <div className="card">
                        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--clr-primary-300)' }}>{xpGained}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--clr-text-muted)', marginTop: 4 }}>XP Guadagnati ⭐</div>
                    </div>
                    <div className="card">
                        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: accuracy >= 80 ? 'var(--clr-success)' : 'var(--clr-warning)' }}>{accuracy}%</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--clr-text-muted)', marginTop: 4 }}>Accuratezza 🎯</div>
                    </div>
                    <div className="card">
                        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>{correctCount}<span style={{ fontSize: 'var(--text-sm)', color: 'var(--clr-text-muted)' }}>/{results.length}</span></div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--clr-text-muted)', marginTop: 4 }}>Corrette ✓</div>
                    </div>
                </div>

                {/* Wrong answers summary */}
                {results.filter(r => !r.isCorrect).length > 0 && (
                    <div className="card" style={{ marginBottom: 'var(--space-6)', textAlign: 'left' }}>
                        <div style={{ fontWeight: 700, marginBottom: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>❌ Errori da rivedere:</div>
                        {results.filter(r => !r.isCorrect).slice(0, 3).map((r, i) => (
                            <div key={i} style={{ fontSize: 'var(--text-sm)', marginBottom: 8, padding: 'var(--space-2)', background: 'rgba(239,68,68,0.08)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--clr-error)' }}>
                                <strong>{r.exercise.prompt_it ?? r.exercise.prompt_en}</strong>
                                <br />
                                <span style={{ color: 'var(--clr-success)' }}>✓ {r.exercise.correct_answer}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <button className="btn btn-primary btn-lg btn-full" onClick={handleContinue}>Continua il Corso →</button>
                    {results.some(r => !r.isCorrect) && (
                        <button className="btn btn-ghost btn-full" onClick={handleReview}>🔁 Ripassa gli errori</button>
                    )}
                    <button className="btn btn-ghost btn-sm" onClick={handleHome}>🏠 Vai alla Dashboard</button>
                </div>
            </div>
        </div>
    )
}

