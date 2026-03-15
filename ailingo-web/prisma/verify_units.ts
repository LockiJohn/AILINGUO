import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- CURRICULUM VERIFICATION ---')
    
    // Check Levels
    const levels = await prisma.level.findMany({ include: { _count: { select: { units: true } } } })
    console.log(`Found ${levels.length} levels.`)
    levels.forEach(l => console.log(`- ${l.code}: ${l.nameEn} (${l._count.units} units)`))

    // Check A1 Units
    const units = await prisma.unit.findMany({
        where: { levelCode: 'A1' },
        orderBy: { sortOrder: 'asc' },
        include: { 
            lessons: {
                include: {
                    _count: { select: { exercises: true } }
                }
            }
        }
    })

    console.log('\n--- LEVEL A1 UNITS DETAIL ---')
    units.forEach(u => {
        const totalEx = u.lessons.reduce((acc, l) => acc + l._count.exercises, 0)
        console.log(`Unit ${u.sortOrder}: ${u.titleEn} (${u.lessons.length} lessons, ${totalEx} exercises)`)
        u.lessons.forEach(l => {
            console.log(`  - Lesson ${l.sortOrder}: ${l.titleEn} (${l._count.exercises} exercises)`)
        })
    })

    // Check Exercises sample
    const totalExercises = await prisma.exercise.count()
    console.log(`\nTotal Exercises in DB: ${totalExercises}`)
    
    const exerciseTypes = await prisma.exercise.groupBy({
        by: ['type'],
        _count: { id: true }
    })
    console.log('\n--- EXERCISE TYPES DISTRIBUTION ---')
    exerciseTypes.forEach(et => {
        console.log(`- ${et.type}: ${et._count.id}`)
    })
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
