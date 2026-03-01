import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../../store/userStore'
import { useSessionStore } from '../../store/sessionStore'
import ActivityHeatmap from '../../components/ui/ActivityHeatmap'
import { api } from '../../services/api'

export default function DashboardScreen() {
    const { user, stats, loadStats } = useUserStore()
    const { startSession, setLesson } = useSessionStore()
    const navigate = useNavigate()

    useEffect(() => {
        loadStats()
    }, [loadStats])

    const handleQuickSession = async () => {
        try {
            const randomExercises = await api.getQuickSession()
            if (randomExercises && randomExercises.length > 0) {
                setLesson({ id: -1, title: '⚡ Ho 5 Minuti' }, randomExercises)
                await startSession()
                navigate('/exercise')
            }
        } catch (e) {
            console.error('Failed quick session:', e)
        }
    }

    const xp = stats?.total_xp ?? 0
    const streak = stats?.current_streak ?? 0
    const wordsLearned = stats?.words_learned ?? 0
    const accuracy = stats?.accuracy_avg ?? 0
    const timeMin = stats?.time_studied_minutes ?? 0
    const badges = stats?.badges ?? []

    const levelThresholds = [0, 100, 300, 600, 1000, 1500, 2500, 4000]
    const userLvl = levelThresholds.filter(t => xp >= t).length
    const nextThreshold = levelThresholds[userLvl] ?? levelThresholds[levelThresholds.length - 1]
    const prevThreshold = levelThresholds[userLvl - 1] ?? 0
    const levelProgress = nextThreshold > prevThreshold
        ? Math.round(((xp - prevThreshold) / (nextThreshold - prevThreshold)) * 100)
        : 100

    const getLevelName = (lvl: number) => ['', 'Principiante', 'Apprendista', 'Studente', 'Esperto', 'Maestro', 'Super', 'Elite', 'Leggenda'][lvl] ?? 'Leggenda'
    const formatTime = (min: number) => min >= 60 ? `${Math.floor(min / 60)}h ${min % 60}m` : `${min}m`

    return (
        <div className="screen-container animate-fade-in">
            {/* Header */}
            <div style={{ marginBottom: 'var(--space-8)' }}>
                <h1>
                    Ciao, <span className="gradient-text">{user?.name}</span>! 👋
                </h1>
                <p className="text-secondary">
                    {streak > 0
                        ? `🔥 ${streak} giorni consecutivi — continua così!`
                        : 'Inizia la tua prima sessione oggi!'}
                </p>
            </div>

            {/* Level & XP card */}
            <div className="card card-glow" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="flex flex-between mb-4">
                    <div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--clr-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                            Livello {userLvl} · {getLevelName(userLvl)}
                        </div>
                        <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>
                            {xp} <span style={{ fontSize: 'var(--text-base)', color: 'var(--clr-text-muted)' }}>XP</span>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        {streak > 0 && <div className="streak-chip" style={{ marginBottom: 8 }}>🔥 {streak} giorni</div>}
                        <div className="badge badge-primary">{levelProgress}% al prossimo livello</div>
                    </div>
                </div>
                <div className="progress-bar" style={{ height: 10 }}>
                    <div className="progress-bar__fill" style={{ width: `${levelProgress}%` }} />
                </div>
                <div className="flex flex-between" style={{ marginTop: 8, fontSize: 'var(--text-xs)', color: 'var(--clr-text-muted)' }}>
                    <span>{xp} XP</span>
                    <span>{nextThreshold} XP per Livello {userLvl + 1}</span>
                </div>
            </div>

            {/* CTA buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
                <button className="btn btn-primary btn-lg" style={{ flexDirection: 'column', gap: 8, padding: 'var(--space-4)' }} onClick={() => navigate('/course')}>
                    <span style={{ fontSize: '1.5rem' }}>📖</span>
                    Vai al Corso
                </button>
                <button className="btn btn-ghost btn-lg" style={{ flexDirection: 'column', gap: 8, padding: 'var(--space-4)' }} onClick={() => navigate('/review')}>
                    <span style={{ fontSize: '1.5rem' }}>🔁</span>
                    Ripassa Ora
                </button>
                <button className="btn btn-accent btn-lg card-glow" style={{ flexDirection: 'column', gap: 8, padding: 'var(--space-4)' }} onClick={handleQuickSession}>
                    <span style={{ fontSize: '1.5rem' }}>⚡</span>
                    Ho 5 Minuti
                </button>
            </div>

            {/* Heatmap Github Style */}
            <ActivityHeatmap />

            {/* Quick stats */}
            <h3 style={{ marginBottom: 'var(--space-4)' }}>Le tue statistiche</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
                {[
                    { icon: '📚', label: 'Parole imparate', value: wordsLearned },
                    { icon: '⏱️', label: 'Tempo di studio', value: formatTime(timeMin) },
                    { icon: '🎯', label: 'Accuratezza media', value: `${accuracy}%` },
                ].map(stat => (
                    <div key={stat.label} className="card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.75rem', marginBottom: 8 }}>{stat.icon}</div>
                        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--clr-primary-300)' }}>{stat.value}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--clr-text-muted)', marginTop: 4 }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Badges */}
            {badges.length > 0 && (
                <>
                    <h3 style={{ marginBottom: 'var(--space-4)' }}>Badge guadagnati 🏅</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                        {badges.map(b => (
                            <div key={b.code} className="card" style={{ padding: 'var(--space-3) var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <span style={{ fontSize: '1.25rem' }}>{b.icon}</span>
                                <div>
                                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>{b.name_it}</div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--clr-text-muted)' }}>{b.description_it}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
