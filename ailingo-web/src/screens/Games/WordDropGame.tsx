"use client"
import { useState, useEffect, useRef } from 'react'

interface FallingWord {
    id: number
    wordIt: string
    wordEn: string
    x: number
    y: number
    speed: number
}

export default function WordDropGame({ onBack }: { onBack: () => void }) {
    const [score, setScore] = useState(0)
    const [lives, setLives] = useState(3)
    const [words, setWords] = useState<FallingWord[]>([])
    const [input, setInput] = useState('')
    const [dictionary, setDictionary] = useState<Array<{ prompt_it: string, correct_answer: string }>>([])
    const containerRef = useRef<HTMLDivElement>(null)
    const requestRef = useRef<number | undefined>(undefined)
    const lastSpawnRef = useRef<number>(Date.now())

    useEffect(() => {
        fetch('/api/content/words?level=A1')
            .then(res => res.json())
            .then((res) => {
                let dict = res
                if (!dict || dict.length < 10) {
                    dict = [
                        { prompt_it: 'Sempre', correct_answer: 'Always', lapses: 0 },
                        { prompt_it: 'Mai', correct_answer: 'Never', lapses: 0 },
                        { prompt_it: 'Oggi', correct_answer: 'Today', lapses: 0 },
                        { prompt_it: 'Domani', correct_answer: 'Tomorrow', lapses: 0 },
                        { prompt_it: 'Ieri', correct_answer: 'Yesterday', lapses: 0 },
                        ...dict
                    ]
                }
                setDictionary(dict)
            })
    }, [])

    const spawnWord = () => {
        if (dictionary.length === 0 || lives <= 0) return

        const r = dictionary[Math.floor(Math.random() * dictionary.length)]
        const newWord: FallingWord = {
            id: Date.now(),
            wordIt: r.prompt_it,
            wordEn: r.correct_answer.toLowerCase().trim(),
            x: Math.random() * 80 + 10, // 10% to 90% width
            y: -10,
            speed: 0.15 + (score * 0.005) // Gets faster
        }
        setWords(prev => [...prev, newWord])
    }

    const gameLoop = () => {
        if (lives <= 0) return

        // Spawn logic
        if (Date.now() - lastSpawnRef.current > Math.max(1000, 3000 - score * 50)) {
            spawnWord()
            lastSpawnRef.current = Date.now()
        }

        // Drop logic
        setWords(prev => {
            let missed = 0
            const next = prev.map(w => ({ ...w, y: w.y + w.speed })).filter(w => {
                if (w.y > 100) {
                    missed++
                    return false
                }
                return true
            })
            if (missed > 0) {
                setLives(l => l - missed)
            }
            return next
        })

        requestRef.current = requestAnimationFrame(gameLoop)
    }

    useEffect(() => {
        requestRef.current = requestAnimationFrame(gameLoop)
        return () => cancelAnimationFrame(requestRef.current!)
    }, [dictionary, lives, score])

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toLowerCase()
        setInput(val)

        const matchIdx = words.findIndex(w => w.wordEn === val)
        if (matchIdx !== -1) {
            // Destroy word
            setWords(prev => prev.filter((_, i) => i !== matchIdx))
            setInput('')
            setScore(s => s + 10)
        }
    }

    if (lives <= 0) {
        return (
            <div className="screen-container animate-scale-in flex flex-center" style={{ height: '100%' }}>
                <div className="card text-center" style={{ padding: 'var(--space-8)' }}>
                    <h2 style={{ fontSize: '2rem', color: 'var(--clr-error)' }}>Game Over</h2>
                    <p style={{ marginTop: 'var(--space-4)', fontSize: '1.2rem' }}>Punteggio Finale: {score}</p>
                    <button className="btn btn-primary mt-6" onClick={onBack}>Torna all'Arcade</button>
                </div>
            </div>
        )
    }

    return (
        <div className="screen-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: 'var(--space-4) var(--space-6)', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--clr-border)', background: 'var(--clr-bg-page)' }}>
                <button className="btn btn-ghost" onClick={onBack}>← Abbandona</button>
                <div style={{ display: 'flex', gap: 'var(--space-6)', fontWeight: 'bold' }}>
                    <span style={{ color: 'var(--clr-primary-400)' }}>Punteggio: {score}</span>
                    <span style={{ color: 'var(--clr-error)' }}>Vite: {'❤️'.repeat(Math.max(0, lives))}</span>
                </div>
            </div>

            <div ref={containerRef} style={{ flex: 1, position: 'relative', background: 'var(--gradient-bg-body)', overflow: 'hidden' }}>
                {words.map(w => (
                    <div key={w.id} className="card" style={{
                        position: 'absolute',
                        left: `${w.x}%`,
                        top: `${w.y}%`,
                        padding: '8px 16px',
                        background: 'var(--gradient-card)',
                        border: '1px solid var(--clr-border-accent)',
                        transform: 'translateX(-50%)',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        color: 'var(--clr-text)',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                    }}>
                        {w.wordIt}
                    </div>
                ))}
            </div>

            <div style={{ padding: 'var(--space-4)', background: 'var(--clr-bg-surface)' }}>
                <input
                    type="text"
                    className="input"
                    placeholder="Digita la traduzione in inglese..."
                    value={input}
                    onChange={handleInput}
                    autoFocus
                    style={{ fontSize: '1.5rem', textAlign: 'center', padding: 'var(--space-4)' }}
                />
            </div>
        </div>
    )
}
