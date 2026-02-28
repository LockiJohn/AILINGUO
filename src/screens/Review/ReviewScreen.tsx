import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '../../store/sessionStore'
import type { Exercise } from '../../types'

export default function ReviewScreen() {
    const [queue, setQueue] = useState<Exercise[]>([])
    const [currentIdx, setCurrentIdx] = useState(0)
    const [userAnswer, setUserAnswer] = useState('')
    const [answered, setAnswered] = useState(false)
    const [isCorrect, setIsCorrect] = useState(false)
    const [loading, setLoading] = useState(true)
    const [done, setDone] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        window.ailingo.getReviewQueue().then(q => {
            setQueue(q)
            setLoading(false)
        })
    }, [])

    if (loading) return (
        <div className="screen-container flex flex-center" style={{ height: '100%' }}>
            <p className="text-muted animate-pulse">Caricamento ripasso…</p>
        </div>
    )

    if (!queue.length || done) {
        return (
            <div className="flex flex-col flex-center" style={{ height: '100vh', padding: 'var(--space-8)' }}>
                <div style={{ textAlign: 'center', maxWidth: 400 }}>
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>{queue.length === 0 ? '✅' : '🎉'}</div>
                    <h2>{queue.length === 0 ? 'Nessun ripasso oggi!' : 'Ripasso completato!'}</h2>
                    <p className="text-secondary" style={{ margin: 'var(--space-4) 0 var(--space-6)' }}>
                        {queue.length === 0
                            ? 'Hai ripassato tutto. Torna domani per nuovi esercizi!'
                            : 'Ottimo lavoro! Il sistema terrà traccia dei tuoi progressi.'}
                    </p>
                    <button className="btn btn-primary btn-lg" onClick={() => navigate('/dashboard')}>🏠 Dashboard</button>
                </div>
            </div>
        )
    }

    const exercise = queue[currentIdx]
    const normalize = (s: string) => s.trim().toLowerCase().replace(/[.!?,;:]/g, '').replace(/\s+/g, ' ')

    const handleSubmit = async () => {
        if (!userAnswer.trim() || answered) return
        const correct = normalize(userAnswer) === normalize(exercise.correct_answer)
        setIsCorrect(correct)
        setAnswered(true)
        // Update SM-2: quality 5 = perfect, 2 = hard, 0 = forgot
        const quality = correct ? 5 : 2
        await window.ailingo.updateReviewItem(exercise.id, quality)
    }

    const handleNext = () => {
        setAnswered(false)
        setUserAnswer('')
        setIsCorrect(false)
        if (currentIdx + 1 >= queue.length) {
            setDone(true)
        } else {
            setCurrentIdx(i => i + 1)
        }
    }

    return (
        <div className="screen-container animate-fade-in">
            <div className="flex flex-between" style={{ marginBottom: 'var(--space-6)' }}>
                <div>
                    <h2>🔁 Ripasso</h2>
                    <p className="text-muted">{currentIdx + 1} / {queue.length} esercizi</p>
                </div>
                <div className="progress-bar" style={{ width: 200, alignSelf: 'center' }}>
                    <div className="progress-bar__fill" style={{ width: `${((currentIdx) / queue.length) * 100}%` }} />
                </div>
            </div>

            <div className="card card-glow" style={{ marginBottom: 'var(--space-6)' }}>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--clr-text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                    {exercise.type === 'multiple_choice' ? 'Scelta Multipla' : 'Traduzione'}
                </div>
                <h3 style={{ fontSize: 'var(--text-xl)' }}>
                    {exercise.prompt_it ?? exercise.prompt_en}
                </h3>
            </div>

            <input
                className="input"
                type="text"
                placeholder="La tua risposta…"
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                disabled={answered}
                autoFocus
                style={{ fontSize: 'var(--text-lg)', padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}
            />

            {!answered && (
                <button className="btn btn-primary btn-full" onClick={handleSubmit} disabled={!userAnswer.trim()}>
                    Conferma →
                </button>
            )}

            {answered && (
                <div className={`animate-slide-up ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`}>
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>
                        {isCorrect ? '✅ Corretto!' : '❌ Sbagliato'}
                    </div>
                    {!isCorrect && (
                        <div style={{ marginBottom: 8, fontSize: 'var(--text-sm)' }}>
                            Risposta corretta: <strong>{exercise.correct_answer}</strong>
                        </div>
                    )}
                    {exercise.explanation_it && (
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--clr-text-secondary)', marginBottom: 8 }}>{exercise.explanation_it}</p>
                    )}
                    <button className="btn btn-primary btn-full" onClick={handleNext}>
                        {currentIdx + 1 >= queue.length ? 'Termina ripasso ✓' : 'Prossimo →'}
                    </button>
                </div>
            )}
        </div>
    )
}
