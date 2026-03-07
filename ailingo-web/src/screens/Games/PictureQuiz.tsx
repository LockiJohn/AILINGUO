"use client"
import { useState, useEffect, useRef } from 'react'

interface QuizPair {
    emoji: string
    word: string
    hint?: string
}

const PICTURE_PAIRS: QuizPair[] = [
    { emoji: '🐱', word: 'cat' },
    { emoji: '🐶', word: 'dog' },
    { emoji: '🐦', word: 'bird' },
    { emoji: '🐟', word: 'fish' },
    { emoji: '🐴', word: 'horse' },
    { emoji: '🐄', word: 'cow' },
    { emoji: '🐷', word: 'pig' },
    { emoji: '🐑', word: 'sheep' },
    { emoji: '🦁', word: 'lion' },
    { emoji: '🐘', word: 'elephant' },
    { emoji: '🦊', word: 'fox' },
    { emoji: '🐰', word: 'rabbit' },
    { emoji: '🍎', word: 'apple' },
    { emoji: '🍌', word: 'banana' },
    { emoji: '🍊', word: 'orange' },
    { emoji: '🍇', word: 'grapes' },
    { emoji: '🍓', word: 'strawberry' },
    { emoji: '🍕', word: 'pizza' },
    { emoji: '🍰', word: 'cake' },
    { emoji: '🍞', word: 'bread' },
    { emoji: '🧀', word: 'cheese' },
    { emoji: '🥚', word: 'egg' },
    { emoji: '🥛', word: 'milk' },
    { emoji: '🍵', word: 'tea' },
    { emoji: '☕', word: 'coffee' },
    { emoji: '🏠', word: 'house' },
    { emoji: '🚗', word: 'car' },
    { emoji: '✈️', word: 'airplane' },
    { emoji: '🚢', word: 'ship' },
    { emoji: '📚', word: 'books' },
    { emoji: '💻', word: 'computer' },
    { emoji: '📱', word: 'phone' },
    { emoji: '⚽', word: 'football' },
    { emoji: '🎵', word: 'music' },
    { emoji: '🌙', word: 'moon' },
    { emoji: '☀️', word: 'sun' },
    { emoji: '⭐', word: 'star' },
    { emoji: '🌊', word: 'wave' },
    { emoji: '🔥', word: 'fire' },
    { emoji: '❤️', word: 'heart' },
]

const TOTAL_ROUNDS = 15

function shuffle<T>(arr: T[]): T[] {
    return [...arr].sort(() => Math.random() - 0.5)
}

