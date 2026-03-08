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

        await prisma.studySession.update({
            where: { id: sessionId },
            data: {
                endedAt: new Date(),
                xpEarned,
                exerciseCount,
                accuracy
            }
        })

        // Double check user id matches session
        const studySession = await prisma.studySession.findUnique({ where: { id: sessionId } })
        if (studySession?.userId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

