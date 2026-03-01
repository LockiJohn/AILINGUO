import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: parseInt(session.user.id!) },
            select: { id: true, name: true, email: true, currentLevel: true, nativeLanguage: true, targetLanguage: true, onboardingComplete: true }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        return NextResponse.json(user)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { name, currentLevel, onboardingComplete } = await req.json()

        // In complete-lesson or onboarding updates
        const user = await prisma.user.update({
            where: { id: parseInt(session.user.id!) },
            data: {
                ...(name && { name }),
                ...(currentLevel && { currentLevel }),
                ...(onboardingComplete !== undefined && { onboardingComplete })
            }
        })

        return NextResponse.json({ success: true, user })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

