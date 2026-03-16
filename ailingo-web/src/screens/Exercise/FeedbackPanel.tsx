"use client"
import { useMemo } from 'react'
import type { Exercise } from '../../types'

interface Props {
    isCorrect: boolean
    correctAnswer: string
    userAnswer: string
    explanation?: string | null
    grammarRule?: string | null
    onNext: () => void
    speaking?: boolean
}

export default function FeedbackPanel({ isCorrect, correctAnswer, userAnswer, explanation, grammarRule, onNext, speaking }: Props) {
    const randomMsg = useMemo(() => {
        const feedbackMessages = isCorrect 
            ? [
                "Fantastico! Hai centrato il punto! 🎯", 
                "Ottimo lavoro! La logica non mente mai. ✨", 
                "Esatto! Vedi come tutto si incastra? 🧩", 
                "Perfetto! Ti muovi come un vero esperto. Maestro approva! 🎩", 
                "Bravissimo! Questo concetto è tuo per sempre. 🏅"
            ]
            : [
                "Ci siamo quasi! Un piccolo inciampo fa parte del percorso. 🧐", 
                "Non mollare! Anche Newton ha dovuto riflettere a lungo. 🍎", 
                "Riprova! Sbagliare è il primo passo per capire davvero. 💡", 
                "Ops, un dettaglio ti è sfuggito! Vediamo perché... 🔍", 
                "Continua così! La perseveranza è la chiave del genio. 💪"
            ]
        return feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)]
    }, [isCorrect])

    return (
        <div className={`animate-slide-up glass-premium ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`} style={{ borderLeft: `4px solid ${isCorrect ? 'var(--clr-success)' : 'var(--clr-error)'}` }}>
            <div className="flex flex-between" style={{ marginBottom: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span style={{ fontSize: '1.5rem', filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.3))' }}>{isCorrect ? '✨' : '🧐'}</span>
                    <span style={{ fontWeight: 800, fontSize: 'var(--text-lg)', color: isCorrect ? 'var(--clr-success)' : 'var(--clr-error)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {randomMsg}
                    </span>
                </div>
                {isCorrect && <span className="xp-chip animate-bounce text-glow">+10 XP ⭐ </span>}
            </div>

            {!isCorrect && (
                <div style={{ marginBottom: 'var(--space-3)' }}>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--clr-text-muted)', marginBottom: 4 }}>Risposta corretta:</div>
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: isCorrect ? 'var(--clr-success)' : 'var(--clr-text-primary)' }}>
                        {correctAnswer}
                    </div>
                    {userAnswer && !speaking && (
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--clr-text-muted)', marginTop: 4 }}>
                            La tua risposta: <em style={{ color: 'var(--clr-error)' }}>{userAnswer}</em>
                        </div>
                    )}
                </div>
            )}

            {explanation && (
                <div style={{ marginBottom: 'var(--space-3)', padding: 'var(--space-3)', background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--clr-text-muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        💡 Spiegazione
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--clr-text-secondary)', margin: 0 }}>{explanation}</p>
                </div>
            )}

            {grammarRule && (
                <div style={{ marginBottom: 'var(--space-3)', padding: 'var(--space-2) var(--space-3)', background: 'rgba(99,55,245,0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--clr-primary-400)' }}>
                    <div style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--clr-primary-300)' }}>
                        📌 {grammarRule}
                    </div>
                </div>
            )}

            <button className="btn btn-primary btn-full" onClick={onNext} autoFocus>
                Continua &rarr;
            </button>
        </div>
    )
}
