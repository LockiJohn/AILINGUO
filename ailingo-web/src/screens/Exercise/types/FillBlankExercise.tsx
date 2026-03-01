"use client"
import { useState } from 'react'
import type { Exercise } from '../../../types'
import FeedbackPanel from '../FeedbackPanel'

interface Props {
    exercise: Exercise
    onAnswer: (correct: boolean, answer: string) => void
    onNext: () => void
}

export default function FillBlankExercise({ exercise, onAnswer, onNext }: Props) {
    const [input, setInput] = useState('')
    const [answered, setAnswered] = useState(false)

    const normalize = (s: string) => s.trim().toLowerCase()
    const isCorrect = normalize(input) === normalize(exercise.correct_answer)

    const handleSubmit = () => {
        if (!input.trim() || answered) return
        setAnswered(true)
        onAnswer(isCorrect, input.trim())
    }

    // Render prompt with blank highlighted
    const promptText = exercise.prompt_en ?? exercise.prompt_it ?? ''

    return (
        <div className="animate-fade-in" style={{ maxWidth: 600, margin: '0 auto' }}>
            <div className="card" style={{ marginBottom: 'var(--space-6)', background: 'var(--gradient-card)' }}>
                {exercise.prompt_it && <p style={{ marginBottom: 8, fontSize: 'var(--text-sm)', color: 'var(--clr-text-muted)' }}>{exercise.prompt_it}</p>}
                <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 600 }}>
                    {promptText.replace('_____', '________')}
                </h3>
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
                <input
                    className="input"
                    type="text"
                    placeholder="Completa la frase…"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    disabled={answered}
                    autoFocus
                    style={{ fontSize: 'var(--text-lg)', padding: 'var(--space-4)', marginBottom: 'var(--space-4)', textAlign: 'center' }}
                />
                {!answered && (
                    <button className="btn btn-primary btn-full" onClick={handleSubmit} disabled={!input.trim()}>
                        Conferma →
                    </button>
                )}
            </div>

            {answered && (
                <FeedbackPanel
                    isCorrect={isCorrect}
                    correctAnswer={exercise.correct_answer}
                    userAnswer={input}
                    explanation={exercise.explanation_it}
                    grammarRule={exercise.grammar_rule}
                    onNext={onNext}
                />
            )}
        </div>
    )
}

