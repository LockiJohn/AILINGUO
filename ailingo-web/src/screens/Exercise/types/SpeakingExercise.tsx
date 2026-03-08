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

type SpeakingState = 'idle' | 'recording' | 'done'

export default function SpeakingExercise({ exercise, onAnswer, onNext }: Props) {
    const [state, setState] = useState<SpeakingState>('idle')
    const [transcript, setTranscript] = useState('')
    const [score, setScore] = useState<number | null>(null)
    const [answered, setAnswered] = useState(false)
    const recognitionRef = useRef<any>(null)

    const targetText = exercise.audio_text ?? exercise.correct_answer

    const startRecording = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (!SpeechRecognition) {
            alert('Il tuo browser non supporta il riconoscimento vocale. Prova con Chrome.')
            return
        }

        const rec = new SpeechRecognition()
        rec.lang = 'en-US'
        rec.interimResults = false
        rec.maxAlternatives = 1
        recognitionRef.current = rec
        setState('recording')

        rec.onresult = (event: any) => {
            const t = event.results[0][0].transcript
            setTranscript(t)
            const sc = calculateSpeakingScore(t, targetText)
            setScore(sc)
            setState('done')
            setAnswered(true)
            onAnswer(sc >= 60, t)
        }

        rec.onerror = () => {
            setState('idle')
            setTranscript('Errore microfono. Riprova.')
        }

        rec.onend = () => {
            if (state === 'recording') setState('idle')
        }

        rec.start()
    }

    const stopRecording = () => {
        recognitionRef.current?.stop()
        setState('idle')
    }

    const getStars = (sc: number) => {
        if (sc >= 85) return 5
        if (sc >= 70) return 4
        if (sc >= 55) return 3
        if (sc >= 40) return 2
        return 1
    }

    const stars = score !== null ? getStars(score) : 0

    return (
        <div className="animate-fade-in" style={{ maxWidth: 600, margin: '0 auto' }}>
            <div className="card" style={{ marginBottom: 'var(--space-6)', background: 'var(--gradient-card)', textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--clr-text-muted)', marginBottom: 8 }}>
                    🎤 Pronuncia questa frase:
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
                    "{targetText}"
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)' }}>
                    <AudioButton text={targetText} large label="▶ Ascolta" />
                    <AudioButton text={targetText} slow label="🐢 Lento" />
                </div>
            </div>

            {/* Recording controls */}
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
                {state === 'idle' && !answered && (
                    <button className="btn btn-accent btn-lg" onClick={startRecording} style={{ borderRadius: '50%', width: 80, height: 80, fontSize: '1.75rem' }}>
                        ⏺
                    </button>
                )}
                {state === 'recording' && (
                    <div>
                        <div className="speaking-wave" style={{ justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
                            <span /><span /><span /><span /><span />
                        </div>
                        <button className="btn btn-danger btn-lg" onClick={stopRecording} style={{ borderRadius: 'var(--radius-full)' }}>
                            ⏹ Ferma
                        </button>
                    </div>
                )}
                {!answered && state === 'idle' && <p className="text-muted" style={{ marginTop: 8, fontSize: 'var(--text-sm)' }}>Premi ⏺ per registrare</p>}
            </div>

            {/* Score display */}
            {score !== null && (
                <div className="card" style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
                    <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: score >= 60 ? 'var(--clr-success)' : 'var(--clr-error)', marginBottom: 8 }}>
                        {score}/100
                    </div>
                    <div className="stars" style={{ justifyContent: 'center', marginBottom: 8 }}>
                        {[1, 2, 3, 4, 5].map(i => (
                            <span key={i} className={`star ${i <= stars ? 'earned' : 'unearned'}`}>⭐</span>
                        ))}
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--clr-text-muted)' }}>
                        Hai detto: "<em>{transcript}</em>"
                    </p>
                </div>
            )}

            {answered && (
                <FeedbackPanel
                    isCorrect={score !== null && score >= 60}
                    correctAnswer={targetText}
                    userAnswer={transcript}
                    explanation={exercise.explanation_it}
                    grammarRule={exercise.grammar_rule}
                    onNext={onNext}
                    speaking
                />
            )}
        </div>
    )
}

// Simple Levenshtein-based similarity score 0-100
function calculateSpeakingScore(spoken: string, target: string): number {
    const a = spoken.toLowerCase().trim()
    const b = target.toLowerCase().trim()
    if (a === b) return 100
    const maxLen = Math.max(a.length, b.length)
    if (maxLen === 0) return 100
    const dist = levenshtein(a, b)
    return Math.max(0, Math.round((1 - dist / maxLen) * 100))
}

function levenshtein(a: string, b: string): number {
    const m = a.length, n = b.length
    const dp = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)))
    for (let i = 1; i <= m; i++)
        for (let j = 1; j <= n; j++)
            dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    return dp[m][n]
}

