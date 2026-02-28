import type { IpcMain } from 'electron'
import Database from 'better-sqlite3'
import { loadUnitsForLevel } from '../content/contentLoader'

export function registerContentHandlers(ipcMain: IpcMain, db: Database.Database): void {
    ipcMain.handle('reload-content', (_event, levelCode: string) => {
        const deleteExercises = db.prepare(`
      DELETE FROM exercises WHERE lesson_id IN
        (SELECT id FROM lessons WHERE unit_id IN (SELECT id FROM units WHERE level_code=?))
    `)
        const deleteLessons = db.prepare('DELETE FROM lessons WHERE unit_id IN (SELECT id FROM units WHERE level_code=?)')
        const deleteUnits = db.prepare('DELETE FROM units WHERE level_code=?')
        db.transaction(() => {
            deleteExercises.run(levelCode)
            deleteLessons.run(levelCode)
            deleteUnits.run(levelCode)
        })()
        loadUnitsForLevel(db, levelCode)
        return { ok: true }
    })
}
