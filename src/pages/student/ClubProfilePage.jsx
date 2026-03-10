import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { mockClubs, mockEvents, mockMemberships, categoryColors, categoryIcons } from '../../lib/mockData'
import { CLUB_CATEGORIES } from '../../lib/constants'
import { motion } from 'framer-motion'
import {
    ArrowLeft, Users, Calendar, UserPlus, CheckCircle2,
    AlertCircle, Clock, MapPin
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ClubProfilePage() {
    const { id } = useParams()
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'

    const club = mockClubs.find(c => c.id === id)
    const isMember = mockMemberships.some(m => m.club_id === id)
    const [joined, setJoined] = useState(isMember)
    const [activeTab, setActiveTab] = useState('about')

    if (!club) {
        return (
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 text-center">
                <AlertCircle size={48} className="mx-auto text-text-muted mb-4" />
                <h2 className="text-xl font-bold text-text-primary mb-2">Club Not Found</h2>
                <Link to="/clubs" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                    ← {t('common.back')} to clubs
                </Link>
            </div>
        )
    }

    const colors = categoryColors[club.category] || categoryColors.academic
    const clubEvents = mockEvents.filter(e => e.club_id === club.id)

    const handleJoin = () => {
        if (joined) {
            setJoined(false)
            toast.success('Left the club.')
        } else {
            setJoined(true)
            toast.success('Join request sent! 🎉')
        }
    }

    const formatDate = (dateStr) => {
        const d = new Date(dateStr)
        return d.toLocaleDateString(isRTL ? 'ar-OM' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    const tabs = [
        { key: 'about', label: t('clubs.profile.about') },
        { key: 'events', label: t('clubs.profile.events'), count: clubEvents.length },
    ]

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
            {/* Breadcrumb */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-sm text-text-muted mb-6"
            >
                <Link to="/clubs" className="hover:text-brand-400 transition-colors flex items-center gap-1">
                    <ArrowLeft size={14} className="icon-flip" />
                    {t('nav.clubs')}
                </Link>
                <span>/</span>
                <span className="text-text-secondary truncate">{isRTL ? club.name_ar : club.name}</span>
            </motion.div>

            {/* Cover + Profile area */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl overflow-hidden mb-6 ${colors.bg}`}
            >
                <div className="h-40 md:h-52 relative flex items-center justify-center">
                    <span className="text-7xl md:text-9xl opacity-20">{categoryIcons[club.category]}</span>
                    <div className="absolute top-4 start-4">
                        <span className={`text-xs px-3 py-1.5 rounded-lg font-medium backdrop-blur-md ${colors.bg} ${colors.text} border ${colors.border}`}>
                            {categoryIcons[club.category]} {isRTL ? CLUB_CATEGORIES.find(c => c.value === club.category)?.labelAr : club.category}
                        </span>
                    </div>
                </div>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Club header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-start gap-4"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-surface-card border border-surface-border flex items-center justify-center text-3xl shadow-lg shrink-0">
                            {categoryIcons[club.category]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
                                {isRTL ? club.name_ar : club.name}
                            </h1>
                            <div className="flex items-center gap-4 mt-1 text-sm text-text-muted">
                                <span className="flex items-center gap-1">
                                    <Users size={14} />
                                    {t('clubs.members', { count: club.member_count })}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    {clubEvents.length} events
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Tabs */}
                    <div className="flex gap-1 bg-surface-card border border-surface-border rounded-xl p-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${activeTab === tab.key
                                        ? 'bg-brand-400/15 text-brand-400'
                                        : 'text-text-secondary hover:text-text-primary'
                                    }`}
                            >
                                {tab.label}
                                {tab.count !== undefined && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded-md ${activeTab === tab.key ? 'bg-brand-400/20' : 'bg-surface-border'
                                        }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'about' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-surface-card border border-surface-border rounded-2xl p-6"
                        >
                            <h2 className="font-semibold text-text-primary mb-3">{t('clubs.profile.about')}</h2>
                            <p className="text-text-secondary leading-relaxed">
                                {isRTL ? club.description_ar : club.description}
                            </p>
                            <div className="mt-4 pt-4 border-t border-surface-border text-sm text-text-muted">
                                Founded: {formatDate(club.created_at)}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'events' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-3"
                        >
                            {clubEvents.length > 0 ? (
                                clubEvents.map((event) => (
                                    <Link
                                        key={event.id}
                                        to={`/events/${event.id}`}
                                        className="block bg-surface-card border border-surface-border rounded-xl p-4 hover:border-brand-400/30 transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-brand-400/10 flex flex-col items-center justify-center text-brand-400 border border-brand-400/20 shrink-0">
                                                <span className="text-xs font-medium">
                                                    {new Date(event.date).toLocaleDateString(isRTL ? 'ar-OM' : 'en-US', { month: 'short' })}
                                                </span>
                                                <span className="text-lg font-bold leading-none">
                                                    {new Date(event.date).getDate()}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-semibold text-text-primary group-hover:text-brand-400 transition-colors truncate">
                                                    {isRTL ? event.title_ar : event.title}
                                                </h3>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {new Date(event.date).toLocaleTimeString(isRTL ? 'ar-OM' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MapPin size={12} />
                                                        {isRTL ? event.location_ar : event.location}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center py-10">
                                    <Calendar size={36} className="mx-auto text-text-muted mb-3" />
                                    <p className="text-text-secondary">No events yet.</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>

                {/* Sidebar */}
                <div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-surface-card border border-surface-border rounded-2xl p-6 sticky top-20"
                    >
                        {/* Join Button */}
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={handleJoin}
                            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold transition-all duration-300 cursor-pointer mb-4 ${joined
                                    ? 'bg-brand-400/15 text-brand-400 border border-brand-400/30 hover:bg-status-error/15 hover:text-status-error hover:border-status-error/30'
                                    : 'gradient-bg text-white shadow-lg shadow-brand-400/20 hover:shadow-brand-400/40'
                                }`}
                        >
                            {joined ? (
                                <>
                                    <CheckCircle2 size={18} />
                                    {t('clubs.joined')}
                                </>
                            ) : (
                                <>
                                    <UserPlus size={18} />
                                    {t('clubs.join')}
                                </>
                            )}
                        </motion.button>

                        {joined && (
                            <p className="text-xs text-text-muted text-center mb-4">
                                Click to leave
                            </p>
                        )}

                        {/* Stats */}
                        <div className="space-y-3 pt-4 border-t border-surface-border">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-text-muted">Members</span>
                                <span className="text-sm font-semibold text-text-primary">{club.member_count}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-text-muted">Events Hosted</span>
                                <span className="text-sm font-semibold text-text-primary">{clubEvents.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-text-muted">Category</span>
                                <span className={`text-sm font-medium ${colors.text}`}>
                                    {categoryIcons[club.category]} {isRTL ? CLUB_CATEGORIES.find(c => c.value === club.category)?.labelAr : club.category}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
