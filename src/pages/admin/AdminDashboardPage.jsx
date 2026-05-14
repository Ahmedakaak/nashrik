import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getPlatformStats, getUsersByRole, getRecentUsers, getPendingClubs, createSystemAlert } from '../../lib/api/admin'
import { PageLoader } from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import { Users, Calendar, BookOpen, AlertCircle, ArrowRight, TrendingUp, BarChart3, Send, X } from 'lucide-react'
import { PieChart as RePieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const ROLE_COLORS = ['#3ECF8E', '#4E9FFF', '#A78BFA']

export default function AdminDashboardPage() {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'
    const [stats, setStats] = useState(null)
    const [usersByRole, setUsersByRole] = useState([])
    const [recentUsers, setRecentUsers] = useState([])
    const [pendingClubs, setPendingClubs] = useState([])
    const [loading, setLoading] = useState(true)
    const [showAlertModal, setShowAlertModal] = useState(false)
    const [alertForm, setAlertForm] = useState({ title: '', title_ar: '', message: '', message_ar: '' })
    const [sendingAlert, setSendingAlert] = useState(false)

    useEffect(() => {
        async function load() {
            try {
                const [s, ubr, ru, pc] = await Promise.all([getPlatformStats(), getUsersByRole(), getRecentUsers(5), getPendingClubs()])
                setStats(s); setUsersByRole(ubr); setRecentUsers(ru); setPendingClubs(pc)
            } catch (err) { console.error('Admin dashboard error:', err) }
            finally { setLoading(false) }
        }
        load()
    }, [])

    if (loading) return <PageLoader />

    const statCards = [
        { label: t('admin.dashboard.totalUsers'), value: stats?.totalUsers || 0, icon: Users, color: 'text-brand-400', bg: 'bg-brand-400/10' },
        { label: t('admin.dashboard.activeEvents'), value: stats?.activeEvents || 0, icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: t('admin.dashboard.totalClubs'), value: stats?.totalClubs || 0, icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        { label: t('admin.dashboard.pendingApprovals'), value: stats?.pendingApprovals || 0, icon: AlertCircle, color: 'text-status-warning', bg: 'bg-status-warning/10' },
    ]
    const quickLinks = [
        { label: t('admin.users.title'), icon: Users, to: '/admin/users' },
        { label: t('admin.clubs.title'), icon: BookOpen, to: '/admin/clubs' },
        { label: t('admin.events.title'), icon: Calendar, to: '/admin/events' },
        { label: t('admin.reports.title'), icon: BarChart3, to: '/admin/reports' },
    ]
    const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
    const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }
    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null
        return (<div className="bg-surface-card border border-surface-border rounded-xl p-3 shadow-lg text-sm"><p className="text-text-primary font-medium mb-1">{label}</p>{payload.map((p, i) => <p key={i} className="text-text-secondary"><span style={{ color: p.color }}>{p.name}:</span> {p.value}</p>)}</div>)
    }

    const handleSendAlert = async () => {
        if (!alertForm.title || !alertForm.title_ar || !alertForm.message || !alertForm.message_ar) {
            toast.error('Please fill in all fields')
            return
        }
        setSendingAlert(true)
        try {
            await createSystemAlert(alertForm.title, alertForm.title_ar, alertForm.message, alertForm.message_ar)
            toast.success('System alert sent successfully!')
            setShowAlertModal(false)
            setAlertForm({ title: '', title_ar: '', message: '', message_ar: '' })
        } catch (error) {
            toast.error(error.message || 'Failed to send alert')
        } finally {
            setSendingAlert(false)
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-8">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-text-primary">{t('admin.dashboard.title')}</h1>
                    <p className="text-text-secondary mt-1">Platform overview and management</p>
                </div>
                <button onClick={() => setShowAlertModal(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-status-error/10 text-status-error hover:bg-status-error/20 font-medium transition-colors cursor-pointer">
                    <Send size={18} /> Send System Alert
                </button>
            </motion.div>

            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((s, i) => (<motion.div key={i} variants={item} className="bg-surface-card border border-surface-border rounded-2xl p-5 hover-lift"><div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}><s.icon size={20} className={s.color} /></div><p className="text-2xl font-bold text-text-primary">{s.value}</p><p className="text-sm text-text-muted mt-0.5">{s.label}</p></motion.div>))}
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {pendingClubs.length > 0 && (
                        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-text-primary flex items-center gap-2"><AlertCircle size={18} className="text-status-warning" />Pending Club Approvals ({pendingClubs.length})</h3><Link to="/admin/clubs" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">{t('common.viewAll')}<ArrowRight size={14} className="icon-flip" /></Link></div>
                            <div className="space-y-3">
                                {pendingClubs.map(club => (
                                    <div key={club.id} className="bg-surface-card border border-surface-border rounded-2xl p-4 hover:border-brand-400/20 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-status-warning/10 flex items-center justify-center text-status-warning font-bold">{(isRTL ? club.name_ar : club.name)?.charAt(0)}</div>
                                            <div className="flex-1 min-w-0"><p className="font-medium text-text-primary truncate">{isRTL ? club.name_ar : club.name}</p><p className="text-xs text-text-muted">by {isRTL ? club.admin?.full_name_ar : club.admin?.full_name}</p></div>
                                            <span className="text-xs bg-status-warning/15 text-status-warning px-2 py-1 rounded-lg font-medium">Pending</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.section>
                    )}
                </div>

                <div className="space-y-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-surface-card border border-surface-border rounded-2xl p-5">
                        <h3 className="font-semibold text-text-primary mb-4">Users by Role</h3>
                        <ResponsiveContainer width="100%" height={200}><RePieChart><Pie data={usersByRole} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="count" nameKey={isRTL ? 'role_ar' : 'role'} paddingAngle={4}>{usersByRole.map((_, i) => <Cell key={i} fill={ROLE_COLORS[i % ROLE_COLORS.length]} />)}</Pie><Tooltip content={<CustomTooltip />} /><Legend formatter={(v) => <span className="text-text-secondary text-sm">{v}</span>} /></RePieChart></ResponsiveContainer>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-surface-card border border-surface-border rounded-2xl p-5">
                        <h3 className="font-semibold text-text-primary mb-4">Quick Links</h3>
                        <div className="space-y-2">{quickLinks.map((link, i) => (<Link key={i} to={link.to} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-text-secondary hover:text-text-primary transition-colors group"><link.icon size={18} className="text-brand-400" /><span className="text-sm font-medium">{link.label}</span><ArrowRight size={14} className="ms-auto text-text-muted group-hover:text-brand-400 transition-colors icon-flip" /></Link>))}</div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-surface-card border border-surface-border rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-text-primary">Recent Users</h3><Link to="/admin/users" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">{t('common.viewAll')}</Link></div>
                        <div className="space-y-2">
                            {recentUsers.map(u => (
                                <div key={u.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400/20 to-brand-600/20 flex items-center justify-center text-brand-400 text-sm font-semibold border border-brand-400/20">{(isRTL ? u.full_name_ar : u.full_name)?.charAt(0) || '?'}</div>
                                    <div className="flex-1 min-w-0"><p className="text-sm text-text-primary truncate">{isRTL ? u.full_name_ar : u.full_name}</p><p className="text-xs text-text-muted">{u.role}</p></div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {showAlertModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => !sendingAlert && setShowAlertModal(false)}>
                    <div className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-5 border-b border-surface-border">
                            <h2 className="text-lg font-bold text-status-error flex items-center gap-2"><AlertCircle size={20} /> New System Alert</h2>
                            <button onClick={() => !sendingAlert && setShowAlertModal(false)} className="p-2 rounded-lg hover:bg-white/5 text-text-muted cursor-pointer"><X size={20} /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div><label className="text-sm text-text-secondary mb-1 block">Title (EN)</label><input value={alertForm.title} onChange={e => setAlertForm({ ...alertForm, title: e.target.value })} className="w-full px-3 py-2.5 bg-surface-darker border border-surface-border rounded-xl text-text-primary text-sm" placeholder="e.g. System Maintenance" /></div>
                                <div><label className="text-sm text-text-secondary mb-1 block">العنوان (AR)</label><input dir="rtl" value={alertForm.title_ar} onChange={e => setAlertForm({ ...alertForm, title_ar: e.target.value })} className="w-full px-3 py-2.5 bg-surface-darker border border-surface-border rounded-xl text-text-primary text-sm" placeholder="مثال: صيانة النظام" /></div>
                            </div>
                            <div><label className="text-sm text-text-secondary mb-1 block">Message (EN)</label><textarea rows={3} value={alertForm.message} onChange={e => setAlertForm({ ...alertForm, message: e.target.value })} className="w-full px-3 py-2.5 bg-surface-darker border border-surface-border rounded-xl text-text-primary text-sm resize-none" /></div>
                            <div><label className="text-sm text-text-secondary mb-1 block">الرسالة (AR)</label><textarea dir="rtl" rows={3} value={alertForm.message_ar} onChange={e => setAlertForm({ ...alertForm, message_ar: e.target.value })} className="w-full px-3 py-2.5 bg-surface-darker border border-surface-border rounded-xl text-text-primary text-sm resize-none" /></div>
                        </div>
                        <div className="flex justify-end gap-3 p-5 border-t border-surface-border">
                            <button onClick={() => !sendingAlert && setShowAlertModal(false)} disabled={sendingAlert} className="px-5 py-2.5 rounded-xl border border-surface-border text-text-secondary hover:text-text-primary hover:bg-white/5 text-sm font-medium transition-colors cursor-pointer">{t('common.cancel')}</button>
                            <button onClick={handleSendAlert} disabled={sendingAlert} className="px-5 py-2.5 rounded-xl bg-status-error text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 inline-flex items-center gap-2">
                                {sendingAlert ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={16} />}
                                {sendingAlert ? 'Sending...' : 'Send to All Users'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
