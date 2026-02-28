import { useState, useRef } from 'react'
import type { Exercise } from '../../../types'
import FeedbackPanel from '../FeedbackPanel'
import AudioButton from '../AudioButton'

interface Props {
    exercise: Exercise
    onAnswer: (correct: boolean, answer: string) => void
    onNext: () => void
}

export default function TranslationExercise({ exercise, onAnswer, onNext }: Props) {
    const [input, setInput] = useState('')
    const [answered, setAnswered] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const normalize = (s: string) => s.trim().toLowerCase().replace(/[.!?,;:]/g, '').replace(/\s+/g, ' ')
    const isCorrect = normalize(input) === normalize(exercise.correct_answer)

    const handleSubmit = () => {
        if (!input.trim() || answered) return
        setAnswered(true)
        onAnswer(isCorrect, input.trim())
    }

    const prompt = exercise.type === 'translation_it_en'
        ? `🇮🇹 → 🇬🇧  ${exercise.prompt_it}`
        : `🇬🇧 → 🇮🇹  ${exercise.prompt_en}`

    return (
        <div className="animate-fade-in" style={{ maxWidth: 600, margin: '0 auto' }}>
            <div className="card" style={{ marginBottom: 'var(--space-6)', background: 'var(--gradient-card)' }}>
                {exercise.audio_text && (
                    <div style={{ marginBottom: 'var(--space-4)' }}>
                        <AudioButton text={exercise.audio_text} />
                    </div>
                )}
                <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 600 }}>{prompt}</h3>
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
                <input
                    ref={inputRef}
                    className="input"
                    type="text"
                    placeholder="Scrivi la tua risposta…"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    disabled={answered}
                    autoFocus
                    style={{ fontSize: 'var(--text-lg)', padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}
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
