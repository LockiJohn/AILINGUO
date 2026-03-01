import { useState, useRef, useEffect } from 'react'
import type { Exercise } from '../../../types'
import FeedbackPanel from '../FeedbackPanel'
import AudioButton from '../AudioButton'

interface Props {
    exercise: Exercise
    onAnswer: (correct: boolean, answer: string) => void
    onNext: () => void
}

export default function FreeDictationExercise({ exercise, onAnswer, onNext }: Props) {
    const [inputValue, setInputValue] = useState('')
    const [answered, setAnswered] = useState(false)
    const [isCorrect, setIsCorrect] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        // Auto-focus the input when the exercise loads
        if (inputRef.current) {
            inputRef.current.focus()
        }
    }, [])

    const normalizeString = (str: string) => {
        return str
            .toLowerCase()
            .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '') // remove punctuation
            .replace(/\s{2,}/g, ' ')                   // replace multiple spaces with single space
            .trim()
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (answered || !inputValue.trim()) return

        const normalizedInput = normalizeString(inputValue)
        const normalizedAnswer = normalizeString(exercise.correct_answer)

        const correct = normalizedInput === normalizedAnswer
        setIsCorrect(correct)
        setAnswered(true)
        onAnswer(correct, inputValue)
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <div className="card" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-8)' }}>
                <h3 style={{ marginBottom: 'var(--space-6)', color: 'var(--clr-text-secondary)' }}>
                    Ascolta e digita la frase esatta
                </h3>

                {exercise.audio_text && (
                    <div style={{ transform: 'scale(1.5)', marginBottom: 'var(--space-8)', display: 'flex', justifyContent: 'center' }}>
                        <AudioButton text={exercise.audio_text} />
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={answered}
                        placeholder="Inizia a digitare qui..."
                        className="textarea"
                        style={{
                            fontSize: '1.25rem',
                            padding: 'var(--space-4)',
                            textAlign: 'center',
                            width: '100%',
                            backgroundColor: 'rgba(0,0,0,0.2)',
                            border: '2px solid var(--clr-border)'
                        }}
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck="false"
                    />

                    {!answered && (
                        <button type="submit" className="btn btn-primary btn-lg" disabled={!inputValue.trim()}>
                            Controlla Answer
                        </button>
                    )}
                </form>
            </div>

            {answered && (
                <FeedbackPanel
                    isCorrect={isCorrect}
                    correctAnswer={exercise.correct_answer}
                    userAnswer={inputValue}
                    explanation={exercise.explanation_it}
                    grammarRule={exercise.grammar_rule}
                    onNext={onNext}
                />
            )}
        </div>
    )
}
