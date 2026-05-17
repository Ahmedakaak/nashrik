import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { motion } from 'framer-motion'
import { CLUB_CATEGORIES, categoryIcons } from '../../lib/constants'
import { getClubByAdminId, updateClub, uploadClubCoverImage } from '../../lib/api/clubs'
import { getEventsByClub } from '../../lib/api/events'
import { getClubMembers } from '../../lib/api/memberships'
import { getClubAnnouncements } from '../../lib/api/announcements'
import { PageLoader } from '../../components/common/LoadingSpinner'
import { Users, Calendar, TrendingUp, BarChart3, ArrowRight, Plus, QrCode, Clock, UserPlus, AlertCircle, XCircle, Pencil, ImagePlus, X, Save, ChevronDown } from 'lucide-react'

const ALLOWED_COVER_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_COVER_SIZE = 5 * 1024 * 1024

const getClubForm = (club) => ({
    name: club?.name || '',
    name_ar: club?.name_ar || '',
    description: club?.description || '',
    description_ar: club?.description_ar || '',
    category: club?.category || 'academic',
    cover_url: club?.cover_url || '',
})

export default function DashboardPage() {
    const { t, i18n } = useTranslation()
    const { user } = useAuth()
    const isRTL = i18n.language === 'ar'
    const [club, setClub] = useState(null)
    const [clubEvents, setClubEvents] = useState([])
    const [members, setMembers] = useState([])
    const [announcements, setAnnouncements] = useState([])
    const [loading, setLoading] = useState(true)
    const [showEditModal, setShowEditModal] = useState(false)
    const [editForm, setEditForm] = useState(getClubForm(null))
    const [savingClub, setSavingClub] = useState(false)
    const [uploadingCover, setUploadingCover] = useState(false)
    const [coverFile, setCoverFile] = useState(null)
    const [coverPreview, setCoverPreview] = useState('')

    useEffect(() => {
        if (!user) return
        async function load() {
            try {
                const c = await getClubByAdminId(user.id)
                if (!c) { setLoading(false); return }
                setClub(c)
                const [events, membs, anns] = await Promise.all([
                    getEventsByClub(c.id), getClubMembers(c.id), getClubAnnouncements(c.id),
                ])
                setClubEvents(events); setMembers(membs); setAnnouncements(anns)
            } catch (err) { console.error('ClubAdmin Dashboard error:', err) }
            finally { setLoading(false) }
        }
        load()
    }, [user])

    useEffect(() => {
        return () => {
            if (coverPreview?.startsWith('blob:')) URL.revokeObjectURL(coverPreview)
        }
    }, [coverPreview])

    const openEditModal = () => {
        const nextForm = getClubForm(club)
        setEditForm(nextForm)
        setCoverFile(null)
        setCoverPreview(nextForm.cover_url)
        setShowEditModal(true)
    }

    const closeEditModal = () => {
        if (savingClub || uploadingCover) return
        setShowEditModal(false)
        setCoverFile(null)
        setCoverPreview('')
    }

    const handleCoverChange = (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (!ALLOWED_COVER_TYPES.includes(file.type)) {
            toast.error('Cover image must be a JPG, PNG, or WebP file.')
            event.target.value = ''
            return
        }

        if (file.size > MAX_COVER_SIZE) {
            toast.error('Cover image must be 5MB or smaller.')
            event.target.value = ''
            return
        }

        if (coverPreview?.startsWith('blob:')) URL.revokeObjectURL(coverPreview)
        setCoverFile(file)
        setCoverPreview(URL.createObjectURL(file))
    }

    const handleSaveClub = async (event) => {
        event.preventDefault()

        if (!editForm.name || !editForm.name_ar || !editForm.description || !editForm.description_ar || !editForm.category) {
            toast.error('Please fill in all editable fields.')
            return
        }

        setSavingClub(true)
        setUploadingCover(!!coverFile)

        try {
            let coverUrl = editForm.cover_url
            if (coverFile) {
                coverUrl = await uploadClubCoverImage(coverFile)
            }

            const updatedClub = await updateClub(club.id, {
                name: editForm.name,
                name_ar: editForm.name_ar,
                description: editForm.description,
                description_ar: editForm.description_ar,
                category: editForm.category,
                cover_url: coverUrl,
            })

            setClub(updatedClub)
            setShowEditModal(false)
            setCoverFile(null)
            setCoverPreview('')
            toast.success('Club updated successfully.')
        } catch (err) {
            console.error('Club update error:', err)
            toast.error(err.message || 'Failed to update club.')
        } finally {
            setSavingClub(false)
            setUploadingCover(false)
        }
    }

    if (loading) return <PageLoader />
    if (!club) return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 text-center">
            <AlertCircle size={48} className="mx-auto text-text-muted mb-4" />
            <h2 className="text-xl font-bold text-text-primary mb-2">{t('clubAdmin.apply.noClubTitle') || 'No Club Assigned'}</h2>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">{t('clubAdmin.apply.noClubDesc') || "You don't have an assigned club yet. You can apply to start a new club."}</p>
            <Link to="/club-admin/apply" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-bg text-white font-medium hover:shadow-lg hover:shadow-brand-400/20 transition-all">
                {t('clubAdmin.apply.startClubBtn') || 'Apply for a Club'}
                <ArrowRight size={18} className="icon-flip" />
            </Link>
        </div>
    )

    if (club.status === 'pending') return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 text-center">
            <div className="w-16 h-16 bg-status-warning/10 text-status-warning rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock size={32} />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">{t('clubAdmin.apply.pendingTitle') || 'Application Pending'}</h2>
            <p className="text-text-secondary max-w-md mx-auto">{t('clubAdmin.apply.pendingDesc') || 'Your club application is currently under review by the system administrators. You will be notified once it is approved.'}</p>
        </div>
    )

    if (club.status === 'rejected') return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 text-center">
            <div className="w-16 h-16 bg-status-error/10 text-status-error rounded-2xl flex items-center justify-center mx-auto mb-4">
                <XCircle size={32} />
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-status-error/15 text-status-error text-xs font-medium mb-4">
                Rejected
            </span>
            <h2 className="text-xl font-bold text-text-primary mb-2">Application Rejected</h2>
            <p className="text-text-secondary max-w-md mx-auto">Your club application was rejected by a system administrator. This club is not active and cannot be managed.</p>
        </div>
    )

    const approvedMembers = members.filter(m => m.status === 'approved')
    const pendingMembers = members.filter(m => m.status === 'pending')
    const upcomingEvents = clubEvents.filter(e => new Date(e.date) > new Date()).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 3)
    const avgAttendance = clubEvents.length === 0 ? 0 : Math.round(clubEvents.reduce((s, e) => s + (e.registered_count || 0), 0) / clubEvents.length)

    const stats = [
        { label: t('clubAdmin.dashboard.totalMembers'), value: approvedMembers.length, icon: Users, color: 'text-brand-400', bg: 'bg-brand-400/10' },
        { label: t('clubAdmin.dashboard.upcomingEvents'), value: upcomingEvents.length, icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: t('clubAdmin.dashboard.totalEvents'), value: clubEvents.length, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        { label: t('clubAdmin.dashboard.avgAttendance'), value: avgAttendance, icon: BarChart3, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    ]
    const quickActions = [
        { label: t('clubAdmin.events.create'), icon: Plus, to: '/club-admin/events', color: 'text-brand-400', bg: 'bg-brand-400/10' },
        { label: t('clubAdmin.scanner.title'), icon: QrCode, to: '/club-admin/scanner', color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: t('clubAdmin.members.title'), icon: UserPlus, to: '/club-admin/members', color: 'text-purple-400', bg: 'bg-purple-400/10' },
        { label: t('clubAdmin.analytics.title'), icon: BarChart3, to: '/club-admin/analytics', color: 'text-orange-400', bg: 'bg-orange-400/10' },
    ]
    const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
    const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }
    const formatDate = (d) => new Date(d).toLocaleDateString(isRTL ? 'ar-OM' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    const ClubCategoryIcon = categoryIcons[club.category] || categoryIcons.academic
    const clubCategory = CLUB_CATEGORIES.find(c => c.value === club.category)

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-8">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary">{t('clubAdmin.dashboard.title')}</h1>
                <p className="text-text-secondary mt-1">{isRTL ? club?.name_ar : club?.name} — {t('clubAdmin.dashboard.title')}</p>
            </motion.div>

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={openEditModal}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface-card px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:border-brand-400/40 hover:bg-white/5"
                >
                    <Pencil size={16} />
                    Edit Club
                </button>
            </div>

            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div key={i} variants={item} className="bg-surface-card border border-surface-border rounded-2xl p-5 hover-lift">
                        <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}><stat.icon size={20} className={stat.color} /></div>
                        <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                        <p className="text-sm text-text-muted mt-0.5">{stat.label}</p>
                    </motion.div>
                ))}
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-text-primary">{t('clubAdmin.dashboard.upcomingEvents')}</h2>
                            <Link to="/club-admin/events" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">{t('common.viewAll')}<ArrowRight size={14} className="icon-flip" /></Link>
                        </div>
                        {upcomingEvents.length > 0 ? (
                            <div className="space-y-3">
                                {upcomingEvents.map(event => (
                                    <div key={event.id} className="bg-surface-card border border-surface-border rounded-2xl p-4 hover:border-brand-400/30 transition-all">
                                        <div className="flex items-start gap-4">
                                            <div className="shrink-0 w-12 h-12 rounded-xl bg-brand-400/10 flex items-center justify-center text-lg">
                                                {(() => {
                                                    const CategoryIcon = categoryIcons[event.category] || categoryIcons.academic
                                                    return <CategoryIcon size={20} />
                                                })()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-text-primary truncate">{isRTL ? event.title_ar : event.title}</h3>
                                                <div className="flex items-center gap-3 mt-1 text-sm text-text-muted">
                                                    <span className="flex items-center gap-1"><Clock size={14} />{formatDate(event.date)}</span>
                                                    <span className="flex items-center gap-1"><Users size={14} />{event.registered_count}/{event.max_capacity}</span>
                                                </div>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-lg font-medium ${event.status === 'published' ? 'bg-status-success/15 text-status-success' : 'bg-status-warning/15 text-status-warning'}`}>{event.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-surface-card border border-surface-border rounded-2xl p-8 text-center"><Calendar size={40} className="mx-auto text-text-muted mb-3" /><p className="text-text-secondary">No upcoming events.</p></div>
                        )}
                    </motion.section>

                    {pendingMembers.length > 0 && (
                        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2"><AlertCircle size={18} className="text-status-warning" />{t('clubAdmin.members.pendingRequests')} ({pendingMembers.length})</h2>
                                <Link to="/club-admin/members" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">{t('common.viewAll')}<ArrowRight size={14} className="icon-flip" /></Link>
                            </div>
                            <div className="space-y-2">
                                {pendingMembers.slice(0, 5).map(member => (
                                    <div key={member.id} className="bg-surface-card border border-surface-border rounded-xl p-3 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400/20 to-brand-600/20 flex items-center justify-center text-brand-400 font-semibold border border-brand-400/20">
                                            {(isRTL ? member.profile?.full_name_ar : member.profile?.full_name)?.charAt(0) || '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-text-primary truncate">{isRTL ? member.profile?.full_name_ar : member.profile?.full_name}</p>
                                            <p className="text-xs text-text-muted">{member.profile?.student_id}</p>
                                        </div>
                                        <span className="text-xs bg-status-warning/15 text-status-warning px-2 py-1 rounded-lg font-medium">Pending</span>
                                    </div>
                                ))}
                            </div>
                        </motion.section>
                    )}
                </div>

                <div className="space-y-6">
                    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="overflow-hidden rounded-2xl border border-surface-border bg-surface-card">
                        <div className="relative h-36 bg-surface-darker">
                            {club.cover_url ? (
                                <img src={club.cover_url} alt="" className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full items-center justify-center text-text-muted">
                                    <ClubCategoryIcon size={36} />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <span className="absolute bottom-3 start-3 inline-flex items-center gap-1.5 rounded-lg bg-black/45 px-2.5 py-1 text-xs font-medium text-white">
                                <ClubCategoryIcon size={14} />
                                {isRTL ? clubCategory?.labelAr : clubCategory?.label}
                            </span>
                        </div>
                        <div className="p-5">
                            <h3 className="truncate font-semibold text-text-primary">{isRTL ? club.name_ar : club.name}</h3>
                            <p className="mt-1 line-clamp-3 text-sm text-text-secondary">{isRTL ? club.description_ar : club.description}</p>
                            <button
                                type="button"
                                onClick={openEditModal}
                                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-400/10 px-4 py-2.5 text-sm font-medium text-brand-400 transition-colors hover:bg-brand-400/15"
                            >
                                <Pencil size={16} />
                                Edit Club
                            </button>
                        </div>
                    </motion.section>

                    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-surface-card border border-surface-border rounded-2xl p-5">
                        <h3 className="font-semibold text-text-primary mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            {quickActions.map((action, i) => (
                                <Link key={i} to={action.to} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-text-secondary hover:text-text-primary transition-colors group">
                                    <div className={`w-9 h-9 rounded-lg ${action.bg} flex items-center justify-center shrink-0`}><action.icon size={18} className={action.color} /></div>
                                    <span className="text-sm font-medium">{action.label}</span>
                                    <ArrowRight size={14} className="ms-auto text-text-muted group-hover:text-brand-400 transition-colors icon-flip" />
                                </Link>
                            ))}
                        </div>
                    </motion.section>

                    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-surface-card border border-surface-border rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-text-primary">{t('clubAdmin.announcements.title')}</h3>
                            <Link to="/club-admin/announcements" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">{t('common.viewAll')}</Link>
                        </div>
                        <div className="space-y-3">
                            {announcements.slice(0, 3).map(ann => (
                                <div key={ann.id} className="border-b border-surface-border pb-3 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        {ann.priority === 'high' && <span className="text-xs bg-status-error/15 text-status-error px-1.5 py-0.5 rounded font-medium">!</span>}
                                        <p className="text-sm font-medium text-text-primary truncate">{isRTL ? ann.title_ar : ann.title}</p>
                                    </div>
                                    <p className="text-xs text-text-muted line-clamp-2">{isRTL ? ann.content_ar : ann.content}</p>
                                </div>
                            ))}
                            {announcements.length === 0 && <p className="text-sm text-text-muted text-center py-2">No announcements yet.</p>}
                        </div>
                    </motion.section>
                </div>
            </div>

            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <motion.form
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onSubmit={handleSaveClub}
                        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-surface-border bg-surface-card p-5 shadow-2xl md:p-6"
                    >
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-text-primary">Edit Club</h2>
                                <p className="mt-1 text-sm text-text-secondary">Update public club information and cover photo.</p>
                            </div>
                            <button
                                type="button"
                                onClick={closeEditModal}
                                disabled={savingClub || uploadingCover}
                                className="rounded-xl p-2 text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-text-secondary">Club Name (English)</label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="w-full rounded-xl border border-surface-border bg-surface-darker px-4 py-3 text-left text-sm text-text-primary outline-none transition-all placeholder:text-text-muted focus:border-brand-400/50 focus:ring-1 focus:ring-brand-400/50"
                                        dir="ltr"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-text-secondary">Club Name (Arabic)</label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.name_ar}
                                        onChange={(e) => setEditForm({ ...editForm, name_ar: e.target.value })}
                                        className="w-full rounded-xl border border-surface-border bg-surface-darker px-4 py-3 text-right text-sm text-text-primary outline-none transition-all placeholder:text-text-muted focus:border-brand-400/50 focus:ring-1 focus:ring-brand-400/50"
                                        dir="rtl"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-text-secondary">Category</label>
                                <div className="relative">
                                    <select
                                        required
                                        value={editForm.category}
                                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                        className="w-full appearance-none rounded-xl border border-surface-border bg-surface-darker px-4 py-3 pe-10 text-sm text-text-primary outline-none transition-all focus:border-brand-400/50 focus:ring-1 focus:ring-brand-400/50"
                                    >
                                        {CLUB_CATEGORIES.map(cat => (
                                            <option key={cat.value} value={cat.value}>
                                                {isRTL ? cat.labelAr : cat.label}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-text-secondary">Description (English)</label>
                                    <textarea
                                        required
                                        rows="5"
                                        value={editForm.description}
                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                        className="w-full resize-none rounded-xl border border-surface-border bg-surface-darker px-4 py-3 text-left text-sm text-text-primary outline-none transition-all placeholder:text-text-muted focus:border-brand-400/50 focus:ring-1 focus:ring-brand-400/50"
                                        dir="ltr"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-text-secondary">Description (Arabic)</label>
                                    <textarea
                                        required
                                        rows="5"
                                        value={editForm.description_ar}
                                        onChange={(e) => setEditForm({ ...editForm, description_ar: e.target.value })}
                                        className="w-full resize-none rounded-xl border border-surface-border bg-surface-darker px-4 py-3 text-right text-sm text-text-primary outline-none transition-all placeholder:text-text-muted focus:border-brand-400/50 focus:ring-1 focus:ring-brand-400/50"
                                        dir="rtl"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-text-secondary">Cover Photo</label>
                                <label className="relative flex min-h-48 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-surface-border bg-surface-darker text-text-secondary transition-colors hover:border-brand-400/40 hover:text-text-primary">
                                    {coverPreview ? (
                                        <img src={coverPreview} alt="" className="absolute inset-0 h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-sm">
                                            <ImagePlus size={24} />
                                            <span>Upload JPG, PNG, or WebP up to 5MB</span>
                                        </div>
                                    )}
                                    {coverPreview && <div className="absolute inset-0 bg-black/35" />}
                                    {coverPreview && (
                                        <span className="relative z-10 rounded-lg bg-black/55 px-3 py-1.5 text-sm font-medium text-white">
                                            Change cover photo
                                        </span>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleCoverChange}
                                        className="sr-only"
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3 border-t border-surface-border pt-5">
                            <button
                                type="button"
                                onClick={closeEditModal}
                                disabled={savingClub || uploadingCover}
                                className="rounded-xl border border-surface-border px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={savingClub || uploadingCover}
                                className="inline-flex items-center gap-2 rounded-xl gradient-bg px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {savingClub || uploadingCover ? (
                                    <>
                                        <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                        {uploadingCover ? 'Uploading cover...' : 'Saving...'}
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.form>
                </div>
            )}
        </div>
    )
}
