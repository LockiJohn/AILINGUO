import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const topic = searchParams.get('topic')
        const grammar = searchParams.get('grammar')

        const where: any = {}
        if (topic) {
            where.topic = topic
        }
        if (grammar) {
            where.grammarCategory = grammar
        }

        const exercises = await prisma.exercise.findMany({
            where,
            take: 20, // Limit to 20 for a session
            // Randomize order if possible, but SQLite doesn't have a built-in random in findMany easily
            // We can fetch more and shuffle in JS if needed
        })

        // Simple shuffle
        const shuffled = exercises.sort(() => Math.random() - 0.5)

        return NextResponse.json(shuffled)
    } catch (error) {
        console.error("Error fetching Book Mode exercises:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
