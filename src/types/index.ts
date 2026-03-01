// Type declarations for the Electron IPC bridge (ailingo.*)
// exposed via preload.ts

export interface User {
    id: number
    name: string
    native_language: string
    target_language: string
    current_level: string
    onboarding_complete: number
    created_at: string
}

export interface UserStats {
    user_id: number
    total_xp: number
    current_streak: number
    longest_streak: number
    last_study_date: string | null
    user_level: number
    words_learned: number
    lessons_completed: number
    time_studied_minutes: number
    accuracy_avg: number
    badges: Badge[]
}

export interface Level {
    code: string
    name_it: string
    name_en: string
    description_it: string
    sort_order: number
}

export interface Unit {
    id: number
    level_code: string
    sort_order: number
    title_en: string
    title_it: string
    description_it: string
    icon: string
    is_locked: number
    lesson_count?: number
    completed_lessons?: number
}

export interface Lesson {
    id: number
    unit_id: number
    sort_order: number
    title_en: string
    title_it: string
    type: string
    estimated_minutes: number
}

export interface Exercise {
    id: number
    lesson_id: number
    type: 'multiple_choice' | 'translation_it_en' | 'translation_en_it' | 'word_order' | 'fill_blank' | 'listen_write' | 'speaking' | 'match_pairs' | 'free_dictation'
    prompt_en: string | null
    prompt_it: string | null
    audio_text: string | null
    options_json: string | null
    correct_answer: string
    explanation_it: string | null
    grammar_rule: string | null
    difficulty: number
}

export interface Badge {
    id: number
    code: string
    name_it: string
    description_it: string
    icon: string
    is_earned?: number
    earned_at?: string
}

export interface StudySession {
    day: string
    xp: number
    exercises: number
    accuracy: number
}

export interface ExerciseResult {
    exerciseId: number
    userAnswer: string
    isCorrect: boolean
    responseTimeMs: number
}

declare global {
    interface Window {
        ailingo: {
            getLevels: () => Promise<Level[]>
            getUnits: (levelCode: string) => Promise<Unit[]>
            getUnitLessons: (unitId: number) => Promise<Lesson[]>
            getLesson: (lessonId: number) => Promise<Lesson>
            getLessonExercises: (lessonId: number) => Promise<Exercise[]>
            getQuickSession: () => Promise<Exercise[]>
            getUser: () => Promise<User | null>
            getAllUsers: () => Promise<User[]>
            switchUser: (userId: number) => Promise<{ ok: boolean }>
            createUser: (name: string, level: string) => Promise<User>
            createDemoProfile: () => Promise<User>
            getUserStats: () => Promise<UserStats>
            saveExerciseResult: (result: ExerciseResult) => Promise<{ ok: boolean }>
            completLesson: (lessonId: number, accuracy: number, xpEarned: number) => Promise<{ ok: boolean }>
            getReviewQueue: () => Promise<Exercise[]>
            updateReviewItem: (exerciseId: number, quality: number) => Promise<{ ok: boolean }>
            getBadges: () => Promise<Badge[]>
            getStudySessions: (days: number) => Promise<StudySession[]>
            getWeakWords: () => Promise<Array<{ lapses: number, prompt_it: string, correct_answer: string }>>
            startSession: () => Promise<{ sessionId: number }>
            endSession: (sessionId: number, xpEarned: number, exerciseCount: number, accuracy: number) => Promise<{ ok: boolean }>
        }
    }
}

export { }
