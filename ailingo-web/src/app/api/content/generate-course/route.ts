import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export const dynamic = 'force-dynamic'

// This endpoint dynamically builds a course for a given subject and level
export async function POST(req: Request) {
    try {
        const openai = new OpenAI() // Initialize inside to avoid build-time errors if env var is missing

        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { subject, level } = await req.json()
        if (!subject || !level) {
            return NextResponse.json({ error: "Missing subject or level" }, { status: 400 })
        }

        const levelCode = `${subject.toUpperCase()}_${level.toUpperCase()}`

        // 1. Check if it already exists to prevent duplicates
        const existingUnit = await prisma.unit.findFirst({
            where: { levelCode: levelCode }
        })

        if (existingUnit) {
            return NextResponse.json({ success: true, message: "Course already generated" })
        }

        console.log(`[AI Gen] Generating course for ${subject} ${level}...`)

        // 2. We need to create the Level first if it doesn't exist
        const subjectNames: Record<string, string> = {
            'physics': 'Fisica',
            'chemistry': 'Chimica',
            'math': 'Matematica',
            'biology': 'Biologia'
        }
        const sName = subjectNames[subject.toLowerCase()] || subject

        await prisma.level.upsert({
            where: { code: levelCode },
            update: {},
            create: {
                code: levelCode,
                nameIt: `${sName} ${level}`,
                nameEn: `${subject} ${level}`,
                descriptionIt: `Corso di ${sName} generato con AI`,
                sortOrder: 100
            }
        })

        // 3. Call OpenAI for structured generation
        const systemPrompt = `Sei un tutor esperto di didattica.
Devi creare un mini-corso base di **${sName}** (livello ${level}) per uno studente italiano.
Il corso deve essere diviso in 2 Unità (Units). Ognuna con un ordine incrementale.
Ogni Unità deve avere 2 Lezioni (Lessons).
Ogni Lezione deve avere un type "theory" oppure "quiz", ma usa sempre "theory" per i primi concetti.
Ogni Lezione deve contenere 6 esercizi (Exercises) pratici.
L'obiettivo è testare la comprensione dei concetti teorici attraverso domande a scelta multipla.

Formato Esercizio:
- "prompt_it": la domanda chiara in italiano.
- "correct_answer": la risposta corretta breve.
- "options": un array di 4 stringhe (inclusa la corretta e 3 distrattori plausibili).
- "explanation_it": una spiegazione di max 2 frasi del perché è corretto.

Evita formule complesse se il livello è Principiante. Mantieni un tono motivante.

Esporta ESATTAMENTE i dati in base allo schema JSON richiesto.`

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: "Genera il sillabo completo in JSON ora." }
            ],
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "course_generation",
                    strict: true,
                    schema: {
                        type: "object",
                        properties: {
                            units: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        title_it: { type: "string", description: "Es: 'Introduzione alla Fisica'" },
                                        description_it: { type: "string" },
                                        icon: { type: "string", description: "Un'emoji rappresentativa" },
                                        lessons: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    title_it: { type: "string" },
                                                    type: { type: "string", enum: ["theory", "vocabulary", "grammar"] },
                                                    exercises: {
                                                        type: "array",
                                                        items: {
                                                            type: "object",
                                                            properties: {
                                                                type: { type: "string", enum: ["multiple_choice"] },
                                                                prompt_it: { type: "string" },
                                                                correct_answer: { type: "string" },
                                                                options: {
                                                                    type: "array",
                                                                    items: { type: "string" }
                                                                },
                                                                explanation_it: { type: "string" }
                                                            },
                                                            required: ["type", "prompt_it", "correct_answer", "options", "explanation_it"],
                                                            additionalProperties: false
                                                        }
                                                    }
                                                },
                                                required: ["title_it", "type", "exercises"],
                                                additionalProperties: false
                                            }
                                        }
                                    },
                                    required: ["title_it", "description_it", "icon", "lessons"],
                                    additionalProperties: false
                                }
                            }
                        },
                        required: ["units"],
                        additionalProperties: false
                    }
                }
            }
        });

        const resultText = completion.choices[0].message.content
        if (!resultText) throw new Error("Empty AI response")

        const courseData = JSON.parse(resultText)

        // 4. Save to Database
        let unitOrder = 1;
        for (const unitData of courseData.units) {
            const unit = await prisma.unit.create({
                data: {
                    levelCode: levelCode,
                    sortOrder: unitOrder,
                    titleEn: unitData.title_it, // fallback
                    titleIt: unitData.title_it,
                    descriptionIt: unitData.description_it,
                    icon: unitData.icon || '📘',
                    isLocked: unitOrder > 1, // Unlock only first unit
                }
            })

            let lessonOrder = 1;
            for (const lessonData of unitData.lessons) {
                const lesson = await prisma.lesson.create({
                    data: {
                        unitId: unit.id,
                        sortOrder: lessonOrder,
                        titleEn: lessonData.title_it,
                        titleIt: lessonData.title_it,
                        type: lessonData.type,
                        estimatedMinutes: 5
                    }
                })

                for (const exData of lessonData.exercises) {
                    await prisma.exercise.create({
                        data: {
                            lessonId: lesson.id,
                            type: 'multiple_choice',
                            promptIt: exData.prompt_it,
                            optionsJson: JSON.stringify(exData.options),
                            correctAnswer: exData.correct_answer,
                            explanationIt: exData.explanation_it,
                            difficulty: 1
                        }
                    })
                }
                lessonOrder++;
            }
            unitOrder++;
        }

        console.log(`[AI Gen] Successfully saved ${courseData.units.length} units to DB.`)

        return NextResponse.json({ success: true, count: courseData.units.length })
    } catch (e: any) {
        console.error("Course Generation Error:", e)
        return NextResponse.json({ error: "Failed to generate course", details: e.message }, { status: 500 })
    }
}
