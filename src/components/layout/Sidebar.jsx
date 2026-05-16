import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { ROLES } from '../../lib/constants'
import { cn } from '../../lib/utils'
import {
    LayoutDashboard, Calendar, Users, BookOpen,
    ClipboardList, QrCode, BarChart3, UserCog,
    Shield, FileText, Megaphone, Settings, Bell,
    ScanLine, UsersRound
} from 'lucide-react'

const studentLinks = [
    { path: '/dashboard', icon: LayoutDashboard, key: 'nav.dashboard' },
    { path: '/events', icon: Calendar, key: 'nav.events' },
    { path: '/clubs', icon: Users, key: 'nav.clubs' },
    { path: '/my-registrations', icon: ClipboardList, key: 'nav.myRegistrations' },
    { path: '/my-clubs', icon: BookOpen, key: 'nav.myClubs' },
    { path: '/notifications', icon: Bell, key: 'nav.notifications' },
]

const clubAdminLinks = [
    { path: '/club-admin/dashboard', icon: LayoutDashboard, key: 'clubAdmin.dashboard.title' },
    { path: '/club-admin/events', icon: Calendar, key: 'clubAdmin.events.title' },
    { path: '/club-admin/scanner', icon: ScanLine, key: 'clubAdmin.scanner.title' },
    { path: '/club-admin/members', icon: UsersRound, key: 'clubAdmin.members.title' },
    { path: '/club-admin/announcements', icon: Megaphone, key: 'clubAdmin.announcements.title' },
    { path: '/club-admin/analytics', icon: BarChart3, key: 'clubAdmin.analytics.title' },
]

const adminLinks = [
    { path: '/admin/dashboard', icon: LayoutDashboard, key: 'admin.dashboard.title' },
    { path: '/admin/users', icon: UserCog, key: 'admin.users.title' },
    { path: '/admin/clubs', icon: Shield, key: 'admin.clubs.title' },
    { path: '/admin/events', icon: Calendar, key: 'admin.events.title' },
    { path: '/admin/reports', icon: FileText, key: 'admin.reports.title' },
]

export default function Sidebar({ isOpen, onClose }) {
    const { t, i18n } = useTranslation()
    const { profile } = useAuth()
    const isRTL = i18n.language === 'ar'

    const getLinks = () => {
        switch (profile?.role) {
            case ROLES.CLUB_ADMIN:
                return clubAdminLinks
            case ROLES.SYSTEM_ADMIN:
                return adminLinks
            default:
                return studentLinks
        }
    }

    const links = getLinks()

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed top-16 bottom-0 start-0 z-30 w-64 bg-surface-darker border-e border-surface-border',
                    'transition-transform duration-300 ease-in-out',
                    'md:translate-x-0',
                    isOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full',
                )}
            >
                <nav className="p-4 space-y-1 overflow-y-auto h-full">
                    {/* Role Badge */}
                    <div className="mb-4 px-3">
                        <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                            {profile?.role?.replace('_', ' ')}
                        </span>
                    </div>

                    {links.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            onClick={onClose}
                            className={({ isActive }) =>
                                cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                                    isActive
                                        ? 'bg-brand-400/10 text-brand-400 border border-brand-400/20'
                                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                                )
                            }
                        >
                            <link.icon size={20} />
                            <span>{t(link.key)}</span>
                        </NavLink>
                    ))}

                    {/* Settings link at bottom */}
                    <div className="pt-4 mt-4 border-t border-surface-border">
                        <NavLink
                            to="/settings"
                            onClick={onClose}
                            className={({ isActive }) =>
                                cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                                    isActive
                                        ? 'bg-brand-400/10 text-brand-400 border border-brand-400/20'
                                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                                )
                            }
                        >
                            <Settings size={20} />
                            <span>{t('nav.settings')}</span>
                        </NavLink>
                    </div>
                </nav>
            </aside>
        </>
    )
}
