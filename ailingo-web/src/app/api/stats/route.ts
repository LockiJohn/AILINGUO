import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userId = parseInt(session.user.id!)

        const stats = await prisma.userStats.findUnique({ where: { userId } })

        // Calculate words learned based on 'translation_it_en', 'multiple_choice', 'match_pairs'
        const wordsCount = await prisma.exerciseResult.count({
            where: {
                userId,
                isCorrect: true,
                exercise: {
                    type: { in: ['translation_it_en', 'multiple_choice', 'match_pairs'] }
                }
            }
        })

        const lessonsCompletedCount = await prisma.lessonProgress.count({
            where: { userId }
        })

        // Calculate time studied in minutes
        // Note: this uses prisma aggregate which is slightly different from SQLite julian day logic
        const sessions = await prisma.studySession.findMany({
            where: { userId, endedAt: { not: null } }
        })

        let timeStudied = 0
        let totalAccuracy = 0
        let exercisesCompleted = 0

        const results = await prisma.exerciseResult.findMany({ where: { userId } })
        if (results.length > 0) {
            const correct = results.filter(r => r.isCorrect).length
            totalAccuracy = (correct / results.length) * 100
        }

        for (const s of sessions) {
            if (s.endedAt) {
                timeStudied += (s.endedAt.getTime() - s.startedAt.getTime()) / 60000
            }
        }

        const badges = await prisma.badge.findMany({
            where: {
                userBadges: { some: { userId } }
            }
        })

        return NextResponse.json({
            ...stats,
            words_learned: wordsCount,
            lessons_completed: lessonsCompletedCount,
            time_studied_minutes: Math.round(timeStudied),
            accuracy_avg: Math.round(totalAccuracy),
            badges
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

