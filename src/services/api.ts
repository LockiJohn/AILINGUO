const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_URL}/api${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
}

export const api = {
    // Lesson & content
    getLevels: () => fetchAPI('/lessons/levels'),
    getUnits: (levelCode: string) => fetchAPI(`/lessons/units/${levelCode}`),
    getUnitLessons: (unitId: number) => fetchAPI(`/lessons/unit/${unitId}/lessons`),
    getLesson: (lessonId: number) => fetchAPI(`/lessons/lesson/${lessonId}`),
    getLessonExercises: (lessonId: number) => fetchAPI(`/lessons/lesson/${lessonId}/exercises`),
    getQuickSession: () => fetchAPI('/lessons/quick-session'),

    // Progress
    getUser: () => fetchAPI('/users/current'),
    getAllUsers: () => fetchAPI('/users/all'),
    switchUser: (userId: number) => fetchAPI('/users/switch', {
        method: 'POST',
        body: JSON.stringify({ userId }),
    }),
    createUser: (name: string, level: string) => fetchAPI('/users/create', {
        method: 'POST',
        body: JSON.stringify({ name, level }),
    }),
    createDemoProfile: () => fetchAPI('/users/demo', { method: 'POST' }),
    getUserStats: () => fetchAPI('/users/stats'),
    saveExerciseResult: (result: { exerciseId: number; userAnswer: string; isCorrect: boolean; responseTimeMs: number }) => fetchAPI('/progress/exercise', {
        method: 'POST',
        body: JSON.stringify(result)
    }),
    completeLesson: (lessonId: number, accuracy: number, xpEarned: number) => fetchAPI('/progress/lesson', {
        method: 'POST',
        body: JSON.stringify({ lessonId, accuracy, xpEarned })
    }),

    // Spaced repetition / review
    getReviewQueue: () => fetchAPI('/progress/review-queue'),
    updateReviewItem: (exerciseId: number, quality: number) => fetchAPI('/progress/review-item', {
        method: 'POST',
        body: JSON.stringify({ exerciseId, quality }),
    }),
    getWeakWords: () => fetchAPI('/progress/weak-words'),

    // Gamification
    getBadges: () => fetchAPI('/progress/badges'),
    getStudySessions: (days: number) => fetchAPI(`/progress/study-sessions?days=${days}`),
    startSession: () => fetchAPI('/progress/session/start', { method: 'POST' }),
    endSession: (sessionId: number, xpEarned: number, exerciseCount: number, accuracy: number) => fetchAPI('/progress/session/end', {
        method: 'POST',
        body: JSON.stringify({ sessionId, xpEarned, exerciseCount, accuracy })
    }),

    // Content Reload
    reloadContent: (levelCode: string) => fetchAPI('/content/reload', {
        method: 'POST',
        body: JSON.stringify({ levelCode })
    })
};
