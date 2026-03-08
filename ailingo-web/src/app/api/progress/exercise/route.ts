import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

// POST /api/progress/exercise -> `save-exercise-result` IPC
export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userId = parseInt(session.user.id!)
        const { exerciseId, userAnswer, isCorrect, responseTimeMs } = await req.json()

        if (!exerciseId || isCorrect === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        await prisma.exerciseResult.create({
            data: {
                exerciseId,
                userId,
                userAnswer: userAnswer || null,
                isCorrect,
                responseTimeMs: responseTimeMs || 0
            }
        })

        // Add to review queue - sqlite UPSERT equivalent logic
        const existingReview = await prisma.reviewQueue.findUnique({
            where: {
                exerciseId_userId: { exerciseId, userId }
            }
        })

        if (!existingReview) {
            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)

            await prisma.reviewQueue.create({
                data: {
                    exerciseId,
                    userId,
                    nextReviewAt: tomorrow,
                    intervalDays: 1,
                    easeFactor: 2.5,
                    repetitions: 0
                }
            })
        }

        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

