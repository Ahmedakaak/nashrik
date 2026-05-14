import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { categoryColors, categoryIcons, CLUB_CATEGORIES } from '../../lib/constants'
import { getAllEvents, updateEvent } from '../../lib/api/events'
import { PageLoader } from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import { Calendar, Search, Star, StarOff, Eye, EyeOff, ChevronDown, Users, MapPin, Ban } from 'lucide-react'

export default function AdminEventManagementPage() {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('all')

    useEffect(() => { getAllEvents().then(setEvents).catch(console.error).finally(() => setLoading(false)) }, [])

    const filtered = useMemo(() => events.filter(e => {
        const title = (isRTL ? e.title_ar : e.title) || ''
        return title.toLowerCase().includes(search.toLowerCase()) && (categoryFilter === 'all' || e.category === categoryFilter)
    }), [events, search, categoryFilter, isRTL])

    const toggleFeatured = async (event) => {
        try { const u = await updateEvent(event.id, { is_featured: !event.is_featured }); setEvents(p => p.map(e => e.id === event.id ? u : e)); toast.success(u.is_featured ? 'Featured!' : 'Unfeatured.') }
        catch (err) { toast.error(err.message) }
    }
    const togglePublish = async (event) => {
        const ns = event.status === 'published' ? 'draft' : 'published'
        try { const u = await updateEvent(event.id, { status: ns }); setEvents(p => p.map(e => e.id === event.id ? u : e)); toast.success(`Event ${ns}!`) }
        catch (err) { toast.error(err.message) }
    }
    const cancelEvent = async (event) => {
        try { const u = await updateEvent(event.id, { status: 'cancelled' }); setEvents(p => p.map(e => e.id === event.id ? u : e)); toast.success('Event cancelled.') }
        catch (err) { toast.error(err.message) }
    }

    const statusColors = { published: 'bg-status-success/15 text-status-success', draft: 'bg-status-warning/15 text-status-warning', cancelled: 'bg-status-error/15 text-status-error', completed: 'bg-blue-500/15 text-blue-400' }
    const fmtDate = (d) => new Date(d).toLocaleDateString(isRTL ? 'ar-OM' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    if (loading) return <PageLoader />

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}><h1 className="text-2xl md:text-3xl font-bold text-text-primary">{t('admin.events.title')}</h1><p className="text-text-secondary mt-1">{filtered.length} events across all clubs</p></motion.div>
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1"><Search size={18} className="absolute start-3 top-1/2 -translate-y-1/2 text-text-muted" /><input type="text" placeholder={t('events.search')} value={search} onChange={e => setSearch(e.target.value)} className="w-full ps-10 pe-4 py-2.5 bg-surface-card border border-surface-border rounded-xl text-text-primary placeholder:text-text-muted text-sm" /></div>
                <div className="relative"><select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="appearance-none px-4 py-2.5 pe-10 bg-surface-card border border-surface-border rounded-xl text-text-primary text-sm cursor-pointer"><option value="all">All Categories</option>{CLUB_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {isRTL ? c.labelAr : c.label}</option>)}</select><ChevronDown size={16} className="absolute end-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" /></div>
            </div>
            <motion.div layout className="space-y-3">
                <AnimatePresence>
                    {filtered.map(event => {
                        const colors = categoryColors[event.category] || categoryColors.academic
                        return (
                            <motion.div key={event.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-surface-card border border-surface-border rounded-2xl p-4 hover:border-brand-400/20 transition-all">
                                <div className="flex items-start gap-4">
                                    <div className={`shrink-0 w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center text-xl`}>{categoryIcons[event.category]}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap"><h3 className="font-semibold text-text-primary truncate">{isRTL ? event.title_ar : event.title}</h3>{event.is_featured && <span className="text-xs bg-brand-400/15 text-brand-400 px-2 py-0.5 rounded-lg font-medium flex items-center gap-1"><Star size={10} className="fill-current" /> Featured</span>}<span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${statusColors[event.status] || statusColors.draft}`}>{event.status}</span></div>
                                        <p className="text-xs text-text-muted mb-1">{isRTL ? event.club?.name_ar : event.club?.name}</p>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-muted"><span className="flex items-center gap-1"><Calendar size={14} />{fmtDate(event.date)}</span><span className="flex items-center gap-1"><MapPin size={14} />{isRTL ? event.location_ar : event.location}</span><span className="flex items-center gap-1"><Users size={14} />{event.registered_count}/{event.max_capacity}</span></div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button onClick={() => toggleFeatured(event)} className={`p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer ${event.is_featured ? 'text-brand-400' : 'text-text-muted hover:text-brand-400'}`}>{event.is_featured ? <Star size={16} className="fill-current" /> : <StarOff size={16} />}</button>
                                        <button onClick={() => togglePublish(event)} className="p-2 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-primary transition-colors cursor-pointer">{event.status === 'published' ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                                        {event.status !== 'cancelled' && <button onClick={() => cancelEvent(event)} className="p-2 rounded-lg hover:bg-status-error/10 text-text-muted hover:text-status-error transition-colors cursor-pointer"><Ban size={16} /></button>}
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
                {filtered.length === 0 && <div className="bg-surface-card border border-surface-border rounded-2xl p-12 text-center"><Calendar size={40} className="mx-auto text-text-muted mb-3" /><p className="text-text-secondary">No events found.</p></div>}
            </motion.div>
        </div>
    )
}
