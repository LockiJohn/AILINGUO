"use client"
import { useState } from 'react'
import type { Exercise } from '../../../types'
import FeedbackPanel from '../FeedbackPanel'

interface Props {
    exercise: Exercise
    onAnswer: (correct: boolean, answer: string) => void
    onNext: () => void
}

export default function WordOrderExercise({ exercise, onAnswer, onNext }: Props) {
    const words: string[] = exercise.options_json ? JSON.parse(exercise.options_json) : []
    const [shuffled] = useState(() => [...words].sort(() => Math.random() - 0.5))
    const [selected, setSelected] = useState<string[]>([])
    const [used, setUsed] = useState<boolean[]>(new Array(shuffled.length).fill(false))
    const [answered, setAnswered] = useState(false)

    const normalize = (s: string) => s.trim().toLowerCase().replace(/[.!?,;:]/g, '').replace(/\s+/g, ' ')
    const currentAnswer = selected.join(' ')
    const isCorrect = normalize(currentAnswer) === normalize(exercise.correct_answer)

    const addWord = (word: string, idx: number) => {
        if (answered || used[idx]) return
        setSelected(prev => [...prev, word])
        setUsed(prev => { const n = [...prev]; n[idx] = true; return n })
    }

    const removeWord = (selIdx: number) => {
        if (answered) return
        const word = selected[selIdx]
        const origIdx = shuffled.findIndex((w, i) => w === word && used[i])
        setSelected(prev => prev.filter((_, i) => i !== selIdx))
        setUsed(prev => {
            const n = [...prev]
            // Find first used occurrence of this word in shuffled
            const fi = shuffled.findIndex((w, i) => w === word && n[i])
            if (fi !== -1) n[fi] = false
            return n
        })
    }

    const handleSubmit = () => {
        if (!selected.length || answered) return
        setAnswered(true)
        onAnswer(isCorrect, currentAnswer)
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: 600, margin: '0 auto' }}>
            <div className="card" style={{ marginBottom: 'var(--space-6)', background: 'var(--gradient-card)' }}>
                <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 600 }}>
                    {exercise.prompt_it ?? '🔀 Riordina le parole:'}
                </h3>
            </div>

            {/* Answer area */}
            <div style={{
                minHeight: 56,
                background: 'var(--clr-bg-input)',
                border: `1.5px solid ${answered ? (isCorrect ? 'var(--clr-success)' : 'var(--clr-error)') : 'var(--clr-border)'}`,
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3) var(--space-4)',
                display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)',
                marginBottom: 'var(--space-4)',
            }}>
                {selected.length === 0 && <span style={{ color: 'var(--clr-text-muted)', fontStyle: 'italic' }}>Clicca le parole per costruire la frase…</span>}
                {selected.map((w, i) => (
                    <span key={i} className="word-chip" onClick={() => removeWord(i)} style={{ background: 'rgba(99,55,245,0.15)', borderColor: 'var(--clr-primary-400)' }}>
                        {w} ×
                    </span>
                ))}
            </div>

            {/* Word bank */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                {shuffled.map((word, i) => (
                    <span key={i} className={`word-chip ${used[i] ? 'used' : ''}`} onClick={() => addWord(word, i)}>
                        {word}
                    </span>
                ))}
            </div>

            {!answered && (
                <button className="btn btn-primary btn-full" onClick={handleSubmit} disabled={!selected.length}>
                    Conferma →
                </button>
            )}

            {answered && (
                <FeedbackPanel
                    isCorrect={isCorrect}
                    correctAnswer={exercise.correct_answer}
                    userAnswer={currentAnswer}
                    explanation={exercise.explanation_it}
                    grammarRule={exercise.grammar_rule}
                    onNext={onNext}
                />
            )}
        </div>
    )
}

