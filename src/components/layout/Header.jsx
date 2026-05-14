import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import {
    Menu, X, Bell, Globe, LogOut, User, Settings,
    ChevronDown
} from 'lucide-react'
import { cn, getInitials } from '../../lib/utils'
import { getNotifications, subscribeToNotifications } from '../../lib/api/notifications'
import toast from 'react-hot-toast'

export default function Header({ onMenuToggle, isSidebarOpen }) {
    const { t, i18n } = useTranslation()
    const { user, profile, signOut } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [showNotifs, setShowNotifs] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)

    const isRTL = i18n.language === 'ar'

    useEffect(() => {
        if (!user) return

        let mounted = true
        async function loadUnread() {
            try {
                const data = await getNotifications(user.id)
                const unread = data.filter(n => !n.read)
                if (mounted) {
                    setUnreadCount(unread.length)
                    if (unread.length > 0 && !sessionStorage.getItem('notif_greeted')) {
                        sessionStorage.setItem('notif_greeted', 'true')
                        toast(
                            <div className="flex items-center gap-2">
                                <span className="text-lg">🔔</span>
                                <span className="font-medium">You have {unread.length} unread {unread.length === 1 ? 'notification' : 'notifications'}</span>
                            </div>, 
                            { duration: 5000, position: 'top-center' }
                        )
                    }
                }
            } catch (err) {
                console.error('Error loading notifications:', err)
            }
        }
        loadUnread()

        const channel = subscribeToNotifications(user.id, (newNotif) => {
            console.log('🔔 [REALTIME] Received new notification:', newNotif)
            if (mounted) {
                setUnreadCount(prev => prev + 1)
                toast(
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-400/20 flex items-center justify-center shrink-0">
                            <Bell size={16} className="text-brand-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-text-primary truncate">{isRTL ? newNotif.title_ar : newNotif.title}</p>
                            <p className="text-xs text-text-secondary line-clamp-1">{isRTL ? newNotif.message_ar : newNotif.message}</p>
                        </div>
                    </div>,
                    { duration: 5000, position: 'top-center' }
                )
            }
        })

        return () => {
            mounted = false
            if (channel) channel.unsubscribe()
        }
    }, [user, isRTL])

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'ar' : 'en'
        i18n.changeLanguage(newLang)
        document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr'
        document.documentElement.lang = newLang
    }

    const handleSignOut = async () => {
        await signOut()
        navigate('/login')
        setShowUserMenu(false)
    }

    const isLandingPage = location.pathname === '/'

    return (
        <header className={cn(
            'sticky top-0 z-40 border-b border-surface-border',
            isLandingPage ? 'glass' : 'bg-surface-darker/95 backdrop-blur-md'
        )}>
            <div className="flex items-center justify-between h-16 px-4 md:px-6 max-w-7xl mx-auto w-full">
                {/* Left: Menu + Logo */}
                <div className="flex items-center gap-3">
                    {user && (
                        <button
                            onClick={onMenuToggle}
                            className="p-2 rounded-lg hover:bg-white/5 text-text-secondary md:hidden"
                            aria-label="Toggle menu"
                        >
                            {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    )}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-brand-400/20 group-hover:shadow-brand-400/40 transition-shadow">
                            N
                        </div>
                        <span className="text-xl font-bold text-text-primary hidden sm:block">
                            {t('app.name')}
                        </span>
                    </Link>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    {/* Language Toggle */}
                    <button
                        onClick={toggleLanguage}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-white/5 text-text-secondary hover:text-text-primary transition-colors text-sm"
                        aria-label="Toggle language"
                    >
                        <Globe size={18} />
                        <span className="hidden sm:inline">{isRTL ? 'EN' : 'عربي'}</span>
                    </button>

                    {user ? (
                        <>
                            {/* Notifications */}
                            <button
                                onClick={() => navigate('/notifications')}
                                className="relative p-2 rounded-xl hover:bg-white/5 text-text-secondary hover:text-text-primary transition-colors"
                                aria-label="Notifications"
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-brand-400 rounded-full" />}
                            </button>

                            {/* User Menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2 p-1.5 pe-3 rounded-xl hover:bg-white/5 transition-colors"
                                    aria-label="User menu"
                                >
                                    <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
                                        {profile?.avatar_url ? (
                                            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            getInitials(profile?.full_name)
                                        )}
                                    </div>
                                    <span className="text-sm text-text-primary hidden md:block max-w-[120px] truncate">
                                        {profile?.full_name || 'User'}
                                    </span>
                                    <ChevronDown size={14} className="text-text-muted hidden md:block" />
                                </button>

                                {showUserMenu && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                                        <div className="absolute end-0 mt-2 w-56 bg-surface-dark border border-surface-border rounded-xl shadow-2xl z-50 py-1 animate-slide-down">
                                            <div className="px-4 py-3 border-b border-surface-border">
                                                <p className="text-sm font-medium text-text-primary truncate">{profile?.full_name || 'User'}</p>
                                                <p className="text-xs text-text-muted truncate">{user.email}</p>
                                                <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-brand-400/15 text-brand-400 capitalize">
                                                    {profile?.role?.replace('_', ' ') || 'Student'}
                                                </span>
                                            </div>
                                            <Link
                                                to="/settings"
                                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                <Settings size={16} />
                                                {t('nav.settings')}
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={handleSignOut}
                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-status-error hover:bg-status-error/5 transition-colors text-start"
                                            >
                                                <LogOut size={16} />
                                                {t('nav.logout')}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                to="/login"
                                className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
                            >
                                {t('nav.login')}
                            </Link>
                            <Link
                                to="/signup"
                                className="px-4 py-2 text-sm rounded-xl gradient-bg text-white font-medium hover:shadow-lg hover:shadow-brand-400/20 transition-shadow"
                            >
                                {t('nav.signup')}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
