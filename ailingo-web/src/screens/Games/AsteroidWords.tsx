"use client"
import { useState, useEffect, useRef, useCallback } from 'react'

interface Asteroid {
    id: number
    wordIt: string
    wordEn: string
    x: number
    y: number
    speed: number
    size: number
    rotation: number
    rotSpeed: number
    color: string
}

interface Explosion {
    id: number
    x: number
    y: number
}

const ASTEROID_COLORS = [
    'rgba(99,55,245,0.8)',
    'rgba(34,229,160,0.7)',
    'rgba(245,158,11,0.8)',
    'rgba(239,68,68,0.7)',
    'rgba(59,130,246,0.8)',
]

const FALLBACK_WORDS = [
    { prompt_it: 'Cane', correct_answer: 'Dog' },
    { prompt_it: 'Gatto', correct_answer: 'Cat' },
    { prompt_it: 'Casa', correct_answer: 'House' },
    { prompt_it: 'Sole', correct_answer: 'Sun' },
    { prompt_it: 'Luna', correct_answer: 'Moon' },
    { prompt_it: 'Acqua', correct_answer: 'Water' },
    { prompt_it: 'Fuoco', correct_answer: 'Fire' },
    { prompt_it: 'Terra', correct_answer: 'Earth' },
    { prompt_it: 'Cielo', correct_answer: 'Sky' },
    { prompt_it: 'Albero', correct_answer: 'Tree' },
    { prompt_it: 'Libro', correct_answer: 'Book' },
    { prompt_it: 'Pane', correct_answer: 'Bread' },
    { prompt_it: 'Vino', correct_answer: 'Wine' },
    { prompt_it: 'Mela', correct_answer: 'Apple' },
    { prompt_it: 'Mare', correct_answer: 'Sea' },
]

