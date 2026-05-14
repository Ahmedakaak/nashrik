import { useState, lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { ROLES } from './lib/constants'

// Layout
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import Footer from './components/layout/Footer'
import ProtectedRoute from './components/layout/ProtectedRoute'
import { PageLoader } from './components/common/LoadingSpinner'

// Auth Pages (Keep static to avoid loading delay on entry)
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'

// Public Pages
import LandingPage from './pages/LandingPage'
import NotFoundPage from './pages/NotFoundPage'

// Lazy loaded Student Pages
const DashboardPage = lazy(() => import('./pages/student/DashboardPage'))
const EventsPage = lazy(() => import('./pages/student/EventsPage'))
const EventDetailsPage = lazy(() => import('./pages/student/EventDetailsPage'))
const ClubsPage = lazy(() => import('./pages/student/ClubsPage'))
const ClubProfilePage = lazy(() => import('./pages/student/ClubProfilePage'))
const MyRegistrationsPage = lazy(() => import('./pages/student/MyRegistrationsPage'))
const MyClubsPage = lazy(() => import('./pages/student/MyClubsPage'))

// Lazy loaded Club Admin Pages
const ClubAdminDashboardPage = lazy(() => import('./pages/club-admin/DashboardPage'))
const EventManagementPage = lazy(() => import('./pages/club-admin/EventManagementPage'))
const QRScannerPage = lazy(() => import('./pages/club-admin/QRScannerPage'))
const MemberManagementPage = lazy(() => import('./pages/club-admin/MemberManagementPage'))
const AnnouncementsPage = lazy(() => import('./pages/club-admin/AnnouncementsPage'))
const AnalyticsPage = lazy(() => import('./pages/club-admin/AnalyticsPage'))
const ClubApplicationPage = lazy(() => import('./pages/club-admin/ClubApplicationPage'))

// Lazy loaded System Admin Pages
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'))
const UserManagementPage = lazy(() => import('./pages/admin/UserManagementPage'))
const ClubApprovalPage = lazy(() => import('./pages/admin/ClubApprovalPage'))
const AdminEventManagementPage = lazy(() => import('./pages/admin/AdminEventManagementPage'))
const ReportsPage = lazy(() => import('./pages/admin/ReportsPage'))

// Lazy loaded Shared Pages
const NotificationsPage = lazy(() => import('./pages/shared/NotificationsPage'))
const SettingsPage = lazy(() => import('./pages/shared/SettingsPage'))

// UI Components
import ErrorBoundary from './components/ui/ErrorBoundary'

export default function App() {
    const { user } = useAuth()
    const location = useLocation()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password'].includes(location.pathname)
    const isLandingPage = location.pathname === '/'
    const showSidebar = user && !isAuthPage && !isLandingPage

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header - shown on all pages except auth */}
            {!isAuthPage && (
                <Header
                    onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
                    isSidebarOpen={sidebarOpen}
                />
            )}

            <div className="flex flex-1">
                {/* Sidebar - shown only for authenticated users on non-auth, non-landing pages */}
                {showSidebar && (
                    <Sidebar
                        isOpen={sidebarOpen}
                        onClose={() => setSidebarOpen(false)}
                    />
                )}

                {/* Main Content */}
                <main className={`flex-1 ${showSidebar ? 'md:ms-64' : ''}`}>
                    <ErrorBoundary>
                        <Suspense fallback={<PageLoader />}>
                            <Routes>
                                {/* Public Routes */}
                                <Route path="/" element={<LandingPage />} />
                                <Route path="/login" element={<LoginPage />} />
                                <Route path="/signup" element={<SignupPage />} />
                                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                                <Route path="/reset-password" element={<ResetPasswordPage />} />

                                {/* Student Protected Routes */}
                                <Route path="/dashboard" element={
                                    <ProtectedRoute>
                                        <DashboardPage />
                                    </ProtectedRoute>
                                } />
                                <Route path="/events" element={
                                    <ProtectedRoute>
                                        <EventsPage />
                                    </ProtectedRoute>
                                } />
                                <Route path="/events/:id" element={
                                    <ProtectedRoute>
                                        <EventDetailsPage />
                                    </ProtectedRoute>
                                } />
                                <Route path="/clubs" element={
                                    <ProtectedRoute>
                                        <ClubsPage />
                                    </ProtectedRoute>
                                } />
                                <Route path="/clubs/:id" element={
                                    <ProtectedRoute>
                                        <ClubProfilePage />
                                    </ProtectedRoute>
                                } />
                                <Route path="/my-registrations" element={
                                    <ProtectedRoute>
                                        <MyRegistrationsPage />
                                    </ProtectedRoute>
                                } />
                                <Route path="/my-clubs" element={
                                    <ProtectedRoute>
                                        <MyClubsPage />
                                    </ProtectedRoute>
                                } />
                                <Route path="/notifications" element={
                                    <ProtectedRoute>
                                        <NotificationsPage />
                                    </ProtectedRoute>
                                } />
                                <Route path="/settings" element={
                                    <ProtectedRoute>
                                        <SettingsPage />
                                    </ProtectedRoute>
                                } />

                                {/* Club Admin Protected Routes */}
                                <Route path="/club-admin/dashboard" element={
                                    <ProtectedRoute allowedRoles={[ROLES.CLUB_ADMIN, ROLES.SYSTEM_ADMIN]}>
                                        <ClubAdminDashboardPage />
                                    </ProtectedRoute>
                                } />
                                <Route path="/club-admin/events" element={
                                    <ProtectedRoute allowedRoles={[ROLES.CLUB_ADMIN, ROLES.SYSTEM_ADMIN]}>
                                        <EventManagementPage />
                                    </ProtectedRoute>
                                } />
                                <Route path="/club-admin/scanner" element={
                                    <ProtectedRoute allowedRoles={[ROLES.CLUB_ADMIN, ROLES.SYSTEM_ADMIN]}>
                                        <QRScannerPage />
                                    </ProtectedRoute>
                                } />
                                <Route path="/club-admin/members" element={
                                    <ProtectedRoute allowedRoles={[ROLES.CLUB_ADMIN, ROLES.SYSTEM_ADMIN]}>
                                        <MemberManagementPage />
                                    </ProtectedRoute>
                                } />
                                <Route path="/club-admin/announcements" element={
                                    <ProtectedRoute allowedRoles={[ROLES.CLUB_ADMIN, ROLES.SYSTEM_ADMIN]}>
                                        <AnnouncementsPage />
                                    </ProtectedRoute>
                                } />
                                <Route path="/club-admin/analytics" element={
                                    <ProtectedRoute allowedRoles={[ROLES.CLUB_ADMIN, ROLES.SYSTEM_ADMIN]}>
                                        <AnalyticsPage />
                                    </ProtectedRoute>
                                } />
                                <Route path="/club-admin/apply" element={
                                    <ProtectedRoute allowedRoles={[ROLES.CLUB_ADMIN, ROLES.SYSTEM_ADMIN]}>
                                        <ClubApplicationPage />
                                    </ProtectedRoute>
                                } />

                                {/* System Admin Protected Routes */}
                                <Route path="/admin/dashboard" element={
                                    <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN]}>
                                        <AdminDashboardPage />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/users" element={
                                    <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN]}>
                                        <UserManagementPage />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/clubs" element={
                                    <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN]}>
                                        <ClubApprovalPage />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/events" element={
                                    <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN]}>
                                        <AdminEventManagementPage />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/reports" element={
                                    <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN]}>
                                        <ReportsPage />
                                    </ProtectedRoute>
                                } />

                                {/* Unauthorized */}
                                <Route path="/unauthorized" element={
                                    <div className="flex items-center justify-center min-h-[60vh] page-enter">
                                        <div className="text-center space-y-4">
                                            <div className="w-20 h-20 rounded-2xl bg-status-error/10 flex items-center justify-center mx-auto">
                                                <span className="text-4xl">🔒</span>
                                            </div>
                                            <h2 className="text-2xl font-bold text-text-primary">Unauthorized</h2>
                                            <p className="text-text-secondary">You don't have permission to access this page.</p>
                                        </div>
                                    </div>
                                } />

                                {/* 404 */}
                                <Route path="*" element={<NotFoundPage />} />
                            </Routes>
                        </Suspense>
                    </ErrorBoundary>
                </main>
            </div>

            {/* Footer - shown on landing page and when not on auth pages */}
            {!isAuthPage && <Footer />}
        </div>
    )
}
