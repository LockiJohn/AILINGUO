import { contextBridge, ipcRenderer } from 'electron'

// Expose safe IPC bridge to the renderer process
contextBridge.exposeInMainWorld('ailingo', {
    // Lesson & content
    getLevels: () => ipcRenderer.invoke('get-levels'),
    getUnits: (levelCode: string) => ipcRenderer.invoke('get-units', levelCode),
    getUnitLessons: (unitId: number) => ipcRenderer.invoke('get-unit-lessons', unitId),
    getLesson: (lessonId: number) => ipcRenderer.invoke('get-lesson', lessonId),
    getLessonExercises: (lessonId: number) => ipcRenderer.invoke('get-lesson-exercises', lessonId),


    // Progress
    getUser: () => ipcRenderer.invoke('get-user'),
    createUser: (name: string, level: string) => ipcRenderer.invoke('create-user', name, level),
    getUserStats: () => ipcRenderer.invoke('get-user-stats'),
    saveExerciseResult: (result: ExerciseResult) => ipcRenderer.invoke('save-exercise-result', result),
    completLesson: (lessonId: number, accuracy: number, xpEarned: number) =>
        ipcRenderer.invoke('complete-lesson', lessonId, accuracy, xpEarned),

    // Spaced repetition / review
    getReviewQueue: () => ipcRenderer.invoke('get-review-queue'),
    updateReviewItem: (exerciseId: number, quality: number) =>
        ipcRenderer.invoke('update-review-item', exerciseId, quality),

    // Gamification
    getBadges: () => ipcRenderer.invoke('get-badges'),
    getStudySessions: (days: number) => ipcRenderer.invoke('get-study-sessions', days),
    startSession: () => ipcRenderer.invoke('start-session'),
    endSession: (sessionId: number, xpEarned: number, exerciseCount: number, accuracy: number) =>
        ipcRenderer.invoke('end-session', sessionId, xpEarned, exerciseCount, accuracy),
})

export interface ExerciseResult {
    exerciseId: number
    userAnswer: string
    isCorrect: boolean
    responseTimeMs: number
}
