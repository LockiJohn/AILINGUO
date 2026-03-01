import { useEffect, useState } from 'react'

export default function Confetti() {
    const [pieces, setPieces] = useState<Array<{ id: number; left: number; delay: number; color: string }>>([])

    useEffect(() => {
        const colors = ['#22e5a0', '#6337f5', '#f59e0b', '#3b82f6', '#fff']
        const newPieces = Array.from({ length: 40 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 0.5,
            color: colors[Math.floor(Math.random() * colors.length)],
        }))
        setPieces(newPieces)
    }, [])

    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 50 }}>
            {pieces.map(p => (
                <div
                    key={p.id}
                    className="confetti-piece"
                    style={{
                        left: `${p.left}%`,
                        top: '-20px',
                        backgroundColor: p.color,
                        animation: `confettiFall 2s ease-in forwards`,
                        animationDelay: `${p.delay}s`,
                    }}
                />
            ))}
        </div>
    )
}
