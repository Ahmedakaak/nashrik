import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { AnimatePresence, motion } from 'framer-motion'
import {
    ArrowRight, Calendar, ChevronLeft, ChevronRight, Clock, MapPin,
    QrCode, Search, Sparkles, Star, UserPlus, Users, Zap
} from 'lucide-react'
import { categoryColors, categoryIcons, CLUB_CATEGORIES } from '../lib/constants'
import { getLandingStats, getUpcomingEvents } from '../lib/api/events'

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' }
    })
}

const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i = 0) => ({
        opacity: 1,
        scale: 1,
        transition: { delay: i * 0.12, duration: 0.5, ease: 'easeOut' }
    })
}

export default function LandingPage() {
    const { t, i18n } = useTranslation()
    const { user } = useAuth()
    const isRTL = i18n.language === 'ar'
    const swipeConfidenceThreshold = 8000

    const [stats, setStats] = useState(null)
    const [upcomingEvents, setUpcomingEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [liveDataError, setLiveDataError] = useState(false)
    const [activeSlide, setActiveSlide] = useState(0)
    const [slideDirection, setSlideDirection] = useState(1)
    const [autoAdvanceSeed, setAutoAdvanceSeed] = useState(0)
    const [isHovered, setIsHovered] = useState(false)

    useEffect(() => {
        let active = true

        async function loadLandingData() {
            try {
                const [statsData, upcomingData] = await Promise.all([
                    getLandingStats(),
                    getUpcomingEvents(4),
                ])

                if (!active) return
                setStats(statsData)
                setUpcomingEvents(upcomingData)
                setLiveDataError(false)
            } catch (error) {
                console.error('LandingPage load error:', error)
                if (!active) return
                setStats({
                    totalEvents: 0,
                    totalClubs: 0,
                    activeUsers: 0,
                })
                setUpcomingEvents([])
                setLiveDataError(true)
            } finally {
                if (active) setLoading(false)
            }
        }

        loadLandingData()

        return () => {
            active = false
        }
    }, [])

    useEffect(() => {
        if (upcomingEvents.length <= 1 || isHovered) return

        const intervalId = window.setInterval(() => {
            setSlideDirection(1)
            setActiveSlide((current) => (current + 1) % upcomingEvents.length)
        }, 5000)

        return () => window.clearInterval(intervalId)
    }, [upcomingEvents.length, autoAdvanceSeed, isHovered])

    const features = useMemo(() => ([
        {
            icon: Search,
            title: t('landing.features.discover.title'),
            description: t('landing.features.discover.description'),
            color: 'from-blue-500/20 to-blue-600/5',
            iconBg: 'bg-blue-500/15 text-blue-400',
        },
        {
            icon: Zap,
            title: t('landing.features.register.title'),
            description: t('landing.features.register.description'),
            color: 'from-amber-500/20 to-amber-600/5',
            iconBg: 'bg-amber-500/15 text-amber-400',
        },
        {
            icon: QrCode,
            title: t('landing.features.qr.title'),
            description: t('landing.features.qr.description'),
            color: 'from-brand-400/20 to-brand-500/5',
            iconBg: 'bg-brand-400/15 text-brand-400',
        },
        {
            icon: UserPlus,
            title: t('landing.features.clubs.title'),
            description: t('landing.features.clubs.description'),
            color: 'from-purple-500/20 to-purple-600/5',
            iconBg: 'bg-purple-500/15 text-purple-400',
        },
    ]), [t])

    const liveStats = useMemo(() => ([
        { value: stats?.totalEvents ?? 0, label: t('landing.stats.events'), icon: Calendar },
        { value: stats?.totalClubs ?? 0, label: t('landing.stats.clubs'), icon: Users },
        { value: stats?.activeUsers ?? 0, label: t('landing.stats.students'), icon: Star },
    ]), [stats, t])

    const primaryEvent = upcomingEvents[activeSlide] || null

    const formatDate = (dateStr) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString(isRTL ? 'ar-OM' : 'en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        })
    }

    const formatTime = (dateStr) => {
        const date = new Date(dateStr)
        return date.toLocaleTimeString(isRTL ? 'ar-OM' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const getCategoryLabel = (category) => {
        const item = CLUB_CATEGORIES.find((entry) => entry.value === category)
        return isRTL ? item?.labelAr || item?.label : item?.label
    }

    const resetAutoAdvance = () => {
        setAutoAdvanceSeed((seed) => seed + 1)
    }

    const paginate = (direction) => {
        if (upcomingEvents.length <= 1) return

        setSlideDirection(direction)
        setActiveSlide((current) => {
            const next = current + direction
            if (next < 0) return upcomingEvents.length - 1
            if (next >= upcomingEvents.length) return 0
            return next
        })
        resetAutoAdvance()
    }

    const jumpToSlide = (index) => {
        if (index === activeSlide) return
        setSlideDirection(index > activeSlide ? 1 : -1)
        setActiveSlide(index)
        resetAutoAdvance()
    }

    const handleCarouselKeyDown = (event) => {
        if (event.key === 'ArrowLeft') {
            event.preventDefault()
            paginate(-1)
        }

        if (event.key === 'ArrowRight') {
            event.preventDefault()
            paginate(1)
        }
    }

    const renderHeroTitle = () => {
        const title = t('landing.hero.title')
        const match = title.match(/^(.*?)\[\[(.*?)\]\](.*)$/)

        if (!match) {
            return title
        }

        const [, before, highlighted, after] = match

        return (
            <>
                {before}
                <span className="gradient-text">{highlighted}</span>
                {after}
            </>
        )
    }

    const renderCapacity = (event) => {
        if (!event?.max_capacity) return null

        const percent = Math.min(
            Math.round(((event.registered_count || 0) / event.max_capacity) * 100),
            100
        )

        return (
            <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-text-muted">
                        {event.registered_count || 0}/{event.max_capacity}
                    </span>
                    <span className="text-text-secondary">
                        {t('events.spotsLeft', {
                            count: Math.max(event.max_capacity - (event.registered_count || 0), 0),
                        })}
                    </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                            percent >= 100
                                ? 'bg-status-error'
                                : percent > 80
                                    ? 'bg-status-warning'
                                    : 'bg-brand-400'
                        }`}
                        style={{ width: `${percent}%` }}
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="page-enter overflow-x-hidden">
            <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-gradient-to-b from-brand-400/8 via-brand-400/3 to-transparent rounded-full blur-3xl" />
                    <div className="absolute top-40 left-0 w-60 h-60 bg-brand-400/5 rounded-full blur-3xl" />
                    <div className="absolute top-60 right-0 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl" />
                    <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)',
                            backgroundSize: '48px 48px',
                        }}
                    />
                </div>

                <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-8">
                    <div className="text-center">
                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            custom={0}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-400/10 border border-brand-400/20 text-brand-400 text-sm font-medium mb-8"
                        >
                            <Sparkles size={14} />
                            <span>UTAS Salalah Campus Platform</span>
                        </motion.div>

                        <motion.h1
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            custom={1}
                            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-text-primary leading-[1.1] mb-6"
                        >
                            {renderHeroTitle()}
                        </motion.h1>

                        <motion.p
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            custom={2}
                            className="text-base sm:text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed px-2"
                        >
                            {t('landing.hero.subtitle')}
                        </motion.p>

                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            custom={3}
                            className="flex items-center justify-center"
                        >
                            <Link
                                to={user ? '/dashboard' : '/signup'}
                                className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl gradient-bg text-white font-semibold text-lg shadow-xl shadow-brand-400/25 hover:shadow-brand-400/40 transition-all duration-300 active:scale-[0.98]"
                            >
                                {t('landing.hero.cta')}
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform icon-flip" />
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="py-20 md:py-24">
                <div className="max-w-6xl mx-auto px-6 md:px-8">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
                                {t('dashboard.upcoming')}
                            </h2>
                            <p className="text-text-secondary max-w-2xl">
                                {t('landing.upcoming.intro')}
                            </p>
                        </div>
                        <Link
                            to="/events"
                            className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 font-medium transition-colors"
                        >
                            {t('common.viewAll')}
                            <ArrowRight size={16} className="icon-flip" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="relative">
                            <div className="relative overflow-hidden rounded-3xl border border-surface-border bg-surface-card min-h-[420px] animate-pulse">
                                <div className="absolute inset-0 bg-white/[0.03]" />
                                <div className="absolute inset-0 p-7 md:p-10 flex flex-col justify-between">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex gap-2">
                                            <div className="h-8 w-28 rounded-full bg-white/10" />
                                            <div className="h-8 w-24 rounded-full bg-white/10" />
                                        </div>
                                        <div className="h-8 w-24 rounded-full bg-white/10" />
                                    </div>
                                    <div className="max-w-3xl">
                                        <div className="h-4 w-32 rounded bg-white/10 mb-4" />
                                        <div className="h-12 w-2/3 rounded bg-white/10 mb-4" />
                                        <div className="h-4 w-full rounded bg-white/10 mb-2" />
                                        <div className="h-4 w-5/6 rounded bg-white/10 mb-8" />
                                        <div className="grid sm:grid-cols-3 gap-3 mb-6">
                                            {[0, 1, 2].map((item) => (
                                                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                                    <div className="h-3 w-16 rounded bg-white/10 mb-3" />
                                                    <div className="h-4 w-24 rounded bg-white/10" />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="max-w-md">
                                            <div className="flex justify-between mb-2">
                                                <div className="h-3 w-16 rounded bg-white/10" />
                                                <div className="h-3 w-20 rounded bg-white/10" />
                                            </div>
                                            <div className="h-1.5 rounded-full bg-white/10" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-4 mt-5">
                                <div className="flex items-center gap-2">
                                    {[0, 1, 2, 3].map((item) => (
                                        <div key={item} className={`rounded-full bg-surface-border ${item === 0 ? 'w-10 h-2.5' : 'w-2.5 h-2.5'}`} />
                                    ))}
                                </div>
                                <div className="grid sm:grid-cols-3 gap-3 flex-1">
                                    {[0, 1, 2].map((item) => (
                                        <div key={item} className="rounded-2xl border border-surface-border bg-surface-card px-4 py-3 animate-pulse">
                                            <div className="h-3 w-20 rounded bg-white/10 mb-2" />
                                            <div className="h-4 w-3/4 rounded bg-white/10 mb-2" />
                                            <div className="h-3 w-2/3 rounded bg-white/10 mb-2" />
                                            <div className="h-3 w-16 rounded bg-white/10" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : primaryEvent ? (
                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="relative"
                            tabIndex={0}
                            onKeyDown={handleCarouselKeyDown}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            <div className="relative overflow-hidden rounded-3xl border border-surface-border bg-surface-card min-h-[420px]">
                                <AnimatePresence initial={false} custom={slideDirection} mode="wait">
                                    <motion.div
                                        key={primaryEvent.id}
                                        custom={slideDirection}
                                        initial={{ opacity: 0, x: (slideDirection > 0 ? 120 : -120) * (isRTL ? -1 : 1) }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: (slideDirection > 0 ? -120 : 120) * (isRTL ? -1 : 1) }}
                                        transition={{ duration: 0.45, ease: 'easeOut' }}
                                        drag="x"
                                        dragConstraints={{ left: 0, right: 0 }}
                                        dragElastic={0.12}
                                        onDragEnd={(_, info) => {
                                            const swipe = Math.abs(info.offset.x) * info.velocity.x
                                            if (swipe < -swipeConfidenceThreshold) paginate(1)
                                            else if (swipe > swipeConfidenceThreshold) paginate(-1)
                                        }}
                                        className="absolute inset-0"
                                    >
                                        <Link
                                            to={`/events/${primaryEvent.id}`}
                                            className="group block h-full"
                                        >
                                            <div className="relative h-full min-h-[420px]">
                                                {primaryEvent.cover_url ? (
                                                    <img src={primaryEvent.cover_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                                                ) : (
                                                    <div className={`absolute inset-0 ${categoryColors[primaryEvent.category]?.bg || categoryColors.academic.bg}`} />
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-r from-surface-dark via-surface-dark/88 to-surface-dark/45" />
                                                <div className="absolute inset-0 p-7 md:p-10 flex flex-col justify-between">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex flex-wrap gap-2">
                                                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-white text-xs font-medium backdrop-blur-sm">
                                                                <span>{categoryIcons[primaryEvent.category]}</span>
                                                                <span>{getCategoryLabel(primaryEvent.category)}</span>
                                                            </span>
                                                            {primaryEvent.is_featured && (
                                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 text-xs font-medium backdrop-blur-sm">
                                                                    <Star size={12} className="fill-current" />
                                                                    <span>{t('landing.featured')}</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-400/15 border border-brand-400/30 text-brand-200 text-xs font-medium backdrop-blur-sm">
                                                            {t('landing.upcoming.slide', { current: activeSlide + 1, total: upcomingEvents.length })}
                                                        </span>
                                                    </div>

                                                    <div className="max-w-3xl">
                                                        <p className="text-sm text-white/70 mb-3">
                                                            {isRTL ? primaryEvent.club?.name_ar : primaryEvent.club?.name}
                                                        </p>
                                                        <h3 className="text-3xl md:text-5xl font-bold text-white mb-4 group-hover:text-brand-100 transition-colors">
                                                            {isRTL ? primaryEvent.title_ar : primaryEvent.title}
                                                        </h3>
                                                        <p className="text-white/75 leading-relaxed mb-6 md:mb-8 line-clamp-3 max-w-2xl">
                                                            {isRTL ? primaryEvent.description_ar : primaryEvent.description}
                                                        </p>

                                                        <div className="grid sm:grid-cols-3 gap-3 mb-6 text-sm">
                                                            <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 backdrop-blur-sm text-white/85">
                                                                <div className="flex items-center gap-2 mb-1 text-white/60">
                                                                    <Calendar size={14} />
                                                                    <span>{t('landing.upcoming.date')}</span>
                                                                </div>
                                                                <p>{formatDate(primaryEvent.date)}</p>
                                                            </div>
                                                            <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 backdrop-blur-sm text-white/85">
                                                                <div className="flex items-center gap-2 mb-1 text-white/60">
                                                                    <Clock size={14} />
                                                                    <span>{t('landing.upcoming.time')}</span>
                                                                </div>
                                                                <p>{formatTime(primaryEvent.date)}</p>
                                                            </div>
                                                            <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 backdrop-blur-sm text-white/85">
                                                                <div className="flex items-center gap-2 mb-1 text-white/60">
                                                                    <MapPin size={14} />
                                                                    <span>{t('landing.upcoming.location')}</span>
                                                                </div>
                                                                <p className="truncate">{isRTL ? primaryEvent.location_ar : primaryEvent.location}</p>
                                                            </div>
                                                        </div>

                                                        <div className="max-w-md">
                                                            {renderCapacity(primaryEvent)}
                                                        </div>

                                                        <div className="mt-6 inline-flex items-center gap-2 text-white font-medium">
                                                            <span>{t('landing.upcoming.viewDetails')}</span>
                                                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform icon-flip" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                </AnimatePresence>

                                {upcomingEvents.length > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => paginate(-1)}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-surface-dark/75 border border-white/10 text-white hover:bg-surface-dark/95 transition-colors flex items-center justify-center"
                                            aria-label={t('common.back')}
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => paginate(1)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-surface-dark/75 border border-white/10 text-white hover:bg-surface-dark/95 transition-colors flex items-center justify-center"
                                            aria-label={t('common.next')}
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </>
                                )}
                            </div>

                            {upcomingEvents.length > 1 && (
                                <div className="flex flex-wrap items-center justify-between gap-4 mt-5">
                                    <div className="flex items-center gap-2">
                                        {upcomingEvents.map((event, index) => (
                                            <button
                                                key={event.id}
                                                type="button"
                                                onClick={() => jumpToSlide(index)}
                                                className={`h-2.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-dark ${
                                                    index === activeSlide
                                                        ? 'w-10 bg-brand-400'
                                                        : 'w-2.5 bg-surface-border hover:bg-white/30'
                                                }`}
                                                aria-label={t('landing.upcoming.slide', { current: index + 1, total: upcomingEvents.length })}
                                            />
                                        ))}
                                    </div>

                                    <div className="grid sm:grid-cols-3 gap-3 flex-1">
                                        {upcomingEvents.map((event, index) => {
                                            const spotsLeft = event.max_capacity
                                                ? Math.max(event.max_capacity - (event.registered_count || 0), 0)
                                                : 0

                                            return (
                                                <button
                                                    key={event.id}
                                                    type="button"
                                                    onClick={() => jumpToSlide(index)}
                                                    className={`text-left rounded-2xl border px-4 py-3 transition-all ${
                                                        index === activeSlide
                                                            ? 'bg-brand-400/10 border-brand-400/30'
                                                            : 'bg-surface-card border-surface-border hover:border-brand-400/20'
                                                    }`}
                                                >
                                                    <p className="text-xs text-brand-400 mb-1">{formatDate(event.date)}</p>
                                                    <p className="text-sm font-medium text-text-primary line-clamp-1">
                                                        {isRTL ? event.title_ar : event.title}
                                                    </p>
                                                    <p className="text-xs text-text-muted mt-1 line-clamp-1">
                                                        {isRTL ? event.club?.name_ar : event.club?.name}
                                                    </p>
                                                    {event.max_capacity && (
                                                        <p className="text-xs text-text-secondary mt-2">
                                                            {spotsLeft > 0 ? t('landing.upcoming.spotsLeft', { count: spotsLeft }) : t('events.full')}
                                                        </p>
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="rounded-3xl border border-dashed border-surface-border bg-surface-card/60 px-8 py-14 text-center"
                        >
                            <Calendar size={42} className="mx-auto text-text-muted mb-4" />
                            <h3 className="text-xl font-semibold text-text-primary mb-2">
                                {t('events.noEvents')}
                            </h3>
                            <p className="text-text-secondary max-w-lg mx-auto mb-6">
                                {t('landing.upcoming.empty')}
                            </p>
                            <Link
                                to="/events"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-bg text-white font-medium"
                            >
                                <span>{t('landing.hero.ctaSecondary')}</span>
                                <ArrowRight size={16} className="icon-flip" />
                            </Link>
                        </motion.div>
                    )}
                </div>
            </section>

            <section className="py-16 border-y border-surface-border bg-surface-dark/30">
                <div className="max-w-4xl mx-auto px-6 md:px-8">
                    <div className="grid grid-cols-3 gap-6 md:gap-12">
                        {liveStats.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                variants={scaleIn}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: '-50px' }}
                                custom={i}
                                className="text-center group"
                            >
                                <div className="flex justify-center mb-3">
                                    <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-brand-400/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <stat.icon size={22} className="text-brand-400" />
                                    </div>
                                </div>
                                <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold gradient-text mb-1">
                                    {loading ? '...' : stat.value}
                                </p>
                                <p className="text-text-secondary text-sm md:text-base font-medium">
                                    {stat.label}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    {liveDataError && (
                        <p className="text-center text-sm text-text-muted mt-6">
                            {t('landing.liveDataUnavailable')}
                        </p>
                    )}
                </div>
            </section>

            <section className="py-20 md:py-24">
                <div className="max-w-6xl mx-auto px-6 md:px-8">
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-50px' }}
                        className="text-center mb-14"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                            {t('landing.features.title')}
                        </h2>
                        <p className="text-text-secondary text-base md:text-lg max-w-xl mx-auto">
                            {t('app.description')}
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {features.map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                variants={scaleIn}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: '-30px' }}
                                custom={i}
                                className="group relative p-6 rounded-2xl bg-surface-dark border border-surface-border hover:border-brand-400/30 transition-all duration-300 hover-lift"
                            >
                                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                                <div className="relative z-10">
                                    <div className={`w-12 h-12 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                        <feature.icon size={24} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm text-text-secondary leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
