import { useEffect, useState } from 'react'
import { useUserStore } from '../../store/userStore'
import type { StudySession } from '../../types'
import { api } from '../../services/api'

export default function StatsScreen() {
    const { stats, user, loadStats } = useUserStore()
    const [sessions, setSessions] = useState<StudySession[]>([])
    const [weakWords, setWeakWords] = useState<Array<{ lapses: number, prompt_it: string, correct_answer: string }>>([])

    useEffect(() => {
        loadStats()
        api.getStudySessions(14).then(setSessions)
        api.getWeakWords().then(setWeakWords)
    }, [loadStats])

    const xp = stats?.total_xp ?? 0
    const streak = stats?.current_streak ?? 0
    const longestStreak = stats?.longest_streak ?? 0
    const wordsLearned = stats?.words_learned ?? 0
    const timeMin = stats?.time_studied_minutes ?? 0
    const accuracy = stats?.accuracy_avg ?? 0
    const lessons = stats?.lessons_completed ?? 0
    const badges = stats?.badges ?? []

    const formatTime = (min: number) => min >= 60 ? `${Math.floor(min / 60)}h ${min % 60}m` : `${min}m`

    // Build 14-day activity map
    const today = new Date()
    const activityMap: Record<string, number> = {}
    for (const s of sessions) activityMap[s.day] = (s.xp ?? 0)

    const days14 = Array.from({ length: 14 }, (_, i) => {
        const d = new Date(today)
        d.setDate(today.getDate() - (13 - i))
        const key = d.toISOString().split('T')[0]
        const label = d.toLocaleDateString('it-IT', { weekday: 'short' }).slice(0, 2)
        return { key, label, xp: activityMap[key] ?? 0 }
    })
    const maxXp = Math.max(...days14.map(d => d.xp), 1)

    const skillRows = [
        { label: 'Vocabolario', pct: Math.min(100, Math.round(wordsLearned / 2)) },
        { label: 'Grammatica', pct: accuracy > 0 ? Math.min(100, Math.round(accuracy * 0.9)) : 0 },
        { label: 'Ascolto', pct: lessons > 0 ? Math.min(100, lessons * 12) : 0 },
        { label: 'Speaking', pct: lessons > 0 ? Math.min(100, lessons * 8) : 0 },
    ]

    return (
        <div className="screen-container animate-fade-in">
            <h1 style={{ marginBottom: 'var(--space-2)' }}>📊 Statistiche</h1>
            <p className="text-secondary" style={{ marginBottom: 'var(--space-8)' }}>
                Ciao {user?.name ?? ''}! Ecco il tuo resoconto completo.
            </p>

            {/* Key numbers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
                {[
                    { icon: '⭐', value: xp, label: 'XP Totali' },
                    { icon: '🔥', value: streak, label: 'Streak attuale' },
                    { icon: '🏆', value: longestStreak, label: 'Streak record' },
                    { icon: '📚', value: wordsLearned, label: 'Parole imparate' },
                    { icon: '⏱️', value: formatTime(timeMin), label: 'Tempo totale' },
                    { icon: '🎯', value: `${accuracy}%`, label: 'Accuratezza media' },
                ].map(s => (
                    <div key={s.label} className="card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{s.icon}</div>
                        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--clr-primary-300)' }}>{s.value}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--clr-text-muted)', marginTop: 4 }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Activity chart – 14 days */}
            <div className="card" style={{ marginBottom: 'var(--space-8)' }}>
                <h4 style={{ marginBottom: 'var(--space-4)' }}>Attività ultimi 14 giorni</h4>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
                    {days14.map(day => (
                        <div key={day.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                            <div
                                style={{
                                    width: '100%',
                                    height: day.xp > 0 ? `${Math.max(8, (day.xp / maxXp) * 60)}px` : '4px',
                                    background: day.xp > 0
                                        ? 'linear-gradient(135deg, var(--clr-primary-500), var(--clr-accent-400))'
                                        : 'var(--clr-bg-hover)',
                                    borderRadius: 'var(--radius-sm)',
                                    transition: 'height var(--transition-base)',
                                }}
                            />
                            <span style={{ fontSize: 9, color: 'var(--clr-text-muted)', fontWeight: 600 }}>{day.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Weak Words Spotlight */}
            {weakWords.length > 0 && (
                <div className="card" style={{ marginBottom: 'var(--space-8)', border: '1px solid var(--clr-primary-400)' }}>
                    <h4 style={{ marginBottom: 'var(--space-4)', color: 'var(--clr-primary-300)' }}>🧠 I tuoi Punti Deboli</h4>
                    <p className="text-muted" style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
                        Queste sono le parole e frasi su cui hai fatto più errori di recente. Concentrati su di esse!
                    </p>
                    <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                        {weakWords.map((ww, i) => (
                            <div key={i} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                background: 'var(--clr-bg-surface)', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)'
                            }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 'var(--text-base)' }}>{ww.correct_answer}</div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--clr-text-muted)' }}>{ww.prompt_it}</div>
                                </div>
                                <div style={{
                                    background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444',
                                    padding: '4px 8px', borderRadius: '4px', fontSize: 'var(--text-xs)', fontWeight: 'bold'
                                }}>
                                    Sbagliata {ww.lapses} volte
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Skill progress */}
            <div className="card" style={{ marginBottom: 'var(--space-8)' }}>
                <h4 style={{ marginBottom: 'var(--space-5)' }}>Progresso per abilità</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {skillRows.map(s => (
                        <div key={s.label}>
                            <div className="flex flex-between" style={{ marginBottom: 6 }}>
                                <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{s.label}</span>
                                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--clr-text-muted)' }}>{s.pct}%</span>
                            </div>
                            <div className="progress-bar" style={{ height: 8 }}>
                                <div className="progress-bar__fill" style={{ width: `${s.pct}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Badges */}
            <div className="card">
                <h4 style={{ marginBottom: 'var(--space-4)' }}>Badge guadagnati ({badges.length})</h4>
                {badges.length === 0 ? (
                    <p className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>Completa lezioni per guadagnare badge!</p>
                ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                        {badges.map(b => (
                            <div key={b.code} className="card" style={{ padding: 'var(--space-3)', textAlign: 'center', minWidth: 100 }}>
                                <div style={{ fontSize: '1.75rem', marginBottom: 4 }}>{b.icon}</div>
                                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700 }}>{b.name_it}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
