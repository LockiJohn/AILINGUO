import type { IpcMain } from 'electron'
import Database from 'better-sqlite3'
import { loadUnitsForLevel } from '../content/contentLoader'

export function registerLessonHandlers(ipcMain: IpcMain, db: Database.Database): void {
    ipcMain.handle('get-levels', () => {
        return db.prepare('SELECT * FROM levels ORDER BY sort_order').all()
    })

    ipcMain.handle('get-units', (_event, levelCode: string) => {
        const units = db.prepare(`
      SELECT u.*,
        (SELECT COUNT(*) FROM lessons l WHERE l.unit_id = u.id) as lesson_count,
        (SELECT COUNT(*) FROM lessons l
          JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.user_id = 1
         WHERE l.unit_id = u.id) as completed_lessons
      FROM units u
      WHERE u.level_code = ?
      ORDER BY u.sort_order
    `).all(levelCode)

        if ((units as unknown[]).length === 0) {
            loadUnitsForLevel(db, levelCode)
            return db.prepare('SELECT * FROM units WHERE level_code = ? ORDER BY sort_order').all(levelCode)
        }
        return units
    })

    ipcMain.handle('get-lesson', (_event, lessonId: number) => {
        return db.prepare('SELECT * FROM lessons WHERE id = ?').get(lessonId)
    })

    ipcMain.handle('get-unit-lessons', (_event, unitId: number) => {
        return db.prepare('SELECT * FROM lessons WHERE unit_id = ? ORDER BY sort_order').all(unitId)
    })

    ipcMain.handle('get-lesson-exercises', (_event, lessonId: number) => {
        return db.prepare('SELECT * FROM exercises WHERE lesson_id = ? ORDER BY RANDOM()').all(lessonId)
    })

    ipcMain.handle('get-quick-session', () => {
        return db.prepare('SELECT * FROM exercises ORDER BY RANDOM() LIMIT 10').all()
    })
}
