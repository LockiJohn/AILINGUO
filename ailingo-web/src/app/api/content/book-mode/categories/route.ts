import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        // Get unique topics
        const topics = await prisma.exercise.findMany({
            where: {
                topic: { not: null }
            },
            select: {
                topic: true
            },
            distinct: ['topic']
        })

        // Get unique grammar categories
        const grammar = await prisma.exercise.findMany({
            where: {
                grammarCategory: { not: null }
            },
            select: {
                grammarCategory: true
            },
            distinct: ['grammarCategory']
        })

        return NextResponse.json({
            topics: topics.map(t => t.topic).filter(Boolean),
            grammar: grammar.map(g => g.grammarCategory).filter(Boolean)
        })
    } catch (error) {
        console.error("Error fetching Book Mode categories:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
