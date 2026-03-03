"use client"
import { useState } from 'react'
import MemoryGame from './MemoryGame'
import WordDropGame from './WordDropGame'

const GAMES = [
    {
        id: 'memory' as const,
        icon: '🎴',
        title: 'Memory Match',
        desc: 'Gira le carte e abbina parole inglesi alle loro traduzioni. Tecnica provata per fissare vocaboli a lungo termine.',
        difficulty: 'Facile',
        skill: '🧠 Memoria',
        skillColor: 'rgba(34,229,160,0.15)',
        skillTextColor: 'var(--clr-accent-400)',
        diffColor: 'rgba(34,197,94,0.15)',
        diffTextColor: 'var(--clr-success)',
        gradient: 'linear-gradient(135deg, rgba(34,229,160,0.15) 0%, rgba(99,55,245,0.05) 100%)',
    },
    {
        id: 'worddrop' as const,
        icon: '☄️',
        title: 'Word Drop',
        desc: 'Le parole cadono dal cielo — scrivi la traduzione prima che tocchino terra! Allena riflessi e automatismi linguistici.',
        difficulty: 'Medio',
        skill: '⚡ Riflessi',
        skillColor: 'rgba(245,158,11,0.15)',
        skillTextColor: 'var(--clr-warning)',
        diffColor: 'rgba(245,158,11,0.15)',
        diffTextColor: 'var(--clr-warning)',
        gradient: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(99,55,245,0.05) 100%)',
    },
]

export default function GamesScreen() {
    const [activeGame, setActiveGame] = useState<'hub' | 'memory' | 'worddrop'>('hub')

    if (activeGame === 'memory') return <MemoryGame onBack={() => setActiveGame('hub')} />
    if (activeGame === 'worddrop') return <WordDropGame onBack={() => setActiveGame('hub')} />

    return (
        <div className="screen-container animate-fade-in">
            <div style={{ marginBottom: 'var(--space-6)' }}>
                <h1>
                    🕹️ <span className="gradient-text">Arcade</span>
                </h1>
                <p className="text-secondary" style={{ marginTop: 'var(--space-2)' }}>
                    Impara giocando — ogni gioco sviluppa un'abilità diversa.
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 'var(--space-4)',
            }}>
                {GAMES.map(game => (
                    <div
                        key={game.id}
                        className="card card-interactive"
                        style={{
                            background: game.gradient,
                            border: '1px solid var(--clr-border-accent)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--space-3)',
                        }}
                        onClick={() => setActiveGame(game.id)}
                    >
                        {/* Icon */}
                        <div style={{ fontSize: '3.5rem', lineHeight: 1 }}>{game.icon}</div>

                        {/* Tags row */}
                        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                            <span style={{
                                display: 'inline-flex', alignItems: 'center',
                                padding: '2px 10px', borderRadius: '999px',
                                fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em',
                                background: game.diffColor, color: game.diffTextColor,
                            }}>
                                {game.difficulty}
                            </span>
                            <span style={{
                                display: 'inline-flex', alignItems: 'center',
                                padding: '2px 10px', borderRadius: '999px',
                                fontSize: '0.72rem', fontWeight: 700,
                                background: game.skillColor, color: game.skillTextColor,
                            }}>
                                {game.skill}
                            </span>
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: 'var(--space-2)' }}>{game.title}</h3>
                            <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                                {game.desc}
                            </p>
                        </div>

                        <button
                            className="btn btn-primary"
                            style={{ padding: 'var(--space-3) var(--space-5)', fontSize: '0.95rem' }}
                            onClick={e => { e.stopPropagation(); setActiveGame(game.id) }}
                        >
                            Gioca Ora →
                        </button>
                    </div>
                ))}
            </div>

            {/* Pedagogical footer note */}
            <div style={{
                marginTop: 'var(--space-6)',
                padding: 'var(--space-4)',
                background: 'rgba(99,55,245,0.08)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--clr-border-accent)',
                fontSize: '0.85rem',
                color: 'var(--clr-text-muted)',
                lineHeight: 1.6,
            }}>
                💡 <strong style={{ color: 'var(--clr-text-secondary)' }}>Consiglio pedagogico:</strong> i giochi usano le stesse parole del tuo corso attivo —
                giocare 5 minuti dopo una lezione aumenta la ritenzione del <strong style={{ color: 'var(--clr-accent-400)' }}>40%</strong>.
            </div>
        </div>
    )
}
