import { useState } from 'react'

function TapTranslateText({ text, vocabulary }: { text: string, vocabulary: any[] }) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null)
    const [translation, setTranslation] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleTap = async (word: string, index: number) => {
        const cleanWord = word.replace(/[.,!?;:()[\]{}'"]/g, '').trim().toLowerCase()
        if (!cleanWord) return

        if (activeIndex === index) {
            setActiveIndex(null) // toggle off
            return
        }

        setActiveIndex(index)
        setTranslation(null)
        
        // Local vocab check
        const vocabMatch = vocabulary?.find((v: any) => v.word.toLowerCase() === cleanWord)
        if (vocabMatch) {
            setTranslation(vocabMatch.translation)
            return
        }

        // External API fallback
        setLoading(true)
        try {
            const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanWord)}&langpair=en|it`)
            const data = await res.json()
            if (data?.responseData?.translatedText) {
                setTranslation(data.responseData.translatedText.toLowerCase())
            } else {
                setTranslation("?")
            }
        } catch (e) {
            setTranslation("err")
        } finally {
            setLoading(false)
        }
    }

    const words = text.split(/(\s+)/)

    return (
        <span style={{ position: 'relative' }}>
            {words.map((w, i) => {
                if (!w.trim()) return <span key={i}>{w}</span>
                const isActive = activeIndex === i
                return (
                    <span 
                        key={i} 
                        onClick={() => handleTap(w, i)}
                        style={{ 
                            cursor: 'pointer',
                            display: 'inline-block',
                            position: 'relative',
                            borderBottom: '1px dashed rgba(255,255,255,0.2)',
                            color: isActive ? 'var(--clr-primary-400)' : 'inherit',
                            transition: 'color 0.2s'
                        }}
                    >
                        {w}
                        {isActive && (
                            <div style={{
                                position: 'absolute',
                                bottom: '100%',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: 'var(--clr-surface-800)',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                whiteSpace: 'nowrap',
                                zIndex: 10,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                                marginBottom: '4px',
                                pointerEvents: 'none',
                                border: '1px solid var(--clr-primary-600)'
                            }}>
                                {loading ? '...' : translation}
                            </div>
                        )}
                    </span>
                )
            })}
        </span>
    )
}

export default function ContextReader({
    contentJson,
    onContinue
}: {
    contentJson: string
    onContinue: () => void
}) {
    let content: any = null
    try {
        content = typeof contentJson === 'string' ? JSON.parse(contentJson) : contentJson
    } catch (e) {
        return <div className="text-error">Errore nel caricamento del contesto della lezione.</div>
    }

    const { story, grammar_points, vocabulary } = content

    return (
        <div className="animate-fade-in" style={{ padding: 'var(--space-4) 0', maxWidth: 800, margin: '0 auto' }}>
            {story && (
                <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                    <h2 style={{ marginBottom: 'var(--space-3)' }}>📖 {story.title}</h2>
                    <p style={{ fontSize: '1.2rem', lineHeight: 1.6, marginBottom: 'var(--space-3)' }}>
                        <TapTranslateText text={story.text} vocabulary={vocabulary || []} />
                    </p>
                    {story.translation && (
                        <div style={{ padding: 'var(--space-3)', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}>
                            <p className="text-secondary" style={{ fontSize: '0.95rem' }}>
                                <strong>Traduzione:</strong> {story.translation}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {vocabulary && vocabulary.length > 0 && (
                <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                    <h3 style={{ marginBottom: 'var(--space-3)' }}>📚 Vocabolario Chiave</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
                        {vocabulary.map((v: any, i: number) => (
                            <div key={i} style={{ padding: 'var(--space-2)', borderBottom: '1px solid var(--clr-border-accent)' }}>
                                <strong style={{ color: 'var(--clr-primary-300)' }}>{v.word}</strong>: {v.translation}
                                {v.context && <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', marginTop: 4 }}>"{v.context}"</div>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {grammar_points && grammar_points.length > 0 && (
                <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                    <h3 style={{ marginBottom: 'var(--space-3)' }}>🧠 Grammatica in Contesto</h3>
                    {grammar_points.map((gp: any, i: number) => (
                        <div key={i} style={{ marginBottom: i < grammar_points.length - 1 ? 'var(--space-4)' : 0 }}>
                            <h4 style={{ color: 'var(--clr-accent-400)', marginBottom: 'var(--space-2)' }}>{gp.title}</h4>
                            <p style={{ marginBottom: 'var(--space-2)', lineHeight: 1.5 }}>{gp.explanation}</p>
                            {gp.context_reference && (
                                <div style={{ fontSize: '0.85rem', color: 'var(--clr-text-secondary)', marginBottom: 'var(--space-2)', fontStyle: 'italic' }}>
                                    Es. dalla storia: "{gp.context_reference}"
                                </div>
                            )}
                            {gp.examples && (
                                <ul style={{ listStyle: 'none', paddingLeft: 'var(--space-2)', borderLeft: '2px solid var(--clr-primary-500)' }}>
                                    {gp.examples.map((ex: any, j: number) => (
                                        <li key={j} style={{ marginBottom: 4 }}>
                                            <strong>{ex.en}</strong> = {ex.it}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <button className="btn btn-primary btn-lg btn-full" onClick={onContinue}>
                Vai agli Esercizi →
            </button>
        </div>
    )
}
