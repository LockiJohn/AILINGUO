import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { NextResponse } from "next/server"

// GET /api/content/exercises?lesson=1 -> `get-lesson-exercises` IPC
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const lessonIdStr = searchParams.get('lesson')
        const topic = searchParams.get('topic')
        const subject = searchParams.get('subject')

        const where: Prisma.ExerciseWhereInput & { topic?: any } = {}

        if (lessonIdStr) {
            const lessonId = parseInt(lessonIdStr, 10)
            if (!isNaN(lessonId)) {
                where.lessonId = lessonId
            }
        } else if (topic) {
            where.topic = { contains: topic }
            if (subject) {
                where.lesson = {
                    unit: {
                        levelCode: { contains: subject.toUpperCase() }
                    }
                }
            }
        } else {
            return NextResponse.json({ error: "Lesson ID or Topic required" }, { status: 400 })
        }

        const exercises = await prisma.exercise.findMany({
            where,
            include: topic ? { lesson: { include: { unit: true } } } : undefined
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
