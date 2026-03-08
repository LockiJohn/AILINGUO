import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

// GET /api/badges -> get-badges IPC
export async function GET() {
    try {
        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const userId = parseInt(session.user.id!)

        const allBadges = await prisma.badge.findMany({
            orderBy: { id: 'asc' }
        })

        const userBadges = await prisma.userBadge.findMany({
            where: { userId }
        })

        const earnedBadgeIds = new Map()
        userBadges.forEach(ub => {
            earnedBadgeIds.set(ub.badgeId, ub.earnedAt.toISOString())
        })

        const formattedBadges = allBadges.map(b => ({
            ...b,
            is_earned: earnedBadgeIds.has(b.id),
            earned_at: earnedBadgeIds.get(b.id) || null
        }))

        return NextResponse.json(formattedBadges)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

