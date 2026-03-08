"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { allStudyLessons, getLessonsBySubject, SUBJECT_META, type StudyLesson } from '../../data/studyLessons'

const SUBJECTS = ['all', 'english', 'italian', 'physics', 'chemistry'] as const
type Filter = typeof SUBJECTS[number]

export default function StudyHubScreen() {
    const router = useRouter()
    const [filter, setFilter] = useState<Filter>('all')

    const lessons = filter === 'all' ? allStudyLessons : getLessonsBySubject(filter as StudyLesson['subject'])

    const diffLabel = (d: number) => d === 1 ? '🟢 Facile' : d === 2 ? '🟡 Medio' : '🔴 Avanzato'

    return (
        <div className="screen-container animate-fade-in">
            {/* Header */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
                <h1 style={{ marginBottom: 'var(--space-2)' }}>
                    <span className="gradient-text">📚 Modalità Studio</span>
                </h1>
                <p className="text-secondary">Mini-lezioni + esercizi su misura. Impara un concetto alla volta.</p>
            </div>

            {/* Subject filters */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-6)', overflowX: 'auto', paddingBottom: 'var(--space-1)' }}>
                <FilterPill label="Tutte" active={filter === 'all'} onClick={() => setFilter('all')} />
                {SUBJECTS.slice(1).map(s => {
                    const subj = s as StudyLesson['subject']
                    const m = SUBJECT_META[subj]
                    return (
                        <FilterPill
                            key={s}
                            label={`${m.emoji} ${m.label}`}
                            active={filter === s}
                            onClick={() => setFilter(s as Filter)}
                            color={m.color}
                        />
                    )
                })}
            </div>

            {/* Lessons grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {lessons.map(lesson => (
                    <LessonCard
                        key={lesson.id}
                        lesson={lesson}
                        onStart={() => router.push(`/study/lesson?id=${lesson.id}`)}
                    />
                ))}
            </div>

            {lessons.length === 0 && (
                <div style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--clr-text-muted)' }}>
                    Nessuna lezione disponibile per il filtro selezionato.
                </div>
            )}
        </div>
    )
}

function FilterPill({ label, active, onClick, color }: {
    label: string; active: boolean; onClick: () => void; color?: string
}) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: '6px 14px',
                borderRadius: 999,
                border: active ? `2px solid ${color || 'var(--clr-primary-400)'}` : '1.5px solid var(--clr-border)',
                background: active ? (color ? `${color}22` : 'rgba(99,55,245,0.12)') : 'var(--clr-bg-surface)',
                color: active ? (color || 'var(--clr-primary-300)') : 'var(--clr-text-secondary)',
                fontWeight: active ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
            }}
        >
            {label}
        </button>
    )
}

function LessonCard({ lesson, onStart }: { lesson: StudyLesson; onStart: () => void }) {
    const meta = SUBJECT_META[lesson.subject]
    const diffLabel = lesson.difficulty === 1 ? '🟢 Facile' : lesson.difficulty === 2 ? '🟡 Medio' : '🔴 Avanzato'

    return (
        <div
            className="card card-interactive"
            style={{ padding: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}
        >
            {/* Emoji */}
            <div style={{
                width: 60, height: 60, borderRadius: 'var(--radius-lg)', flexShrink: 0,
                background: `${meta.color}18`,
                border: `2px solid ${meta.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.8rem',
            }}>
                {lesson.emoji}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.97rem' }}>{lesson.title}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: meta.color, background: `${meta.color}18`, padding: '2px 8px', borderRadius: 999 }}>
                        {meta.emoji} {meta.label}
                    </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--clr-text-muted)', marginBottom: 'var(--space-2)', lineHeight: 1.4 }}>
                    {lesson.subtitle}
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>
                    <span>⏱️ {lesson.estimatedMinutes} min</span>
                    <span>📝 {lesson.exercises.length} esercizi</span>
                    <span>⭐ +{lesson.xp} XP</span>
                    <span>{diffLabel}</span>
                </div>
            </div>

            {/* CTA */}
            <button
                className="btn btn-primary btn-sm"
                style={{ flexShrink: 0, background: `${meta.color}`, border: 'none', boxShadow: `0 4px 12px ${meta.color}44` }}
                onClick={onStart}
            >
                Inizia ▶
            </button>
        </div>
    )
}
