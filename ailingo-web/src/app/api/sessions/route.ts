import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

// GET /api/sessions -> get-study-sessions IPC
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const daysStr = searchParams.get('days') || '7'
        const days = parseInt(daysStr, 10)

        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const userId = parseInt(session.user.id!)

        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - days)

        const sessions = await prisma.studySession.findMany({
            where: {
                userId,
                startedAt: { gte: cutoffDate },
                endedAt: { not: null }
            }
        })

        // Group by day string 'YYYY-MM-DD'
        const grouped = new Map<string, { day: string, xp: number, exercises: number, accuracySum: number, count: number }>()

        sessions.forEach(s => {
            const day = s.startedAt.toISOString().split('T')[0]
            if (!grouped.has(day)) {
                grouped.set(day, { day, xp: 0, exercises: 0, accuracySum: 0, count: 0 })
            }
            const item = grouped.get(day)!
            item.xp += s.xpEarned
            item.exercises += s.exerciseCount
            item.accuracySum += s.accuracy
            item.count += 1
        })

        const result = Array.from(grouped.values()).map(item => ({
            day: item.day,
            xp: item.xp,
            exercises: item.exercises,
            accuracy: item.accuracySum / item.count
        })).sort((a, b) => a.day.localeCompare(b.day))

        return NextResponse.json(result)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

