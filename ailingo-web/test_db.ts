import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const units = await prisma.unit.findMany({ select: { id: true, levelCode: true, titleIt: true } })
    console.log(`Found ${units.length} units`)
    console.table(units)

    const lessons = await prisma.lesson.findMany({ select: { id: true, unitId: true, titleIt: true } })
    console.log(`Found ${lessons.length} lessons`)
}

main().finally(() => prisma.$disconnect())
