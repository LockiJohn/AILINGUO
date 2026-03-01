import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '../../store/sessionStore'
import MultipleChoiceExercise from './types/MultipleChoiceExercise'
import TranslationExercise from './types/TranslationExercise'
import WordOrderExercise from './types/WordOrderExercise'
import FillBlankExercise from './types/FillBlankExercise'
import ListenWriteExercise from './types/ListenWriteExercise'
import SpeakingExercise from './types/SpeakingExercise'
import MatchPairsExercise from './types/MatchPairsExercise'
import FreeDictationExercise from './types/FreeDictationExercise'
import type { Exercise } from '../../types'
import { api } from '../../services/api'

export default function ExerciseScreen() {
    const navigate = useNavigate()
    const { exercises, currentIndex, currentLesson, recordResult, nextExercise, endSession } = useSessionStore()
    const startTimeRef = useRef<number>(Date.now())
    const [showRule, setShowRule] = useState(false)
    const [showSolution, setShowSolution] = useState(false)
    const [showHelp, setShowHelp] = useState(false)
    const [usedSolution, setUsedSolution] = useState(false)

    useEffect(() => {
        if (!exercises.length) {
            navigate('/course')
        }
        startTimeRef.current = Date.now()
        setShowRule(false)
        setShowSolution(false)
        setShowHelp(false)
        setUsedSolution(false)
    }, [currentIndex, exercises.length, navigate])

    if (!exercises.length) return null

    const isFinished = currentIndex >= exercises.length

    if (isFinished) {
        handleFinish()
        return null
    }

    const exercise = exercises[currentIndex]
    const progress = Math.round((currentIndex / exercises.length) * 100)

    async function handleFinish() {
        const { xp, accuracy } = await endSession()
        if (currentLesson && currentLesson.id > 0) {
            await api.completeLesson(currentLesson.id, accuracy, xp)
        }
        navigate('/results')
    }

    function handleAnswer(isCorrect: boolean, userAnswer: string) {
        const timeMs = Date.now() - startTimeRef.current
        recordResult(exercise, isCorrect && !usedSolution, userAnswer, timeMs, usedSolution)
        // nextExercise is called inside exercise components after feedback
    }

    function handleSkip() {
        const timeMs = Date.now() - startTimeRef.current
        recordResult(exercise, false, '[SKIPPED]', timeMs, true)
        nextExercise()
    }

    const renderModals = () => {
        if (!showRule && !showSolution && !showHelp) return null

        const getHelpText = (type: string) => {
            switch (type) {
                case 'translation_en_it': return "Traduci la frase dall'Inglese all'Italiano. Assicurati di usare l'ortografia corretta."
                case 'translation_it_en': return "Traduci la frase dall'Italiano all'Inglese scrivendola nel campo di testo."
                case 'multiple_choice': return "Leggi la domanda e clicca su una delle opzioni disponibili per dare la tua risposta."
                case 'word_order': return "Clicca sulle parole nell'ordine corretto per formare la frase esatta."
                case 'fill_blank': return "Scrivi o seleziona la parola mancante per completare la frase mostrata."
                case 'listen_write': return "Ascolta l'audio e trascrivi esattamente ciò che senti in Inglese."
                case 'speaking': return "Ascolta la frase e ripetila al microfono. Il sistema valuterà la tua pronuncia!"
                case 'match_pairs': return "Trova le coppie corrette associando la parola inglese alla sua traduzione italiana."
                case 'free_dictation': return "Ascolta il lungo audio e scrivi al meglio delle tue capacità la frase intera."
                default: return "Rispondi correttamente alla domanda per ottenere punti e svuotare la barra di progresso in alto."
            }
        }

        return (
            <div style={{
                position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <div className="card animate-scale-in" style={{ maxWidth: 400, width: '90%' }}>
                    {showRule && (
                        <>
                            <h3 className="mb-2 text-primary">💡 Regola Grammaticale</h3>
                            <p>{exercise.grammar_rule}</p>
                            <button className="btn btn-primary mt-4 w-full" onClick={() => setShowRule(false)}>Ho capito</button>
                        </>
                    )}
                    {showSolution && (
                        <>
                            <h3 className="mb-2 text-warning">🔍 Soluzione Svelata</h3>
                            <p className="text-muted">Questa risposta non ti darà Punti Esperienza.</p>
                            <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', fontSize: '1.2rem', fontWeight: 'bold', background: 'var(--clr-bg-surface)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                                {exercise.correct_answer}
                            </div>
                            <button className="btn btn-primary mt-4 w-full" onClick={() => setShowSolution(false)}>Chiudi</button>
                        </>
                    )}
                    {showHelp && (
                        <>
                            <h3 className="mb-2 text-primary">❓ Cosa devo fare?</h3>
                            <p className="text-muted" style={{ marginBottom: 'var(--space-3)' }}>Per superare questo esercizio e guadagnare XP devi:</p>
                            <div style={{ padding: 'var(--space-3)', background: 'var(--clr-bg-surface)', borderRadius: 'var(--radius-sm)' }}>
                                {getHelpText(exercise.type)}
                            </div>
                            <button className="btn btn-primary mt-4 w-full" onClick={() => setShowHelp(false)}>Ho capito</button>
                        </>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', padding: 'var(--space-6)' }}>
            {/* Top bar */}
            <div className="flex flex-between" style={{ marginBottom: 'var(--space-6)', gap: 'var(--space-4)' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/course')}>✕</button>
                <div style={{ flex: 1 }}>
                    <div className="progress-bar" style={{ height: 8 }}>
                        <div className="progress-bar__fill" style={{ width: `${progress}%` }} />
                    </div>
                </div>
                {useSessionStore.getState().comboCount >= 2 && (
                    <div className="combo-badge">
                        🔥 {useSessionStore.getState().comboCount} COMBO
                    </div>
                )}

                <div className="flex gap-2">
                    <button className="btn btn-ghost btn-sm" onClick={() => setShowHelp(true)} title="Istruzioni Esercizio">
                        ❓ Cosa devo fare?
                    </button>
                    {exercise.grammar_rule && (
                        <button className="btn btn-ghost btn-sm" onClick={() => setShowRule(true)} title="Spiegazione Grammaticale">
                            💡 Regola
                        </button>
                    )}
                    <button className="btn btn-ghost btn-sm" onClick={() => { setShowSolution(true); setUsedSolution(true) }} title="Svela Soluzione (Nessun XP)">
                        🔍 Soluzione
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={handleSkip} title="Salta la domanda (Nessun XP)">
                        ⏭️ Salta
                    </button>
                    <div className="xp-chip">❤️ {exercises.length - currentIndex}</div>
                </div>
            </div>

            {/* Lesson title */}
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--clr-text-muted)', marginBottom: 'var(--space-4)', fontWeight: 600 }}>
                {currentLesson?.title} · {currentIndex + 1}/{exercises.length}
            </div>

            {/* Exercise content */}
            <div style={{ flex: 1, overflow: 'auto' }}>
                <ExerciseRenderer
                    exercise={exercise}
                    onAnswer={handleAnswer}
                    onNext={nextExercise}
                />
            </div>

            {renderModals()}
        </div>
    )
}

function ExerciseRenderer({
    exercise,
    onAnswer,
    onNext,
}: {
    exercise: Exercise
    onAnswer: (correct: boolean, answer: string) => void
    onNext: () => void
}) {
    const props = { exercise, onAnswer, onNext }

    switch (exercise.type) {
        case 'multiple_choice':
            return <MultipleChoiceExercise {...props} />
        case 'translation_it_en':
        case 'translation_en_it':
            return <TranslationExercise {...props} />
        case 'word_order':
            return <WordOrderExercise {...props} />
        case 'fill_blank':
            return <FillBlankExercise {...props} />
        case 'listen_write':
            return <ListenWriteExercise {...props} />
        case 'speaking':
            return <SpeakingExercise {...props} />
        case 'match_pairs':
            return <MatchPairsExercise {...props} />
        case 'free_dictation':
            return <FreeDictationExercise {...props} />
        default:
            return <TranslationExercise {...props} />
    }
}
