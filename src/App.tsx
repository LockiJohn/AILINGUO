import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useUserStore } from './store/userStore'
import Sidebar from './components/layout/Sidebar'
import OnboardingScreen from './screens/Onboarding/OnboardingScreen'
import DashboardScreen from './screens/Dashboard/DashboardScreen'
import CourseMapScreen from './screens/CourseMap/CourseMapScreen'
import LessonScreen from './screens/Lesson/LessonScreen'
import ExerciseScreen from './screens/Exercise/ExerciseScreen'
import ResultsScreen from './screens/Results/ResultsScreen'
import ReviewScreen from './screens/Review/ReviewScreen'
import StatsScreen from './screens/Stats/StatsScreen'
import SettingsScreen from './screens/Settings/SettingsScreen'

function AppLayout() {
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<DashboardScreen />} />
                    <Route path="/course" element={<CourseMapScreen />} />
                    <Route path="/lesson/:lessonId" element={<LessonScreen />} />
                    <Route path="/exercise" element={<ExerciseScreen />} />
                    <Route path="/results" element={<ResultsScreen />} />
                    <Route path="/review" element={<ReviewScreen />} />
                    <Route path="/stats" element={<StatsScreen />} />
                    <Route path="/settings" element={<SettingsScreen />} />
                </Routes>
            </main>
        </div>
    )
}

export default function App() {
    const { user, isLoading, loadUser } = useUserStore()
    const navigate = useNavigate()

    useEffect(() => {
        loadUser()
    }, [loadUser])

    if (isLoading) {
        return (
            <div className="flex flex-col flex-center" style={{ height: '100vh' }}>
                <div className="animate-pulse gradient-text" style={{ fontSize: '2rem', fontWeight: 800 }}>
                    AILINGO
                </div>
                <p className="text-muted" style={{ marginTop: 8 }}>Avvio in corso…</p>
            </div>
        )
    }

    // Show onboarding if no user or onboarding incomplete
    if (!user || !user.onboarding_complete) {
        return (
            <Routes>
                <Route path="*" element={<OnboardingScreen />} />
            </Routes>
        )
    }

    return <AppLayout />
}
