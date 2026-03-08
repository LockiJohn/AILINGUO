"use client"
import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getLessonById, type StudyLesson, type StudyExercise } from '../../data/studyLessons'
import { useUserStore } from '../../store/userStore'

type Phase = 'intro' | 'slides' | 'exercises' | 'recap'

export default function StudyModeScreen() {
    const router = useRouter()
    const params = useSearchParams()
    const lessonId = params.get('id') || ''
    const lesson = getLessonById(lessonId)
    const { user } = useUserStore()

    const [phase, setPhase] = useState<Phase>('intro')
    const [slideIndex, setSlideIndex] = useState(0)
    const [exIndex, setExIndex] = useState(0)
    const [answers, setAnswers] = useState<{ correct: boolean; userAnswer: string }[]>([])
    const [selected, setSelected] = useState<string | null>(null)
    const [fillInput, setFillInput] = useState('')
    const [showFeedback, setShowFeedback] = useState(false)
    const [xpEarned, setXpEarned] = useState(0)
    const [streak, setStreak] = useState(0)
    const [bestStreak, setBestStreak] = useState(0)
    const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        return () => { if (feedbackTimer.current) clearTimeout(feedbackTimer.current) }
    }, [])

    if (!lesson) {
        return (
            <div className="screen-container flex flex-center flex-col" style={{ height: '100vh' }}>
                <div style={{ fontSize: '3rem' }}>😕</div>
                <h2>Lezione non trovata</h2>
                <button className="btn btn-primary" onClick={() => router.push('/study')}>
                    ← Torna all'elenco
                </button>
            </div>
        )
    }

    const currentSlide = lesson.slides[slideIndex]
    const currentEx = lesson.exercises[exIndex]
    const correctCount = answers.filter(a => a.correct).length
    const totalEx = lesson.exercises.length
    const accuracy = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0
    const topProgress = phase === 'slides'
        ? ((slideIndex + 1) / lesson.slides.length) * 100
        : phase === 'exercises'
            ? ((exIndex) / totalEx) * 100
            : phase === 'recap' ? 100 : 0

    // ─── Phase: INTRO ──────────────────────────────────────────────
    if (phase === 'intro') {
        return (
            <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', background: 'var(--clr-bg-base)' }}>
                <button
                    className="btn btn-ghost btn-sm"
                    style={{ alignSelf: 'flex-start', margin: 'var(--space-4)' }}
                    onClick={() => router.push('/study')}
                >
                    ← Esci
                </button>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)', maxWidth: 500, margin: '0 auto', width: '100%' }}>
                    <div className="animate-fade-in" style={{ textAlign: 'center', width: '100%' }}>
                        <div style={{ fontSize: '4.5rem', marginBottom: 'var(--space-4)', animation: 'float 3s ease-in-out infinite' }}>
                            {lesson.emoji}
                        </div>

                        <h1 className="gradient-text" style={{ fontSize: '1.8rem', marginBottom: 'var(--space-2)' }}>
                            {lesson.title}
                        </h1>
                        <p className="text-secondary" style={{ marginBottom: 'var(--space-6)', fontSize: '1rem', lineHeight: 1.5 }}>
                            {lesson.subtitle}
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
                            {[
                                { icon: '⏱️', label: `${lesson.estimatedMinutes} min` },
                                { icon: '📝', label: `${totalEx} esercizi` },
                                { icon: '⭐', label: `+${lesson.xp} XP` },
                            ].map(b => (
                                <div key={b.label} className="card" style={{ padding: 'var(--space-3)', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.3rem', marginBottom: 4 }}>{b.icon}</div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--clr-text-secondary)' }}>{b.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="card" style={{ marginBottom: 'var(--space-6)', textAlign: 'left', background: 'rgba(99,55,245,0.06)', border: '1px solid var(--clr-border-accent)' }}>
                            <p style={{ fontWeight: 700, marginBottom: 'var(--space-2)' }}>🎯 In questa lezione imparerai a:</p>
                            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.9rem', color: 'var(--clr-text-secondary)' }}>
                                {lesson.slides.map((s, i) => (
                                    <li key={i}>{s.title}</li>
                                ))}
                            </ul>
                        </div>

                        <button className="btn btn-primary btn-lg btn-full" onClick={() => setPhase('slides')}
                            style={{ fontSize: '1rem', padding: 'var(--space-4)', background: 'var(--gradient-primary)', border: 'none', boxShadow: '0 6px 24px rgba(99,55,245,0.4)' }}>
                            🚀 Inizia la lezione
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // ─── Phase: SLIDES (Mini-Lesson) ───────────────────────────────
    if (phase === 'slides') {
        return (
            <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', background: 'var(--clr-bg-base)' }}>
                {/* Progress bar */}
                <div style={{ height: 4, background: 'var(--clr-bg-hover)', flexShrink: 0 }}>
                    <div className="progress-bar__fill" style={{ width: `${topProgress}%`, height: '100%', transition: 'width 0.4s ease', background: 'var(--gradient-primary)' }} />
                </div>

                {/* Header */}
                <div className="flex flex-between" style={{ padding: 'var(--space-4) var(--space-5)', flexShrink: 0 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => slideIndex === 0 ? setPhase('intro') : setSlideIndex(s => s - 1)}>
                        ←
                    </button>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>
                        {slideIndex + 1} / {lesson.slides.length}
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--clr-primary-400)', fontSize: '0.85rem' }}>
                        {lesson.emoji} {lesson.title}
                    </span>
                </div>

                {/* Slide content */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-5)', maxWidth: 560, margin: '0 auto', width: '100%' }}>
                    <div key={slideIndex} className="animate-slide-up" style={{ width: '100%' }}>
                        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-3)' }}>{currentSlide.emoji}</div>
                            <h2 style={{ fontSize: '1.4rem', marginBottom: 0 }}>{currentSlide.title}</h2>
                        </div>

                        {/* Body with bold parsing */}
                        <div className="card" style={{ marginBottom: 'var(--space-4)', lineHeight: 1.75, fontSize: '0.97rem', whiteSpace: 'pre-line', background: 'var(--clr-bg-surface)' }}>
                            {parseBold(currentSlide.body)}
                        </div>

                        {/* Example box */}
                        {currentSlide.example && (
                            <div style={{
                                background: 'rgba(99,55,245,0.07)',
                                border: '1.5px solid var(--clr-border-accent)',
                                borderRadius: 'var(--radius-lg)',
                                padding: 'var(--space-4)',
                                marginBottom: 'var(--space-6)',
                                fontFamily: 'monospace',
                                fontSize: '0.92rem',
                                whiteSpace: 'pre-line',
                                lineHeight: 1.65,
                                color: 'var(--clr-primary-300)',
                            }}>
                                {currentSlide.example}
                            </div>
                        )}
                    </div>
                </div>

                {/* Next button */}
                <div style={{ padding: 'var(--space-5)', paddingBottom: 'calc(var(--space-5) + env(safe-area-inset-bottom,0px))', flexShrink: 0 }}>
                    {slideIndex < lesson.slides.length - 1 ? (
                        <button className="btn btn-primary btn-lg btn-full" onClick={() => setSlideIndex(i => i + 1)}>
                            Avanti →
                        </button>
                    ) : (
                        <button
                            className="btn btn-accent btn-lg btn-full"
                            onClick={() => setPhase('exercises')}
                            style={{ background: 'var(--gradient-primary)', border: 'none', boxShadow: '0 6px 24px rgba(99,55,245,0.35)' }}
                        >
                            ✅ Pronto per gli esercizi!
                        </button>
                    )}
                </div>
            </div>
        )
    }

    // ─── Phase: EXERCISES ─────────────────────────────────────────
    if (phase === 'exercises' && currentEx) {
        const isCorrect = selected === currentEx.correct || fillInput.trim().toLowerCase() === currentEx.correct.toLowerCase()

        const handleAnswer = (answer: string) => {
            if (showFeedback) return
            setSelected(answer)
            setShowFeedback(true)
            const correct = answer === currentEx.correct || answer.trim().toLowerCase() === currentEx.correct.toLowerCase()
            if (correct) {
                const newStreak = streak + 1
                setStreak(newStreak)
                setBestStreak(s => Math.max(s, newStreak))
                setXpEarned(x => x + Math.round((lesson.xp / totalEx) * (newStreak >= 3 ? 1.5 : 1)))
            } else {
                setStreak(0)
            }
            setAnswers(a => [...a, { correct, userAnswer: answer }])
            feedbackTimer.current = setTimeout(goNext, 2200)
        }

        const goNext = () => {
            if (feedbackTimer.current) clearTimeout(feedbackTimer.current)
            setShowFeedback(false)
            setSelected(null)
            setFillInput('')
            if (exIndex + 1 >= totalEx) {
                setPhase('recap')
            } else {
                setExIndex(i => i + 1)
            }
        }

        return (
            <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', background: 'var(--clr-bg-base)' }}>
                {/* Progress bar */}
                <div style={{ height: 4, background: 'var(--clr-bg-hover)', flexShrink: 0 }}>
                    <div className="progress-bar__fill" style={{ width: `${topProgress}%`, height: '100%', transition: 'width 0.5s ease', background: 'var(--gradient-primary)' }} />
                </div>

                {/* Header */}
                <div className="flex flex-between" style={{ padding: 'var(--space-4) var(--space-5)', flexShrink: 0 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => router.push('/study')}>✕</button>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>
                        {exIndex + 1} / {totalEx}
                    </div>
                    <div className="xp-chip">⭐ {xpEarned} XP</div>
                </div>

                {/* Streak banner */}
                {streak >= 3 && !showFeedback && (
                    <div style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 700, color: '#f97316', padding: 'var(--space-2)', background: 'rgba(249,115,22,0.1)', borderBottom: '1px solid rgba(249,115,22,0.2)' }}>
                        🔥 {streak} risposte corrette di fila! Bonus XP attivo!
                    </div>
                )}

                {/* Exercise */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 'var(--space-5)', maxWidth: 560, margin: '0 auto', width: '100%' }}>
                    <div key={exIndex} className="animate-slide-up">
                        {/* Exercise type badge */}
                        <span className="badge badge-primary" style={{ marginBottom: 'var(--space-4)', fontSize: '0.75rem' }}>
                            {currentEx.type === 'multiple_choice' ? '🎯 Scelta multipla' : currentEx.type === 'true_false' ? '✅ Vero o Falso' : '✏️ Completa'}
                        </span>

                        {/* Prompt */}
                        <div className="card card-glow" style={{ marginBottom: 'var(--space-5)', fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.55, padding: 'var(--space-5)' }}>
                            {currentEx.prompt}
                        </div>

                        {/* Answers */}
                        {currentEx.type === 'multiple_choice' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                {currentEx.options!.map(opt => (
                                    <OptionButton
                                        key={opt}
                                        label={opt}
                                        selected={selected === opt}
                                        showFeedback={showFeedback}
                                        correct={currentEx.correct}
                                        onSelect={handleAnswer}
                                    />
                                ))}
                            </div>
                        )}

                        {currentEx.type === 'true_false' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                                {['Vero', 'Falso'].map(opt => (
                                    <OptionButton
                                        key={opt}
                                        label={opt === 'Vero' ? '✅ Vero' : '❌ Falso'}
                                        rawValue={opt}
                                        selected={selected === opt}
                                        showFeedback={showFeedback}
                                        correct={currentEx.correct}
                                        onSelect={handleAnswer}
                                    />
                                ))}
                            </div>
                        )}

                        {currentEx.type === 'fill_blank' && (
                            <div>
                                <input
                                    className="input"
                                    style={{ width: '100%', fontSize: '1rem', marginBottom: 'var(--space-3)', textAlign: 'center', fontWeight: 600 }}
                                    placeholder="Scrivi la risposta..."
                                    value={fillInput}
                                    onChange={e => setFillInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && fillInput.trim() && handleAnswer(fillInput.trim())}
                                    disabled={showFeedback}
                                    autoFocus
                                />
                                {!showFeedback && (
                                    <button className="btn btn-primary btn-full" onClick={() => fillInput.trim() && handleAnswer(fillInput.trim())} disabled={!fillInput.trim()}>
                                        Conferma ✓
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Feedback overlay */}
                {showFeedback && (
                    <div
                        key="feedback"
                        style={{
                            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
                            padding: 'var(--space-5)',
                            paddingBottom: 'calc(var(--space-5) + env(safe-area-inset-bottom,0px))',
                            background: isCorrect ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                            backdropFilter: 'blur(8px)',
                            borderTop: `2px solid ${isCorrect ? '#22c55e' : '#ef4444'}`,
                            animation: 'slideUp 0.25s ease-out',
                        }}
                    >
                        <div className="flex" style={{ gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                            <div style={{ fontSize: '1.8rem', flexShrink: 0 }}>{isCorrect ? '🎉' : '💡'}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 800, fontSize: '1rem', color: isCorrect ? '#22c55e' : '#ef4444', marginBottom: 4 }}>
                                    {isCorrect ? 'Corretto!' : `Risposta: ${currentEx.correct}`}
                                </div>
                                <div style={{ fontSize: '0.88rem', color: 'var(--clr-text-secondary)', lineHeight: 1.5 }}>
                                    {currentEx.explanation}
                                </div>
                            </div>
                            <button
                                className="btn btn-sm"
                                style={{ background: isCorrect ? '#22c55e' : '#ef4444', color: '#fff', border: 'none', flexShrink: 0 }}
                                onClick={goNext}
                            >
                                Avanti
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // ─── Phase: RECAP ─────────────────────────────────────────────
    if (phase === 'recap') {
        const grade = accuracy >= 90 ? '🏆' : accuracy >= 70 ? '🌟' : accuracy >= 50 ? '💪' : '📚'
        const gradeMsg = accuracy >= 90 ? 'Eccellente! Sei un campione!' : accuracy >= 70 ? 'Ottimo lavoro!' : accuracy >= 50 ? 'Bene! Continua così' : 'Ripassiamo insieme!'
        const missed = lesson.exercises.filter((_, i) => answers[i] && !answers[i].correct)

        return (
            <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', background: 'var(--clr-bg-base)' }}>
                <div style={{ flex: 1, padding: 'var(--space-6)', maxWidth: 540, margin: '0 auto', width: '100%', paddingBottom: '120px' }}>
                    <div className="animate-fade-in">
                        {/* Trophy */}
                        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
                            <div style={{ fontSize: '5rem', marginBottom: 'var(--space-3)', animation: 'float 2.5s ease-in-out infinite' }}>{grade}</div>
                            <h1 className="gradient-text" style={{ fontSize: '1.7rem', marginBottom: 'var(--space-1)' }}>{gradeMsg}</h1>
                            <p className="text-secondary">{lesson.title} completata!</p>
                        </div>

                        {/* Stats grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                            {[
                                { label: 'Precisione', value: `${accuracy}%`, icon: '🎯', color: accuracy >= 70 ? '#22c55e' : '#ef4444' },
                                { label: 'XP Guadagnati', value: `+${xpEarned}`, icon: '⭐', color: '#f97316' },
                                { label: 'Streak Max', value: `${bestStreak}🔥`, icon: '🔥', color: '#f97316' },
                            ].map(s => (
                                <div key={s.label} className="card" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', marginBottom: 4 }}>{s.label}</div>
                                    <div style={{ fontWeight: 800, fontSize: '1.25rem', color: s.color }}>{s.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Answer list */}
                        <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
                            <h4 style={{ marginBottom: 'var(--space-3)' }}>📋 Riepilogo risposte</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                {lesson.exercises.map((ex, i) => {
                                    const ans = answers[i]
                                    if (!ans) return null
                                    return (
                                        <div key={i} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', background: ans.correct ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)' }}>
                                            <span style={{ flexShrink: 0 }}>{ans.correct ? '✅' : '❌'}</span>
                                            <div style={{ fontSize: '0.83rem', lineHeight: 1.4 }}>
                                                <div style={{ color: 'var(--clr-text-secondary)' }}>{ex.prompt.substring(0, 60)}{ex.prompt.length > 60 ? '…' : ''}</div>
                                                {!ans.correct && <div style={{ color: '#22c55e', fontWeight: 600 }}>→ {ex.correct}</div>}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Missed items review */}
                        {missed.length > 0 && (
                            <div className="card" style={{ marginBottom: 'var(--space-5)', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                <h4 style={{ color: '#ef4444', marginBottom: 'var(--space-3)' }}>💡 Da ripassare</h4>
                                <ul style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.85rem', color: 'var(--clr-text-secondary)' }}>
                                    {missed.map((ex, i) => (
                                        <li key={i}><strong>{ex.correct}</strong> — {ex.explanation}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom buttons */}
                <div style={{
                    position: 'fixed', bottom: 0, left: 0, right: 0,
                    padding: 'var(--space-4)',
                    paddingBottom: 'calc(var(--space-4) + env(safe-area-inset-bottom,0px))',
                    background: 'var(--clr-bg-surface)',
                    borderTop: '1px solid var(--clr-border)',
                    display: 'flex', gap: 'var(--space-3)',
                }}>
                    <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => {
                        setPhase('intro')
                        setSlideIndex(0)
                        setExIndex(0)
                        setAnswers([])
                        setSelected(null)
                        setFillInput('')
                        setShowFeedback(false)
                        setXpEarned(0)
                        setStreak(0)
                        setBestStreak(0)
                    }}>
                        🔁 Ripeti
                    </button>
                    <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => router.push('/study')}>
                        📚 Prossima lezione →
                    </button>
                </div>
            </div>
        )
    }

    return null
}

// ─── Option Button ──────────────────────────────────────────────────
function OptionButton({ label, rawValue, selected, showFeedback, correct, onSelect }: {
    label: string; rawValue?: string; selected: boolean; showFeedback: boolean; correct: string; onSelect: (v: string) => void
}) {
    const val = rawValue ?? label
    const isCorrect = val === correct
    let bg = 'var(--clr-bg-surface)'
    let border = '1.5px solid var(--clr-border)'
    let color = 'var(--clr-text)'

    if (showFeedback && isCorrect) { bg = 'rgba(34,197,94,0.12)'; border = '2px solid #22c55e'; color = '#22c55e' }
    if (showFeedback && selected && !isCorrect) { bg = 'rgba(239,68,68,0.1)'; border = '2px solid #ef4444'; color = '#ef4444' }
    if (!showFeedback && selected) { bg = 'rgba(99,55,245,0.12)'; border = '2px solid var(--clr-primary-400)' }

    return (
        <button
            onClick={() => !showFeedback && onSelect(val)}
            disabled={showFeedback}
            style={{
                background: bg, border, color, borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)', fontSize: '0.95rem', fontWeight: 600,
                cursor: showFeedback ? 'default' : 'pointer', textAlign: 'left',
                transition: 'all 0.15s ease',
                width: '100%',
            }}
        >
            {label}
        </button>
    )
}

// ─── Bold parser ─────────────────────────────────────────────────
function parseBold(text: string) {
    const parts = text.split(/\*\*(.*?)\*\*/)
    return parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i} style={{ color: 'var(--clr-primary-300)' }}>{part}</strong> : part
    )
}
