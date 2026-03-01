import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

// POST /api/progress/lesson -> `complete-lesson` IPC
export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userId = parseInt(session.user.id!)
        const { lessonId, accuracy, xpEarned } = await req.json()

        if (!lessonId || accuracy === undefined || xpEarned === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        await prisma.lessonProgress.create({
            data: {
                lessonId,
                userId,
                accuracy,
                xpEarned
            }
        })

        const today = new Date().toISOString().split('T')[0]
        const stats = await prisma.userStats.findUnique({ where: { userId } })

        if (stats) {
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
            const newStreak = stats.lastStudyDate === yesterday ? stats.currentStreak + 1
                : stats.lastStudyDate === today ? stats.currentStreak : 1
            const newLongest = Math.max(newStreak, stats.longestStreak)
            const newXp = stats.totalXp + xpEarned

            await prisma.userStats.update({
                where: { userId },
                data: {
                    totalXp: newXp,
                    currentStreak: newStreak,
                    longestStreak: newLongest,
                    lastStudyDate: today
                }
            })

            await checkAndAwardBadges(userId, newXp, newStreak, accuracy)
        }

        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

async function checkAndAwardBadges(userId: number, totalXp: number, streak: number, accuracy: number) {
    const award = async (code: string) => {
        const badge = await prisma.badge.findUnique({ where: { code } })
        if (!badge) return

        const held = await prisma.userBadge.findUnique({
            where: { userId_badgeId: { userId, badgeId: badge.id } }
        })

        if (!held) {
            await prisma.userBadge.create({
                data: { userId, badgeId: badge.id }
            })
        }
    }

    const lc = await prisma.lessonProgress.count({ where: { userId } })
    if (lc >= 1) await award('first_lesson')
    if (streak >= 3) await award('streak_3')
    if (streak >= 7) await award('streak_7')
    if (totalXp >= 100) await award('xp_100')
    if (totalXp >= 500) await award('xp_500')
    if (totalXp >= 1000) await award('xp_1000')
    if (accuracy === 100) await award('perfect_lesson')
}

