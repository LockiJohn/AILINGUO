import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { initDatabase } from '../electron/db/database'

// Initialize environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Initialize the database
const db = initDatabase()

// Routes

// --- CONTENT CONTROLLERS ---
import { loadUnitsForLevel } from '../electron/content/contentLoader'
app.post('/api/content/reload', (req, res) => {
    const { levelCode } = req.body
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

    // loadUnitsForLevel uses electron dependencies inside, so we might need to be careful if it relies on app.getPath
    // we'll need to adapt it later if it does.
    loadUnitsForLevel(db, levelCode)
    res.json({ ok: true })
})

// --- LESSON CONTROLLERS ---
app.get('/api/lessons/levels', (req, res) => {
    const levels = db.prepare('SELECT * FROM levels ORDER BY sort_order').all()
    res.json(levels)
})

app.get('/api/lessons/units/:levelCode', (req, res) => {
    const { levelCode } = req.params;
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
        const reloadedUnits = db.prepare('SELECT * FROM units WHERE level_code = ? ORDER BY sort_order').all(levelCode)
        return res.json(reloadedUnits)
    }
    res.json(units)
})

app.get('/api/lessons/lesson/:lessonId', (req, res) => {
    const lesson = db.prepare('SELECT * FROM lessons WHERE id = ?').get(req.params.lessonId)
    res.json(lesson)
})

app.get('/api/lessons/unit/:unitId/lessons', (req, res) => {
    const lessons = db.prepare('SELECT * FROM lessons WHERE unit_id = ? ORDER BY sort_order').all(req.params.unitId)
    res.json(lessons)
})

app.get('/api/lessons/lesson/:lessonId/exercises', (req, res) => {
    const exercises = db.prepare('SELECT * FROM exercises WHERE lesson_id = ? ORDER BY RANDOM()').all(req.params.lessonId)
    res.json(exercises)
})

app.get('/api/lessons/quick-session', (req, res) => {
    const exercises = db.prepare('SELECT * FROM exercises ORDER BY RANDOM() LIMIT 10').all()
    res.json(exercises)
})


// --- PROGRESS & USER CONTROLLERS ---
let currentUserId = 1;

app.get('/api/users/current', (req, res) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(currentUserId)
    res.json(user)
})

app.get('/api/users/all', (req, res) => {
    const users = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all()
    res.json(users)
})

app.post('/api/users/switch', (req, res) => {
    const { userId } = req.body
    const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(userId)
    if (existing) {
        currentUserId = userId
        res.json({ ok: true })
    } else {
        res.status(404).json({ ok: false, error: 'User not found' })
    }
})

app.post('/api/users/create', (req, res) => {
    const { name, level } = req.body
    const info = db.prepare('INSERT INTO users (name, current_level, onboarding_complete) VALUES (?, ?, 1)').run(name, level)
    const newId = info.lastInsertRowid as number
    db.prepare('INSERT INTO user_stats (user_id) VALUES (?)').run(newId)
    currentUserId = newId
    const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(newId)
    res.json(newUser)
})

app.post('/api/users/demo', (req, res) => {
    const info = db.prepare('INSERT INTO users (name, current_level, onboarding_complete) VALUES (?, ?, 1)').run('Test Demo (B2)', 'B2')
    const newId = info.lastInsertRowid as number

    // Genera stats base
    db.prepare('INSERT INTO user_stats (user_id, total_xp, current_streak, longest_streak) VALUES (?, ?, ?, ?)').run(newId, 15000, 45, 45)

    // Popola la heatmap con 168 giorni sparsi
    const insertSession = db.prepare('INSERT INTO study_sessions (user_id, started_at, ended_at, xp_earned, exercise_count, accuracy) VALUES (?, ?, ?, ?, ?, ?)')
    const today = new Date()
    for (let i = 168; i >= 0; i--) {
        // Lavora l'80% dei giorni passati
        if (Math.random() > 0.2) {
            const date = new Date(today.getTime())
            date.setDate(date.getDate() - i)
            const dateStr = date.toISOString().split('T')[0] + ' 12:00:00'
            const xp = Math.floor(Math.random() * 300) + 10 // XP randomico tra 10 e 310 per colorare la heatmap in vari livelli
            insertSession.run(newId, dateStr, dateStr, xp, Math.floor(xp / 10), 95)
        }
    }

    // Sblocca 10 lezioni arbitrarie per far vedere i livelli aperti
    const insertLesson = db.prepare('INSERT INTO lesson_progress (user_id, lesson_id, accuracy, xp_earned) VALUES (?, ?, 100, 100)')
    for (let i = 1; i <= 10; i++) {
        insertLesson.run(newId, i)
    }

    // Premi e onorificenze false
    checkAndAwardBadges(db, 15000, 45, 100, newId)

    currentUserId = newId
    const demoUser = db.prepare('SELECT * FROM users WHERE id = ?').get(newId)
    res.json(demoUser)
})

