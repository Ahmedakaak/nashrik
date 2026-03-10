import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { mockPlatformStats, mockPendingClubs, mockUsers } from '../../lib/mockData'
import {
    Users, Calendar, BookOpen, AlertCircle, ArrowRight,
    TrendingUp, UserPlus, ShieldCheck, BarChart3
} from 'lucide-react'
import {
    AreaChart, Area, PieChart as RePieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const ROLE_COLORS = ['#3ECF8E', '#4E9FFF', '#A78BFA']

export default function AdminDashboardPage() {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'
    const { totalUsers, activeEvents, totalClubs, pendingApprovals, monthlyActivity, usersByRole } = mockPlatformStats

    const stats = [
        { label: t('admin.dashboard.totalUsers'), value: totalUsers, icon: Users, color: 'text-brand-400', bg: 'bg-brand-400/10' },
        { label: t('admin.dashboard.activeEvents'), value: activeEvents, icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: t('admin.dashboard.totalClubs'), value: totalClubs, icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        { label: t('admin.dashboard.pendingApprovals'), value: pendingApprovals, icon: AlertCircle, color: 'text-status-warning', bg: 'bg-status-warning/10' },
    ]

    const quickLinks = [
        { label: t('admin.users.title'), icon: Users, to: '/admin/users' },
        { label: t('admin.clubs.title'), icon: BookOpen, to: '/admin/clubs' },
        { label: t('admin.events.title'), icon: Calendar, to: '/admin/events' },
        { label: t('admin.reports.title'), icon: BarChart3, to: '/admin/reports' },
    ]

    const recentUsers = mockUsers.slice(-5).reverse()

    const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
    const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null
        return (
            <div className="bg-surface-card border border-surface-border rounded-xl p-3 shadow-lg text-sm">
                <p className="text-text-primary font-medium mb-1">{label}</p>
                {payload.map((p, i) => (
                    <p key={i} className="text-text-secondary"><span style={{ color: p.color }}>{p.name}:</span> {p.value}</p>
                ))}
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-8">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary">{t('admin.dashboard.title')}</h1>
                <p className="text-text-secondary mt-1">Platform overview and management</p>
            </motion.div>

            {/* Stats */}
            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div key={i} variants={item} className="bg-surface-card border border-surface-border rounded-2xl p-5 hover-lift">
                        <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                            <stat.icon size={20} className={stat.color} />
                        </div>
                        <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                        <p className="text-sm text-text-muted mt-0.5">{stat.label}</p>
                    </motion.div>
                ))}
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Platform Activity Chart */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-surface-card border border-surface-border rounded-2xl p-5">
                        <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                            <TrendingUp size={18} className="text-brand-400" />
                            Platform Activity
                        </h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={monthlyActivity}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3ECF8E" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3ECF8E" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorRegs" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4E9FFF" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#4E9FFF" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey={isRTL ? 'month_ar' : 'month'} tick={{ fill: '#A0A0A0', fontSize: 12 }} />
                                <YAxis tick={{ fill: '#A0A0A0', fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="users" name="Users" stroke="#3ECF8E" fill="url(#colorUsers)" strokeWidth={2} />
                                <Area type="monotone" dataKey="registrations" name="Registrations" stroke="#4E9FFF" fill="url(#colorRegs)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Pending Clubs */}
                    {mockPendingClubs.length > 0 && (
                        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-text-primary flex items-center gap-2">
                                    <AlertCircle size={18} className="text-status-warning" />
                                    Pending Club Approvals ({mockPendingClubs.length})
                                </h3>
                                <Link to="/admin/clubs" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">
                                    {t('common.viewAll')}<ArrowRight size={14} className="icon-flip" />
                                </Link>
                            </div>
                            <div className="space-y-3">
                                {mockPendingClubs.map(club => (
                                    <div key={club.id} className="bg-surface-card border border-surface-border rounded-2xl p-4 hover:border-brand-400/20 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-status-warning/10 flex items-center justify-center text-status-warning font-bold">
                                                {(isRTL ? club.name_ar : club.name).charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-text-primary truncate">{isRTL ? club.name_ar : club.name}</p>
                                                <p className="text-xs text-text-muted">by {isRTL ? club.requested_by_ar : club.requested_by}</p>
                                            </div>
                                            <span className="text-xs bg-status-warning/15 text-status-warning px-2 py-1 rounded-lg font-medium">Pending</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.section>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Users by Role */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-surface-card border border-surface-border rounded-2xl p-5">
                        <h3 className="font-semibold text-text-primary mb-4">Users by Role</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <RePieChart>
                                <Pie data={usersByRole} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="count" nameKey={isRTL ? 'role_ar' : 'role'} paddingAngle={4}>
                                    {usersByRole.map((_, i) => <Cell key={i} fill={ROLE_COLORS[i % ROLE_COLORS.length]} />)}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend formatter={(v) => <span className="text-text-secondary text-sm">{v}</span>} />
                            </RePieChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Quick Links */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-surface-card border border-surface-border rounded-2xl p-5">
                        <h3 className="font-semibold text-text-primary mb-4">Quick Links</h3>
                        <div className="space-y-2">
                            {quickLinks.map((link, i) => (
                                <Link key={i} to={link.to} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-text-secondary hover:text-text-primary transition-colors group">
                                    <link.icon size={18} className="text-brand-400" />
                                    <span className="text-sm font-medium">{link.label}</span>
                                    <ArrowRight size={14} className="ms-auto text-text-muted group-hover:text-brand-400 transition-colors icon-flip" />
                                </Link>
                            ))}
                        </div>
                    </motion.div>

                    {/* Recent Users */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-surface-card border border-surface-border rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-text-primary">Recent Users</h3>
                            <Link to="/admin/users" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">{t('common.viewAll')}</Link>
                        </div>
                        <div className="space-y-2">
                            {recentUsers.map(user => (
                                <div key={user.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400/20 to-brand-600/20 flex items-center justify-center text-brand-400 text-sm font-semibold border border-brand-400/20">
                                        {(isRTL ? user.full_name_ar : user.full_name).charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-text-primary truncate">{isRTL ? user.full_name_ar : user.full_name}</p>
                                        <p className="text-xs text-text-muted">{user.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
