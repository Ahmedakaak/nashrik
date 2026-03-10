import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { mockAnalyticsData } from '../../lib/mockData'
import {
    BarChart3, TrendingUp, Users, PieChart
} from 'lucide-react'
import {
    AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const CHART_COLORS = ['#3ECF8E', '#4E9FFF', '#F97066', '#FFA726', '#A78BFA']

export default function AnalyticsPage() {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'
    const { attendanceTrend, memberGrowth, eventsByCategory, topEvents } = mockAnalyticsData

    const getLabel = (item, field) => isRTL ? item[`${field}_ar`] : item[field]

    const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }
    const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null
        return (
            <div className="bg-surface-card border border-surface-border rounded-xl p-3 shadow-lg text-sm">
                <p className="text-text-primary font-medium mb-1">{label}</p>
                {payload.map((p, i) => (
                    <p key={i} className="text-text-secondary">
                        <span style={{ color: p.color }}>{p.name}:</span> {p.value}
                    </p>
                ))}
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary">{t('clubAdmin.analytics.title')}</h1>
                <p className="text-text-secondary mt-1">Club performance insights and trends</p>
            </motion.div>

            <motion.div variants={container} initial="hidden" animate="show" className="grid lg:grid-cols-2 gap-6">
                {/* Attendance Trend */}
                <motion.div variants={item} className="bg-surface-card border border-surface-border rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={18} className="text-brand-400" />
                        <h3 className="font-semibold text-text-primary">{t('clubAdmin.analytics.attendanceTrend')}</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={attendanceTrend}>
                            <defs>
                                <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3ECF8E" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3ECF8E" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey={isRTL ? 'month_ar' : 'month'} tick={{ fill: '#A0A0A0', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#A0A0A0', fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="attendance" name="Attendance" stroke="#3ECF8E" fill="url(#colorAtt)" strokeWidth={2} />
                            <Area type="monotone" dataKey="capacity" name="Capacity" stroke="#4E9FFF" fill="none" strokeWidth={2} strokeDasharray="5 5" />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Member Growth */}
                <motion.div variants={item} className="bg-surface-card border border-surface-border rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Users size={18} className="text-purple-400" />
                        <h3 className="font-semibold text-text-primary">{t('clubAdmin.analytics.memberGrowth')}</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={memberGrowth}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey={isRTL ? 'month_ar' : 'month'} tick={{ fill: '#A0A0A0', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#A0A0A0', fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="members" name="Members" fill="#A78BFA" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Events by Category Pie */}
                <motion.div variants={item} className="bg-surface-card border border-surface-border rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <PieChart size={18} className="text-blue-400" />
                        <h3 className="font-semibold text-text-primary">Events by Category</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <RePieChart>
                            <Pie
                                data={eventsByCategory}
                                cx="50%" cy="50%"
                                innerRadius={60} outerRadius={90}
                                dataKey="count"
                                nameKey={isRTL ? 'category_ar' : 'category'}
                                paddingAngle={4}
                            >
                                {eventsByCategory.map((_, i) => (
                                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                formatter={(v) => <span className="text-text-secondary text-sm">{v}</span>}
                            />
                        </RePieChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Top Events Table */}
                <motion.div variants={item} className="bg-surface-card border border-surface-border rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 size={18} className="text-orange-400" />
                        <h3 className="font-semibold text-text-primary">{t('clubAdmin.analytics.popularEvents')}</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-surface-border text-text-muted">
                                    <th className="text-start pb-3 font-medium">Event</th>
                                    <th className="text-center pb-3 font-medium">Registered</th>
                                    <th className="text-center pb-3 font-medium">Attended</th>
                                    <th className="text-end pb-3 font-medium">Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topEvents.map((event, i) => (
                                    <tr key={i} className="border-b border-surface-border last:border-0">
                                        <td className="py-3 text-text-primary font-medium">
                                            {getLabel(event, 'name')}
                                        </td>
                                        <td className="py-3 text-center text-text-secondary">{event.registered}</td>
                                        <td className="py-3 text-center text-text-secondary">{event.attended}</td>
                                        <td className="py-3 text-end">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${event.rate >= 80 ? 'bg-status-success/15 text-status-success' : event.rate >= 60 ? 'bg-status-warning/15 text-status-warning' : 'bg-status-error/15 text-status-error'}`}>
                                                {event.rate}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    )
}
