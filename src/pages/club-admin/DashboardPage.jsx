import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { motion } from 'framer-motion'
import { categoryIcons } from '../../lib/constants'
import { getClubByAdminId } from '../../lib/api/clubs'
import { getEventsByClub } from '../../lib/api/events'
import { getClubMembers } from '../../lib/api/memberships'
import { getClubAnnouncements } from '../../lib/api/announcements'
import { PageLoader } from '../../components/common/LoadingSpinner'
import { Users, Calendar, TrendingUp, BarChart3, ArrowRight, Plus, QrCode, Megaphone, Clock, UserPlus, AlertCircle } from 'lucide-react'

export default function DashboardPage() {
    const { t, i18n } = useTranslation()
    const { user } = useAuth()
    const isRTL = i18n.language === 'ar'
    const [club, setClub] = useState(null)
    const [clubEvents, setClubEvents] = useState([])
    const [members, setMembers] = useState([])
    const [announcements, setAnnouncements] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return
        async function load() {
            try {
                const c = await getClubByAdminId(user.id)
                if (!c) { setLoading(false); return }
                setClub(c)
                const [events, membs, anns] = await Promise.all([
                    getEventsByClub(c.id), getClubMembers(c.id), getClubAnnouncements(c.id),
                ])
                setClubEvents(events); setMembers(membs); setAnnouncements(anns)
            } catch (err) { console.error('ClubAdmin Dashboard error:', err) }
            finally { setLoading(false) }
        }
        load()
    }, [user])

    if (loading) return <PageLoader />
    if (!club) return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 text-center">
            <AlertCircle size={48} className="mx-auto text-text-muted mb-4" />
            <h2 className="text-xl font-bold text-text-primary mb-2">{t('clubAdmin.apply.noClubTitle') || 'No Club Assigned'}</h2>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">{t('clubAdmin.apply.noClubDesc') || "You don't have an assigned club yet. You can apply to start a new club."}</p>
            <Link to="/club-admin/apply" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-bg text-white font-medium hover:shadow-lg hover:shadow-brand-400/20 transition-all">
                {t('clubAdmin.apply.startClubBtn') || 'Apply for a Club'}
                <ArrowRight size={18} className="icon-flip" />
            </Link>
        </div>
    )

    if (club.status === 'pending') return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 text-center">
            <div className="w-16 h-16 bg-status-warning/10 text-status-warning rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock size={32} />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">{t('clubAdmin.apply.pendingTitle') || 'Application Pending'}</h2>
            <p className="text-text-secondary max-w-md mx-auto">{t('clubAdmin.apply.pendingDesc') || 'Your club application is currently under review by the system administrators. You will be notified once it is approved.'}</p>
        </div>
    )

    const approvedMembers = members.filter(m => m.status === 'approved')
    const pendingMembers = members.filter(m => m.status === 'pending')
    const upcomingEvents = clubEvents.filter(e => new Date(e.date) > new Date()).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 3)
    const avgAttendance = clubEvents.length === 0 ? 0 : Math.round(clubEvents.reduce((s, e) => s + (e.registered_count || 0), 0) / clubEvents.length)

    const stats = [
        { label: t('clubAdmin.dashboard.totalMembers'), value: approvedMembers.length, icon: Users, color: 'text-brand-400', bg: 'bg-brand-400/10' },
        { label: t('clubAdmin.dashboard.upcomingEvents'), value: upcomingEvents.length, icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: t('clubAdmin.dashboard.totalEvents'), value: clubEvents.length, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        { label: t('clubAdmin.dashboard.avgAttendance'), value: avgAttendance, icon: BarChart3, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    ]
    const quickActions = [
        { label: t('clubAdmin.events.create'), icon: Plus, to: '/club-admin/events', color: 'text-brand-400', bg: 'bg-brand-400/10' },
        { label: t('clubAdmin.scanner.title'), icon: QrCode, to: '/club-admin/scanner', color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: t('clubAdmin.members.title'), icon: UserPlus, to: '/club-admin/members', color: 'text-purple-400', bg: 'bg-purple-400/10' },
        { label: t('clubAdmin.analytics.title'), icon: BarChart3, to: '/club-admin/analytics', color: 'text-orange-400', bg: 'bg-orange-400/10' },
    ]
    const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
    const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }
    const formatDate = (d) => new Date(d).toLocaleDateString(isRTL ? 'ar-OM' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-8">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary">{t('clubAdmin.dashboard.title')}</h1>
                <p className="text-text-secondary mt-1">{isRTL ? club?.name_ar : club?.name} — {t('clubAdmin.dashboard.title')}</p>
            </motion.div>

            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div key={i} variants={item} className="bg-surface-card border border-surface-border rounded-2xl p-5 hover-lift">
                        <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}><stat.icon size={20} className={stat.color} /></div>
                        <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                        <p className="text-sm text-text-muted mt-0.5">{stat.label}</p>
                    </motion.div>
                ))}
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-text-primary">{t('clubAdmin.dashboard.upcomingEvents')}</h2>
                            <Link to="/club-admin/events" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">{t('common.viewAll')}<ArrowRight size={14} className="icon-flip" /></Link>
                        </div>
                        {upcomingEvents.length > 0 ? (
                            <div className="space-y-3">
                                {upcomingEvents.map(event => (
                                    <div key={event.id} className="bg-surface-card border border-surface-border rounded-2xl p-4 hover:border-brand-400/30 transition-all">
                                        <div className="flex items-start gap-4">
                                            <div className="shrink-0 w-12 h-12 rounded-xl bg-brand-400/10 flex items-center justify-center text-lg">{categoryIcons[event.category]}</div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-text-primary truncate">{isRTL ? event.title_ar : event.title}</h3>
                                                <div className="flex items-center gap-3 mt-1 text-sm text-text-muted">
                                                    <span className="flex items-center gap-1"><Clock size={14} />{formatDate(event.date)}</span>
                                                    <span className="flex items-center gap-1"><Users size={14} />{event.registered_count}/{event.max_capacity}</span>
                                                </div>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-lg font-medium ${event.status === 'published' ? 'bg-status-success/15 text-status-success' : 'bg-status-warning/15 text-status-warning'}`}>{event.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-surface-card border border-surface-border rounded-2xl p-8 text-center"><Calendar size={40} className="mx-auto text-text-muted mb-3" /><p className="text-text-secondary">No upcoming events.</p></div>
                        )}
                    </motion.section>

                    {pendingMembers.length > 0 && (
                        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2"><AlertCircle size={18} className="text-status-warning" />{t('clubAdmin.members.pendingRequests')} ({pendingMembers.length})</h2>
                                <Link to="/club-admin/members" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">{t('common.viewAll')}<ArrowRight size={14} className="icon-flip" /></Link>
                            </div>
                            <div className="space-y-2">
                                {pendingMembers.slice(0, 5).map(member => (
                                    <div key={member.id} className="bg-surface-card border border-surface-border rounded-xl p-3 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400/20 to-brand-600/20 flex items-center justify-center text-brand-400 font-semibold border border-brand-400/20">
                                            {(isRTL ? member.profile?.full_name_ar : member.profile?.full_name)?.charAt(0) || '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-text-primary truncate">{isRTL ? member.profile?.full_name_ar : member.profile?.full_name}</p>
                                            <p className="text-xs text-text-muted">{member.profile?.student_id}</p>
                                        </div>
                                        <span className="text-xs bg-status-warning/15 text-status-warning px-2 py-1 rounded-lg font-medium">Pending</span>
                                    </div>
                                ))}
                            </div>
                        </motion.section>
                    )}
                </div>

                <div className="space-y-6">
                    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-surface-card border border-surface-border rounded-2xl p-5">
                        <h3 className="font-semibold text-text-primary mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            {quickActions.map((action, i) => (
                                <Link key={i} to={action.to} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-text-secondary hover:text-text-primary transition-colors group">
                                    <div className={`w-9 h-9 rounded-lg ${action.bg} flex items-center justify-center shrink-0`}><action.icon size={18} className={action.color} /></div>
                                    <span className="text-sm font-medium">{action.label}</span>
                                    <ArrowRight size={14} className="ms-auto text-text-muted group-hover:text-brand-400 transition-colors icon-flip" />
                                </Link>
                            ))}
                        </div>
                    </motion.section>

                    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-surface-card border border-surface-border rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-text-primary">{t('clubAdmin.announcements.title')}</h3>
                            <Link to="/club-admin/announcements" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">{t('common.viewAll')}</Link>
                        </div>
                        <div className="space-y-3">
                            {announcements.slice(0, 3).map(ann => (
                                <div key={ann.id} className="border-b border-surface-border pb-3 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        {ann.priority === 'high' && <span className="text-xs bg-status-error/15 text-status-error px-1.5 py-0.5 rounded font-medium">!</span>}
                                        <p className="text-sm font-medium text-text-primary truncate">{isRTL ? ann.title_ar : ann.title}</p>
                                    </div>
                                    <p className="text-xs text-text-muted line-clamp-2">{isRTL ? ann.content_ar : ann.content}</p>
                                </div>
                            ))}
                            {announcements.length === 0 && <p className="text-sm text-text-muted text-center py-2">No announcements yet.</p>}
                        </div>
                    </motion.section>
                </div>
            </div>
        </div>
    )
}
