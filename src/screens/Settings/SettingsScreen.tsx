import { useState } from 'react'
import { useUserStore } from '../../store/userStore'

export default function SettingsScreen() {
    const { user } = useUserStore()
    const [dailyGoal, setDailyGoal] = useState(20)
    const [soundEnabled, setSoundEnabled] = useState(true)
    const [saved, setSaved] = useState(false)

    const handleSave = () => {
        // Persist to localStorage for now (simple settings)
        localStorage.setItem('ailingo_daily_goal', String(dailyGoal))
        localStorage.setItem('ailingo_sound', String(soundEnabled))
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    return (
        <div className="screen-container animate-fade-in">
            <h1 style={{ marginBottom: 'var(--space-2)' }}>⚙️ Impostazioni</h1>
            <p className="text-secondary" style={{ marginBottom: 'var(--space-8)' }}>Personalizza la tua esperienza di apprendimento</p>

            {/* Profile */}
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                <h4 style={{ marginBottom: 'var(--space-4)' }}>👤 Profilo</h4>
                <div className="flex" style={{ gap: 'var(--space-4)', alignItems: 'center' }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: '50%',
                        background: 'var(--gradient-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem', fontWeight: 800, color: '#fff',
                    }}>
                        {user?.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>{user?.name ?? 'Utente'}</div>
                        <div className="badge badge-primary" style={{ marginTop: 4 }}>Livello {user?.current_level ?? 'A1'}</div>
                    </div>
                </div>
            </div>

            {/* Learning settings */}
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                <h4 style={{ marginBottom: 'var(--space-5)' }}>🎯 Obiettivo Giornaliero</h4>
                <p className="text-secondary" style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
                    Quanti XP vuoi guadagnare ogni giorno?
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                    {[10, 20, 50, 100].map(goal => (
                        <button
                            key={goal}
                            className={`btn ${dailyGoal === goal ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setDailyGoal(goal)}
                        >
                            {goal === 10 ? '😌 Casual' : goal === 20 ? '👍 Regolare' : goal === 50 ? '⚡ Intenso' : '🔥 Serio'} · {goal} XP
                        </button>
                    ))}
                </div>
            </div>

            {/* Audio */}
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                <h4 style={{ marginBottom: 'var(--space-4)' }}>🔊 Audio</h4>
                <div className="flex flex-between">
                    <div>
                        <div style={{ fontWeight: 600 }}>Effetti sonori e TTS</div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--clr-text-muted)' }}>
                            Pronuncia automatica nelle lezioni
                        </div>
                    </div>
                    <button
                        className={`btn ${soundEnabled ? 'btn-accent' : 'btn-ghost'}`}
                        onClick={() => setSoundEnabled(v => !v)}
                        style={{ minWidth: 80 }}
                    >
                        {soundEnabled ? '✓ Attivo' : '✗ Off'}
                    </button>
                </div>
            </div>

            {/* App info */}
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                <h4 style={{ marginBottom: 'var(--space-4)' }}>ℹ️ Informazioni</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                    <div className="flex flex-between">
                        <span className="text-muted">Versione</span><span>0.1.0 MVP</span>
                    </div>
                    <div className="flex flex-between">
                        <span className="text-muted">Stack</span><span>Electron + React + SQLite</span>
                    </div>
                    <div className="flex flex-between">
                        <span className="text-muted">Lingua nativa</span><span>🇮🇹 Italiano</span>
                    </div>
                    <div className="flex flex-between">
                        <span className="text-muted">Lingua target</span><span>🇬🇧 Inglese</span>
                    </div>
                    <div className="flex flex-between">
                        <span className="text-muted">Dati salvati in</span><span style={{ fontSize: 'var(--text-xs)', color: 'var(--clr-text-muted)' }}>%APPDATA%/ailingo/ailingo.db</span>
                    </div>
                </div>
            </div>

            <button className="btn btn-primary btn-lg" onClick={handleSave} style={{ minWidth: 180 }}>
                {saved ? '✅ Salvato!' : 'Salva impostazioni'}
            </button>
        </div>
    )
}
