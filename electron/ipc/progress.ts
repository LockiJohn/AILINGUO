import type { IpcMain } from 'electron'
import Database from 'better-sqlite3'

export function registerProgressHandlers(ipcMain: IpcMain, db: Database.Database): void {
    ipcMain.handle('get-user', () => {
        return db.prepare('SELECT * FROM users WHERE id = 1').get()
    })

    ipcMain.handle('create-user', (_event, name: string, level: string) => {
        const existing = db.prepare('SELECT id FROM users WHERE id = 1').get()
        if (existing) {
            db.prepare('UPDATE users SET name=?, current_level=?, onboarding_complete=1 WHERE id=1').run(name, level)
        } else {
            db.prepare('INSERT INTO users (id, name, current_level, onboarding_complete) VALUES (1, ?, ?, 1)').run(name, level)
            db.prepare('INSERT INTO user_stats (user_id) VALUES (1)').run()
        }
        return db.prepare('SELECT * FROM users WHERE id = 1').get()
    })

    ipcMain.handle('get-user-stats', () => {
        const stats = db.prepare('SELECT * FROM user_stats WHERE user_id = 1').get() as Record<string, unknown> | undefined
        const wordsLearned = (db.prepare(`
      SELECT COUNT(DISTINCT e.id) as count FROM exercises e
      JOIN exercise_results er ON er.exercise_id = e.id AND er.user_id = 1 AND er.is_correct = 1
      WHERE e.type IN ('translation_it_en','multiple_choice','match_pairs')
    `).get() as { count: number }).count
        const lessonsCompleted = (db.prepare('SELECT COUNT(*) as count FROM lesson_progress WHERE user_id = 1').get() as { count: number }).count
        const timeStudied = (db.prepare(`
      SELECT COALESCE(SUM((julianday(ended_at)-julianday(started_at))*24*60),0) as minutes
      FROM study_sessions WHERE user_id=1 AND ended_at IS NOT NULL
    `).get() as { minutes: number }).minutes
        const accuracy = (db.prepare(`
      SELECT COALESCE(AVG(is_correct)*100,0) as avg FROM exercise_results WHERE user_id=1
    `).get() as { avg: number }).avg
        const badges = db.prepare(`
      SELECT b.* FROM badges b JOIN user_badges ub ON ub.badge_id=b.id WHERE ub.user_id=1
    `).all()

        return {
            ...stats, words_learned: wordsLearned, lessons_completed: lessonsCompleted,
            time_studied_minutes: Math.round(timeStudied), accuracy_avg: Math.round(accuracy), badges
        }
    })

    ipcMain.handle('save-exercise-result', (_event, result: {
        exerciseId: number; userAnswer: string; isCorrect: boolean; responseTimeMs: number
    }) => {
        db.prepare('INSERT INTO exercise_results (exercise_id,user_id,user_answer,is_correct,response_time_ms) VALUES (?,1,?,?,?)').run(
            result.exerciseId, result.userAnswer, result.isCorrect ? 1 : 0, result.responseTimeMs
        )
        db.prepare(`
      INSERT INTO review_queue (exercise_id,user_id,next_review_at,interval_days,ease_factor,repetitions)
      VALUES (?, 1, datetime('now','+1 day'), 1, 2.5, 0)
      ON CONFLICT(exercise_id, user_id) DO NOTHING
    `).run(result.exerciseId)
        return { ok: true }
    })

    ipcMain.handle('complete-lesson', (_event, lessonId: number, accuracy: number, xpEarned: number) => {
        db.prepare('INSERT INTO lesson_progress (lesson_id,user_id,accuracy,xp_earned) VALUES (?,1,?,?)').run(lessonId, accuracy, xpEarned)
        const today = new Date().toISOString().split('T')[0]
        const stats = db.prepare('SELECT * FROM user_stats WHERE user_id=1').get() as {
            total_xp: number; current_streak: number; longest_streak: number; last_study_date: string | null
        } | undefined
        if (stats) {
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
            const newStreak = stats.last_study_date === yesterday ? stats.current_streak + 1
                : stats.last_study_date === today ? stats.current_streak : 1
            const newLongest = Math.max(newStreak, stats.longest_streak)
            const newXp = stats.total_xp + xpEarned
            db.prepare('UPDATE user_stats SET total_xp=?,current_streak=?,longest_streak=?,last_study_date=? WHERE user_id=1').run(
                newXp, newStreak, newLongest, today
            )
            checkAndAwardBadges(db, newXp, newStreak, accuracy)
        }
        return { ok: true }
    })

    ipcMain.handle('get-review-queue', () => {
        return db.prepare(`
      SELECT rq.*,e.type,e.prompt_en,e.prompt_it,e.correct_answer,e.options_json,e.explanation_it,e.audio_text
      FROM review_queue rq JOIN exercises e ON e.id=rq.exercise_id
      WHERE rq.user_id=1 AND rq.next_review_at<=datetime('now')
      ORDER BY rq.next_review_at ASC LIMIT 20
    `).all()
    })

    ipcMain.handle('update-review-item', (_event, exerciseId: number, quality: number) => {
        const item = db.prepare('SELECT * FROM review_queue WHERE exercise_id=? AND user_id=1').get(exerciseId) as {
            ease_factor: number; interval_days: number; repetitions: number
        } | undefined
        if (!item) return { ok: false }
        const { newInterval, newEaseFactor } = sm2(quality, item.repetitions, item.ease_factor, item.interval_days)
        const nextReview = new Date(Date.now() + newInterval * 86400000).toISOString()
        db.prepare(`UPDATE review_queue SET interval_days=?,ease_factor=?,next_review_at=?,repetitions=repetitions+1,lapses=lapses+?
      WHERE exercise_id=? AND user_id=1`).run(newInterval, newEaseFactor, nextReview, quality < 3 ? 1 : 0, exerciseId)
        return { ok: true }
    })

    ipcMain.handle('start-session', () => {
        const result = db.prepare('INSERT INTO study_sessions (user_id) VALUES (1)').run()
        return { sessionId: result.lastInsertRowid }
    })

    ipcMain.handle('end-session', (_event, sessionId: number, xpEarned: number, exerciseCount: number, accuracy: number) => {
        db.prepare(`UPDATE study_sessions SET ended_at=datetime('now'),xp_earned=?,exercise_count=?,accuracy=? WHERE id=? AND user_id=1`).run(
            xpEarned, exerciseCount, accuracy, sessionId
        )
        return { ok: true }
    })

    ipcMain.handle('get-badges', () => {
        return db.prepare(`
      SELECT b.*, ub.earned_at IS NOT NULL as is_earned, ub.earned_at
      FROM badges b LEFT JOIN user_badges ub ON ub.badge_id=b.id AND ub.user_id=1
      ORDER BY b.id
    `).all()
    })

    ipcMain.handle('get-study-sessions', (_event, days: number) => {
        return db.prepare(`
      SELECT date(started_at) as day, SUM(xp_earned) as xp, SUM(exercise_count) as exercises, AVG(accuracy) as accuracy
      FROM study_sessions
      WHERE user_id=1 AND started_at>=datetime('now','-'||?||' days') AND ended_at IS NOT NULL
      GROUP BY date(started_at) ORDER BY day ASC
    `).all(days)
    })
}

