"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '../../store/sessionStore'

export default function BookModeScreen() {
    const [categories, setCategories] = useState<{ topics: string[], grammar: string[] }>({ topics: [], grammar: [] })
    const [loading, setLoading] = useState(true)
    const [view, setView] = useState<'topics' | 'grammar'>('topics')
    const { startSession, setLesson } = useSessionStore()
    const router = useRouter()

    useEffect(() => {
        fetch('/api/content/book-mode/categories')
            .then(r => r.json())
            .then(data => {
                setCategories(data)
                setLoading(false)
            })
    }, [])

    const handleSelect = async (type: 'topic' | 'grammar', value: string) => {
        setLoading(true)
        const url = `/api/content/book-mode/exercises?${type}=${encodeURIComponent(value)}`
        const res = await fetch(url)
        const exercises = await res.json()

        if (exercises.length === 0) {
            alert("No exercises found for this category.")
            setLoading(false)
            return
        }

        await startSession()
        setLesson({ 
            id: 999999, 
            title: `${type === 'topic' ? 'Argomento' : 'Grammatica'}: ${value}` 
        }, exercises)
        router.push('/exercise')
    }

    if (loading) {
        return (
            <div className="screen-container flex flex-center" style={{ height: '100vh' }}>
                <p className="text-muted animate-pulse">Caricamento Modalità Libro…</p>
            </div>
        )
    }

    return (
        <div className="screen-container page-enter">
            <div style={{ marginBottom: 'var(--space-8)' }}>
                <h1 style={{ marginBottom: 'var(--space-2)' }} className="gradient-text">Modalità Libro 📖</h1>
                <p className="text-secondary text-lg">Scegli cosa allenare oggi. Focus mirato su argomenti o grammatica.</p>
            </div>

            {/* View Switcher */}
            <div style={{ 
                display: 'flex', 
                gap: 'var(--space-2)', 
                background: 'rgba(255,255,255,0.05)', 
                padding: 'var(--space-1)', 
                borderRadius: 'var(--radius-lg)',
                marginBottom: 'var(--space-6)',
                width: 'fit-content'
            }}>
                <button 
                    className={`btn ${view === 'topics' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setView('topics')}
                    style={{ padding: 'var(--space-2) var(--space-6)', minWidth: 140 }}
                >
                    Argomenti
                </button>
                <button 
                    className={`btn ${view === 'grammar' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setView('grammar')}
                    style={{ padding: 'var(--space-2) var(--space-6)', minWidth: 140 }}
                >
                    Grammatica
                </button>
            </div>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
                gap: 'var(--space-4)' 
            }}>
                {(view === 'topics' ? categories.topics : categories.grammar).map(val => (
                    <button
                        key={val}
                        className="card card-interactive"
                        onClick={() => handleSelect(view === 'topics' ? 'topic' : 'grammar', val)}
                        style={{ 
                            textAlign: 'left', 
                            padding: 'var(--space-5)', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: 'var(--space-2)',
                            height: '100%'
                        }}
                    >
                        <div style={{ fontSize: '1.5rem' }}>{view === 'topics' ? '🎯' : '📝'}</div>
                        <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>{val}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--clr-text-muted)' }}>
                            Inizia sessione mirata
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}
