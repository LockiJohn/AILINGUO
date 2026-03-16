import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { subject, level } = await req.json()
        if (!subject || !level) {
            return NextResponse.json({ error: "Missing subject or level" }, { status: 400 })
        }

        const levelCode = subject === 'english' ? level.toUpperCase() : `${subject.toUpperCase()}_${level.toUpperCase()}`

        // 1. Check if it already exists
        const existingUnit = await prisma.unit.findFirst({
            where: { levelCode: levelCode }
        })

        if (existingUnit) {
            return NextResponse.json({ success: true, message: "Course already generated" })
        }

        console.log(`[Dynamic Gen] Generating course for ${subject} ${levelCode}...`)

        // 2. Read from JSON files
        let subjectsDir = path.join(process.cwd(), '..', 'content', 'subjects', subject.toLowerCase())
        
        // Fallback for Vercel/Production where cwd might be the root or different
        if (!fs.existsSync(subjectsDir)) {
            subjectsDir = path.join(process.cwd(), 'content', 'subjects', subject.toLowerCase())
        }
        
        if (!fs.existsSync(subjectsDir)) {
             console.error(`[Dynamic Gen] Directory not found: ${subjectsDir}`)
             return NextResponse.json({ error: `Subject directory not found for ${subject}` }, { status: 404 })
        }

        const files = fs.readdirSync(subjectsDir).filter(f => f.endsWith('.json'))
        const unitsData = files.map(f => JSON.parse(fs.readFileSync(path.join(subjectsDir, f), 'utf-8')))

        // 3. Level Upsert
        const subjectNames: Record<string, string> = {
            'physics': 'Fisica',
            'chemistry': 'Chimica',
            'english': 'Inglese',
            'math': 'Matematica'
        }
        const sName = subjectNames[subject.toLowerCase()] || subject

        await prisma.level.upsert({
            where: { code: levelCode },
            update: {},
            create: {
                code: levelCode,
                nameIt: `${sName} ${level.toUpperCase()}`,
                nameEn: `${subject.charAt(0).toUpperCase() + subject.slice(1)} ${level.toUpperCase()}`,
                descriptionIt: `Percorso di ${sName} basato sul metodo AILINGO`,
                sortOrder: 100
            }
        })

        // 4. Save to Database
        for (const unitData of unitsData) {
            const unit = await prisma.unit.create({
                data: {
                    levelCode: levelCode,
                    sortOrder: unitData.order || 1,
                    titleEn: unitData.title_en || unitData.title_it,
                    titleIt: unitData.title_it,
                    descriptionIt: unitData.description_it,
                    icon: unitData.icon || '📘',
                    isLocked: (unitData.order || 1) > 1,
                }
            })

            for (const lessonData of unitData.lessons) {
                const lesson = await prisma.lesson.create({
                    data: {
                        unitId: unit.id,
                        sortOrder: lessonData.order || 1,
                        titleEn: lessonData.title_en || lessonData.title_it,
                        titleIt: lessonData.title_it,
                        type: lessonData.type || 'vocabulary',
                        estimatedMinutes: lessonData.estimated_minutes || 5,
                        contentJson: lessonData.content_json ? JSON.stringify(lessonData.content_json) : null
                    }
                })

                for (const exData of lessonData.exercises) {
                    await prisma.exercise.create({
                        data: {
                            lessonId: lesson.id,
                            type: exData.type,
                            promptIt: exData.prompt_it,
                            promptEn: exData.prompt_en,
                            optionsJson: exData.options ? JSON.stringify(exData.options) : null,
                            correctAnswer: exData.correct_answer,
                            explanationIt: exData.explanation_it,
                            grammarRule: exData.grammar_rule,
                            difficulty: exData.difficulty || 1,
                            topic: exData.topic || null
                        }
                    })
                }
            }
        }

        return NextResponse.json({ success: true, count: unitsData.length })
    } catch (e: unknown) {
        const error = e as Error
        console.error("Course Generation Error:", error)
        return NextResponse.json({ error: "Failed to generate course", details: error.message }, { status: 500 })
    }
}
