import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json()
        if (!name || !email || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 })
        }

        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) {
            return NextResponse.json({ error: "Email already in use" }, { status: 400 })
        }

        const passwordHash = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                stats: {
                    create: {}
                }
            }
        })

        return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