app.get('/api/users/stats', (req, res) => {
    const stats = db.prepare('SELECT * FROM user_stats WHERE user_id = ?').get(currentUserId) as Record<string, unknown> | undefined
    const wordsLearned = (db.prepare(`
        SELECT COUNT(DISTINCT e.id) as count FROM exercises e
        JOIN exercise_results er ON er.exercise_id = e.id AND er.user_id = ? AND er.is_correct = 1
        WHERE e.type IN ('translation_it_en','multiple_choice','match_pairs')
    `).get(currentUserId) as { count: number }).count
    const lessonsCompleted = (db.prepare('SELECT COUNT(*) as count FROM lesson_progress WHERE user_id = ?').get(currentUserId) as { count: number }).count
    const timeStudied = (db.prepare(`
        SELECT COALESCE(SUM((julianday(ended_at)-julianday(started_at))*24*60),0) as minutes
        FROM study_sessions WHERE user_id=? AND ended_at IS NOT NULL
    `).get(currentUserId) as { minutes: number }).minutes
    const accuracy = (db.prepare(`
        SELECT COALESCE(AVG(is_correct)*100,0) as avg FROM exercise_results WHERE user_id=?
    `).get(currentUserId) as { avg: number }).avg
    const badges = db.prepare(`
        SELECT b.* FROM badges b JOIN user_badges ub ON ub.badge_id=b.id WHERE ub.user_id=?
    `).all(currentUserId)

    res.json({
        ...stats, words_learned: wordsLearned, lessons_completed: lessonsCompleted,
        time_studied_minutes: Math.round(timeStudied), accuracy_avg: Math.round(accuracy), badges
    })
})

app.post('/api/progress/exercise', (req, res) => {
    const { exerciseId, userAnswer, isCorrect, responseTimeMs } = req.body;
    db.prepare('INSERT INTO exercise_results (exercise_id,user_id,user_answer,is_correct,response_time_ms) VALUES (?,?,?,?,?)').run(
        exerciseId, currentUserId, userAnswer, isCorrect ? 1 : 0, responseTimeMs
    )
    db.prepare(`
        INSERT INTO review_queue (exercise_id,user_id,next_review_at,interval_days,ease_factor,repetitions)
        VALUES (?, ?, datetime('now','+1 day'), 1, 2.5, 0)
        ON CONFLICT(exercise_id, user_id) DO NOTHING
    `).run(exerciseId, currentUserId)
    res.json({ ok: true })
})

app.post('/api/progress/lesson', (req, res) => {
    const { lessonId, accuracy, xpEarned } = req.body;
    db.prepare('INSERT INTO lesson_progress (lesson_id,user_id,accuracy,xp_earned) VALUES (?,?,?,?)').run(lessonId, currentUserId, accuracy, xpEarned)
    const today = new Date().toISOString().split('T')[0]
    const stats = db.prepare('SELECT * FROM user_stats WHERE user_id=?').get(currentUserId) as {
        total_xp: number; current_streak: number; longest_streak: number; last_study_date: string | null
    } | undefined
    if (stats) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
        const newStreak = stats.last_study_date === yesterday ? stats.current_streak + 1
            : stats.last_study_date === today ? stats.current_streak : 1
        const newLongest = Math.max(newStreak, stats.longest_streak)
        const newXp = stats.total_xp + xpEarned
        db.prepare('UPDATE user_stats SET total_xp=?,current_streak=?,longest_streak=?,last_study_date=? WHERE user_id=?').run(
            newXp, newStreak, newLongest, today, currentUserId
        )
        checkAndAwardBadges(db, newXp, newStreak, accuracy, currentUserId)
    }
    res.json({ ok: true })
})

app.get('/api/progress/review-queue', (req, res) => {
    const queue = db.prepare(`
        SELECT rq.*,e.type,e.prompt_en,e.prompt_it,e.correct_answer,e.options_json,e.explanation_it,e.audio_text
        FROM review_queue rq JOIN exercises e ON e.id=rq.exercise_id
        WHERE rq.user_id=? AND rq.next_review_at<=datetime('now')
        ORDER BY rq.next_review_at ASC LIMIT 20
    `).all(currentUserId)
    res.json(queue)
})

