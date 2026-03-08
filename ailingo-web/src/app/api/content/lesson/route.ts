import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET /api/content/lesson?id=1 -> get-lesson IPC
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const idStr = searchParams.get('id')

        if (!idStr) return NextResponse.json({ error: "Lesson ID required" }, { status: 400 })

        const id = parseInt(idStr, 10)
        const lesson = await prisma.lesson.findUnique({ where: { id } })

        if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 })

        const formattedLesson = {
            id: lesson.id,
            unit_id: lesson.unitId,
            sort_order: lesson.sortOrder,
            title_en: lesson.titleEn,
            title_it: lesson.titleIt,
            type: lesson.type,
            estimated_minutes: lesson.estimatedMinutes
        }

        return NextResponse.json(formattedLesson)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
