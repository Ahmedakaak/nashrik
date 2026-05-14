import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { categoryColors, categoryIcons } from '../../lib/constants'
import { getEvents } from '../../lib/api/events'
import { getMyRegistrations } from '../../lib/api/registrations'
import { getMyMemberships } from '../../lib/api/memberships'
import { PageLoader } from '../../components/common/LoadingSpinner'
import { motion } from 'framer-motion'
import {
    Calendar, Clock, MapPin, ArrowRight, Users,
    CalendarDays, BookOpen, ClipboardList, TrendingUp, Sparkles
} from 'lucide-react'

export default function DashboardPage() {
    const { t, i18n } = useTranslation()
    const { profile, user } = useAuth()
    const isRTL = i18n.language === 'ar'

    const [registrations, setRegistrations] = useState([])
    const [memberships, setMemberships] = useState([])
    const [allEvents, setAllEvents] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return
        async function load() {
            try {
                const [regs, membs, events] = await Promise.all([
                    getMyRegistrations(user.id),
                    getMyMemberships(user.id),
                    getEvents({ status: 'published' }),
                ])
                setRegistrations(regs)
                setMemberships(membs)
                setAllEvents(events)
            } catch (err) {
                console.error('Dashboard load error:', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [user])

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return t('common.morning')
        if (hour < 17) return t('common.afternoon')
        return t('common.evening')
    }

    const firstName = profile?.full_name?.split(' ')[0] || 'Student'

    // My upcoming events (registered)
    const myUpcomingEvents = useMemo(() => {
        const regEventIds = registrations.map(r => r.event_id || r.event?.id)
        return allEvents
            .filter(e => regEventIds.includes(e.id) && new Date(e.date) > new Date())
            .sort((a, b) => new Date(a.date) - new Date(b.date))
    }, [registrations, allEvents])

    // Recommended events (not registered yet, upcoming)
    const recommendedEvents = useMemo(() => {
        const regEventIds = registrations.map(r => r.event_id || r.event?.id)
        return allEvents
            .filter(e => !regEventIds.includes(e.id) && new Date(e.date) > new Date())
            .slice(0, 3)
    }, [registrations, allEvents])

    // My clubs
    const myClubs = useMemo(() => {
        return memberships
            .filter(m => m.status === 'approved')
            .map(m => m.club)
            .filter(Boolean)
    }, [memberships])

    const attendedCount = useMemo(() => {
        return registrations.filter(r => r.attended).length
    }, [registrations])

    const formatDate = (dateStr) => {
        const d = new Date(dateStr)
        return d.toLocaleDateString(isRTL ? 'ar-OM' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    }

    const formatTime = (dateStr) => {
        const d = new Date(dateStr)
        return d.toLocaleTimeString(isRTL ? 'ar-OM' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    }

    const stats = [
        { label: t('dashboard.quickActions.browseEvents'), value: registrations.length, icon: CalendarDays, color: 'text-brand-400', bg: 'bg-brand-400/10' },
        { label: t('dashboard.quickActions.myClubs'), value: myClubs.length, icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        { label: t('dashboard.quickActions.myRegistrations'), value: registrations.length, icon: ClipboardList, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: 'Events Attended', value: attendedCount, icon: TrendingUp, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    ]

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.08 } },
    }
    const item = {
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0 },
    }

    if (loading) return <PageLoader />

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-8">
            {/* Greeting */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
                    {t('dashboard.greeting', { timeOfDay: getGreeting(), name: firstName })}
                </h1>
                <p className="text-text-secondary mt-1">Here's what's happening on campus today.</p>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        variants={item}
                        className="bg-surface-card border border-surface-border rounded-2xl p-5 hover-lift"
                    >
                        <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                            <stat.icon size={20} className={stat.color} />
                        </div>
                        <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                        <p className="text-sm text-text-muted mt-0.5">{stat.label}</p>
                    </motion.div>
                ))}
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Content — Upcoming Events */}
                <div className="lg:col-span-2 space-y-6">
                    {/* My Upcoming Events */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-text-primary">{t('dashboard.upcoming')}</h2>
                            <Link to="/my-registrations" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">
                                {t('common.viewAll')}
                                <ArrowRight size={14} className="icon-flip" />
                            </Link>
                        </div>

                        {myUpcomingEvents.length > 0 ? (
                            <div className="space-y-3">
                                {myUpcomingEvents.map((event) => {
                                    const colors = categoryColors[event.category] || categoryColors.academic
                                    return (
                                        <Link
                                            key={event.id}
                                            to={`/events/${event.id}`}
                                            className="block bg-surface-card border border-surface-border rounded-2xl p-4 hover:border-brand-400/30 transition-all duration-200 group"
                                        >
                                            <div className="flex items-start gap-4">
                                                {/* Date badge */}
                                                <div className="shrink-0 w-14 h-14 rounded-xl bg-brand-400/10 flex flex-col items-center justify-center text-brand-400 border border-brand-400/20">
                                                    <span className="text-xs font-medium">
                                                        {new Date(event.date).toLocaleDateString(isRTL ? 'ar-OM' : 'en-US', { month: 'short' })}
                                                    </span>
                                                    <span className="text-lg font-bold leading-none">
                                                        {new Date(event.date).getDate()}
                                                    </span>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${colors.bg} ${colors.text}`}>
                                                            {categoryIcons[event.category]} {event.category}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-semibold text-text-primary group-hover:text-brand-400 transition-colors truncate">
                                                        {isRTL ? event.title_ar : event.title}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-text-muted">
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={14} />
                                                            {formatTime(event.date)}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <MapPin size={14} />
                                                            {isRTL ? event.location_ar : event.location}
                                                        </span>
                                                    </div>
                                                </div>

                                                <ArrowRight size={18} className="text-text-muted group-hover:text-brand-400 transition-colors mt-1 icon-flip shrink-0" />
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="bg-surface-card border border-surface-border rounded-2xl p-8 text-center">
                                <Calendar size={40} className="mx-auto text-text-muted mb-3" />
                                <p className="text-text-secondary">No upcoming registrations.</p>
                                <Link to="/events" className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 text-sm mt-2 transition-colors">
                                    {t('dashboard.quickActions.browseEvents')}
                                    <ArrowRight size={14} className="icon-flip" />
                                </Link>
                            </div>
                        )}
                    </motion.section>

                    {/* Recommended Events */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles size={18} className="text-brand-400" />
                            <h2 className="text-lg font-semibold text-text-primary">
                                {t('dashboard.tabs.recommended')}
                            </h2>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recommendedEvents.map((event) => {
                                const colors = categoryColors[event.category] || categoryColors.academic
                                const spotsLeft = event.max_capacity - event.registered_count
                                const isFull = spotsLeft <= 0

                                return (
                                    <Link
                                        key={event.id}
                                        to={`/events/${event.id}`}
                                        className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden hover:border-brand-400/30 transition-all duration-200 group hover-lift"
                                    >
                                        {/* Cover placeholder */}
                                        <div className={`h-28 ${colors.bg} flex items-center justify-center`}>
                                            <span className="text-4xl">{categoryIcons[event.category]}</span>
                                        </div>

                                        <div className="p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${colors.bg} ${colors.text}`}>
                                                    {event.category}
                                                </span>
                                                {isFull && (
                                                    <span className="text-xs px-2 py-0.5 rounded-md bg-status-error/15 text-status-error font-medium">
                                                        {t('events.full')}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="font-semibold text-text-primary text-sm group-hover:text-brand-400 transition-colors line-clamp-1">
                                                {isRTL ? event.title_ar : event.title}
                                            </h3>
                                            <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
                                                <Calendar size={12} />
                                                {formatDate(event.date)}
                                            </p>
                                            <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
                                                <Users size={12} />
                                                {event.registered_count}/{event.max_capacity}
                                            </p>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </motion.section>
                </div>

                {/* Sidebar — Quick Actions + My Clubs */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-surface-card border border-surface-border rounded-2xl p-5"
                    >
                        <h3 className="font-semibold text-text-primary mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <Link
                                to="/events"
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-text-secondary hover:text-text-primary transition-colors group"
                            >
                                <div className="w-9 h-9 rounded-lg bg-brand-400/10 flex items-center justify-center shrink-0">
                                    <Calendar size={18} className="text-brand-400" />
                                </div>
                                <span className="text-sm font-medium">{t('dashboard.quickActions.browseEvents')}</span>
                                <ArrowRight size={14} className="ms-auto text-text-muted group-hover:text-brand-400 transition-colors icon-flip" />
                            </Link>
                            <Link
                                to="/clubs"
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-text-secondary hover:text-text-primary transition-colors group"
                            >
                                <div className="w-9 h-9 rounded-lg bg-purple-400/10 flex items-center justify-center shrink-0">
                                    <Users size={18} className="text-purple-400" />
                                </div>
                                <span className="text-sm font-medium">{t('nav.clubs')}</span>
                                <ArrowRight size={14} className="ms-auto text-text-muted group-hover:text-brand-400 transition-colors icon-flip" />
                            </Link>
                            <Link
                                to="/my-registrations"
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-text-secondary hover:text-text-primary transition-colors group"
                            >
                                <div className="w-9 h-9 rounded-lg bg-blue-400/10 flex items-center justify-center shrink-0">
                                    <ClipboardList size={18} className="text-blue-400" />
                                </div>
                                <span className="text-sm font-medium">{t('dashboard.quickActions.myRegistrations')}</span>
                                <ArrowRight size={14} className="ms-auto text-text-muted group-hover:text-brand-400 transition-colors icon-flip" />
                            </Link>
                        </div>
                    </motion.section>

                    {/* My Clubs */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-surface-card border border-surface-border rounded-2xl p-5"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-text-primary">{t('dashboard.quickActions.myClubs')}</h3>
                            <Link to="/my-clubs" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                                {t('common.viewAll')}
                            </Link>
                        </div>

                        {myClubs.length > 0 ? (
                            <div className="space-y-3">
                                {myClubs.map((club) => (
                                    <Link
                                        key={club.id}
                                        to={`/clubs/${club.id}`}
                                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400/20 to-brand-600/20 flex items-center justify-center text-lg border border-brand-400/20 shrink-0">
                                            {categoryIcons[club.category]}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-text-primary truncate group-hover:text-brand-400 transition-colors">
                                                {isRTL ? club.name_ar : club.name}
                                            </p>
                                            <p className="text-xs text-text-muted">
                                                {t('clubs.members', { count: club.member_count })}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <Users size={28} className="mx-auto text-text-muted mb-2" />
                                <p className="text-sm text-text-secondary">No clubs joined yet.</p>
                                <Link to="/clubs" className="text-xs text-brand-400 hover:text-brand-300 mt-1 inline-block transition-colors">
                                    Browse Clubs
                                </Link>
                            </div>
                        )}
                    </motion.section>
                </div>
            </div>
        </div>
    )
}
