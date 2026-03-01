"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '../../store/userStore'

const LEVELS = [
    { code: 'A1', label: 'Principiante assoluto', desc: 'Non so nulla, parto da zero', icon: '🌱' },
    { code: 'A1', label: 'So qualcosa di base', desc: 'Conosco saluti e parole semplici', icon: '📖' },
    { code: 'A2', label: 'Livello elementare', desc: 'Riesco in situazioni semplici', icon: '🚀' },
    { code: 'B1', label: 'Livello intermedio', desc: 'Capisco e mi faccio capire', icon: '⚡' },
]

export default function OnboardingScreen() {
    const [step, setStep] = useState<'welcome' | 'name' | 'level'>('welcome')
    const [name, setName] = useState('')
    const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const { setUser } = useUserStore()
    const router = useRouter()

    const handleStart = async () => {
        if (!name.trim() || !selectedLevel) return
        setIsLoading(true)
        try {
            const res = await fetch('/api/user', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), currentLevel: selectedLevel, onboardingComplete: true })
            })
            const { user } = await res.json()
            setUser(user)
            router.push('/dashboard')
        } finally {
            setIsLoading(false)
        }
    }

    if (step === 'welcome') {
        return (
            <div className="flex flex-col flex-center" style={{ height: '100vh', padding: 'var(--space-8)' }}>
                <div className="animate-fade-in" style={{ textAlign: 'center', maxWidth: 480 }}>
                    <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>🌍</div>
                    <h1 className="gradient-text" style={{ marginBottom: 'var(--space-4)' }}>Benvenuto in AILINGO</h1>
                    <p style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-8)', color: 'var(--clr-text-secondary)' }}>
                        Il modo più efficace per imparare l'inglese. Locale, personale, serio.
                    </p>
                    <div style={{ display: 'grid', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
                        {['🎯 Lezioni strutturate e progressive', '🔊 Audio e speaking avec feedback', '🔁 Ripasso intelligente spaced repetition', '📊 Statistiche e motivazione'].map(f => (
                            <div key={f} className="card" style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'left', fontSize: 'var(--text-sm)' }}>
                                {f}
                            </div>
                        ))}
                    </div>
                    <button className="btn btn-primary btn-lg btn-full" onClick={() => setStep('name')}>
                        Inizia il tuo percorso →
                    </button>
                </div>
            </div>
        )
    }

    if (step === 'name') {
        return (
            <div className="flex flex-col flex-center" style={{ height: '100vh', padding: 'var(--space-8)' }}>
                <div className="animate-slide-up" style={{ textAlign: 'center', maxWidth: 400, width: '100%' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>👋</div>
                    <h2 style={{ marginBottom: 'var(--space-2)' }}>Come ti chiami?</h2>
                    <p className="text-secondary" style={{ marginBottom: 'var(--space-6)' }}>Ti chiamerò così durante le lezioni</p>
                    <input
                        className="input"
                        type="text"
                        placeholder="Il tuo nome..."
                        value={name}
                        onChange={e => setName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && name.trim() && setStep('level')}
                        autoFocus
                        style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-lg)', textAlign: 'center' }}
                    />
                    <button
                        className="btn btn-primary btn-lg btn-full"
                        onClick={() => setStep('level')}
                        disabled={!name.trim()}
                    >
                        Continua →
                    </button>
                    <button className="btn btn-ghost btn-sm" style={{ marginTop: 'var(--space-3)' }} onClick={() => setStep('welcome')}>
                        ← Indietro
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col flex-center" style={{ height: '100vh', padding: 'var(--space-8)' }}>
            <div className="animate-slide-up" style={{ textAlign: 'center', maxWidth: 520, width: '100%' }}>
                <h2 style={{ marginBottom: 'var(--space-2)' }}>Qual è il tuo livello, {name}?</h2>
                <p className="text-secondary" style={{ marginBottom: 'var(--space-6)' }}>Sii onesto: puoi cambiarlo dopo</p>
                <div style={{ display: 'grid', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                    {LEVELS.map((lv, i) => (
                        <div
                            key={i}
                            className={`card card-interactive ${selectedLevel === lv.code && LEVELS.indexOf(LEVELS.find(l => l.code === lv.code)!) === i ? 'card-glow' : ''}`}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
                                padding: 'var(--space-4) var(--space-5)',
                                border: selectedLevel === lv.code && i === LEVELS.filter(l => l.code === lv.code).indexOf(lv) ? '1.5px solid var(--clr-primary-400)' : undefined,
                            }}
                            onClick={() => setSelectedLevel(lv.code)}
                        >
                            <span style={{ fontSize: '1.75rem' }}>{lv.icon}</span>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>{lv.label}</div>
                                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--clr-text-muted)' }}>{lv.desc}</div>
                            </div>
                            <span className="badge badge-primary" style={{ marginLeft: 'auto' }}>{lv.code}</span>
                        </div>
                    ))}
                </div>
                <button
                    className="btn btn-accent btn-lg btn-full"
                    onClick={handleStart}
                    disabled={!selectedLevel || isLoading}
                >
                    {isLoading ? 'Avvio…' : '🚀 Inizia ad imparare!'}
                </button>
                <button className="btn btn-ghost btn-sm" style={{ marginTop: 'var(--space-3)' }} onClick={() => setStep('name')}>
                    ← Indietro
                </button>
            </div>
        </div>
    )
}