export default function PictureQuiz({ onBack }: { onBack: () => void }) {
    const [rounds] = useState<QuizPair[]>(() => shuffle(PICTURE_PAIRS).slice(0, TOTAL_ROUNDS))
    const [current, setCurrent] = useState(0)
    const [input, setInput] = useState('')
    const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle')
    const [score, setScore] = useState(0)
    const [streak, setStreak] = useState(0)
    const [hintUsed, setHintUsed] = useState(false)
    const [hintShown, setHintShown] = useState('')
    const [gameOver, setGameOver] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => { inputRef.current?.focus() }, [current])

    const pair = rounds[current]

    const normalize = (s: string) => s.trim().toLowerCase().replace(/[^a-z]/g, '')

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (feedback !== 'idle') return
        const val = e.target.value
        setInput(val)

        if (normalize(val) === normalize(pair.word)) {
            const pts = hintUsed ? 5 : 10 + streak * 2
            setScore(s => s + pts)
            setStreak(s => s + 1)
            setFeedback('correct')
            setTimeout(() => advance(), 800)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && input.trim() && feedback === 'idle') {
            setFeedback('wrong')
            setStreak(0)
            setTimeout(() => {
                setFeedback('idle')
                setInput('')
            }, 700)
        }
    }

    const showHint = () => {
        if (hintUsed) return
        setHintUsed(true)
        const first = pair.word[0].toUpperCase()
        const rest = '_'.repeat(pair.word.length - 1)
        setHintShown(`${first}${rest}`)
    }

    const advance = () => {
        if (current + 1 >= TOTAL_ROUNDS) {
            setGameOver(true)
        } else {
            setCurrent(c => c + 1)
            setInput('')
            setFeedback('idle')
            setHintUsed(false)
            setHintShown('')
        }
    }

    const skipRound = () => {
        setStreak(0)
        advance()
    }

    if (gameOver) {
        const pct = Math.round((score / (TOTAL_ROUNDS * 10)) * 100)
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '32px', textAlign: 'center', gap: '18px' }}>
                <div style={{ fontSize: '4rem' }}>🏆</div>
                <h2 style={{ fontSize: '1.8rem' }}>Quiz Completato!</h2>
                <div style={{ fontSize: '3.5rem', fontWeight: 900, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{score} pt</div>
                <p style={{ color: 'var(--clr-text-muted)' }}>{pct >= 80 ? '🌟 Ottimo lavoro!' : pct >= 50 ? '👍 Buona prova!' : '💪 Riprova per migliorare!'}</p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button className="btn btn-primary" onClick={() => window.location.reload()}>🔄 Ricomincia</button>
                    <button className="btn btn-ghost" onClick={onBack}>← Arcade</button>
                </div>
            </div>
        )
    }

    const progress = (current / TOTAL_ROUNDS) * 100

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(17,17,24,0.9)', borderBottom: '1px solid var(--clr-border)', flexShrink: 0 }}>
                <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ padding: '4px 10px', fontSize: '0.78rem' }}>✕</button>
                <div style={{ flex: 1 }}>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${progress}%`, background: 'var(--gradient-primary)', borderRadius: 999, transition: 'width 0.4s ease' }} />
                    </div>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', fontWeight: 700, minWidth: 56, textAlign: 'right' }}>
                    {current + 1}/{TOTAL_ROUNDS}
                </div>
                <div className="xp-chip">{score} pt</div>
                {streak >= 2 && <span style={{ fontSize: '0.75rem', color: 'var(--clr-warning)', fontWeight: 800 }}>🔥×{streak}</span>}
            </div>

            {/* Main content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', gap: '24px', overflow: 'auto' }}>
                {/* Emoji picture */}
                <div style={{
                    fontSize: 'clamp(5rem, 18vw, 8rem)',
                    lineHeight: 1,
                    filter: feedback === 'correct' ? 'drop-shadow(0 0 30px var(--clr-success))' : feedback === 'wrong' ? 'drop-shadow(0 0 20px var(--clr-error))' : 'drop-shadow(0 0 15px rgba(99,55,245,0.4))',
                    animation: feedback === 'correct' ? 'correctBounce 0.5s ease' : feedback === 'wrong' ? 'wrongShake 0.4s ease' : 'none',
                    userSelect: 'none',
                }}>
                    {pair.emoji}
                </div>

                <div style={{ textAlign: 'center', color: 'var(--clr-text-muted)', fontSize: '0.85rem' }}>
                    Cosa vedi? Scrivi la parola in inglese
                </div>

                {/* Hint display */}
                {hintShown && (
                    <div style={{ fontSize: '1.4rem', letterSpacing: '0.25em', fontWeight: 700, color: 'var(--clr-primary-300)', fontFamily: 'var(--font-mono)' }}>
                        {hintShown}
                    </div>
                )}

                {/* Input area */}
                <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input
                        ref={inputRef}
                        type="text"
                        className="input"
                        placeholder="Type the English word..."
                        value={input}
                        onChange={handleInput}
                        onKeyDown={handleKeyDown}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        disabled={feedback !== 'idle'}
                        style={{
                            fontSize: '1.2rem',
                            textAlign: 'center',
                            borderColor: feedback === 'correct' ? 'var(--clr-success)' : feedback === 'wrong' ? 'var(--clr-error)' : undefined,
                            background: feedback === 'correct' ? 'rgba(34,197,94,0.08)' : feedback === 'wrong' ? 'rgba(239,68,68,0.08)' : undefined,
                            transition: 'border-color 0.2s, background 0.2s',
                        }}
                    />

                    {feedback === 'correct' && (
                        <div style={{ textAlign: 'center', color: 'var(--clr-success)', fontWeight: 700, fontSize: '1rem', animation: 'slideUp 0.3s ease' }}>
                            ✅ Corretto! {hintUsed ? '+5' : `+${10 + (streak - 1) * 2}`} pt
                        </div>
                    )}
                    {feedback === 'wrong' && (
                        <div style={{ textAlign: 'center', color: 'var(--clr-error)', fontWeight: 600, fontSize: '0.9rem' }}>
                            ❌ Riprova!
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={showHint}
                            disabled={hintUsed || feedback !== 'idle'}
                            style={{ fontSize: '0.8rem' }}
                        >
                            💡 Suggerimento
                        </button>
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={skipRound}
                            style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}
                        >
                            Salta →
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes correctBounce {
                    0%  { transform: scale(1); }
                    40% { transform: scale(1.25) rotate(5deg); }
                    70% { transform: scale(0.95) rotate(-3deg); }
                    100%{ transform: scale(1) rotate(0deg); }
                }
                @keyframes wrongShake {
                    0%,100%{ transform: translateX(0) rotate(0); }
                    20%    { transform: translateX(-10px) rotate(-4deg); }
                    40%    { transform: translateX(10px)  rotate(4deg); }
                    60%    { transform: translateX(-6px)  rotate(-2deg); }
                    80%    { transform: translateX(6px)   rotate(2deg); }
                }
            `}</style>
        </div>
    )
}