export default function AsteroidWords({ onBack }: { onBack: () => void }) {
    const [score, setScore] = useState(0)
    const [cityHp, setCityHp] = useState(5)
    const [asteroids, setAsteroids] = useState<Asteroid[]>([])
    const [input, setInput] = useState('')
    const [dictionary, setDictionary] = useState<Array<{ prompt_it: string; correct_answer: string }>>([])
    const [explosions, setExplosions] = useState<Explosion[]>([])
    const [shakeInput, setShakeInput] = useState(false)
    const [gameStarted, setGameStarted] = useState(false)
    const [combo, setCombo] = useState(0)

    const rafRef = useRef<number | undefined>(undefined)
    const lastSpawnRef = useRef(0)
    const dictRef = useRef(dictionary)
    const cityHpRef = useRef(cityHp)
    const scoreRef = useRef(score)
    const inputRef = useRef<HTMLInputElement>(null)

    dictRef.current = dictionary
    cityHpRef.current = cityHp
    scoreRef.current = score

    useEffect(() => {
        fetch('/api/content/words?level=A1')
            .then(r => r.json())
            .then((res: any[]) => {
                const valid = (Array.isArray(res) ? res : [])
                    .filter(w => w.prompt_it && w.correct_answer && w.prompt_it !== 'null' && w.correct_answer !== 'null')
                if (valid.length >= 8) {
                    setDictionary(valid)
                } else {
                    setDictionary([...FALLBACK_WORDS, ...(valid || [])])
                }
            })
            .catch(() => setDictionary(FALLBACK_WORDS))
    }, [])

    const spawnAsteroid = useCallback(() => {
        const dict = dictRef.current
        if (!dict.length) return
        const w = dict[Math.floor(Math.random() * dict.length)]
        const newAsteroid: Asteroid = {
            id: Date.now() + Math.random(),
            wordIt: w.prompt_it,
            wordEn: w.correct_answer.toLowerCase().trim(),
            x: Math.random() * 82 + 8,
            y: -8,
            speed: 0.06 + scoreRef.current * 0.001,
            size: 52 + Math.random() * 24,
            rotation: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 1.2,
            color: ASTEROID_COLORS[Math.floor(Math.random() * ASTEROID_COLORS.length)],
        }
        setAsteroids(prev => [...prev, newAsteroid])
    }, [])

    useEffect(() => {
        if (!gameStarted || !dictionary.length) return
        let hpLost = 0

        const loop = (ts: number) => {
            if (cityHpRef.current <= 0) return

            const spawnInterval = Math.max(900, 2800 - scoreRef.current * 30)
            if (ts - lastSpawnRef.current > spawnInterval) {
                spawnAsteroid()
                lastSpawnRef.current = ts
            }

            setAsteroids(prev => {
                let lost = 0
                const next = prev.map(a => ({
                    ...a,
                    y: a.y + a.speed,
                    rotation: a.rotation + a.rotSpeed,
                })).filter(a => {
                    if (a.y > 96) { lost++; return false }
                    return true
                })
                if (lost > 0) {
                    hpLost += lost
                    setCityHp(h => Math.max(0, h - lost))
                }
                return next
            })
            rafRef.current = requestAnimationFrame(loop)
        }

        rafRef.current = requestAnimationFrame(loop)
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
    }, [gameStarted, dictionary, spawnAsteroid])

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toLowerCase()
        setInput(val)

        const matchIdx = asteroids.findIndex(a => a.wordEn === val)
        if (matchIdx !== -1) {
            const hit = asteroids[matchIdx]
            setExplosions(prev => [...prev, { id: hit.id, x: hit.x, y: hit.y }])
            setTimeout(() => setExplosions(prev => prev.filter(ex => ex.id !== hit.id)), 700)
            setAsteroids(prev => prev.filter((_, i) => i !== matchIdx))
            setInput('')
            const pts = 10 + combo * 5
            setScore(s => s + pts)
            setCombo(c => c + 1)
        }
    }

    const handleWrongKey = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && input.trim()) {
            setShakeInput(true)
            setCombo(0)
            setTimeout(() => setShakeInput(false), 400)
        }
    }

    if (!gameStarted) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '24px', textAlign: 'center', gap: '24px' }}>
                <div style={{ fontSize: '5rem' }}>🚀</div>
                <h2 className="gradient-text" style={{ fontSize: '1.8rem' }}>Asteroid Defense</h2>
                <p style={{ color: 'var(--clr-text-secondary)', maxWidth: 340, lineHeight: 1.7 }}>
                    Gli <strong style={{ color: 'var(--clr-text-primary)' }}>asteroidi italiani</strong> cadono sulla tua città!
                    Scrivi la <strong style={{ color: 'var(--clr-accent-400)' }}>traduzione in inglese</strong> per distruggerli prima che colpiscano.
                </p>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>
                    <span>❤️ 5 HP città</span>
                    <span>•</span>
                    <span>⚡ combo multiplier</span>
                    <span>•</span>
                    <span>🏆 score infinito</span>
                </div>
                <button className="btn btn-primary btn-lg" onClick={() => { setGameStarted(true); setTimeout(() => inputRef.current?.focus(), 100) }}>
                    🚀 Inizia la Difesa!
                </button>
                <button className="btn btn-ghost" onClick={onBack}>← Torna all'Arcade</button>
            </div>
        )
    }

    if (cityHp <= 0) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '24px', textAlign: 'center', gap: '20px' }}>
                <div style={{ fontSize: '4rem' }}>💥</div>
                <h2 style={{ fontSize: '2rem', color: 'var(--clr-error)' }}>La città è distrutta!</h2>
                <p style={{ color: 'var(--clr-text-muted)' }}>Punteggio finale</p>
                <div style={{ fontSize: '3rem', fontWeight: 900, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{score}</div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button className="btn btn-primary" onClick={() => { setAsteroids([]); setCityHp(5); setScore(0); setCombo(0); setInput(''); lastSpawnRef.current = 0; setGameStarted(false) }}>
                        🔄 Riprova
                    </button>
                    <button className="btn btn-ghost" onClick={onBack}>← Arcade</button>
                </div>
            </div>
        )
    }

    const hpPercent = (cityHp / 5) * 100
    const hpColor = cityHp >= 4 ? 'var(--clr-success)' : cityHp >= 2 ? 'var(--clr-warning)' : 'var(--clr-error)'

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'radial-gradient(ellipse at 50% 0%, rgba(99,55,245,0.18) 0%, transparent 60%), var(--clr-bg-base)' }}>
            {/* HUD */}
            <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(17,17,24,0.9)', borderBottom: '1px solid var(--clr-border)', flexShrink: 0 }}>
                <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ padding: '4px 10px', fontSize: '0.78rem' }}>✕</button>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)', fontWeight: 700 }}>🏙️ CITTÀ</span>
                        <span style={{ fontSize: '0.72rem', color: hpColor, fontWeight: 700 }}>{cityHp}/5 HP</span>
                    </div>
                    <div style={{ height: 7, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${hpPercent}%`, background: hpColor, borderRadius: 999, transition: 'width 0.4s ease, background 0.4s ease' }} />
                    </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: 80 }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--clr-primary-300)' }}>{score}</div>
                    {combo > 1 && <div style={{ fontSize: '0.65rem', color: 'var(--clr-warning)', fontWeight: 700 }}>🔥 ×{combo} COMBO</div>}
                </div>
            </div>

            {/* Play field */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                {/* Stars background */}
                {[...Array(22)].map((_, i) => (
                    <div key={i} style={{
                        position: 'absolute',
                        width: i % 4 === 0 ? 2 : 1,
                        height: i % 4 === 0 ? 2 : 1,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.5)',
                        left: `${(i * 137.5) % 100}%`,
                        top: `${(i * 79.3) % 90}%`,
                    }} />
                ))}

                {/* Asteroids */}
                {asteroids.map(a => (
                    <div key={a.id} style={{
                        position: 'absolute',
                        left: `${a.x}%`,
                        top: `${a.y}%`,
                        transform: `translate(-50%, -50%) rotate(${a.rotation}deg)`,
                        width: a.size,
                        height: a.size,
                        borderRadius: '40% 60% 50% 45%',
                        background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.15), ${a.color})`,
                        border: `2px solid ${a.color}`,
                        boxShadow: `0 0 14px ${a.color}, inset 0 0 8px rgba(0,0,0,0.5)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: a.size > 68 ? '0.85rem' : '0.72rem',
                        fontWeight: 800,
                        color: '#fff',
                        textShadow: '0 1px 4px rgba(0,0,0,0.8)',
                        textAlign: 'center',
                        padding: '4px',
                        lineHeight: 1.1,
                        userSelect: 'none',
                        transition: 'filter 0.05s',
                    }}>
                        {a.wordIt}
                    </div>
                ))}

                {/* Explosions */}
                {explosions.map(ex => (
                    <div key={ex.id} style={{
                        position: 'absolute',
                        left: `${ex.x}%`,
                        top: `${ex.y}%`,
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none',
                    }}>
                        <div style={{
                            width: 80, height: 80, borderRadius: '50%',
                            border: '3px solid var(--clr-accent-400)',
                            animation: 'explosionRing 0.6s ease-out forwards',
                        }} />
                        <div style={{
                            position: 'absolute', inset: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2rem',
                            animation: 'explosionEmoji 0.6s ease-out forwards',
                        }}>💥</div>
                    </div>
                ))}

                {/* City at bottom */}
                <div style={{
                    position: 'absolute',
                    bottom: 0, left: 0, right: 0,
                    height: 36,
                    background: 'linear-gradient(0deg, rgba(99,55,245,0.6) 0%, transparent 100%)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    paddingBottom: 2,
                    gap: 4,
                }}>
                    {['🏛️', '🏢', '🏗️', '🏙️', '🏢', '🏛️'].map((b, i) => (
                        <span key={i} style={{ fontSize: cityHp <= i ? '0.5rem' : '1.1rem', opacity: cityHp <= i ? 0.2 : 1, transition: 'all 0.3s', filter: cityHp === 1 ? 'brightness(0.5) saturate(0)' : 'none' }}>{b}</span>
                    ))}
                </div>
            </div>

            {/* Input */}
            <div style={{ padding: '10px 14px', background: 'rgba(17,17,24,0.95)', borderTop: '1px solid var(--clr-border-accent)', flexShrink: 0 }}>
                <input
                    ref={inputRef}
                    type="text"
                    className="input"
                    placeholder="Scrivi la traduzione inglese..."
                    value={input}
                    onChange={handleInput}
                    onKeyDown={handleWrongKey}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    style={{
                        fontSize: '1.2rem',
                        textAlign: 'center',
                        padding: '10px',
                        animation: shakeInput ? 'shake 0.4s ease' : 'none',
                        borderColor: shakeInput ? 'var(--clr-error)' : undefined,
                    }}
                />
            </div>

            <style>{`
                @keyframes explosionRing {
                    from { transform: translate(-50%,-50%) scale(0.2); opacity: 1; }
                    to   { transform: translate(-50%,-50%) scale(2.2); opacity: 0; }
                }
                @keyframes explosionEmoji {
                    from { opacity: 1; transform: scale(0.5); }
                    to   { opacity: 0; transform: scale(2); }
                }
                @keyframes shake {
                    0%,100% { transform: translateX(0); }
                    20%     { transform: translateX(-6px); }
                    40%     { transform: translateX(6px); }
                    60%     { transform: translateX(-4px); }
                    80%     { transform: translateX(4px); }
                }
            `}</style>
        </div>
    )
}
