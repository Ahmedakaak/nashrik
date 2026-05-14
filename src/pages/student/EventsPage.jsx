import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { categoryColors, categoryIcons, CLUB_CATEGORIES } from '../../lib/constants'
import { getEvents } from '../../lib/api/events'
import { getMyRegistrations } from '../../lib/api/registrations'
import { PageLoader } from '../../components/common/LoadingSpinner'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search, Calendar, MapPin, Users, Clock, Filter,
    SlidersHorizontal, X, ArrowRight, CheckCircle2
} from 'lucide-react'

export default function EventsPage() {
    const { t, i18n } = useTranslation()
    const { user } = useAuth()
    const isRTL = i18n.language === 'ar'

    const [events, setEvents] = useState([])
    const [regEventIds, setRegEventIds] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        async function load() {
            try {
                const evts = await getEvents({ status: 'published' })
                setEvents(evts)

                if (user) {
                    const regs = await getMyRegistrations(user.id)
                    setRegEventIds(regs.map(r => r.event_id))
                }
            } catch (err) {
                console.error('EventsPage load error:', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [user])

    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            const matchesSearch = search === '' ||
                event.title?.toLowerCase().includes(search.toLowerCase()) ||
                event.title_ar?.includes(search) ||
                event.club?.name?.toLowerCase().includes(search.toLowerCase())
            const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory
            return matchesSearch && matchesCategory
        })
    }, [events, search, selectedCategory])

    const formatDate = (dateStr) => {
        const d = new Date(dateStr)
        return d.toLocaleDateString(isRTL ? 'ar-OM' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    }

    const formatTime = (dateStr) => {
        const d = new Date(dateStr)
        return d.toLocaleTimeString(isRTL ? 'ar-OM' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    }

    const categories = [
        { value: 'all', label: t('events.filters.all'), icon: '🌟' },
        ...CLUB_CATEGORIES.map(c => ({
            value: c.value,
            label: isRTL ? c.labelAr : c.label,
            icon: c.icon,
        })),
    ]

    const activeFilterCount = (selectedCategory !== 'all' ? 1 : 0) + (search ? 1 : 0)

    if (loading) return <PageLoader />

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary">{t('events.title')}</h1>
                <p className="text-text-secondary mt-1">{t('landing.features.discover.description')}</p>
            </motion.div>

            {/* Search + Filter Bar */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6 space-y-4"
            >
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                            <Search size={18} className="text-text-muted" />
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('events.search')}
                            className="w-full rounded-xl bg-surface-card border border-surface-border ps-10 pe-4 py-3 text-text-primary placeholder:text-text-muted transition-all duration-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 outline-none"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute inset-y-0 end-0 flex items-center pe-3 text-text-muted hover:text-text-primary cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Filter toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl border transition-all duration-200 cursor-pointer shrink-0 ${showFilters || activeFilterCount > 0
                                ? 'bg-brand-400/10 border-brand-400/30 text-brand-400'
                                : 'bg-surface-card border-surface-border text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        <SlidersHorizontal size={18} />
                        <span className="text-sm font-medium">{t('common.filter')}</span>
                        {activeFilterCount > 0 && (
                            <span className="w-5 h-5 rounded-full bg-brand-400 text-white text-xs flex items-center justify-center">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Category Filter Pills */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="flex flex-wrap gap-2 pt-2">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.value}
                                        onClick={() => setSelectedCategory(cat.value)}
                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer ${selectedCategory === cat.value
                                                ? 'bg-brand-400/15 border-brand-400/30 text-brand-400'
                                                : 'bg-surface-card border-surface-border text-text-secondary hover:text-text-primary hover:border-brand-400/20'
                                            }`}
                                    >
                                        <span>{cat.icon}</span>
                                        {cat.label}
                                    </button>
                                ))}
                                {selectedCategory !== 'all' && (
                                    <button
                                        onClick={() => setSelectedCategory('all')}
                                        className="flex items-center gap-1 px-3 py-2 rounded-full text-sm text-status-error hover:bg-status-error/10 transition-colors cursor-pointer"
                                    >
                                        <X size={14} />
                                        {t('events.filters.clear')}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Results count */}
            <p className="text-sm text-text-muted mb-4">
                {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
            </p>

            {/* Events Grid */}
            {filteredEvents.length > 0 ? (
                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
                    className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                    {filteredEvents.map((event) => {
                        const colors = categoryColors[event.category] || categoryColors.academic
                        const spotsLeft = event.max_capacity - event.registered_count
                        const isFull = spotsLeft <= 0
                        const isRegistered = regEventIds.includes(event.id)
                        const percentFull = Math.round((event.registered_count / event.max_capacity) * 100)

                        return (
                            <motion.div
                                key={event.id}
                                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                            >
                                <Link
                                    to={`/events/${event.id}`}
                                    className="block bg-surface-card border border-surface-border rounded-2xl overflow-hidden hover:border-brand-400/30 transition-all duration-200 group hover-lift h-full"
                                >
                                    {/* Cover */}
                                    <div className={`h-36 relative ${event.cover_url ? '' : colors.bg}`}>
                                        {event.cover_url ? (
                                            <img src={event.cover_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-5xl opacity-60">{categoryIcons[event.category]}</span>
                                            </div>
                                        )}
                                        {/* Tags */}
                                        <div className="absolute top-3 start-3 flex gap-1.5">
                                            <span className={`text-xs px-2.5 py-1 rounded-lg font-medium backdrop-blur-sm ${colors.bg} ${colors.text} border ${colors.border}`}>
                                                {isRTL ? CLUB_CATEGORIES.find(c => c.value === event.category)?.labelAr : event.category}
                                            </span>
                                            {event.is_featured && (
                                                <span className="text-xs px-2.5 py-1 rounded-lg font-medium bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 backdrop-blur-sm">
                                                    ⭐ Featured
                                                </span>
                                            )}
                                        </div>
                                        {/* Registration badge */}
                                        {isRegistered && (
                                            <div className="absolute top-3 end-3">
                                                <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-brand-400/20 text-brand-400 font-medium border border-brand-400/30 backdrop-blur-sm">
                                                    <CheckCircle2 size={12} />
                                                    {t('events.registered')}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-4 space-y-3">
                                        <div>
                                            <h3 className="font-semibold text-text-primary group-hover:text-brand-400 transition-colors line-clamp-1">
                                                {isRTL ? event.title_ar : event.title}
                                            </h3>
                                            <p className="text-xs text-text-muted mt-0.5">
                                                {isRTL ? event.club?.name_ar : event.club?.name}
                                            </p>
                                        </div>

                                        <div className="space-y-1.5 text-sm text-text-secondary">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-text-muted shrink-0" />
                                                <span>{formatDate(event.date)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock size={14} className="text-text-muted shrink-0" />
                                                <span>{formatTime(event.date)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin size={14} className="text-text-muted shrink-0" />
                                                <span className="truncate">{isRTL ? event.location_ar : event.location}</span>
                                            </div>
                                        </div>

                                        {/* Capacity bar */}
                                        <div>
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                <span className="text-text-muted">
                                                    <Users size={12} className="inline me-1" />
                                                    {event.registered_count}/{event.max_capacity}
                                                </span>
                                                <span className={isFull ? 'text-status-error font-medium' : 'text-text-muted'}>
                                                    {isFull ? t('events.full') : `${spotsLeft} left`}
                                                </span>
                                            </div>
                                            <div className="w-full bg-surface-border rounded-full h-1.5">
                                                <div
                                                    className={`h-1.5 rounded-full transition-all duration-500 ${isFull ? 'bg-status-error' : percentFull > 80 ? 'bg-status-warning' : 'bg-brand-400'
                                                        }`}
                                                    style={{ width: `${Math.min(percentFull, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        )
                    })}
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                >
                    <Calendar size={48} className="mx-auto text-text-muted mb-4" />
                    <h3 className="text-lg font-semibold text-text-primary mb-1">{t('events.noEvents')}</h3>
                    <p className="text-text-secondary text-sm">Try adjusting your search or filters.</p>
                    <button
                        onClick={() => { setSearch(''); setSelectedCategory('all') }}
                        className="mt-4 text-sm text-brand-400 hover:text-brand-300 font-medium cursor-pointer transition-colors"
                    >
                        {t('events.filters.clear')}
                    </button>
                </motion.div>
            )}
        </div>
    )
}
