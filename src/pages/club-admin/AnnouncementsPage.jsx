import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { getClubByAdminId } from '../../lib/api/clubs'
import { getClubAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../../lib/api/announcements'
import { PageLoader } from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import { Megaphone, Plus, Edit3, Trash2, ChevronDown, ChevronUp, AlertCircle, X, Clock } from 'lucide-react'

const initialForm = { title: '', title_ar: '', content: '', content_ar: '', priority: 'normal', type: 'club' }

export default function AnnouncementsPage() {
    const { t, i18n } = useTranslation()
    const { user } = useAuth()
    const isRTL = i18n.language === 'ar'
    const [club, setClub] = useState(null)
    const [announcements, setAnnouncements] = useState([])
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [editingAnn, setEditingAnn] = useState(null)
    const [form, setForm] = useState(initialForm)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (!user) return
        async function load() {
            try {
                const c = await getClubByAdminId(user.id)
                if (c?.status === 'approved') { setClub(c); setAnnouncements(await getClubAnnouncements(c.id)) }
            } catch (err) { console.error(err) }
            finally { setLoading(false) }
        }
        load()
    }, [user])

    const openCreate = () => { setEditingAnn(null); setForm(initialForm); setShowModal(true) }
    const openEdit = (ann) => { setEditingAnn(ann); setForm({ title: ann.title, title_ar: ann.title_ar || '', content: ann.content, content_ar: ann.content_ar || '', priority: ann.priority || 'normal', type: ann.type || 'club' }); setShowModal(true) }

    const handleSave = async () => {
        setSaving(true)
        try {
            if (editingAnn) {
                const updated = await updateAnnouncement(editingAnn.id, form)
                setAnnouncements(prev => prev.map(a => a.id === editingAnn.id ? updated : a))
                toast.success('Announcement updated!')
            } else {
                const created = await createAnnouncement({ ...form, club_id: club.id, author_id: user.id })
                setAnnouncements(prev => [created, ...prev])
                toast.success('Announcement created!')
            }
            setShowModal(false)
        } catch (err) { toast.error(err.message || 'Failed to save') }
        finally { setSaving(false) }
    }

    const handleDelete = async (id) => {
        try { await deleteAnnouncement(id); setAnnouncements(prev => prev.filter(a => a.id !== id)); toast.success('Deleted.') }
        catch (err) { toast.error(err.message) }
    }

    const priorityColors = { high: 'bg-status-error/15 text-status-error border-status-error/20', normal: 'bg-blue-500/15 text-blue-400 border-blue-500/20', low: 'bg-surface-darker text-text-muted border-surface-border' }
    const formatDate = (d) => new Date(d).toLocaleDateString(isRTL ? 'ar-OM' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })

    if (loading) return <PageLoader />

    return (
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div><h1 className="text-2xl md:text-3xl font-bold text-text-primary">{t('clubAdmin.announcements.title')}</h1><p className="text-text-secondary mt-1">{announcements.length} announcements</p></div>
                <button onClick={openCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg text-white font-medium hover:opacity-90 transition-opacity cursor-pointer"><Plus size={18} /> New Announcement</button>
            </motion.div>

            <motion.div layout className="space-y-3">
                <AnimatePresence>
                    {announcements.map(ann => (
                        <motion.div key={ann.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50 }} className={`bg-surface-card border rounded-2xl overflow-hidden transition-colors ${expanded === ann.id ? 'border-brand-400/30' : 'border-surface-border hover:border-brand-400/20'}`}>
                            <div className="p-4 cursor-pointer" onClick={() => setExpanded(expanded === ann.id ? null : ann.id)}>
                                <div className="flex items-start gap-3">
                                    <div className="shrink-0 mt-0.5">{ann.priority === 'high' ? <AlertCircle size={20} className="text-status-error" /> : <Megaphone size={20} className="text-brand-400" />}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1"><h3 className="font-semibold text-text-primary truncate">{isRTL ? ann.title_ar : ann.title}</h3><span className={`text-xs px-2 py-0.5 rounded-lg font-medium shrink-0 ${priorityColors[ann.priority]}`}>{ann.priority}</span></div>
                                        <div className="flex items-center gap-3 text-xs text-text-muted">
                                            <span className="flex items-center gap-1"><Clock size={12} />{formatDate(ann.created_at)}</span>
                                            <span>by {isRTL ? ann.author?.full_name_ar : ann.author?.full_name}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button onClick={e => { e.stopPropagation(); openEdit(ann) }} className="p-2 rounded-lg hover:bg-white/5 text-text-muted hover:text-brand-400 transition-colors cursor-pointer"><Edit3 size={15} /></button>
                                        <button onClick={e => { e.stopPropagation(); handleDelete(ann.id) }} className="p-2 rounded-lg hover:bg-white/5 text-text-muted hover:text-status-error transition-colors cursor-pointer"><Trash2 size={15} /></button>
                                        {expanded === ann.id ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
                                    </div>
                                </div>
                            </div>
                            <AnimatePresence>
                                {expanded === ann.id && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                        <div className="px-4 pb-4 ps-12"><p className="text-sm text-text-secondary leading-relaxed">{isRTL ? ann.content_ar : ann.content}</p></div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {announcements.length === 0 && <div className="bg-surface-card border border-surface-border rounded-2xl p-12 text-center"><Megaphone size={40} className="mx-auto text-text-muted mb-3" /><p className="text-text-secondary">No announcements yet.</p></div>}
            </motion.div>

            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between p-5 border-b border-surface-border"><h2 className="text-lg font-bold text-text-primary">{editingAnn ? 'Edit Announcement' : 'New Announcement'}</h2><button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-white/5 text-text-muted cursor-pointer"><X size={20} /></button></div>
                            <div className="p-5 space-y-4">
                                <div className="grid sm:grid-cols-2 gap-4"><div><label className="text-sm text-text-secondary mb-1 block">Title (EN)</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2.5 bg-surface-darker border border-surface-border rounded-xl text-text-primary text-sm" /></div><div><label className="text-sm text-text-secondary mb-1 block">العنوان (AR)</label><input dir="rtl" value={form.title_ar} onChange={e => setForm({ ...form, title_ar: e.target.value })} className="w-full px-3 py-2.5 bg-surface-darker border border-surface-border rounded-xl text-text-primary text-sm" /></div></div>
                                <div><label className="text-sm text-text-secondary mb-1 block">Content (EN)</label><textarea rows={3} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className="w-full px-3 py-2.5 bg-surface-darker border border-surface-border rounded-xl text-text-primary text-sm resize-none" /></div>
                                <div><label className="text-sm text-text-secondary mb-1 block">المحتوى (AR)</label><textarea dir="rtl" rows={3} value={form.content_ar} onChange={e => setForm({ ...form, content_ar: e.target.value })} className="w-full px-3 py-2.5 bg-surface-darker border border-surface-border rounded-xl text-text-primary text-sm resize-none" /></div>
                                <div><label className="text-sm text-text-secondary mb-1 block">Priority</label><div className="flex gap-2">{['normal', 'high', 'low'].map(p => <button key={p} onClick={() => setForm({ ...form, priority: p })} className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors cursor-pointer ${form.priority === p ? priorityColors[p] : 'border-surface-border text-text-muted hover:bg-white/5'}`}>{p.charAt(0).toUpperCase() + p.slice(1)}</button>)}</div></div>
                                <div><label className="text-sm text-text-secondary mb-1 block">Type</label><div className="flex gap-2">{['club', 'event', 'reminder'].map(t => <button key={t} onClick={() => setForm({ ...form, type: t })} className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors cursor-pointer ${form.type === t ? 'bg-brand-400/15 text-brand-400 border-brand-400/20' : 'border-surface-border text-text-muted hover:bg-white/5'}`}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>)}</div></div>
                            </div>
                            <div className="flex justify-end gap-3 p-5 border-t border-surface-border">
                                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border border-surface-border text-text-secondary hover:text-text-primary hover:bg-white/5 text-sm font-medium transition-colors cursor-pointer">{t('common.cancel')}</button>
                                <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50">{saving ? 'Saving...' : t('common.save')}</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