app.post('/api/progress/review-item', (req, res) => {
    const { exerciseId, quality } = req.body;
    const item = db.prepare('SELECT * FROM review_queue WHERE exercise_id=? AND user_id=?').get(exerciseId, currentUserId) as {
        ease_factor: number; interval_days: number; repetitions: number
    } | undefined
    if (!item) return res.status(404).json({ ok: false, error: 'Item not found' })

    const { newInterval, newEaseFactor } = sm2(quality, item.repetitions, item.ease_factor, item.interval_days)
    const nextReview = new Date(Date.now() + newInterval * 86400000).toISOString()
    db.prepare(`UPDATE review_queue SET interval_days=?,ease_factor=?,next_review_at=?,repetitions=repetitions+1,lapses=lapses+?
        WHERE exercise_id=? AND user_id=?`).run(newInterval, newEaseFactor, nextReview, quality < 3 ? 1 : 0, exerciseId, currentUserId)
    res.json({ ok: true })
})

app.post('/api/progress/session/start', (req, res) => {
    const result = db.prepare('INSERT INTO study_sessions (user_id) VALUES (?)').run(currentUserId)
    res.json({ sessionId: result.lastInsertRowid })
})

app.post('/api/progress/session/end', (req, res) => {
    const { sessionId, xpEarned, exerciseCount, accuracy } = req.body;
    db.prepare(`UPDATE study_sessions SET ended_at=datetime('now'),xp_earned=?,exercise_count=?,accuracy=? WHERE id=? AND user_id=?`).run(
        xpEarned, exerciseCount, accuracy, sessionId, currentUserId
    )
    res.json({ ok: true })
})

app.get('/api/progress/badges', (req, res) => {
    const badges = db.prepare(`
        SELECT b.*, ub.earned_at IS NOT NULL as is_earned, ub.earned_at
        FROM badges b LEFT JOIN user_badges ub ON ub.badge_id=b.id AND ub.user_id=?
        ORDER BY b.id
    `).all(currentUserId)
    res.json(badges)
})

app.get('/api/progress/study-sessions', (req, res) => {
    const days = parseInt(req.query.days as string) || 7;
    const sessions = db.prepare(`
        SELECT date(started_at) as day, SUM(xp_earned) as xp, SUM(exercise_count) as exercises, AVG(accuracy) as accuracy
        FROM study_sessions
        WHERE user_id=? AND started_at>=datetime('now','-'||?||' days') AND ended_at IS NOT NULL
        GROUP BY date(started_at) ORDER BY day ASC
    `).all(currentUserId, days)
    res.json(sessions)
})

app.get('/api/progress/weak-words', (req, res) => {
    const weakWords = db.prepare(`
        SELECT rq.lapses, e.prompt_it, e.correct_answer 
        FROM review_queue rq 
        JOIN exercises e ON e.id = rq.exercise_id 
        WHERE rq.user_id = ? AND rq.lapses > 0 
        ORDER BY rq.lapses DESC 
        LIMIT 5
    `).all(currentUserId)
    res.json(weakWords)
})

// Helper functions (copied from progress.ts)
function sm2(quality: number, repetitions: number, easeFactor: number, interval: number) {
    let newEF = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    if (newEF < 1.3) newEF = 1.3
    let newReps = repetitions; let newInterval: number
    if (quality < 3) { newReps = 0; newInterval = 1 }
    else { newReps++; newInterval = newReps === 1 ? 1 : newReps === 2 ? 6 : Math.round(interval * newEF) }
    return { newInterval, newEaseFactor: newEF }
}

function checkAndAwardBadges(db: any, totalXp: number, streak: number, accuracy: number, userId: number): void {
    const award = (code: string) => {
        const badge = db.prepare('SELECT id FROM badges WHERE code=?').get(code) as { id: number } | undefined
        if (!badge) return
        const held = db.prepare('SELECT 1 FROM user_badges WHERE user_id=? AND badge_id=?').get(userId, badge.id)
        if (!held) db.prepare('INSERT INTO user_badges (user_id,badge_id) VALUES (?,?)').run(userId, badge.id)
    }
    const lc = (db.prepare('SELECT COUNT(*) as count FROM lesson_progress WHERE user_id=?').get(userId) as { count: number }).count
    if (lc >= 1) award('first_lesson')
    if (streak >= 3) award('streak_3')
    if (streak >= 7) award('streak_7')
    if (totalXp >= 100) award('xp_100')
    if (totalXp >= 500) award('xp_500')
    if (totalXp >= 1000) award('xp_1000')
    if (accuracy === 100) award('perfect_lesson')
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
