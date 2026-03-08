"use client"
import { useState, useRef } from 'react'
import type { Exercise } from '../../../types'
import FeedbackPanel from '../FeedbackPanel'
import AudioButton from '../AudioButton'

interface Props {
    exercise: Exercise
    onAnswer: (correct: boolean, answer: string) => void
    onNext: () => void
}

export default function ListenWriteExercise({ exercise, onAnswer, onNext }: Props) {
    const [input, setInput] = useState('')
    const [answered, setAnswered] = useState(false)

    const normalize = (s: string) => s.trim().toLowerCase().replace(/[.!?,;:]/g, '').replace(/\s+/g, ' ')
    const isCorrect = normalize(input) === normalize(exercise.correct_answer)

    const handleSubmit = () => {
        if (!input.trim() || answered) return
        setAnswered(true)
        onAnswer(isCorrect, input.trim())
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: 600, margin: '0 auto' }}>
            <div className="card" style={{ marginBottom: 'var(--space-6)', background: 'var(--gradient-card)', textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)', color: 'var(--clr-text-muted)' }}>
                    🎧 Ascolta e scrivi ciò che senti
                </div>
                {exercise.audio_text && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)' }}>
                        <AudioButton text={exercise.audio_text} large />
                        <AudioButton text={exercise.audio_text} slow label="🐢 Lento" />
                    </div>
                )}
            </div>

            <input
                className="input"
                type="text"
                placeholder="Scrivi ciò che hai sentito…"
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

