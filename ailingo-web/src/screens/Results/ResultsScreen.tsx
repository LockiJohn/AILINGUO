"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '../../store/sessionStore'
import { useUserStore } from '../../store/userStore'

export default function ResultsScreen() {
    const { results, currentLesson, reset } = useSessionStore()
    const { loadStats } = useUserStore()
    const router = useRouter()
    
    const correctCount = results.filter(r => r.isCorrect).length
    const accuracy = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0
    const isPerfect = accuracy === 100

    const [xpGained] = useState(() => {
        let xp = 0
        for (const r of results) {
            if (r.isCorrect) {
                xp += 10
                if (r.timeMs < 5000) xp += 5
            }
        }
        if (isPerfect) xp += 15 // Perfect Lesson Bonus
        return xp
    })

    useEffect(() => {
        loadStats()
    }, [loadStats])

    const getPerformanceText = () => {
        if (accuracy === 100) return { msg: '🏆 PERFETTO! SEI UN CAMPIONE!', cls: 'text-success' }
        if (accuracy >= 80) return { msg: '⭐ OTTIMO LAVORO! QUASI PERFETTO!', cls: 'text-accent' }
        if (accuracy >= 60) return { msg: '👍 BEL TENTATIVO! CONTINUA COSÌ.', cls: 'text-purple' }
        return { msg: '💪 NON MOLLARE! LA PRATICA PORTA AL SUCCESSO.', cls: 'text-warning' }
    }

    const perf = getPerformanceText()

    const handleContinue = () => {
        reset()
        router.push('/course')
    }

    const handleReview = () => {
        reset()
        router.push('/review')
    }

    const handleHome = () => {
        reset()
        router.push('/dashboard')
    }

    return (
        <div className="flex flex-col flex-center page-enter" style={{ minHeight: '100vh', padding: 'var(--space-8)' }}>
            <div className="animate-scale-in" style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
                {isPerfect && (
                    <div className="glass-premium" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-6)', background: 'var(--gradient-primary)', borderRadius: 'var(--radius-xl)', boxShadow: '0 0 40px rgba(99, 102, 241, 0.4)', border: '2px solid rgba(255,255,255,0.3)' }}>
                        <h2 className="text-glow" style={{ fontSize: 'var(--text-3xl)', color: 'white', fontWeight: 900, letterSpacing: '0.05em' }}>🏆 LEZIONE PERFETTA! 🏆</h2>
                        <p style={{ color: 'rgba(255,255,255,0.95)', fontWeight: 600, marginTop: 12, fontSize: 'var(--text-lg)' }}>La tua precisione è assoluta. Un vero esempio di eccellenza! +15 Bonus XP! 💥</p>
                    </div>
                )}
                
                {/* Trophy */}
                <div className={`celebration-circle text-glow ${isPerfect ? 'animate-pulse' : ''}`} style={{ margin: '0 auto var(--space-6)', width: 100, height: 100, fontSize: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--glass-bg)', borderRadius: '50%', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-glow)' }}>
                    {isPerfect ? '👑' : accuracy >= 80 ? '⭐' : '📖'}
                </div>

                <h2 style={{ marginBottom: 'var(--space-2)' }} className="gradient-text">Lezione Completata!</h2>
                {currentLesson && (
                    <p className="text-secondary" style={{ marginBottom: 'var(--space-4)', fontWeight: 600, fontSize: 'var(--text-lg)' }}>{currentLesson.title}</p>
                )}
                <div className={perf.cls} style={{ fontWeight: 800, marginBottom: 'var(--space-6)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 'var(--text-sm)' }}>{perf.msg}</div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                    <div className="card glass-premium">
                        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--clr-primary-300)' }}>{xpGained}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--clr-text-muted)', marginTop: 4 }}>XP ⭐ </div>
                    </div>
                    <div className="card glass-premium">
                        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: accuracy >= 80 ? 'var(--clr-success)' : 'var(--clr-warning)' }}>{accuracy}%</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--clr-text-muted)', marginTop: 4 }}>🎯 %</div>
                    </div>
                    <div className="card glass-premium">
                        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>{correctCount}<span style={{ fontSize: 'var(--text-sm)', color: 'var(--clr-text-muted)' }}>/{results.length}</span></div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--clr-text-muted)', marginTop: 4 }}>Corrette ✓</div>
                    </div>
                </div>

                {/* Wrong answers summary */}
                {!isPerfect && results.filter(r => !r.isCorrect).length > 0 && (
                    <div className="card glass-premium" style={{ marginBottom: 'var(--space-6)', textAlign: 'left', borderLeft: '4px solid var(--clr-error)' }}>
                        <div style={{ fontWeight: 700, marginBottom: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>❌ Da rivedere:</div>
                        {results.filter(r => !r.isCorrect).slice(0, 3).map((r, i) => (
                            <div key={i} style={{ fontSize: 'var(--text-sm)', marginBottom: 8 }}>
                                <div style={{ color: 'var(--clr-text-primary)' }}>{r.exercise.prompt_it ?? r.exercise.prompt_en}</div>
                                <div style={{ color: 'var(--clr-success)', fontWeight: 600 }}>→ {r.exercise.correct_answer || (r.exercise as any).correctAnswer}</div>
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <button className="btn btn-primary btn-lg btn-full" onClick={handleContinue}>Continua il Corso →</button>
                    {!isPerfect && (
                        <button className="btn btn-ghost btn-full" onClick={handleReview}>🔁 Ripassa gli errori</button>
                    )}
                    <button className="btn btn-ghost btn-sm" onClick={handleHome}>🏠 Dashboard</button>
                </div>
            </div>
        </div>
    )
}
