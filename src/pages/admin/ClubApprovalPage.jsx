import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { mockPendingClubs, mockClubs, categoryIcons, categoryColors } from '../../lib/mockData'
import {
    BookOpen, Check, X, Trash2, Users, Calendar, AlertCircle
} from 'lucide-react'

export default function ClubApprovalPage() {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'
    const [pending, setPending] = useState(mockPendingClubs)
    const [clubs, setClubs] = useState(mockClubs)

    const handleApprove = (id) => {
        const club = pending.find(c => c.id === id)
        if (club) {
            setPending(prev => prev.filter(c => c.id !== id))
            setClubs(prev => [...prev, { ...club, status: 'approved', member_count: 0, created_at: new Date().toISOString() }])
        }
    }

    const handleReject = (id) => {
        setPending(prev => prev.filter(c => c.id !== id))
    }

    const handleDelete = (id) => {
        setClubs(prev => prev.filter(c => c.id !== id))
    }

    const stats = [
        { label: 'Total Clubs', value: clubs.length, icon: BookOpen, color: 'text-brand-400', bg: 'bg-brand-400/10' },
        { label: 'Pending', value: pending.length, icon: AlertCircle, color: 'text-status-warning', bg: 'bg-status-warning/10' },
        { label: 'Total Members', value: clubs.reduce((s, c) => s + c.member_count, 0), icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    ]

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary">{t('admin.clubs.title')}</h1>
                <p className="text-text-secondary mt-1">Manage club applications and existing clubs</p>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-surface-card border border-surface-border rounded-2xl p-4 text-center">
                        <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
                            <stat.icon size={20} className={stat.color} />
                        </div>
                        <p className="text-xl font-bold text-text-primary">{stat.value}</p>
                        <p className="text-xs text-text-muted">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Pending Applications */}
            {pending.length > 0 && (
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                        <AlertCircle size={18} className="text-status-warning" />
                        Pending Applications ({pending.length})
                    </h2>
                    <div className="space-y-3">
                        <AnimatePresence>
                            {pending.map(club => {
                                const colors = categoryColors[club.category] || categoryColors.academic
                                return (
                                    <motion.div
                                        key={club.id} layout
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -80 }}
                                        className="bg-surface-card border border-surface-border rounded-2xl p-5 hover:border-brand-400/20 transition-all"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`shrink-0 w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center text-xl`}>
                                                {categoryIcons[club.category]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-text-primary">{isRTL ? club.name_ar : club.name}</h3>
                                                <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                                                    {isRTL ? club.description_ar : club.description}
                                                </p>
                                                <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                                                    <span className={`px-2 py-0.5 rounded-md ${colors.bg} ${colors.text} font-medium`}>{club.category}</span>
                                                    <span>by {isRTL ? club.requested_by_ar : club.requested_by}</span>
                                                    <span><Calendar size={12} className="inline mr-1" />{club.requested_at}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button onClick={() => handleApprove(club.id)} className="p-2.5 rounded-xl bg-status-success/10 text-status-success hover:bg-status-success/20 transition-colors" title={t('admin.clubs.approve')}>
                                                    <Check size={18} />
                                                </button>
                                                <button onClick={() => handleReject(club.id)} className="p-2.5 rounded-xl bg-status-error/10 text-status-error hover:bg-status-error/20 transition-colors" title={t('admin.clubs.reject')}>
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>
                    </div>
                </motion.section>
            )}

            {/* Existing Clubs */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h2 className="text-lg font-semibold text-text-primary mb-4">Active Clubs ({clubs.length})</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                        {clubs.map(club => {
                            const colors = categoryColors[club.category] || categoryColors.academic
                            return (
                                <motion.div
                                    key={club.id} layout
                                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                                    className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden hover:border-brand-400/20 hover-lift transition-all"
                                >
                                    <div className={`h-16 ${colors.bg} flex items-center justify-center text-2xl`}>
                                        {categoryIcons[club.category]}
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-semibold text-text-primary text-sm truncate">{isRTL ? club.name_ar : club.name}</h3>
                                            <button onClick={() => handleDelete(club.id)} className="p-1.5 rounded-lg hover:bg-status-error/10 text-text-muted hover:text-status-error transition-colors shrink-0" title={t('admin.clubs.delete')}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-text-muted mt-2">
                                            <span className={`px-2 py-0.5 rounded-md ${colors.bg} ${colors.text} font-medium`}>{club.category}</span>
                                            <span className="flex items-center gap-1"><Users size={12} />{club.member_count}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>
            </motion.section>
        </div>
    )
}
