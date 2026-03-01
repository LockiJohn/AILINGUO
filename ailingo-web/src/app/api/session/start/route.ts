import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

// POST /api/session/start -> start-session IPC
export async function POST() {
    try {
        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const userId = parseInt(session.user.id!)

        const newSession = await prisma.studySession.create({
            data: { userId }
        })

        return NextResponse.json({ sessionId: newSession.id })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

