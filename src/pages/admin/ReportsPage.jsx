import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { mockPlatformStats, mockAnalyticsData, mockEvents, mockClubs } from '../../lib/mockData'
import { BarChart3, Download, Calendar, Users, BookOpen } from 'lucide-react'
import { BarChart, Bar, PieChart as RePieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = ['#3ECF8E', '#4E9FFF', '#A78BFA', '#FFA726', '#F97066']
const REPORTS = ['attendance', 'engagement', 'clubActivity']

export default function ReportsPage() {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'
    const [activeReport, setActiveReport] = useState('attendance')

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null
        return (
            <div className="bg-surface-card border border-surface-border rounded-xl p-3 shadow-lg text-sm">
                <p className="text-text-primary font-medium mb-1">{label}</p>
                {payload.map((p, i) => <p key={i} className="text-text-secondary"><span style={{ color: p.color }}>{p.name}:</span> {p.value}</p>)}
            </div>
        )
    }

    const exportPDF = async () => {
        try {
            const { default: jsPDF } = await import('jspdf')
            const { default: autoTable } = await import('jspdf-autotable')
            const doc = new jsPDF()
            doc.setFontSize(18)
            doc.text(`Nashark — ${activeReport.charAt(0).toUpperCase() + activeReport.slice(1)} Report`, 14, 22)
            doc.setFontSize(10)
            doc.setTextColor(100)
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30)

            if (activeReport === 'attendance') {
                autoTable(doc, {
                    startY: 40, head: [['Month', 'Attendance', 'Capacity', 'Rate']],
                    body: mockAnalyticsData.attendanceTrend.map(r => [r.month, r.attendance, r.capacity, `${Math.round((r.attendance / r.capacity) * 100)}%`]),
                    theme: 'grid', headStyles: { fillColor: [62, 207, 142] },
                })
            } else if (activeReport === 'engagement') {
                autoTable(doc, {
                    startY: 40, head: [['Month', 'Users', 'Events', 'Registrations']],
                    body: mockPlatformStats.monthlyActivity.map(r => [r.month, r.users, r.events, r.registrations]),
                    theme: 'grid', headStyles: { fillColor: [78, 159, 255] },
                })
            } else {
                autoTable(doc, {
                    startY: 40, head: [['Club', 'Category', 'Members', 'Events']],
                    body: mockClubs.map(c => [c.name, c.category, c.member_count, mockEvents.filter(e => e.club_id === c.id).length]),
                    theme: 'grid', headStyles: { fillColor: [167, 139, 250] },
                })
            }
            doc.save(`nashark-${activeReport}-report.pdf`)
        } catch { alert('PDF libraries not available. Please install jspdf and jspdf-autotable.') }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-text-primary">{t('admin.reports.title')}</h1>
                    <p className="text-text-secondary mt-1">Generate and export platform reports</p>
                </div>
                <button onClick={exportPDF} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg text-white font-medium hover:opacity-90 transition-opacity">
                    <Download size={18} /> {t('admin.reports.export')}
                </button>
            </motion.div>

            {/* Report Type Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
                {REPORTS.map(r => (
                    <button key={r} onClick={() => setActiveReport(r)} className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${activeReport === r ? 'gradient-bg text-white' : 'bg-surface-card border border-surface-border text-text-secondary hover:text-text-primary hover:bg-white/5'}`}>
                        {t(`admin.reports.${r}`)}
                    </button>
                ))}
            </div>

            {/* Report Content */}
            <motion.div key={activeReport} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {activeReport === 'attendance' && (
                    <>
                        <div className="bg-surface-card border border-surface-border rounded-2xl p-5">
                            <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2"><Calendar size={18} className="text-brand-400" /> Attendance Trend</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={mockAnalyticsData.attendanceTrend}>
                                    <defs><linearGradient id="attG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3ECF8E" stopOpacity={0.3} /><stop offset="95%" stopColor="#3ECF8E" stopOpacity={0} /></linearGradient></defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey={isRTL ? 'month_ar' : 'month'} tick={{ fill: '#A0A0A0', fontSize: 12 }} />
                                    <YAxis tick={{ fill: '#A0A0A0', fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="attendance" name="Attendance" stroke="#3ECF8E" fill="url(#attG)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="capacity" name="Capacity" stroke="#4E9FFF" fill="none" strokeWidth={2} strokeDasharray="5 5" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="bg-surface-card border border-surface-border rounded-2xl p-5">
                            <h3 className="font-semibold text-text-primary mb-4">Top Events</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead><tr className="border-b border-surface-border text-text-muted"><th className="text-start pb-3 font-medium">Event</th><th className="text-center pb-3 font-medium">Registered</th><th className="text-center pb-3 font-medium">Attended</th><th className="text-end pb-3 font-medium">Rate</th></tr></thead>
                                    <tbody>{mockAnalyticsData.topEvents.map((e, i) => (
                                        <tr key={i} className="border-b border-surface-border last:border-0">
                                            <td className="py-3 text-text-primary font-medium">{isRTL ? e.name_ar : e.name}</td>
                                            <td className="py-3 text-center text-text-secondary">{e.registered}</td>
                                            <td className="py-3 text-center text-text-secondary">{e.attended}</td>
                                            <td className="py-3 text-end"><span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${e.rate >= 80 ? 'bg-status-success/15 text-status-success' : 'bg-status-warning/15 text-status-warning'}`}>{e.rate}%</span></td>
                                        </tr>
                                    ))}</tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {activeReport === 'engagement' && (
                    <div className="bg-surface-card border border-surface-border rounded-2xl p-5">
                        <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2"><Users size={18} className="text-blue-400" /> Platform Engagement</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={mockPlatformStats.monthlyActivity}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey={isRTL ? 'month_ar' : 'month'} tick={{ fill: '#A0A0A0', fontSize: 12 }} />
                                <YAxis tick={{ fill: '#A0A0A0', fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend formatter={(v) => <span className="text-text-secondary text-sm">{v}</span>} />
                                <Bar dataKey="users" name="Users" fill="#3ECF8E" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="events" name="Events" fill="#4E9FFF" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="registrations" name="Registrations" fill="#A78BFA" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {activeReport === 'clubActivity' && (
                    <div className="grid lg:grid-cols-2 gap-6">
                        <div className="bg-surface-card border border-surface-border rounded-2xl p-5">
                            <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2"><BookOpen size={18} className="text-purple-400" /> Clubs Overview</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <RePieChart>
                                    <Pie data={mockPlatformStats.usersByRole} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="count" nameKey={isRTL ? 'role_ar' : 'role'} paddingAngle={4}>
                                        {mockPlatformStats.usersByRole.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend formatter={(v) => <span className="text-text-secondary text-sm">{v}</span>} />
                                </RePieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="bg-surface-card border border-surface-border rounded-2xl p-5">
                            <h3 className="font-semibold text-text-primary mb-4">Club Details</h3>
                            <div className="space-y-3">
                                {mockClubs.map(club => (
                                    <div key={club.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                                        <div className="w-8 h-8 rounded-lg bg-brand-400/10 flex items-center justify-center text-sm">{club.category === 'academic' ? '📚' : club.category === 'sports' ? '⚽' : club.category === 'cultural' ? '🎭' : '🤝'}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-text-primary truncate">{isRTL ? club.name_ar : club.name}</p>
                                            <p className="text-xs text-text-muted">{club.member_count} members · {mockEvents.filter(e => e.club_id === club.id).length} events</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    )
}
