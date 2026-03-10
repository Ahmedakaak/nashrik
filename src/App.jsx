import { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { ROLES } from './lib/constants'

// Layout
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import Footer from './components/layout/Footer'
import ProtectedRoute from './components/layout/ProtectedRoute'

// Auth Pages
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'

// Public Pages
import LandingPage from './pages/LandingPage'
import NotFoundPage from './pages/NotFoundPage'

// Student Pages
import DashboardPage from './pages/student/DashboardPage'
import EventsPage from './pages/student/EventsPage'
import EventDetailsPage from './pages/student/EventDetailsPage'
import ClubsPage from './pages/student/ClubsPage'
import ClubProfilePage from './pages/student/ClubProfilePage'
import MyRegistrationsPage from './pages/student/MyRegistrationsPage'

// Club Admin Pages
import ClubAdminDashboardPage from './pages/club-admin/DashboardPage'
import EventManagementPage from './pages/club-admin/EventManagementPage'
import QRScannerPage from './pages/club-admin/QRScannerPage'
import MemberManagementPage from './pages/club-admin/MemberManagementPage'
import AnnouncementsPage from './pages/club-admin/AnnouncementsPage'
import AnalyticsPage from './pages/club-admin/AnalyticsPage'

// System Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import UserManagementPage from './pages/admin/UserManagementPage'
import ClubApprovalPage from './pages/admin/ClubApprovalPage'
import AdminEventManagementPage from './pages/admin/AdminEventManagementPage'
import ReportsPage from './pages/admin/ReportsPage'

// Shared Pages
import NotificationsPage from './pages/shared/NotificationsPage'
import SettingsPage from './pages/shared/SettingsPage'

// UI Components
import ErrorBoundary from './components/ui/ErrorBoundary'

// Placeholder for future pages
function ComingSoon({ title }) {
    return (
        <div className="flex items-center justify-center min-h-[60vh] page-enter">
            <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-2xl gradient-bg-subtle flex items-center justify-center mx-auto">
                    <span className="text-4xl">🚧</span>
                </div>
                <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
                <p className="text-text-secondary">This page is coming soon!</p>
            </div>
        </div>
    )
}

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
                                    <ComingSoon title="My Clubs" />
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
                    </ErrorBoundary>
                </main>
            </div>

            {/* Footer - shown on landing page and when not on auth pages */}
            {!isAuthPage && <Footer />}
        </div>
    )
}
