"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '../../store/userStore'
import { useSessionStore } from '../../store/sessionStore'
import type { Exercise } from '../../types'

export default function BookModeScreen() {
    const { user } = useUserStore()
    const { startSession, setLesson } = useSessionStore()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null)

    const subject = (user as any)?.learning_goal || 'english'
    /* subjectNames removed as unused */

    const topics: Record<string, { label: string; icon: string; items: string[] }> = {
        'english': {
            label: 'Grammatica e Lessico',
            icon: '📚',
            items: ['Present Simple', 'Past Simple', 'Vocabolario: Cibo', 'Vocabolario: Viaggi', 'Preposizioni']
        },
        'physics': {
            label: 'Argomenti di Fisica',
            icon: '⚛️',
            items: ['Cinematica', 'Dinamica', 'Energia', 'Termodinamica', 'Ottica']
        },
        'math': {
            label: 'Argomenti di Matematica',
            icon: '🔢',
            items: ['Aritmetica', 'Algebra', 'Geometria', 'Trigonometria', 'Analisi']
        },
        'chemistry': {
            label: 'Argomenti di Chimica',
            icon: '🧪',
            items: ['Atomi', 'Legami Chimici', 'Reazioni', 'Acidi e Basi', 'Tavola Periodica']
        }
    }

    const currentTopicData = topics[subject] || topics['english']

    const handleTopicStart = async (topic: string) => {
        setLoading(true)
        setSelectedTopic(topic)
        
        try {
            // Fetch exercises by topic/category
            const res = await fetch(`/api/content/exercises?topic=${encodeURIComponent(topic)}&subject=${subject}`)
            const exercises = await res.json()
            
            if (Array.isArray(exercises) && exercises.length > 0) {
                await startSession()
                setLesson({ id: -1, title: `Focus: ${topic}` }, exercises)
                router.push('/exercise')
            } else {
                alert("Nessun esercizio trovato per questo argomento. Prova con un altro!")
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="screen-container animate-fade-in">
            <div style={{ marginBottom: 'var(--space-8)' }}>
                <h1>
                    <span className="gradient-text">Modalità Libro</span> {currentTopicData.icon}
                </h1>
                <p className="text-secondary">Scegli un argomento specifico su cui vuoi esercitarti oggi.</p>
            </div>

            <div className="card" style={{ background: 'var(--gradient-card)', border: '1px solid var(--clr-border-accent)', marginBottom: 'var(--space-6)' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: 'var(--space-4)' }}>{currentTopicData.label}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
                    {currentTopicData.items.map(topic => (
                        <button
                            key={topic}
                            className={`card card-interactive ${selectedTopic === topic && loading ? 'animate-pulse' : ''}`}
                            style={{
                                textAlign: 'left',
                                padding: 'var(--space-4)',
                                border: '1px solid var(--clr-border)',
                                background: 'rgba(255,255,255,0.03)',
                                cursor: loading ? 'default' : 'pointer'
                            }}
                            onClick={() => !loading && handleTopicStart(topic)}
                        >
                            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--clr-primary-200)' }}>{topic}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', marginTop: 4 }}>Inizia esercizi →</div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="glass-premium animate-slide-up" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', borderStyle: 'dashed', borderColor: 'var(--clr-primary-400)' }}>
                <p style={{ fontSize: '1rem', color: 'var(--clr-text-primary)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.5rem' }}>👨‍🏫</span>
                    <span><strong>Consiglio del Maestro:</strong> La modalità libro è lo strumento segreto per i veri campioni. Approfondisci ciò che ti appassiona e diventerai imbattibile!</span>
                </p>
            </div>
        </div>
    )
}
