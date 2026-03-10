import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { mockEvents, mockRegistrations, categoryColors, categoryIcons } from '../../lib/mockData'
import { motion } from 'framer-motion'
import {
    Calendar, Clock, MapPin, QrCode, ArrowRight,
    CalendarDays, CalendarCheck, CalendarClock, X
} from 'lucide-react'

export default function MyRegistrationsPage() {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'

    const [activeTab, setActiveTab] = useState('upcoming')
    const [showQR, setShowQR] = useState(null)

    const registeredEvents = useMemo(() => {
        return mockRegistrations.map(reg => {
            const event = mockEvents.find(e => e.id === reg.event_id)
            return { ...reg, event }
        }).filter(r => r.event)
    }, [])

    const upcomingRegs = registeredEvents.filter(r => new Date(r.event.date) > new Date())
    const pastRegs = registeredEvents.filter(r => new Date(r.event.date) <= new Date())
    const attendedRegs = registeredEvents.filter(r => r.attended)

    const currentRegs = activeTab === 'upcoming' ? upcomingRegs
        : activeTab === 'past' ? pastRegs : attendedRegs

    const formatDate = (dateStr) => {
        const d = new Date(dateStr)
        return d.toLocaleDateString(isRTL ? 'ar-OM' : 'en-US', {
            weekday: 'short', month: 'short', day: 'numeric'
        })
    }

    const formatTime = (dateStr) => {
        const d = new Date(dateStr)
        return d.toLocaleTimeString(isRTL ? 'ar-OM' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    }

    const tabs = [
        { key: 'upcoming', label: t('registrations.tabs.upcoming'), icon: CalendarClock, count: upcomingRegs.length },
        { key: 'past', label: t('registrations.tabs.past'), icon: CalendarDays, count: pastRegs.length },
        { key: 'attended', label: t('registrations.tabs.attended'), icon: CalendarCheck, count: attendedRegs.length },
    ]

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary">{t('registrations.title')}</h1>
                <p className="text-text-secondary mt-1">Track all your event registrations and attendance.</p>
            </motion.div>

            {/* Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex gap-1 bg-surface-card border border-surface-border rounded-xl p-1 mb-6"
            >
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${activeTab === tab.key
                                ? 'bg-brand-400/15 text-brand-400'
                                : 'text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        <tab.icon size={16} />
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-md ${activeTab === tab.key ? 'bg-brand-400/20' : 'bg-surface-border'
                            }`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </motion.div>

            {/* Registration List */}
            {currentRegs.length > 0 ? (
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                >
                    {currentRegs.map((reg) => {
                        const event = reg.event
                        const colors = categoryColors[event.category] || categoryColors.academic

                        return (
                            <div
                                key={reg.event_id}
                                className="bg-surface-card border border-surface-border rounded-2xl p-4 md:p-5 hover:border-brand-400/20 transition-all"
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
                                            {reg.attended && (
                                                <span className="text-xs px-2 py-0.5 rounded-md bg-brand-400/15 text-brand-400 font-medium">
                                                    ✓ Attended
                                                </span>
                                            )}
                                        </div>

                                        <Link
                                            to={`/events/${event.id}`}
                                            className="font-semibold text-text-primary hover:text-brand-400 transition-colors"
                                        >
                                            {isRTL ? event.title_ar : event.title}
                                        </Link>

                                        <p className="text-xs text-text-muted mt-0.5">
                                            {isRTL ? event.club.name_ar : event.club.name}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-text-muted">
                                            <span className="flex items-center gap-1">
                                                <Clock size={13} />
                                                {formatDate(event.date)} • {formatTime(event.date)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MapPin size={13} />
                                                {isRTL ? event.location_ar : event.location}
                                            </span>
                                        </div>
                                    </div>

                                    {/* QR Code button — only for upcoming */}
                                    {activeTab === 'upcoming' && (
                                        <button
                                            onClick={() => setShowQR(showQR === reg.event_id ? null : reg.event_id)}
                                            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-400/10 text-brand-400 border border-brand-400/20 hover:bg-brand-400/20 transition-colors cursor-pointer text-sm font-medium"
                                        >
                                            <QrCode size={16} />
                                            <span className="hidden sm:inline">{t('registrations.showQR')}</span>
                                        </button>
                                    )}
                                </div>

                                {/* QR Code Expanded */}
                                {showQR === reg.event_id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        className="mt-4 pt-4 border-t border-surface-border text-center"
                                    >
                                        <div className="inline-block bg-white rounded-2xl p-4">
                                            {/* QR Code placeholder - replace with actual qrcode library */}
                                            <div className="w-40 h-40 bg-gray-100 rounded-xl flex items-center justify-center">
                                                <div className="text-center">
                                                    <QrCode size={48} className="mx-auto text-gray-800 mb-1" />
                                                    <p className="text-[10px] text-gray-600 font-mono">{reg.event_id}-{Date.now()}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-xs text-text-muted mt-3">
                                            Show this QR code at the event for attendance
                                        </p>
                                        <button
                                            onClick={() => setShowQR(null)}
                                            className="text-xs text-brand-400 hover:text-brand-300 mt-2 cursor-pointer transition-colors flex items-center gap-1 mx-auto"
                                        >
                                            <X size={12} />
                                            Close
                                        </button>
                                    </motion.div>
                                )}
                            </div>
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
                    <h3 className="text-lg font-semibold text-text-primary mb-1">{t('registrations.noRegistrations')}</h3>
                    <p className="text-text-secondary text-sm mb-4">
                        {activeTab === 'upcoming' ? 'Browse events and register to get started!' : 'Nothing here yet.'}
                    </p>
                    {activeTab === 'upcoming' && (
                        <Link
                            to="/events"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg text-white font-medium text-sm shadow-lg shadow-brand-400/20 transition-all"
                        >
                            {t('dashboard.quickActions.browseEvents')}
                            <ArrowRight size={16} className="icon-flip" />
                        </Link>
                    )}
                </motion.div>
            )}
        </div>
    )
}
