import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET /api/content/levels -> `get-levels` IPC
export async function GET() {
    try {
        const levels = await prisma.level.findMany({
            orderBy: { sortOrder: 'asc' }
        })
        return NextResponse.json(levels)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
