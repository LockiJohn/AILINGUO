"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '../../store/userStore'
import { useSessionStore } from '../../store/sessionStore'
import type { Unit, Lesson } from '../../types'

export default function CourseMapScreen() {
    const { user } = useUserStore()
    const [units, setUnits] = useState<Unit[]>([])
    const [expandedUnit, setExpandedUnit] = useState<number | null>(null)
    const [lessons, setLessons] = useState<Record<number, Lesson[]>>({})
    const [isLoading, setIsLoading] = useState(true)
    const { startSession, setLesson } = useSessionStore()
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
    const [starting, setStarting] = useState(false)
    const [generatingCourse, setGeneratingCourse] = useState(false)
    const router = useRouter()

    const subject = (user as any)?.learning_goal || user?.learning_goal || 'english'
    const baseLevel = (user as any)?.currentLevel || user?.current_level || 'A1'
    const levelCode = subject === 'english' ? baseLevel : `${subject.toUpperCase()}_${baseLevel}`
    const subjectNames: Record<string, string> = { 'physics': 'Fisica', 'chemistry': 'Chimica', 'english': 'Inglese' }

    const fetchUnits = () => {
        setIsLoading(true)
        fetch('/api/content/units?level=' + levelCode)
            .then(res => res.json())
            .then(async u => {
                if (Array.isArray(u) && u.length > 0) {
                    setUnits(u)
                    setExpandedUnit(u[0].id)
                    setIsLoading(false)
                } else if (subject !== 'english') {
                    // Trigger AI Generation
                    setGeneratingCourse(true)
                    try {
                        const res = await fetch('/api/content/generate-course', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ subject, level: baseLevel })
                        })
                        if (res.ok) {
                            // Retry fetch after generation
                            const newRes = await fetch('/api/content/units?level=' + levelCode)
                            const newU = await newRes.json()
                            if (Array.isArray(newU)) {
                                setUnits(newU)
                                if (newU.length > 0) setExpandedUnit(newU[0].id)
                            }
                        }
                    } catch (e) {
                        console.error("AI Generation failed", e)
                    } finally {
                        setGeneratingCourse(false)
                        setIsLoading(false)
                    }
                } else {
                    setUnits([])
                    setIsLoading(false)
                }
            })
            .catch(err => {
                console.error(err)
                setIsLoading(false)
                setGeneratingCourse(false)
            })
    }

    useEffect(() => {
        if (user) fetchUnits()
    }, [levelCode, user])

    const handleLessonSelect = (lesson: Lesson) => {
        setSelectedLesson(lesson)
    }

    const handleStartLesson = async () => {
        if (!selectedLesson) return
        setStarting(true)
        await startSession()
        const exercises = await fetch('/api/content/exercises?lesson=' + selectedLesson.id).then(res => res.json())
        setLesson({ id: selectedLesson.id, title: selectedLesson.title_it }, exercises)
        router.push('/exercise')
    }

    if (isLoading || generatingCourse) {
        return (
            <div className="screen-container flex flex-center flex-col" style={{ height: '100vh', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>{generatingCourse ? '🧠' : '📚'}</div>
                <h2 style={{ marginBottom: 'var(--space-2)' }}>
                    {generatingCourse ? "L'AI sta creando il tuo corso..." : "Caricamento corso..."}
                </h2>
                <p className="text-secondary animate-pulse" style={{ maxWidth: 300 }}>
                    {generatingCourse ? `Stiamo generando le lezioni di ${subjectNames[subject] || subject} su misura per te. Potrebbe richiedere qualche secondo.` : 'Preparazione dei contenuti in corso.'}
                </p>
            </div>
        )
    }

    return (
        <div className="screen-container animate-fade-in">
            <div style={{ marginBottom: 'var(--space-8)' }}>
                <h1>
                    <span className="gradient-text">Corso {subjectNames[subject] || subject} {baseLevel}</span>
                </h1>
                <p className="text-secondary">Seleziona un'unità e inizia a studiare</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {units.map((unit, i) => {
                    const isLocked = !!unit.is_locked
                    const isExpanded = expandedUnit === unit.id
                    const completed = unit.completed_lessons ?? 0
                    const total = unit.lesson_count ?? 0
                    const pct = total > 0 ? Math.round((completed / total) * 100) : 0

                    return (
                        <div
                            key={unit.id}
                            className={`card ${isLocked ? 'unit-lock' : 'card-interactive'}`}
                            onClick={() => !isLocked && setExpandedUnit(isExpanded ? null : unit.id)}
                        >
                            <div className="flex flex-between">
                                <div className="flex" style={{ gap: 'var(--space-4)', alignItems: 'center' }}>
                                    <div style={{
                                        width: 56, height: 56, borderRadius: 'var(--radius-lg)',
                                        background: isLocked ? 'var(--clr-bg-hover)' : 'rgba(99,55,245,0.15)',
                                        border: `2px solid ${isLocked ? 'var(--clr-border)' : 'var(--clr-border-accent)'}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.5rem', flexShrink: 0,
                                    }}>
                                        {isLocked ? '🔒' : unit.icon}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)', marginBottom: 4 }}>
                                            {unit.title_it}
                                        </div>
                                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--clr-text-muted)' }}>
                                            {unit.description_it}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 'var(--space-4)' }}>
                                    {pct === 100 && <span className="badge badge-success">✓ Completa</span>}
                                    {pct > 0 && pct < 100 && <span className="badge badge-warning">In corso {pct}%</span>}
                                    {!isLocked && total > 0 && (
                                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--clr-text-muted)', marginTop: 6 }}>
                                            {completed}/{total} lezioni
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Progress under unit header */}
                            {!isLocked && total > 0 && (
                                <div className="progress-bar" style={{ marginTop: 'var(--space-4)' }}>
                                    <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
                                </div>
                            )}

                            {/* Expanded lessons list - for MVP, show a "Inizia" CTA per unit */}
                            {isExpanded && !isLocked && (
                                <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--clr-border)' }} onClick={(e) => e.stopPropagation()}>
                                    <UnitLessons unitId={unit.id} onStart={handleLessonSelect} />
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Pedagogical Objectives Modal */}
            {selectedLesson && (
                <div
                    style={{
                        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)',
                        padding: 'var(--space-4)',
                    }}
                    onClick={() => !starting && setSelectedLesson(null)}
                >
                    <div
                        className="card animate-scale-in"
                        style={{ maxWidth: 450, width: '100%', border: '1px solid var(--clr-border-accent)', background: 'var(--gradient-card)', maxHeight: '90svh', overflowY: 'auto' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 style={{ marginBottom: 'var(--space-2)', fontSize: '1.3rem' }}>🎯 Obiettivi di Apprendimento</h2>
                        <h3 style={{ color: 'var(--clr-primary-400)', marginBottom: 'var(--space-4)' }}>{selectedLesson.title_it}</h3>

                        <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.9rem', marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>
                            Prima di iniziare, preparati ad affrontare questi argomenti. La ricerca dimostra che conoscere gli obiettivi <strong>aumenta la ritenzione fino al 30%</strong>.
                        </p>

                        <ul style={{ marginBottom: 'var(--space-5)', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.95rem' }}>
                            <li>Comprendere nuovi vocaboli nel loro contesto naturale.</li>
                            <li>Praticare l'ascolto attivo e la pronuncia di frasi chiave.</li>
                            <li>Ricostruire correttamente la grammatica inglese soggetto-verbo.</li>
                        </ul>

                        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setSelectedLesson(null)} disabled={starting}>
                                Annulla
                            </button>
                            <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleStartLesson} disabled={starting}>
                                {starting ? 'Caricamento...' : "Ho capito, Iniziamo!"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function UnitLessons({ unitId, onStart }: { unitId: number; onStart: (l: Lesson) => void }) {
    const [lessons, setLessons] = useState<Lesson[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Load lessons for this unit via direct DB query
        fetch('/api/content/lessons?unit=' + unitId)
            .then(res => res.json())
            .then(ls => {
                setLessons(ls)
                setLoading(false)
            }).catch(() => setLoading(false))
    }, [unitId])

    if (loading) return <p className="text-muted animate-pulse" style={{ fontSize: 'var(--text-sm)' }}>Caricamento lezioni…</p>
    if (!lessons.length) return <p className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>Nessuna lezione disponibile</p>

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {lessons.map(l => (
                <div key={l.id} className="flex flex-between" style={{
                    padding: 'var(--space-3) var(--space-4)',
                    background: 'var(--clr-bg-input)',
                    borderRadius: 'var(--radius-md)',
                }}>
                    <div>
                        <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{l.title_it}</span>
                        <span style={{ marginLeft: 8, fontSize: 'var(--text-xs)', color: 'var(--clr-text-muted)' }}>
                            ~{l.estimated_minutes} min
                        </span>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => onStart(l)}>
                        Inizia ▶
                    </button>
                </div>
            ))}
        </div>
    )
}

