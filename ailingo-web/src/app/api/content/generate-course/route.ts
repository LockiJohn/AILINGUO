import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export const dynamic = 'force-dynamic'

// This endpoint builds a course for a given subject and level using a static predefined response (LLM API Removed)
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

        const levelCode = `${subject.toUpperCase()}_${level.toUpperCase()}`

        // 1. Check if it already exists to prevent duplicates
        const existingUnit = await prisma.unit.findFirst({
            where: { levelCode: levelCode }
        })

        if (existingUnit) {
            return NextResponse.json({ success: true, message: "Course already generated" })
        }

        console.log(`[Static Gen] Generating mock course for ${subject} ${level}...`)

        // 2. We need to create the Level first if it doesn't exist
        const subjectNames: Record<string, string> = {
            'physics': 'Fisica',
            'chemistry': 'Chimica',
            'english': 'Inglese'
        }
        const sName = subjectNames[subject.toLowerCase()] || subject

        await prisma.level.upsert({
            where: { code: levelCode },
            update: {},
            create: {
                code: levelCode,
                nameIt: `${sName} ${level}`,
                nameEn: `${subject} ${level}`,
                descriptionIt: `Corso base statico di ${sName}`,
                sortOrder: 100
            }
        })

        // 3. Static Predefined Content (Replacing LLM)
        let predefinedUnits = []

        if (subject.toLowerCase() === 'physics') {
            predefinedUnits = [
                {
                    title_it: "Cos'è la Fisica?",
                    description_it: "Le grandezze e il metodo scientifico",
                    icon: "📏",
                    lessons: [
                        {
                            title_it: "Grandezze Fondamentali",
                            type: "theory",
                            exercises: [
                                { type: "multiple_choice", prompt_it: "Quale di queste è una grandezza fondamentale nel SI?", correct_answer: "Lunghezza", options: ["Forza", "Velocità", "Lunghezza", "Accelerazione"], explanation_it: "La lunghezza è fondamentale, le altre derivano." },
                                { type: "multiple_choice", prompt_it: "L'unità di misura della massa è:", correct_answer: "Kilogrammo", options: ["Newton", "Litro", "Grammo", "Kilogrammo"], explanation_it: "Nel Sistema Internazionale si usa il kilogrammo (kg)." },
                                { type: "multiple_choice", prompt_it: "Cos'è un vettore?", correct_answer: "Una grandezza con direzione e verso", options: ["Un numero puro", "Una forza nucleare", "Una grandezza con direzione e verso", "La misura del tempo"], explanation_it: "I vettori hanno modulo, direzione e verso." }
                            ]
                        }
                    ]
                },
                {
                    title_it: "La Cinematica",
                    description_it: "Il movimento dei corpi",
                    icon: "🚗",
                    lessons: [
                        {
                            title_it: "Velocità e Moto",
                            type: "theory",
                            exercises: [
                                { type: "multiple_choice", prompt_it: "La velocità costante indica un moto:", correct_answer: "Rettilineo Uniforme", options: ["Accelerato", "Rettilineo Uniforme", "Circolare", "Parabolico"], explanation_it: "Moto rettilineo uniforme significa velocità costante nel tempo." },
                                { type: "multiple_choice", prompt_it: "Cos'è l'accelerazione?", correct_answer: "La variazione della velocità", options: ["Lo spazio percorso dritto", "La variazione della velocità", "Il peso di un corpo in caduta", "L'energia di un corpo in movimento"], explanation_it: "L'accelerazione misura quanto rapidamente cambia la velocità." },
                                { type: "multiple_choice", prompt_it: "La forza d'attrito:", correct_answer: "Si oppone al movimento", options: ["Aumenta l'accelerazione", "Si oppone al movimento", "È proporzionale al volume", "Non esiste nel vuoto"], explanation_it: "L'attrito è una forza che frena lo scivolamento tra superfici." }
                            ]
                        }
                    ]
                }
            ]
        } else if (subject.toLowerCase() === 'chemistry') {
            predefinedUnits = [
                {
                    title_it: "Stati della Materia",
                    description_it: "Solido, Liquido, Gas",
                    icon: "🧊",
                    lessons: [
                        {
                            title_it: "Le tre fasi principali",
                            type: "theory",
                            exercises: [
                                { type: "multiple_choice", prompt_it: "L'acqua che bolle diventa vapore. Questo passaggio si chiama:", correct_answer: "Evaporazione", options: ["Condensazione", "Sublimazione", "Evaporazione", "Fusione"], explanation_it: "Da liquido a vapore si chiama evaporazione o ebollizione." },
                                { type: "multiple_choice", prompt_it: "Quale stato della materia ha volume proprio ma prende la forma del contenitore?", correct_answer: "Liquido", options: ["Solido", "Gas", "Liquido", "Plasma"], explanation_it: "Nei liquidi le molecole scorrono prendendo la forma del contenitore." },
                                { type: "multiple_choice", prompt_it: "Da solido a gas senza passare per il fluido si chiama:", correct_answer: "Sublimazione", options: ["Brinamento", "Sublimazione", "Evaporazione", "Fusione"], explanation_it: "Esempio: il ghiaccio secco si sublima a temperatura ambiente." }
                            ]
                        }
                    ]
                }
            ]
        } else {
            // Default generic fallback
            predefinedUnits = [
                {
                    title_it: `Fondamenti di ${sName}`,
                    description_it: `Corso introduttivo generato automaticamente`,
                    icon: "💡",
                    lessons: [
                        {
                            title_it: "Prima Lezione",
                            type: "theory",
                            exercises: [
                                { type: "multiple_choice", prompt_it: `Ecco la tua prima domanda di ${sName}. Prova!`, correct_answer: "Risposta Corretta", options: ["Risposta Errata 1", "Risposta Corretta", "Risposta Errata 2", "Opzione a caso"], explanation_it: "Questo è un corso dimostrativo statico." }
                            ]
                        }
                    ]
                }
            ]
        }

        // 4. Save to Database
        let unitOrder = 1;
        for (const unitData of predefinedUnits) {
            const unit = await prisma.unit.create({
                data: {
                    levelCode: levelCode,
                    sortOrder: unitOrder,
                    titleEn: unitData.title_it,
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

        console.log(`[Static Gen] Successfully saved ${predefinedUnits.length} units to DB.`)

        // Simulate network delay to show the nice loading screen
        await new Promise(r => setTimeout(r, 2000));

        return NextResponse.json({ success: true, count: predefinedUnits.length })
    } catch (e: any) {
        console.error("Course Generation Error:", e)
        return NextResponse.json({ error: "Failed to generate course", details: e.message }, { status: 500 })
    }
}
