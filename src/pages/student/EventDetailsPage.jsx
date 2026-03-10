import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { mockEvents, mockRegistrations, categoryColors, categoryIcons } from '../../lib/mockData'
import { CLUB_CATEGORIES } from '../../lib/constants'
import { motion } from 'framer-motion'
import {
    Calendar, Clock, MapPin, Users, ArrowLeft, Tag,
    Share2, CheckCircle2, UserPlus, AlertCircle
} from 'lucide-react'
import EventDiscussion from '../../components/events/EventDiscussion'
import toast from 'react-hot-toast'

export default function EventDetailsPage() {
    const { id } = useParams()
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'

    const event = mockEvents.find(e => e.id === id)
    const isRegistered = mockRegistrations.some(r => r.event_id === id)
    const [registered, setRegistered] = useState(isRegistered)
    const [regCount, setRegCount] = useState(event?.registered_count || 0)

    if (!event) {
        return (
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 text-center">
                <AlertCircle size={48} className="mx-auto text-text-muted mb-4" />
                <h2 className="text-xl font-bold text-text-primary mb-2">Event Not Found</h2>
                <p className="text-text-secondary mb-4">The event you're looking for doesn't exist.</p>
                <Link to="/events" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                    ← {t('common.back')} to events
                </Link>
            </div>
        )
    }

    const colors = categoryColors[event.category] || categoryColors.academic
    const spotsLeft = event.max_capacity - regCount
    const isFull = spotsLeft <= 0
    const percentFull = Math.round((regCount / event.max_capacity) * 100)

    const handleRegister = () => {
        if (registered) {
            setRegistered(false)
            setRegCount(prev => prev - 1)
            toast.success('Registration cancelled.')
        } else if (!isFull) {
            setRegistered(true)
            setRegCount(prev => prev + 1)
            toast.success('Successfully registered! 🎉')
        }
    }

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href)
            toast.success('Link copied to clipboard!')
        } catch {
            toast.error('Failed to copy link')
        }
    }

    const formatFullDate = (dateStr) => {
        const d = new Date(dateStr)
        return d.toLocaleDateString(isRTL ? 'ar-OM' : 'en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        })
    }

    const formatTime = (dateStr) => {
        const d = new Date(dateStr)
        return d.toLocaleTimeString(isRTL ? 'ar-OM' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    }

    // Related events (same category, excluding current)
    const relatedEvents = mockEvents
        .filter(e => e.category === event.category && e.id !== event.id)
        .slice(0, 3)

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
            {/* Breadcrumb */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-sm text-text-muted mb-6"
            >
                <Link to="/events" className="hover:text-brand-400 transition-colors flex items-center gap-1">
                    <ArrowLeft size={14} className="icon-flip" />
                    {t('nav.events')}
                </Link>
                <span>/</span>
                <span className="text-text-secondary truncate">{isRTL ? event.title_ar : event.title}</span>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Cover */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`h-48 md:h-64 rounded-2xl ${colors.bg} flex items-center justify-center relative overflow-hidden`}
                    >
                        <span className="text-7xl md:text-8xl opacity-40">{categoryIcons[event.category]}</span>
                        {/* Tags overlay */}
                        <div className="absolute top-4 start-4 flex gap-2">
                            <span className={`text-xs px-3 py-1.5 rounded-lg font-medium backdrop-blur-md ${colors.bg} ${colors.text} border ${colors.border}`}>
                                {categoryIcons[event.category]} {isRTL ? CLUB_CATEGORIES.find(c => c.value === event.category)?.labelAr : event.category}
                            </span>
                            {event.is_featured && (
                                <span className="text-xs px-3 py-1.5 rounded-lg font-medium bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 backdrop-blur-md">
                                    ⭐ Featured
                                </span>
                            )}
                        </div>
                    </motion.div>

                    {/* Title & Club */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
                            {isRTL ? event.title_ar : event.title}
                        </h1>
                        <Link
                            to={`/clubs/${event.club_id}`}
                            className="inline-flex items-center gap-2 text-text-secondary hover:text-brand-400 transition-colors"
                        >
                            <div className="w-7 h-7 rounded-lg bg-brand-400/15 flex items-center justify-center text-xs">
                                {categoryIcons[event.category]}
                            </div>
                            <span className="text-sm font-medium">
                                {t('events.details.hostedBy')} {isRTL ? event.club.name_ar : event.club.name}
                            </span>
                        </Link>
                    </motion.div>

                    {/* Description */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-surface-card border border-surface-border rounded-2xl p-6"
                    >
                        <h2 className="font-semibold text-text-primary mb-3">{t('events.details.about')}</h2>
                        <p className="text-text-secondary leading-relaxed">
                            {isRTL ? event.description_ar : event.description}
                        </p>
                    </motion.section>

                    {/* Tags */}
                    {event.tags && event.tags.length > 0 && (
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                        >
                            <h3 className="text-sm font-medium text-text-muted mb-2 flex items-center gap-1.5">
                                <Tag size={14} />
                                {t('events.details.tags')}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {event.tags.map((tag) => (
                                    <span key={tag} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-text-secondary border border-surface-border">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </motion.section>
                    )}

                    {/* Related Events */}
                    {relatedEvents.length > 0 && (
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h2 className="font-semibold text-text-primary mb-4">{t('events.details.relatedEvents')}</h2>
                            <div className="grid sm:grid-cols-3 gap-3">
                                {relatedEvents.map((re) => (
                                    <Link
                                        key={re.id}
                                        to={`/events/${re.id}`}
                                        className="bg-surface-card border border-surface-border rounded-xl p-3 hover:border-brand-400/30 transition-all group"
                                    >
                                        <h4 className="text-sm font-medium text-text-primary group-hover:text-brand-400 transition-colors line-clamp-1">
                                            {isRTL ? re.title_ar : re.title}
                                        </h4>
                                        <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
                                            <Calendar size={12} />
                                            {new Date(re.date).toLocaleDateString(isRTL ? 'ar-OM' : 'en-US', { month: 'short', day: 'numeric' })}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </motion.section>
                    )}

                    {/* Discussion Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                    >
                        <EventDiscussion eventId={event.id} />
                    </motion.section>
                </div>

                {/* Sidebar — Event Info + Registration */}
                <div className="space-y-4">
                    {/* Registration Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-surface-card border border-surface-border rounded-2xl p-6 sticky top-20"
                    >
                        {/* Date & Time */}
                        <div className="space-y-3 mb-6">
                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-lg bg-brand-400/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <Calendar size={18} className="text-brand-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-text-primary">{t('events.details.dateTime')}</p>
                                    <p className="text-sm text-text-secondary">{formatFullDate(event.date)}</p>
                                    <p className="text-sm text-text-muted">{formatTime(event.date)} - {formatTime(event.end_date)}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-lg bg-purple-400/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <MapPin size={18} className="text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-text-primary">{t('events.details.location')}</p>
                                    <p className="text-sm text-text-secondary">{isRTL ? event.location_ar : event.location}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-lg bg-blue-400/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <Users size={18} className="text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-text-primary">{t('events.details.attendees')}</p>
                                    <p className="text-sm text-text-secondary">{t('events.capacity', { current: regCount, max: event.max_capacity })}</p>
                                </div>
                            </div>
                        </div>

                        {/* Capacity bar */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between text-xs mb-1.5">
                                <span className="text-text-muted">{regCount} / {event.max_capacity}</span>
                                <span className={isFull ? 'text-status-error font-medium' : 'text-text-muted'}>
                                    {isFull ? t('events.full') : t('events.spotsLeft', { count: spotsLeft })}
                                </span>
                            </div>
                            <div className="w-full bg-surface-border rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-500 ${isFull ? 'bg-status-error' : percentFull > 80 ? 'bg-status-warning' : 'bg-brand-400'
                                        }`}
                                    style={{ width: `${Math.min(percentFull, 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Register Button */}
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={handleRegister}
                            disabled={isFull && !registered}
                            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold transition-all duration-300 cursor-pointer ${registered
                                ? 'bg-brand-400/15 text-brand-400 border border-brand-400/30 hover:bg-status-error/15 hover:text-status-error hover:border-status-error/30'
                                : isFull
                                    ? 'bg-surface-border text-text-muted cursor-not-allowed'
                                    : 'gradient-bg text-white shadow-lg shadow-brand-400/20 hover:shadow-brand-400/40'
                                }`}
                        >
                            {registered ? (
                                <>
                                    <CheckCircle2 size={18} />
                                    {t('events.registered')}
                                </>
                            ) : isFull ? (
                                t('events.full')
                            ) : (
                                <>
                                    <UserPlus size={18} />
                                    {t('events.register')}
                                </>
                            )}
                        </motion.button>

                        {registered && (
                            <p className="text-xs text-text-muted text-center mt-2">
                                Click to unregister
                            </p>
                        )}

                        {/* Share */}
                        <button
                            onClick={handleShare}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-surface-border text-text-secondary hover:text-text-primary hover:border-brand-400/30 transition-all mt-3 cursor-pointer"
                        >
                            <Share2 size={16} />
                            <span className="text-sm font-medium">Share Event</span>
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
