import { useState } from 'react'
import MemoryGame from './MemoryGame'
import WordDropGame from './WordDropGame'

export default function GamesScreen() {
    const [activeGame, setActiveGame] = useState<'hub' | 'memory' | 'worddrop'>('hub')

    if (activeGame === 'memory') {
        return <MemoryGame onBack={() => setActiveGame('hub')} />
    }

    if (activeGame === 'worddrop') {
        return <WordDropGame onBack={() => setActiveGame('hub')} />
    }

    return (
        <div className="screen-container animate-fade-in">
            <div style={{ marginBottom: 'var(--space-8)' }}>
                <h1>
                    🕹️ <span className="gradient-text">Arcade</span>
                </h1>
                <p className="text-secondary">Impara giocando. Metti alla prova i tuoi riflessi e la tua memoria!</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
                {/* Memory Match Card */}
                <div
                    className="card card-interactive"
                    style={{ background: 'var(--gradient-card)', border: '1px solid var(--clr-border-accent)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
                    onClick={() => setActiveGame('memory')}
                >
                    <div style={{ fontSize: '3rem', textAlign: 'center' }}>🎴</div>
                    <div>
                        <h3 style={{ fontSize: '1.4rem', marginBottom: 'var(--space-2)' }}>Memory Match</h3>
                        <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.95rem' }}>
                            Allena la tua memoria visiva. Gira le carte e abbina le parole inglesi alle loro traduzioni italiane. Ottimo per fissare i vocaboli a lungo termine.
                        </p>
                    </div>
                    <button className="btn btn-primary mt-auto">Gioca Ora</button>
                </div>

                {/* Word Drop Card */}
                <div
                    className="card card-interactive"
                    style={{ background: 'var(--gradient-card)', border: '1px solid var(--clr-border-accent)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
                    onClick={() => setActiveGame('worddrop')}
                >
                    <div style={{ fontSize: '3rem', textAlign: 'center' }}>☄️</div>
                    <div>
                        <h3 style={{ fontSize: '1.4rem', marginBottom: 'var(--space-2)' }}>Word Drop</h3>
                        <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.95rem' }}>
                            Allena i tuoi riflessi. Le parole cadono dal cielo, digita la loro traduzione per distruggerle prima che tocchino terra!
                        </p>
                    </div>
                    <button className="btn btn-primary mt-auto">Gioca Ora</button>
                </div>
            </div>
        </div>
    )
}
