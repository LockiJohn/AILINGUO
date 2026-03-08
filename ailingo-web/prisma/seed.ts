import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding initial data...')

    // Seed Levels
    const levels = [
        {
            code: 'A1', nameIt: 'Principiante', nameEn: 'Beginner', descriptionIt: "Le basi assolute dell'inglese", sortOrder: 1
        },
        { code: 'A2', nameIt: 'Elementare', nameEn: 'Elementary', descriptionIt: 'Comunicare in situazioni semplici', sortOrder: 2 },
        { code: 'B1', nameIt: 'Intermedio', nameEn: 'Intermediate', descriptionIt: 'Trattare argomenti familiari', sortOrder: 3 },
        { code: 'B2', nameIt: 'Intermedio Superiore', nameEn: 'Upper-Intermediate', descriptionIt: 'Conversare con scioltezza', sortOrder: 4 },
        { code: 'C1', nameIt: 'Avanzato', nameEn: 'Advanced', descriptionIt: 'Esprimersi con fluidità e precisione', sortOrder: 5 },
    ]

    for (const level of levels) {
        await prisma.level.upsert({
            where: { code: level.code },
            update: {},
            create: level,
        })
    }
    console.log('Levels seeded.')

    // Seed Badges
    const badges = [
        { code: 'first_lesson', nameIt: 'Prima Lezione!', descriptionIt: 'Hai completato la tua prima lezione', icon: '🎉', xpRequired: 0, streakRequired: 0 },
        { code: 'streak_3', nameIt: '3 giorni di fila!', descriptionIt: 'Hai studiato 3 giorni consecutivi', icon: '🔥', xpRequired: 0, streakRequired: 3 },
        { code: 'streak_7', nameIt: 'Una settimana!', descriptionIt: '7 giorni di streak consecutivi', icon: '⚡', xpRequired: 0, streakRequired: 7 },
        { code: 'xp_100', nameIt: 'Studente', descriptionIt: 'Hai guadagnato 100 XP', icon: '⭐', xpRequired: 100, streakRequired: 0 },
        { code: 'xp_500', nameIt: 'Apprendista', descriptionIt: 'Hai guadagnato 500 XP', icon: '🌟', xpRequired: 500, streakRequired: 0 },
        { code: 'xp_1000', nameIt: 'Studente Serio', descriptionIt: 'Hai guadagnato 1000 XP', icon: '💫', xpRequired: 1000, streakRequired: 0 },
        { code: 'perfect_lesson', nameIt: 'Lezione Perfetta', descriptionIt: 'Lezione completata con 100% accuratezza', icon: '💯', xpRequired: 0, streakRequired: 0 },
    ]

    for (const badge of badges) {
        await prisma.badge.upsert({
            where: { code: badge.code },
            update: {},
            create: badge,
        })
    }
    console.log('Badges seeded.')

    // Load original JSON content
    const contentDir = path.join(process.cwd(), '..', 'content', 'levels')
    if (fs.existsSync(contentDir)) {
        const levelsToLoad = fs.readdirSync(contentDir)
        for (const levelCode of levelsToLoad) {
            const levelPath = path.join(contentDir, levelCode)
            if (!fs.statSync(levelPath).isDirectory()) continue

            const files = fs.readdirSync(levelPath).filter(f => f.endsWith('.json')).sort()
            for (let fi = 0; fi < files.length; fi++) {
                const f = files[fi]
                const unitData = JSON.parse(fs.readFileSync(path.join(levelPath, f), 'utf-8'))

                // Create Unit
                const unit = await prisma.unit.create({
                    data: {
                        levelCode: unitData.levelCode,
                        sortOrder: unitData.order,
                        titleEn: unitData.title_en,
                        titleIt: unitData.title_it,
                        descriptionIt: unitData.description_it || '',
                        icon: unitData.icon || '📚',
                        isLocked: fi !== 0, // Only first unit unlocked
                    }
                })

                console.log(`Created Unit: ${unit.titleIt}`)

                for (const lessonData of unitData.lessons) {
                    const lesson = await prisma.lesson.create({
                        data: {
                            unitId: unit.id,
                            sortOrder: lessonData.order,
                            titleEn: lessonData.title_en,
                            titleIt: lessonData.title_it,
                            type: lessonData.type || 'vocabulary',
                            estimatedMinutes: lessonData.estimated_minutes || 5
                        }
                    })

                    for (const exData of lessonData.exercises) {
                        await prisma.exercise.create({
                            data: {
                                lessonId: lesson.id,
                                type: exData.type,
                                promptEn: exData.prompt_en || null,
                                promptIt: exData.prompt_it || null,
                                audioText: exData.audio_text || null,
                                optionsJson: exData.options ? JSON.stringify(exData.options) : null,
                                correctAnswer: exData.correct_answer,
                                explanationIt: exData.explanation_it || null,
                                grammarRule: exData.grammar_rule || null,
                                difficulty: exData.difficulty || 1
                            }
                        })
                    }
                }
            }
            console.log(`Content for level ${levelCode} loaded.`)
        }
    } else {
        console.warn('Content directory not found at', contentDir)
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
