import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET /api/content/lessons?unit=1 -> `get-unit-lessons` IPC
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const unitIdStr = searchParams.get('unit')

        if (!unitIdStr) {
            return NextResponse.json({ error: "Unit ID required" }, { status: 400 })
        }

        const unitId = parseInt(unitIdStr, 10)
        if (isNaN(unitId)) {
            return NextResponse.json({ error: "Invalid Unit ID" }, { status: 400 })
        }

        const lessons = await prisma.lesson.findMany({
            where: { unitId },
            orderBy: { sortOrder: 'asc' }
        })

        // Map output to match Electron format
        const formattedLessons = lessons.map(l => ({
            id: l.id,
            unit_id: l.unitId,
            sort_order: l.sortOrder,
            title_en: l.titleEn,
            title_it: l.titleIt,
            type: l.type,
            estimated_minutes: l.estimatedMinutes
        }))

        return NextResponse.json(formattedLessons)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
