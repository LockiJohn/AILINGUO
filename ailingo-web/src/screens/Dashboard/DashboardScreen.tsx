"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '../../store/userStore'

export default function DashboardScreen() {
    const { user, stats, loadStats } = useUserStore()
    const router = useRouter()

    useEffect(() => {
        loadStats()
    }, [loadStats])

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

    const PRIMARY_ACTIONS = [
        { icon: '📖', label: 'Vai al Corso', href: '/course', style: 'primary' },
        { icon: '🔁', label: 'Ripassa', href: '/review', style: 'ghost' },
    ]

    return (
        <div className="screen-container animate-fade-in">
            {/* Header */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
                <h1 style={{ lineHeight: 1.2 }}>
                    Ciao, <span className="gradient-text">{user?.name}</span>! 👋
                </h1>
                <p className="text-secondary" style={{ marginTop: 'var(--space-2)' }}>
                    {streak > 0
                        ? `🔥 ${streak} giorni consecutivi — continua così!`
                        : 'Inizia la tua prima sessione oggi!'}
                </p>
            </div>

            {/* Level & XP card */}
            <div className="card card-glow" style={{ marginBottom: 'var(--space-5)' }}>
                <div className="flex flex-between mb-4">
                    <div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--clr-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                            Livello {userLvl} · {getLevelName(userLvl)}
                        </div>
                        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>
                            {xp} <span style={{ fontSize: 'var(--text-sm)', color: 'var(--clr-text-muted)' }}>XP</span>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        {streak > 0 && <div className="streak-chip" style={{ marginBottom: 6 }}>🔥 {streak} giorni</div>}
                        <div className="badge badge-primary">{levelProgress}% al prossimo</div>
                    </div>
                </div>
                <div className="progress-bar" style={{ height: 8 }}>
                    <div className="progress-bar__fill" style={{ width: `${levelProgress}%` }} />
                </div>
                <div className="flex flex-between" style={{ marginTop: 6, fontSize: 'var(--text-xs)', color: 'var(--clr-text-muted)' }}>
                    <span>{xp} XP</span>
                    <span>{nextThreshold} XP → Livello {userLvl + 1}</span>
                </div>
            </div>

            {/* CTA buttons — 2 primary + 1 secondary row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <button
                    className="btn btn-primary"
                    style={{ flexDirection: 'column', gap: 6, padding: 'var(--space-4) var(--space-3)', height: 72 }}
                    onClick={() => router.push('/course')}
                >
                    <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>📖</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Vai al Corso</span>
                </button>
                <button
                    className="btn btn-ghost"
                    style={{ flexDirection: 'column', gap: 6, padding: 'var(--space-4) var(--space-3)', height: 72, border: '1px solid var(--clr-border-accent)' }}
                    onClick={() => router.push('/review')}
                >
                    <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>🔁</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Ripassa</span>
                </button>
            </div>

            {/* Secondary CTAs row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
                {[
                    { icon: '🕹️', label: 'Arcade', href: '/games', color: 'rgba(34,229,160,0.12)', border: 'rgba(34,229,160,0.3)', text: 'var(--clr-accent-400)' },
                    { icon: '💬', label: 'Tutor IA', href: '/tutor', color: 'rgba(99,55,245,0.12)', border: 'var(--clr-border-accent)', text: 'var(--clr-primary-300)' },
                    { icon: '📊', label: 'Stats', href: '/stats', color: 'rgba(255,255,255,0.04)', border: 'var(--clr-border)', text: 'var(--clr-text-secondary)' },
                ].map(item => (
                    <button
                        key={item.href}
                        onClick={() => router.push(item.href)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 4,
                            padding: 'var(--space-3) var(--space-2)',
                            background: item.color,
                            border: `1px solid ${item.border}`,
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
                    >
                        <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>{item.icon}</span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: item.text }}>{item.label}</span>
                    </button>
                ))}
            </div>

            {/* Quick stats */}
            <h3 style={{ marginBottom: 'var(--space-3)', fontSize: '1rem', color: 'var(--clr-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                Le tue statistiche
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                {[
                    { icon: '📚', label: 'Parole', value: wordsLearned },
                    { icon: '⏱️', label: 'Studio', value: formatTime(timeMin) },
                    { icon: '🎯', label: 'Accuratezza', value: `${accuracy}%` },
                ].map(stat => (
                    <div key={stat.label} className="card" style={{ textAlign: 'center', padding: 'var(--space-4) var(--space-2)' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{stat.icon}</div>
                        <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--clr-primary-300)', lineHeight: 1.1 }}>{stat.value}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--clr-text-muted)', marginTop: 3 }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Badges */}
            {badges.length > 0 && (
                <>
                    <h3 style={{ marginBottom: 'var(--space-3)', fontSize: '1rem' }}>Badge guadagnati 🏅</h3>
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
