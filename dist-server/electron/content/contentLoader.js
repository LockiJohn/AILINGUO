"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadUnitsForLevel = loadUnitsForLevel;
const path_1 = require("path");
const fs_1 = require("fs");
function loadUnitsForLevel(db, levelCode) {
    const possiblePaths = [
        (0, path_1.join)(process.cwd(), 'content', 'levels', levelCode.toLowerCase()),
        (0, path_1.join)(__dirname, '..', '..', 'content', 'levels', levelCode.toLowerCase()), // from dist-server/electron/content
        (0, path_1.join)(__dirname, '..', '..', '..', 'content', 'levels', levelCode.toLowerCase())
    ];
    let contentDir = '';
    for (const p of possiblePaths) {
        if ((0, fs_1.existsSync)(p)) {
            contentDir = p;
            break;
        }
    }
    if (!contentDir) {
        console.warn(`[Content] No content dir for ${levelCode}`);
        return;
    }
    const files = (0, fs_1.readdirSync)(contentDir).filter((f) => f.endsWith('.json')).sort();
    const insertUnit = db.prepare('INSERT INTO units (level_code,sort_order,title_en,title_it,description_it,icon,is_locked) VALUES (?,?,?,?,?,?,?)');
    const insertLesson = db.prepare('INSERT INTO lessons (unit_id,sort_order,title_en,title_it,type,estimated_minutes) VALUES (?,?,?,?,?,?)');
    const insertExercise = db.prepare('INSERT INTO exercises (lesson_id,type,prompt_en,prompt_it,audio_text,options_json,correct_answer,explanation_it,grammar_rule,difficulty) VALUES (?,?,?,?,?,?,?,?,?,?)');
    const loadAll = db.transaction(() => {
        for (let fi = 0; fi < files.length; fi++) {
            const unit = JSON.parse((0, fs_1.readFileSync)((0, path_1.join)(contentDir, files[fi]), 'utf-8'));
            const unitId = Number(insertUnit.run(unit.levelCode, unit.order, unit.title_en, unit.title_it, unit.description_it || '', unit.icon || '📚', fi === 0 ? 0 : 1).lastInsertRowid);
            for (const lesson of unit.lessons) {
                const lessonId = Number(insertLesson.run(unitId, lesson.order, lesson.title_en, lesson.title_it, lesson.type || 'vocabulary', lesson.estimated_minutes || 5).lastInsertRowid);
                for (const ex of lesson.exercises) {
                    insertExercise.run(lessonId, ex.type, ex.prompt_en ?? null, ex.prompt_it ?? null, ex.audio_text ?? null, ex.options ? JSON.stringify(ex.options) : null, ex.correct_answer, ex.explanation_it ?? null, ex.grammar_rule ?? null, ex.difficulty ?? 1);
                }
            }
        }
    });
    loadAll();
    console.log(`[Content] Loaded ${files.length} units for ${levelCode}`);
}