function sm2(quality: number, repetitions: number, easeFactor: number, interval: number) {
    let newEF = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    if (newEF < 1.3) newEF = 1.3
    let newReps = repetitions; let newInterval: number
    if (quality < 3) { newReps = 0; newInterval = 1 }
    else { newReps++; newInterval = newReps === 1 ? 1 : newReps === 2 ? 6 : Math.round(interval * newEF) }
    return { newInterval, newEaseFactor: newEF }
}

function checkAndAwardBadges(db: Database.Database, totalXp: number, streak: number, accuracy: number): void {
    const award = (code: string) => {
        const badge = db.prepare('SELECT id FROM badges WHERE code=?').get(code) as { id: number } | undefined
        if (!badge) return
        const held = db.prepare('SELECT 1 FROM user_badges WHERE user_id=1 AND badge_id=?').get(badge.id)
        if (!held) db.prepare('INSERT INTO user_badges (user_id,badge_id) VALUES (1,?)').run(badge.id)
    }
    const lc = (db.prepare('SELECT COUNT(*) as count FROM lesson_progress WHERE user_id=1').get() as { count: number }).count
    if (lc >= 1) award('first_lesson')
    if (streak >= 3) award('streak_3')
    if (streak >= 7) award('streak_7')
    if (totalXp >= 100) award('xp_100')
    if (totalXp >= 500) award('xp_500')
    if (totalXp >= 1000) award('xp_1000')
    if (accuracy === 100) award('perfect_lesson')
}
