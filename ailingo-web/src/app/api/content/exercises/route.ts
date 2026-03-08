import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET /api/content/exercises?lesson=1 -> `get-lesson-exercises` IPC
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const lessonIdStr = searchParams.get('lesson')

        if (!lessonIdStr) {
            return NextResponse.json({ error: "Lesson ID required" }, { status: 400 })
        }

        const lessonId = parseInt(lessonIdStr, 10)
        if (isNaN(lessonId)) {
            return NextResponse.json({ error: "Invalid Lesson ID" }, { status: 400 })
        }

        // Prisma doesn't support ORDER BY RANDOM() natively for all DBs easily, 
        // but we can fetch them all and shuffle in memory since exercise count per lesson is small.
        const exercises = await prisma.exercise.findMany({
            where: { lessonId }
        })

        // Shuffle array
        const shuffled = exercises.sort(() => 0.5 - Math.random())

        // Format to match Electron keys
        const formattedExercises = shuffled.map(e => ({
            id: e.id,
            lesson_id: e.lessonId,
            type: e.type,
            prompt_en: e.promptEn,
            prompt_it: e.promptIt,
            audio_text: e.audioText,
            options_json: e.optionsJson,
            correct_answer: e.correctAnswer,
            explanation_it: e.explanationIt,
            grammar_rule: e.grammarRule,
            difficulty: e.difficulty
        }))

        return NextResponse.json(formattedExercises)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
