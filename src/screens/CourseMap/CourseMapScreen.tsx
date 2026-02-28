import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
    const navigate = useNavigate()

    const levelCode = user?.current_level ?? 'A1'

    useEffect(() => {
        window.ailingo.getUnits(levelCode).then(u => {
            setUnits(u)
            if (u.length > 0) setExpandedUnit(u[0].id)
            setIsLoading(false)
        })
    }, [levelCode])

    const loadLessons = async (unitId: number) => {
        if (lessons[unitId]) return
        // Fetch lessons for unit - we need to add this IPC. For now use the lesson list from the unit
        // We'll derive lessons from exercise queries - simplified: load via a dedicated call
        const res = await fetch(`ailingo://unit/${unitId}/lessons`).catch(() => null)
        // fallback: just show unit info
        setLessons(prev => ({ ...prev, [unitId]: [] }))
    }

    const handleStartLesson = async (lesson: Lesson) => {
        await startSession()
        const exercises = await window.ailingo.getLessonExercises(lesson.id)
        setLesson({ id: lesson.id, title: lesson.title_it }, exercises)
        navigate('/exercise')
    }

    if (isLoading) {
        return (
            <div className="screen-container flex flex-center" style={{ height: '100%' }}>
                <p className="text-muted animate-pulse">Caricamento corso…</p>
            </div>
        )
    }

    return (
        <div className="screen-container animate-fade-in">
            <div style={{ marginBottom: 'var(--space-8)' }}>
                <h1>
                    <span className="gradient-text">Corso {levelCode}</span>
                </h1>
                <p className="text-secondary">Seleziona un'unità e inizia a studiare</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {units.map((unit, i) => {
                    const isLocked = unit.is_locked === 1
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
                                <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--clr-border)' }}>
                                    <UnitLessons unitId={unit.id} onStart={handleStartLesson} />
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

function UnitLessons({ unitId, onStart }: { unitId: number; onStart: (l: Lesson) => void }) {
    const [lessons, setLessons] = useState<Lesson[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Load lessons for this unit via direct DB query (added in IPC as get-unit-lessons)
        window.ailingo.getUnitLessons(unitId).then(ls => {
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
