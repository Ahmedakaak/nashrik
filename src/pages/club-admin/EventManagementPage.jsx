import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { mockEvents, ADMIN_CLUB_ID, categoryIcons } from '../../lib/mockData'
import { CLUB_CATEGORIES, EVENT_STATUSES } from '../../lib/constants'
import {
    Plus, Search, Calendar, Users, MapPin, Clock,
    Edit3, Trash2, Eye, EyeOff, X, ChevronDown
} from 'lucide-react'

const initialForm = {
    title: '', title_ar: '', description: '', description_ar: '',
    date: '', end_date: '', location: '', location_ar: '',
    category: 'academic', max_capacity: 40, status: 'draft',
}

export default function EventManagementPage() {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'
    const [events, setEvents] = useState(mockEvents.filter(e => e.club_id === ADMIN_CLUB_ID))
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [showModal, setShowModal] = useState(false)
    const [editingEvent, setEditingEvent] = useState(null)
    const [form, setForm] = useState(initialForm)

    const filtered = useMemo(() => {
        return events.filter(e => {
            const matchSearch = (isRTL ? e.title_ar : e.title).toLowerCase().includes(search.toLowerCase())
            const matchStatus = statusFilter === 'all' || e.status === statusFilter
            return matchSearch && matchStatus
        })
    }, [events, search, statusFilter, isRTL])

    const openCreate = () => { setEditingEvent(null); setForm(initialForm); setShowModal(true) }
    const openEdit = (event) => {
        setEditingEvent(event)
        setForm({
            title: event.title, title_ar: event.title_ar,
            description: event.description, description_ar: event.description_ar,
            date: event.date?.slice(0, 16) || '', end_date: event.end_date?.slice(0, 16) || '',
            location: event.location, location_ar: event.location_ar,
            category: event.category, max_capacity: event.max_capacity, status: event.status,
        })
        setShowModal(true)
    }

    const handleSave = () => {
        if (editingEvent) {
            setEvents(prev => prev.map(e => e.id === editingEvent.id ? { ...e, ...form } : e))
        } else {
            const newEvent = {
                ...form, id: `new-${Date.now()}`, club_id: ADMIN_CLUB_ID,
                registered_count: 0, cover_url: null, tags: [], is_featured: false,
                club: { name: 'Tech Innovators', name_ar: 'المبتكرون التقنيون' },
            }
            setEvents(prev => [newEvent, ...prev])
        }
        setShowModal(false)
    }

    const handleDelete = (id) => { setEvents(prev => prev.filter(e => e.id !== id)) }

    const togglePublish = (id) => {
        setEvents(prev => prev.map(e =>
            e.id === id ? { ...e, status: e.status === 'published' ? 'draft' : 'published' } : e
        ))
    }

    const statusColors = {
        published: 'bg-status-success/15 text-status-success',
        draft: 'bg-status-warning/15 text-status-warning',
        cancelled: 'bg-status-error/15 text-status-error',
        completed: 'bg-blue-500/15 text-blue-400',
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return ''
        return new Date(dateStr).toLocaleDateString(isRTL ? 'ar-OM' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-text-primary">{t('clubAdmin.events.title')}</h1>
                    <p className="text-text-secondary mt-1">{filtered.length} events</p>
                </div>
                <button onClick={openCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg text-white font-medium hover:opacity-90 transition-opacity">
                    <Plus size={18} />
                    {t('clubAdmin.events.create')}
                </button>
            </motion.div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={18} className="absolute start-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                        type="text" placeholder={t('events.search')} value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full ps-10 pe-4 py-2.5 bg-surface-card border border-surface-border rounded-xl text-text-primary placeholder:text-text-muted text-sm"
                    />
                </div>
                <div className="relative">
                    <select
                        value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        className="appearance-none px-4 py-2.5 pe-10 bg-surface-card border border-surface-border rounded-xl text-text-primary text-sm cursor-pointer"
                    >
                        <option value="all">All Status</option>
                        {Object.values(EVENT_STATUSES).map(s => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                    </select>
                    <ChevronDown size={16} className="absolute end-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                </div>
            </div>

            {/* Events List */}
            <motion.div layout className="space-y-3">
                <AnimatePresence>
                    {filtered.map(event => (
                        <motion.div
                            key={event.id} layout
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="bg-surface-card border border-surface-border rounded-2xl p-4 hover:border-brand-400/20 transition-all"
                        >
                            <div className="flex items-start gap-4">
                                <div className="shrink-0 w-12 h-12 rounded-xl bg-brand-400/10 flex items-center justify-center text-xl">
                                    {categoryIcons[event.category]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-text-primary truncate">{isRTL ? event.title_ar : event.title}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-lg font-medium shrink-0 ${statusColors[event.status] || statusColors.draft}`}>
                                            {event.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-muted">
                                        <span className="flex items-center gap-1"><Calendar size={14} />{formatDate(event.date)}</span>
                                        <span className="flex items-center gap-1"><MapPin size={14} />{isRTL ? event.location_ar : event.location}</span>
                                        <span className="flex items-center gap-1"><Users size={14} />{event.registered_count}/{event.max_capacity}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <button onClick={() => togglePublish(event.id)} className="p-2 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-primary transition-colors" title={event.status === 'published' ? 'Unpublish' : 'Publish'}>
                                        {event.status === 'published' ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                    <button onClick={() => openEdit(event)} className="p-2 rounded-lg hover:bg-white/5 text-text-muted hover:text-brand-400 transition-colors">
                                        <Edit3 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(event.id)} className="p-2 rounded-lg hover:bg-white/5 text-text-muted hover:text-status-error transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {filtered.length === 0 && (
                    <div className="bg-surface-card border border-surface-border rounded-2xl p-12 text-center">
                        <Calendar size={40} className="mx-auto text-text-muted mb-3" />
                        <p className="text-text-secondary">No events found.</p>
                    </div>
                )}
            </motion.div>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-5 border-b border-surface-border sticky top-0 bg-surface-card z-10 rounded-t-2xl">
                                <h2 className="text-lg font-bold text-text-primary">
                                    {editingEvent ? t('clubAdmin.events.edit') : t('clubAdmin.events.create')}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-white/5 text-text-muted"><X size={20} /></button>
                            </div>
                            <div className="p-5 space-y-4">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-text-secondary mb-1 block">Title (EN)</label>
                                        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2.5 bg-surface-darker border border-surface-border rounded-xl text-text-primary text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-sm text-text-secondary mb-1 block">العنوان (AR)</label>
                                        <input dir="rtl" value={form.title_ar} onChange={e => setForm({ ...form, title_ar: e.target.value })} className="w-full px-3 py-2.5 bg-surface-darker border border-surface-border rounded-xl text-text-primary text-sm" />
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-text-secondary mb-1 block">Description (EN)</label>
                                        <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2.5 bg-surface-darker border border-surface-border rounded-xl text-text-primary text-sm resize-none" />
                                    </div>
                                    <div>
                                        <label className="text-sm text-text-secondary mb-1 block">الوصف (AR)</label>
                                        <textarea dir="rtl" rows={3} value={form.description_ar} onChange={e => setForm({ ...form, description_ar: e.target.value })} className="w-full px-3 py-2.5 bg-surface-darker border border-surface-border rounded-xl text-text-primary text-sm resize-none" />
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-text-secondary mb-1 block">Start Date & Time</label>
                                        <input type="datetime-local" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2.5 bg-surface-darker border border-surface-border rounded-xl text-text-primary text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-sm text-text-secondary mb-1 block">End Date & Time</label>
                                        <input type="datetime-local" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} className="w-full px-3 py-2.5 bg-surface-darker border border-surface-border rounded-xl text-text-primary text-sm" />
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-text-secondary mb-1 block">Location (EN)</label>
                                        <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2.5 bg-surface-darker border border-surface-border rounded-xl text-text-primary text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-sm text-text-secondary mb-1 block">الموقع (AR)</label>
                                        <input dir="rtl" value={form.location_ar} onChange={e => setForm({ ...form, location_ar: e.target.value })} className="w-full px-3 py-2.5 bg-surface-darker border border-surface-border rounded-xl text-text-primary text-sm" />
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-text-secondary mb-1 block">Category</label>
                                        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2.5 bg-surface-darker border border-surface-border rounded-xl text-text-primary text-sm">
                                            {CLUB_CATEGORIES.map(c => (
                                                <option key={c.value} value={c.value}>{c.icon} {isRTL ? c.labelAr : c.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm text-text-secondary mb-1 block">Max Capacity</label>
                                        <input type="number" min={1} value={form.max_capacity} onChange={e => setForm({ ...form, max_capacity: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2.5 bg-surface-darker border border-surface-border rounded-xl text-text-primary text-sm" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 p-5 border-t border-surface-border">
                                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border border-surface-border text-text-secondary hover:text-text-primary hover:bg-white/5 text-sm font-medium transition-colors">
                                    {t('common.cancel')}
                                </button>
                                <button onClick={handleSave} className="px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-medium hover:opacity-90 transition-opacity">
                                    {t('common.save')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
