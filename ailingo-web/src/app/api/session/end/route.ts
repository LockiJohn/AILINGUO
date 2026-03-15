import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

// POST /api/session/end -> end-session IPC
export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const userId = parseInt(session.user.id!)
        const { sessionId, xpEarned, exerciseCount, accuracy } = await req.json()

        if (sessionId === undefined || xpEarned === undefined || exerciseCount === undefined || accuracy === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Update UserStats and Session
        const studySession = await prisma.studySession.update({
            where: { id: sessionId },
            data: {
                endedAt: new Date(),
                xpEarned,
                exerciseCount,
                accuracy
            }
        })

        if (studySession.userId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const today = new Date().toISOString().split('T')[0]
        const currentStats = await prisma.userStats.findUnique({ where: { userId } })
        
        let newStreak = currentStats?.currentStreak ?? 0
        if (currentStats?.lastStudyDate !== today) {
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            const yesterdayStr = yesterday.toISOString().split('T')[0]
            
            if (currentStats?.lastStudyDate === yesterdayStr) {
                newStreak += 1
            } else {
                newStreak = 1
            }
        }

        const updatedStats = await prisma.userStats.update({
            where: { userId },
            data: {
                totalXp: { increment: xpEarned },
                currentStreak: newStreak,
                longestStreak: { set: Math.max(currentStats?.longestStreak ?? 0, newStreak) },
                lastStudyDate: today,
                userLevel: Math.floor(((currentStats?.totalXp ?? 0) + xpEarned) / 500) + 1
            }
        })

        // Badge Awarding
        const allBadges = await prisma.badge.findMany()
        const userBadges = await prisma.userBadge.findMany({ where: { userId } })
        const ownedBadgeIds = new Set(userBadges.map(ub => ub.badgeId))

        for (const badge of allBadges) {
            if (ownedBadgeIds.has(badge.id)) continue
            let earned = false
            if (badge.xpRequired > 0 && updatedStats.totalXp >= badge.xpRequired) earned = true
            if (badge.streakRequired > 0 && updatedStats.currentStreak >= badge.streakRequired) earned = true
            if (badge.code === 'first_lesson' && exerciseCount > 0) earned = true
            if (badge.code === 'perfect_lesson' && accuracy === 100 && exerciseCount >= 5) earned = true

            if (earned) {
                await prisma.userBadge.create({ data: { userId, badgeId: badge.id } }).catch(() => {})
            }
        }

        return NextResponse.json({ ok: true, stats: updatedStats })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

