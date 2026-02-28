import { useState } from 'react'
import type { Exercise } from '../../../types'
import FeedbackPanel from '../FeedbackPanel'

interface Props {
    exercise: Exercise
    onAnswer: (correct: boolean, answer: string) => void
    onNext: () => void
}

export default function MatchPairsExercise({ exercise, onAnswer, onNext }: Props) {
    // Parse pairs from options_json - format: ["word1_it", "word2_it", ..., "word1_en", "word2_en", ...]
    // Correct answer format: "it1:en1|it2:en2|..."
    const options: string[] = exercise.options_json ? JSON.parse(exercise.options_json) : []
    const half = Math.floor(options.length / 2)
    const leftItems = options.slice(0, half)
    const rightItems = options.slice(half)

    const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
    const [selectedRight, setSelectedRight] = useState<string | null>(null)
    const [matched, setMatched] = useState<Record<string, string>>({}) // left -> right
    const [answered, setAnswered] = useState(false)
    const [wrongPair, setWrongPair] = useState<[string, string] | null>(null)

    // Parse correct pairs from answer string "it1:en1|it2:en2"
    const correctPairs: Record<string, string> = {}
    exercise.correct_answer.split('|').forEach(pair => {
        const [l, r] = pair.split(':')
        if (l && r) correctPairs[l.trim()] = r.trim()
    })

    const handleLeftClick = (word: string) => {
        if (answered || matched[word]) return
        setSelectedLeft(word)
        setWrongPair(null)
    }

    const handleRightClick = (word: string) => {
        if (answered || Object.values(matched).includes(word)) return
        if (!selectedLeft) return
        setSelectedRight(word)

        // Check match
        const isMatch = correctPairs[selectedLeft] === word
        if (isMatch) {
            setMatched(prev => ({ ...prev, [selectedLeft]: word }))
            setSelectedLeft(null)
            setSelectedRight(null)

            // Check if all matched
            const newMatched = { ...matched, [selectedLeft]: word }
            if (Object.keys(newMatched).length === leftItems.length) {
                setAnswered(true)
                onAnswer(true, JSON.stringify(newMatched))
            }
        } else {
            setWrongPair([selectedLeft, word])
            setTimeout(() => {
                setSelectedLeft(null)
                setSelectedRight(null)
                setWrongPair(null)
            }, 800)
        }
    }

    const getLeftClass = (word: string) => {
        let cls = 'option-btn'
        if (matched[word]) cls += ' correct'
        else if (selectedLeft === word) cls += ' selected'
        else if (wrongPair?.[0] === word) cls += ' wrong'
        return cls
    }

    const getRightClass = (word: string) => {
        let cls = 'option-btn'
        if (Object.values(matched).includes(word)) cls += ' correct'
        else if (selectedRight === word) cls += ' selected'
        else if (wrongPair?.[1] === word) cls += ' wrong'
        return cls
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: 600, margin: '0 auto' }}>
            <div className="card" style={{ marginBottom: 'var(--space-6)', background: 'var(--gradient-card)' }}>
                <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 600 }}>
                    {exercise.prompt_it ?? '🔗 Abbina le coppie:'}
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--clr-text-muted)', marginTop: 8 }}>
                    Clicca una parola a sinistra, poi la sua traduzione a destra
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {leftItems.map(word => (
                        <button key={word} className={getLeftClass(word)} onClick={() => handleLeftClick(word)} disabled={!!matched[word]}>
                            {word}
                        </button>
                    ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {rightItems.map(word => (
                        <button key={word} className={getRightClass(word)} onClick={() => handleRightClick(word)} disabled={Object.values(matched).includes(word)}>
                            {word}
                        </button>
                    ))}
                </div>
            </div>

            {answered && (
                <FeedbackPanel
                    isCorrect={true}
                    correctAnswer={exercise.correct_answer}
                    userAnswer=""
                    explanation={exercise.explanation_it}
                    grammarRule={exercise.grammar_rule}
                    onNext={onNext}
                />
            )}
        </div>
    )
}
