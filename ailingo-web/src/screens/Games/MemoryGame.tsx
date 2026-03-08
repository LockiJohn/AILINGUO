"use client"
import { useState, useEffect } from 'react'

interface Card {
    id: number
    text: string
    pairId: number
    isFlipped: boolean
    isMatched: boolean
}

export default function MemoryGame({ onBack }: { onBack: () => void }) {
    const [cards, setCards] = useState<Card[]>([])
    const [flippedCards, setFlippedCards] = useState<number[]>([])
    const [matches, setMatches] = useState(0)
    const [moves, setMoves] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Fetch vocabulary (weak words) to generate cards
        fetch('/api/content/words?level=A1')
            .then(res => res.json())
            .then((words: any[]) => {
                let pairsToUse = words.slice(0, 6)

                // Fallback if not enough weak words
                if (pairsToUse.length < 6) {
                    const fallback = [
                        { prompt_it: 'Gatto', correct_answer: 'Cat', lapses: 0 },
                        { prompt_it: 'Cane', correct_answer: 'Dog', lapses: 0 },
                        { prompt_it: 'Mela', correct_answer: 'Apple', lapses: 0 },
                        { prompt_it: 'Acqua', correct_answer: 'Water', lapses: 0 },
                        { prompt_it: 'Fuoco', correct_answer: 'Fire', lapses: 0 },
                        { prompt_it: 'Terra', correct_answer: 'Earth', lapses: 0 },
                    ]
                    pairsToUse = [...pairsToUse, ...fallback]
                    // Deduplicate and slice 6
                    const unique = new Map()
                    pairsToUse.forEach((p: any) => unique.set(p.correct_answer.toLowerCase(), p))
                    pairsToUse = Array.from(unique.values()).slice(0, 6)
                }

                const deck: Card[] = []
                pairsToUse.forEach((word: any, index: number) => {
                    deck.push({ id: index * 2, text: word.prompt_it, pairId: index, isFlipped: false, isMatched: false })
                    deck.push({ id: index * 2 + 1, text: word.correct_answer, pairId: index, isFlipped: false, isMatched: false })
                })

                // Shuffle
                deck.sort(() => Math.random() - 0.5)
                setCards(deck)
                setLoading(false)
            })
    }, [])

    const handleCardClick = (index: number) => {
        if (flippedCards.length === 2 || cards[index].isFlipped || cards[index].isMatched) return

        const newCards = [...cards]
        newCards[index].isFlipped = true
        setCards(newCards)

        const newFlipped = [...flippedCards, index]
        setFlippedCards(newFlipped)

        if (newFlipped.length === 2) {
            setMoves(m => m + 1)
            const [firstIndex, secondIndex] = newFlipped
            if (newCards[firstIndex].pairId === newCards[secondIndex].pairId) {
                // Match
                setTimeout(() => {
                    setCards(prev => {
                        const matched = [...prev]
                        matched[firstIndex].isMatched = true
                        matched[secondIndex].isMatched = true
                        return matched
                    })
                    setFlippedCards([])
                    setMatches(m => m + 1)
                }, 500)
            } else {
                // No match
                setTimeout(() => {
                    setCards(prev => {
                        const reset = [...prev]
                        reset[firstIndex].isFlipped = false
                        reset[secondIndex].isFlipped = false
                        return reset
                    })
                    setFlippedCards([])
                }, 1000)
            }
        }
    }

    if (loading) return <div className="screen-container">Caricamento Memory...</div>

    const isGameOver = matches === 6

    return (
        <div className="screen-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
                <button className="btn btn-ghost" onClick={onBack}>← Esci</button>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Mosse: {moves}</div>
                    <div style={{ color: 'var(--clr-text-muted)' }}>Coppie: {matches}/6</div>
                </div>
            </div>

            {isGameOver ? (
                <div className="card text-center animate-scale-in" style={{ padding: 'var(--space-8)' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: 'var(--space-4)' }}>🎉 Vittoria!</h2>
                    <p style={{ color: 'var(--clr-text-muted)', marginBottom: 'var(--space-6)' }}>
                        Hai completato il Memory in {moves} mosse.
                    </p>
                    <button className="btn btn-primary" onClick={onBack}>Torna all'Arcade</button>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 'var(--space-4)',
                    maxWidth: 500,
                    width: '100%',
                    perspective: 1000
                }}>
                    {cards.map((card, idx) => (
                        <div
                            key={card.id}
                            onClick={() => handleCardClick(idx)}
                            style={{
                                height: 120,
                                position: 'relative',
                                transformStyle: 'preserve-3d',
                                transition: 'transform 0.6s',
                                transform: card.isFlipped || card.isMatched ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                cursor: card.isMatched ? 'default' : 'pointer'
                            }}
                        >
                            {/* Card Back */}
                            <div className="card" style={{
                                position: 'absolute', width: '100%', height: '100%',
                                backfaceVisibility: 'hidden',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'var(--gradient-primary)',
                                color: 'white', fontSize: '2rem',
                                opacity: card.isMatched ? 0 : 1
                            }}>
                                ?
                            </div>

                            {/* Card Front */}
                            <div className="card" style={{
                                position: 'absolute', width: '100%', height: '100%',
                                backfaceVisibility: 'hidden',
                                transform: 'rotateY(180deg)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                textAlign: 'center',
                                background: card.isMatched ? 'var(--clr-success)' : 'var(--gradient-card)',
                                color: card.isMatched ? 'rgba(0,0,0,0.5)' : 'var(--clr-text)',
                                fontWeight: 'bold', fontSize: '1.1rem',
                                border: `2px solid ${card.isMatched ? 'var(--clr-success)' : 'var(--clr-border-accent)'}`,
                                opacity: card.isMatched ? 0.6 : 1
                            }}>
                                {card.text}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
