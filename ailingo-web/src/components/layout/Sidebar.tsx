"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUserStore } from '../../store/userStore'
import { useEffect } from 'react'

const NAV_ITEMS = [
    { to: '/dashboard', icon: '🏠', label: 'Home' },
    { to: '/course', icon: '🗺️', label: 'Corso' },
    { to: '/review', icon: '🔁', label: 'Ripassa' },
    { to: '/games', icon: '🕹️', label: 'Arcade' },
    { to: '/tutor', icon: '💬', label: 'AI Tutor' },
    { to: '/stats', icon: '📊', label: 'Statistiche' },
    { to: '/settings', icon: '⚙️', label: 'Impostazioni' },
]

export default function Sidebar() {
    const { user, stats, loadStats } = useUserStore()
    const pathname = usePathname()

    useEffect(() => {
        loadStats()
    }, [loadStats])

    const xp = stats?.total_xp ?? 0
    const streak = stats?.current_streak ?? 0
    // Level thresholds
    const levelThresholds = [0, 100, 300, 600, 1000, 1500, 2500, 4000]
    const userLvl = levelThresholds.filter(t => xp >= t).length
    const nextThreshold = levelThresholds[userLvl] ?? levelThresholds[levelThresholds.length - 1]
    const prevThreshold = levelThresholds[userLvl - 1] ?? 0
    const progress = nextThreshold > prevThreshold
        ? Math.round(((xp - prevThreshold) / (nextThreshold - prevThreshold)) * 100)
        : 100

    return (
        <nav className="sidebar">
            <div className="sidebar-logo">AILINGO</div>

            {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.to || pathname?.startsWith(item.to + '/')
                return (
                    <Link
                        key={item.to}
                        href={item.to}
                        className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        {item.label}
                    </Link>
                )
            })}

            <div className="sidebar-divider" />

            <div className="sidebar-stats">
                <div className="flex flex-between mb-4">
                    <span className="xp-chip">⭐ {xp} XP</span>
                    {streak > 0 && <span className="streak-chip">🔥 {streak}</span>}
                </div>
                <div style={{ marginBottom: 8, fontSize: 'var(--text-xs)', color: 'var(--clr-text-muted)', fontWeight: 600 }}>
                    Livello {userLvl}
                </div>
                <div className="progress-bar">
                    <div className="progress-bar__fill" style={{ width: `${progress}%` }} />
                </div>
                <div style={{ marginTop: 4, fontSize: 'var(--text-xs)', color: 'var(--clr-text-muted)' }}>
                    {xp} / {nextThreshold} XP
                </div>
                {user && (
                    <div style={{ marginTop: 8, fontSize: 'var(--text-xs)', color: 'var(--clr-text-muted)' }}>
                        Ciao, <strong style={{ color: 'var(--clr-text-secondary)' }}>{user.name}</strong>!
                    </div>
                )}
            </div>
        </nav>
    )
}
