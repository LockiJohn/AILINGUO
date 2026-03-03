import { NavLink, useNavigate } from 'react-router-dom'
import { useUserStore } from '../../store/userStore'
import { useEffect, useState } from 'react'

const NAV_ITEMS = [
    { to: '/dashboard', icon: '🏠', label: 'Home' },
    { to: '/course', icon: '🗺️', label: 'Corso' },
    { to: '/review', icon: '🔁', label: 'Ripassa' },
    { to: '/games', icon: '🕹️', label: 'Arcade' },
    { to: '/tutor', icon: '💬', label: 'Tutor' },
    { to: '/stats', icon: '📊', label: 'Stats', mobileHide: true },
    { to: '/settings', icon: '⚙️', label: 'Setup', mobileHide: true },
    { to: '/help', icon: '❓', label: 'Guida', mobileHide: true },
]

export default function Sidebar() {
    const { user, stats, loadStats, profiles, loadProfiles, switchUser, setUser } = useUserStore()
    const navigate = useNavigate()
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        loadStats()
        if (showModal) loadProfiles()
    }, [loadStats, loadProfiles, showModal])

    const handleSwitch = async (userId: number) => {
        await switchUser(userId)
        setShowModal(false)
        navigate('/dashboard')
    }

    const handleCreateNew = () => {
        setUser(null) // Disconnect current user, which will trigger App.tsx to load OnboardingScreen
        setShowModal(false)
        navigate('/')
    }

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

            {NAV_ITEMS.map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''} ${item.mobileHide ? 'nav-mobile-hide' : ''}`}
                >
                    <span className="nav-icon">{item.icon}</span>
                    {item.label}
                </NavLink>
            ))}

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
                    <div
                        className="profile-switcher-btn"
                        style={{ marginTop: 12, padding: '8px', cursor: 'pointer', borderRadius: 'var(--radius-sm)', background: 'var(--clr-bg-page)', border: '1px solid var(--clr-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                        onClick={() => setShowModal(true)}
                    >
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--clr-text-muted)' }}>
                            Profilo: <strong style={{ color: 'var(--clr-text-secondary)' }}>{user.name}</strong>
                        </div>
                        <span style={{ fontSize: '0.8rem' }}>🔄</span>
                    </div>
                )}
            </div>

            {/* Profile Switcher Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="card animate-scale-in" style={{ maxWidth: 400, width: '90%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                        <div className="flex flex-between mb-4">
                            <h3 className="text-secondary">Seleziona Profilo</h3>
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            {profiles.map(p => (
                                <button
                                    key={p.id}
                                    className={`btn ${p.id === user?.id ? 'btn-primary' : 'btn-outline'} w-full`}
                                    style={{ justifyContent: 'flex-start' }}
                                    onClick={() => handleSwitch(p.id)}
                                >
                                    <span style={{ marginRight: 8 }}>{p.id === user?.id ? '✅' : '👤'}</span>
                                    {p.name} - Livello {p.current_level}
                                </button>
                            ))}
                        </div>
                        <button className="btn btn-accent w-full mt-4" onClick={handleCreateNew}>
                            + Crea Nuovo Utente
                        </button>
                    </div>
                </div>
            )}
        </nav>
    )
}
