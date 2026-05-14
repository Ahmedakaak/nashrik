import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { categoryColors, categoryIcons } from '../../lib/constants'
import { getClubs, updateClub, deleteClub } from '../../lib/api/clubs'
import { getPendingClubs } from '../../lib/api/admin'
import { PageLoader } from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import { BookOpen, Check, X, Trash2, Users, Calendar, AlertCircle } from 'lucide-react'

export default function ClubApprovalPage() {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'
    const [pending, setPending] = useState([])
    const [clubs, setClubs] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            try {
                const [p, c] = await Promise.all([getPendingClubs(), getClubs({ status: 'approved' })])
                setPending(p); setClubs(c)
            } catch (err) { console.error(err) }
            finally { setLoading(false) }
        }
        load()
    }, [])

    const handleApprove = async (id) => {
        try { await updateClub(id, { status: 'approved' }); const club = pending.find(c => c.id === id); setPending(prev => prev.filter(c => c.id !== id)); if (club) setClubs(prev => [...prev, { ...club, status: 'approved' }]); toast.success('Club approved!') }
        catch (err) { toast.error(err.message) }
    }
    const handleReject = async (id) => {
        try { await updateClub(id, { status: 'rejected' }); setPending(prev => prev.filter(c => c.id !== id)); toast.success('Club rejected.') }
        catch (err) { toast.error(err.message) }
    }
    const handleDelete = async (id) => {
        try { await deleteClub(id); setClubs(prev => prev.filter(c => c.id !== id)); toast.success('Club deleted.') }
        catch (err) { toast.error(err.message) }
    }

    const stats = [
        { label: 'Total Clubs', value: clubs.length, icon: BookOpen, color: 'text-brand-400', bg: 'bg-brand-400/10' },
        { label: 'Pending', value: pending.length, icon: AlertCircle, color: 'text-status-warning', bg: 'bg-status-warning/10' },
        { label: 'Total Members', value: clubs.reduce((s, c) => s + (c.member_count || 0), 0), icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    ]

    if (loading) return <PageLoader />

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}><h1 className="text-2xl md:text-3xl font-bold text-text-primary">{t('admin.clubs.title')}</h1><p className="text-text-secondary mt-1">Manage club applications and existing clubs</p></motion.div>

            <div className="grid grid-cols-3 gap-4">
                {stats.map((s, i) => (<div key={i} className="bg-surface-card border border-surface-border rounded-2xl p-4 text-center"><div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-2`}><s.icon size={20} className={s.color} /></div><p className="text-xl font-bold text-text-primary">{s.value}</p><p className="text-xs text-text-muted">{s.label}</p></div>))}
            </div>

            {pending.length > 0 && (
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2"><AlertCircle size={18} className="text-status-warning" />Pending Applications ({pending.length})</h2>
                    <div className="space-y-3">
                        <AnimatePresence>
                            {pending.map(club => {
                                const colors = categoryColors[club.category] || categoryColors.academic
                                return (
                                    <motion.div key={club.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -80 }} className="bg-surface-card border border-surface-border rounded-2xl p-5 hover:border-brand-400/20 transition-all">
                                        <div className="flex items-start gap-4">
                                            <div className={`shrink-0 w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center text-xl`}>{categoryIcons[club.category]}</div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-text-primary">{isRTL ? club.name_ar : club.name}</h3>
                                                <p className="text-sm text-text-secondary mt-1 line-clamp-2">{isRTL ? club.description_ar : club.description}</p>
                                                <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                                                    <span className={`px-2 py-0.5 rounded-md ${colors.bg} ${colors.text} font-medium`}>{club.category}</span>
                                                    <span>by {isRTL ? club.admin?.full_name_ar : club.admin?.full_name}</span>
                                                    <span><Calendar size={12} className="inline mr-1" />{new Date(club.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button onClick={() => handleApprove(club.id)} className="p-2.5 rounded-xl bg-status-success/10 text-status-success hover:bg-status-success/20 transition-colors cursor-pointer"><Check size={18} /></button>
                                                <button onClick={() => handleReject(club.id)} className="p-2.5 rounded-xl bg-status-error/10 text-status-error hover:bg-status-error/20 transition-colors cursor-pointer"><X size={18} /></button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>
                    </div>
                </motion.section>
            )}

            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h2 className="text-lg font-semibold text-text-primary mb-4">Active Clubs ({clubs.length})</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                        {clubs.map(club => {
                            const colors = categoryColors[club.category] || categoryColors.academic
                            return (
                                <motion.div key={club.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden hover:border-brand-400/20 hover-lift transition-all">
                                    <div className={`h-16 ${colors.bg} flex items-center justify-center text-2xl`}>{categoryIcons[club.category]}</div>
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-1"><h3 className="font-semibold text-text-primary text-sm truncate">{isRTL ? club.name_ar : club.name}</h3><button onClick={() => handleDelete(club.id)} className="p-1.5 rounded-lg hover:bg-status-error/10 text-text-muted hover:text-status-error transition-colors shrink-0 cursor-pointer"><Trash2 size={14} /></button></div>
                                        <div className="flex items-center gap-3 text-xs text-text-muted mt-2"><span className={`px-2 py-0.5 rounded-md ${colors.bg} ${colors.text} font-medium`}>{club.category}</span><span className="flex items-center gap-1"><Users size={12} />{club.member_count || 0}</span></div>
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
