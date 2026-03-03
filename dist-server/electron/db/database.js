"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDatabase = initDatabase;
exports.getDb = getDb;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = require("path");
const fs_1 = __importDefault(require("fs"));
let db;
function initDatabase() {
    let dbPath;
    try {
        // Try to get path from Electron if we're running in Electron
        const { app } = require('electron');
        const userDataPath = app.getPath('userData');
        dbPath = (0, path_1.join)(userDataPath, 'ailingo.db');
    }
    catch (e) {
        // Fallback to local data directory for Express server
        const dataDir = (0, path_1.join)(process.cwd(), 'data');
        if (!fs_1.default.existsSync(dataDir)) {
            fs_1.default.mkdirSync(dataDir, { recursive: true });
        }
        dbPath = (0, path_1.join)(dataDir, 'ailingo.db');
    }
    db = new better_sqlite3_1.default(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    createTables();
    seedInitialData();
    return db;
}
function getDb() {
    return db;
}
function createTables() {
    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      native_language TEXT DEFAULT 'it',
      target_language TEXT DEFAULT 'en',
      current_level TEXT DEFAULT 'A1',
      onboarding_complete INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS levels (
      code TEXT PRIMARY KEY, name_it TEXT NOT NULL, name_en TEXT NOT NULL,
      description_it TEXT, sort_order INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS units (
      id INTEGER PRIMARY KEY AUTOINCREMENT, level_code TEXT NOT NULL REFERENCES levels(code),
      sort_order INTEGER NOT NULL, title_en TEXT NOT NULL, title_it TEXT NOT NULL,
      description_it TEXT, icon TEXT DEFAULT '📚', is_locked INTEGER DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT, unit_id INTEGER NOT NULL REFERENCES units(id),
      sort_order INTEGER NOT NULL, title_en TEXT NOT NULL, title_it TEXT NOT NULL,
      type TEXT DEFAULT 'vocabulary', estimated_minutes INTEGER DEFAULT 5
    );
    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT, lesson_id INTEGER NOT NULL REFERENCES lessons(id),
      type TEXT NOT NULL, prompt_en TEXT, prompt_it TEXT, audio_text TEXT,
      options_json TEXT, correct_answer TEXT NOT NULL, explanation_it TEXT,
      grammar_rule TEXT, difficulty INTEGER DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS lesson_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT, lesson_id INTEGER NOT NULL REFERENCES lessons(id),
      user_id INTEGER NOT NULL REFERENCES users(id), completed_at TEXT DEFAULT (datetime('now')),
      accuracy REAL DEFAULT 0, xp_earned INTEGER DEFAULT 0, attempts INTEGER DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS exercise_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT, exercise_id INTEGER NOT NULL REFERENCES exercises(id),
      user_id INTEGER NOT NULL REFERENCES users(id), user_answer TEXT,
      is_correct INTEGER DEFAULT 0, response_time_ms INTEGER DEFAULT 0,
      seen_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS review_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT, exercise_id INTEGER NOT NULL REFERENCES exercises(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      next_review_at TEXT DEFAULT (datetime('now')), interval_days REAL DEFAULT 1,
      ease_factor REAL DEFAULT 2.5, lapses INTEGER DEFAULT 0, repetitions INTEGER DEFAULT 0,
      UNIQUE(exercise_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS user_stats (
      user_id INTEGER PRIMARY KEY REFERENCES users(id), total_xp INTEGER DEFAULT 0,
      current_streak INTEGER DEFAULT 0, longest_streak INTEGER DEFAULT 0,
      last_study_date TEXT, user_level INTEGER DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT UNIQUE NOT NULL, name_it TEXT NOT NULL,
      description_it TEXT, icon TEXT DEFAULT '🏅', xp_required INTEGER DEFAULT 0,
      streak_required INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS user_badges (
      user_id INTEGER NOT NULL REFERENCES users(id), badge_id INTEGER NOT NULL REFERENCES badges(id),
      earned_at TEXT DEFAULT (datetime('now')), PRIMARY KEY (user_id, badge_id)
    );
    CREATE TABLE IF NOT EXISTS study_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id),
      started_at TEXT DEFAULT (datetime('now')), ended_at TEXT,
      xp_earned INTEGER DEFAULT 0, exercise_count INTEGER DEFAULT 0, accuracy REAL DEFAULT 0
    );
  `);
}
function seedInitialData() {
    const levelCount = db.prepare('SELECT COUNT(*) as count FROM levels').get();
    if (levelCount.count > 0)
        return;
    const il = db.prepare('INSERT INTO levels (code,name_it,name_en,description_it,sort_order) VALUES (?,?,?,?,?)');
    [
        ['A1', 'Principiante', 'Beginner', "Le basi assolute dell'inglese", 1],
        ['A2', 'Elementare', 'Elementary', 'Comunicare in situazioni semplici', 2],
        ['B1', 'Intermedio', 'Intermediate', 'Trattare argomenti familiari', 3],
        ['B2', 'Intermedio Superiore', 'Upper-Intermediate', 'Conversare con scioltezza', 4],
        ['C1', 'Avanzato', 'Advanced', 'Esprimersi con fluidità e precisione', 5],
    ].forEach(l => il.run(...l));
    const ib = db.prepare('INSERT INTO badges (code,name_it,description_it,icon,xp_required,streak_required) VALUES (?,?,?,?,?,?)');
    [
        ['first_lesson', 'Prima Lezione!', 'Hai completato la tua prima lezione', '🎉', 0, 0],
        ['streak_3', '3 giorni di fila!', 'Hai studiato 3 giorni consecutivi', '🔥', 0, 3],
        ['streak_7', 'Una settimana!', '7 giorni di streak consecutivi', '⚡', 0, 7],
        ['xp_100', 'Studente', 'Hai guadagnato 100 XP', '⭐', 100, 0],
        ['xp_500', 'Apprendista', 'Hai guadagnato 500 XP', '🌟', 500, 0],
        ['xp_1000', 'Studente Serio', 'Hai guadagnato 1000 XP', '💫', 1000, 0],
        ['perfect_lesson', 'Lezione Perfetta', 'Lezione completata con 100% accuratezza', '💯', 0, 0],
    ].forEach(b => ib.run(...b));
    console.log('[DB] Seeded initial data');
}
