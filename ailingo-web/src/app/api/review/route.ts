import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

function sm2(quality: number, repetitions: number, easeFactor: number, interval: number) {
    let newEF = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    if (newEF < 1.3) newEF = 1.3
    let newReps = repetitions
    let newInterval: number
    if (quality < 3) { newReps = 0; newInterval = 1 }
    else { newReps++; newInterval = newReps === 1 ? 1 : newReps === 2 ? 6 : Math.round(interval * newEF) }
    return { newInterval, newEaseFactor: newEF }
}

// GET /api/review -> get-review-queue IPC
export async function GET() {
    try {
        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const userId = parseInt(session.user.id!)

        const items = await prisma.reviewQueue.findMany({
            where: {
                userId,
                nextReviewAt: { lte: new Date() }
            },
            orderBy: { nextReviewAt: 'asc' },
            take: 20,
            include: {
                exercise: true
            }
        })

        const formattedItems = items.map(rq => ({
            id: rq.id,
            exercise_id: rq.exerciseId,
            user_id: rq.userId,
            next_review_at: rq.nextReviewAt.toISOString(),
            interval_days: rq.intervalDays,
            ease_factor: rq.easeFactor,
            lapses: rq.lapses,
            repetitions: rq.repetitions,
            type: rq.exercise.type,
            prompt_en: rq.exercise.promptEn,
            prompt_it: rq.exercise.promptIt,
            correct_answer: rq.exercise.correctAnswer,
            options_json: rq.exercise.optionsJson,
            explanation_it: rq.exercise.explanationIt,
            audio_text: rq.exercise.audioText
        }))

        return NextResponse.json(formattedItems)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// PUT /api/review -> update-review-item IPC
export async function PUT(req: Request) {
    try {
        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const userId = parseInt(session.user.id!)
        const { exerciseId, quality } = await req.json()

        if (exerciseId === undefined || quality === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const item = await prisma.reviewQueue.findUnique({
            where: { exerciseId_userId: { exerciseId, userId } }
        })

        if (!item) return NextResponse.json({ ok: false }, { status: 404 })

        const { newInterval, newEaseFactor } = sm2(quality, item.repetitions, item.easeFactor, item.intervalDays)

        const nextReview = new Date(Date.now() + newInterval * 86400000)

        await prisma.reviewQueue.update({
            where: { exerciseId_userId: { exerciseId, userId } },
            data: {
                intervalDays: newInterval,
                easeFactor: newEaseFactor,
                nextReviewAt: nextReview,
                repetitions: item.repetitions + (quality < 3 ? 0 : 1),
                lapses: item.lapses + (quality < 3 ? 1 : 0)
            }
        })

        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

