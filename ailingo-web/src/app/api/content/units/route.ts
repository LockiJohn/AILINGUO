import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "@/auth"

// GET /api/content/units?level=A1 -> `get-units` IPC
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const levelCode = searchParams.get('level')

        if (!levelCode) {
            return NextResponse.json({ error: "Level code required" }, { status: 400 })
        }

        const session = await auth()
        const userId = session?.user?.id ? parseInt(session.user.id!) : null

        const units = await prisma.unit.findMany({
            where: { levelCode },
            orderBy: { sortOrder: 'asc' },
            include: {
                lessons: {
                    include: {
                        progresses: userId ? { where: { userId } } : false
                    }
                }
            }
        })

        // Map output to match Electron format
        const formattedUnits = units.map(u => ({
            id: u.id,
            level_code: u.levelCode,
            sort_order: u.sortOrder,
            title_en: u.titleEn,
            title_it: u.titleIt,
            description_it: u.descriptionIt,
            icon: u.icon,
            is_locked: u.isLocked,
            lesson_count: u.lessons.length,
            completed_lessons: u.lessons.filter(l => l.progresses && l.progresses.length > 0).length
        }))

        return NextResponse.json(formattedUnits)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

