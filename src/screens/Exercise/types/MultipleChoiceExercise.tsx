import { useState } from 'react'
import type { Exercise } from '../../../types'
import FeedbackPanel from '../FeedbackPanel'
import AudioButton from '../AudioButton'

interface Props {
    exercise: Exercise
    onAnswer: (correct: boolean, answer: string) => void
    onNext: () => void
}

export default function MultipleChoiceExercise({ exercise, onAnswer, onNext }: Props) {
    const [selected, setSelected] = useState<string | null>(null)
    const [answered, setAnswered] = useState(false)
    const options: string[] = exercise.options_json ? JSON.parse(exercise.options_json) : []

    const isCorrect = selected === exercise.correct_answer

    const handleSelect = (opt: string) => {
        if (answered) return
        setSelected(opt)
        setAnswered(true)
        onAnswer(opt === exercise.correct_answer, opt)
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: 600, margin: '0 auto' }}>
            {/* Prompt */}
            <div className="card" style={{ marginBottom: 'var(--space-6)', background: 'var(--gradient-card)' }}>
                {exercise.audio_text && (
                    <div style={{ marginBottom: 'var(--space-4)' }}>
                        <AudioButton text={exercise.audio_text} />
                    </div>
                )}
                <h3 style={{ fontWeight: 600, fontSize: 'var(--text-xl)' }}>
                    {exercise.prompt_it ?? exercise.prompt_en}
                </h3>
            </div>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                {options.map((opt) => {
                    let cls = 'option-btn'
                    if (answered) {
                        if (opt === exercise.correct_answer) cls += ' correct'
                        else if (opt === selected) cls += ' wrong'
                    } else if (opt === selected) {
                        cls += ' selected'
                    }
                    return (
                        <button key={opt} className={cls} onClick={() => handleSelect(opt)} disabled={answered}>
                            {opt}
                        </button>
                    )
                })}
            </div>

            {/* Feedback */}
            {answered && (
                <FeedbackPanel
                    isCorrect={isCorrect}
                    correctAnswer={exercise.correct_answer}
                    userAnswer={selected ?? ''}
                    explanation={exercise.explanation_it}
                    grammarRule={exercise.grammar_rule}
                    onNext={onNext}
                />
            )}
        </div>
    )
}
