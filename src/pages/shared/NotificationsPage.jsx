import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { NOTIFICATION_TYPES } from '../../lib/constants'
import { useAuth } from '../../contexts/AuthContext'
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, subscribeToNotifications } from '../../lib/api/notifications'
import { PageLoader } from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import { Bell, Calendar, BookOpen, Settings, AlertCircle, CheckCheck, Trash2 } from 'lucide-react'

const typeConfig = {
    event: { icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    club: { icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    system: { icon: Settings, color: 'text-brand-400', bg: 'bg-brand-400/10' },
    reminder: { icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-400/10' },
}

export default function NotificationsPage() {
    const { t, i18n } = useTranslation()
    const { user } = useAuth()
    const isRTL = i18n.language === 'ar'
    const [notifications, setNotifications] = useState([])
    const [filter, setFilter] = useState('all')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        async function load() {
            try {
                const data = await getNotifications(user.id)
                setNotifications(data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        load()

        // Subscribe to real-time notifications
        const channel = subscribeToNotifications(user.id, (newNotif) => {
            setNotifications(prev => [newNotif, ...prev])
        })

        return () => {
            if (channel) channel.unsubscribe()
        }
    }, [user, isRTL])

    const filtered = useMemo(() =>
        filter === 'all' ? notifications :
            filter === 'unread' ? notifications.filter(n => !n.read) :
                notifications.filter(n => n.type === filter)
        , [notifications, filter])

    const unreadCount = notifications.filter(n => !n.read).length

    const handleMarkAsRead = async (id) => {
        const notif = notifications.find(n => n.id === id)
        if (notif?.read) return
        try {
            await markAsRead(id)
            setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n))
        } catch (err) {
            toast.error(err.message)
        }
    }

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead(user.id)
            setNotifications(p => p.map(n => ({ ...n, read: true })))
            toast.success('All marked as read')
        } catch (err) {
            toast.error(err.message)
        }
    }

    const handleDelete = async (id) => {
        try {
            await deleteNotification(id)
            setNotifications(p => p.filter(n => n.id !== id))
        } catch (err) {
            toast.error(err.message)
        }
    }

    const formatTime = (d) => {
        const diff = Date.now() - new Date(d).getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 60) return `${mins}m ago`
        const hrs = Math.floor(mins / 60)
        if (hrs < 24) return `${hrs}h ago`
        return `${Math.floor(hrs / 24)}d ago`
    }

    const filters = [
        { key: 'all', label: 'All' },
        { key: 'unread', label: `Unread (${unreadCount})` },
        ...Object.entries(NOTIFICATION_TYPES).map(([, v]) => ({ key: v, label: t(`notifications.types.${v}`) })),
    ]

    if (loading) return <PageLoader />

    return (
        <div className="w-full max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                    <h1 className="text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-2">
                        <Bell size={28} className="text-brand-400" /> {t('notifications.title')}
                    </h1>
                    {unreadCount > 0 && <p className="text-text-secondary mt-1">{unreadCount} unread</p>}
                </div>
                {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors cursor-pointer">
                        <CheckCheck size={16} /> {t('notifications.markAllRead')}
                    </button>
                )}
            </motion.div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
                {filters.map(f => (
                    <button key={f.key} onClick={() => setFilter(f.key)} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${filter === f.key ? 'gradient-bg text-white' : 'bg-surface-card border border-surface-border text-text-secondary hover:text-text-primary'}`}>
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Notifications */}
            <div className="space-y-2">
                <AnimatePresence>
                    {filtered.map(notif => {
                        const cfg = typeConfig[notif.type] || typeConfig.system
                        const Icon = cfg.icon
                        return (
                            <motion.div key={notif.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50 }}
                                className={`bg-surface-card border rounded-2xl p-4 transition-all cursor-pointer ${notif.read ? 'border-surface-border' : 'border-brand-400/30 bg-brand-400/[0.03]'}`}
                                onClick={() => handleMarkAsRead(notif.id)}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`shrink-0 w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center`}>
                                        <Icon size={18} className={cfg.color} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            {!notif.read && <span className="w-2 h-2 rounded-full bg-brand-400 shrink-0" />}
                                            <h3 className="text-sm font-semibold text-text-primary truncate">{isRTL ? notif.title_ar : notif.title}</h3>
                                        </div>
                                        <p className="text-sm text-text-secondary line-clamp-2">{isRTL ? notif.message_ar : notif.message}</p>
                                        <p className="text-xs text-text-muted mt-1">{formatTime(notif.created_at)}</p>
                                    </div>
                                    <button onClick={e => { e.stopPropagation(); handleDelete(notif.id) }} className="p-1.5 rounded-lg hover:bg-status-error/10 text-text-muted hover:text-status-error transition-colors shrink-0 cursor-pointer">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
                {filtered.length === 0 && (
                    <div className="bg-surface-card border border-surface-border rounded-2xl p-12 text-center">
                        <Bell size={40} className="mx-auto text-text-muted mb-3" />
                        <p className="text-text-secondary">{t('notifications.noNotifications')}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
