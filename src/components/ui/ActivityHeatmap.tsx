import { useEffect, useState } from 'react'
import type { StudySession } from '../../types'

export default function ActivityHeatmap() {
    const [sessions, setSessions] = useState<StudySession[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const DAYS_TO_SHOW = 168 // 24 settimane (circa 6 mesi) fatte di 7 giorni

    useEffect(() => {
        async function fetchHistory() {
            try {
                // Prendi le ultime 24 settimane di storia
                const hist = await window.ailingo.getStudySessions(DAYS_TO_SHOW)
                setSessions(hist)
            } catch (err) {
                console.error("Failed to load study heatmap:", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchHistory()
    }, [])

    if (isLoading) return <div className="card text-center text-muted" style={{ padding: 40 }}>Caricamento contributi...</div>

    // Build map for quick access
    const historyMap = new Map(sessions.map(s => [s.day, s.xp]))

    // Generate date sequence (last 24 weeks)
    const today = new Date()
    // Arrotonda alla domenica per far combaciare correttamente le righe coi giorni della settimana in CSS Grid
    // 0 = Sunday, 1 = Monday...
    const gridDates: Date[] = []

    // Riempi all'indietro
    for (let i = DAYS_TO_SHOW; i >= 0; i--) {
        const d = new Date(today.getTime())
        d.setDate(d.getDate() - i)
        gridDates.push(d)
    }

    const getXpLevel = (xp: number) => {
        if (xp === 0) return 0
        if (xp <= 50) return 1
        if (xp <= 150) return 2
        if (xp <= 300) return 3
        return 4
    }

    return (
        <div className="card" style={{ marginBottom: 'var(--space-8)' }}>
            <h3 style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 8 }}>
                🔥 I tuoi Contributi <span style={{ fontSize: 'var(--text-xs)', color: 'var(--clr-text-muted)', fontWeight: 'normal' }}>(Ultimi 6 mesi)</span>
            </h3>

            <div className="heatmap-container">
                <div className="heatmap-grid">
                    {gridDates.map((date, idx) => {
                        // "YYYY-MM-DD" in local time
                        const offset = date.getTimezoneOffset()
                        const localDate = new Date(date.getTime() - (offset * 60 * 1000))
                        const dateString = localDate.toISOString().split('T')[0]
                        const xp = historyMap.get(dateString) || 0
                        const level = getXpLevel(xp)

                        return (
                            <div
                                key={idx}
                                className="heatmap-cell"
                                data-level={level}
                                title={xp === 0 ? `Niente studio il ${dateString}` : `${xp} XP il ${dateString}`}
                            />
                        )
                    })}
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6, marginTop: 16, fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>
                <span>Meno</span>
                <div className="heatmap-cell" data-level="0" />
                <div className="heatmap-cell" data-level="1" />
                <div className="heatmap-cell" data-level="2" />
                <div className="heatmap-cell" data-level="3" />
                <div className="heatmap-cell" data-level="4" />
                <span>Di più</span>
            </div>
        </div>
    )
}
