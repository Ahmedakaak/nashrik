import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { categoryColors, categoryIcons, CLUB_CATEGORIES } from '../../lib/constants'
import { getMyMemberships } from '../../lib/api/memberships'
import { PageLoader } from '../../components/common/LoadingSpinner'
import { motion } from 'framer-motion'
import { Users, ArrowRight, Clock, CheckCircle2 } from 'lucide-react'

export default function MyClubsPage() {
    const { t, i18n } = useTranslation()
    const { user } = useAuth()
    const isRTL = i18n.language === 'ar'
    const [myClubsData, setMyClubsData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return
        async function load() {
            try {
                const memberships = await getMyMemberships(user.id)
                const data = memberships
                    .filter(m => m.status === 'approved' || m.status === 'pending')
                    .map(m => ({ ...m.club, membershipStatus: m.status }))
                    .filter(Boolean)
                setMyClubsData(data)
            } catch (err) { console.error('MyClubs load error:', err) }
            finally { setLoading(false) }
        }
        load()
    }, [user])

    const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
    const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

    if (loading) return <PageLoader />

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
                    {t('dashboard.quickActions.myClubs') || 'My Clubs'}
                </h1>
                <p className="text-text-secondary mt-1">
                    Manage your club memberships and discover new ones.
                </p>
            </motion.div>

            {myClubsData.length > 0 ? (
                <motion.div initial="hidden" animate="show" variants={container} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {myClubsData.map((club) => {
                        const colors = categoryColors[club.category] || categoryColors.academic
                        const isApproved = club.membershipStatus === 'approved'

                        return (
                            <motion.div key={club.id} variants={item}>
                                <Link to={`/clubs/${club.id}`} className="block bg-surface-card border border-surface-border rounded-2xl overflow-hidden hover:border-brand-400/30 transition-all duration-200 group hover-lift h-full flex flex-col">
                                    <div className={`h-32 relative ${colors.bg}`}>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-5xl opacity-50">{categoryIcons[club.category]}</span>
                                        </div>
                                        <div className="absolute top-3 start-3">
                                            <span className={`text-xs px-2.5 py-1 rounded-lg font-medium backdrop-blur-sm ${colors.bg} ${colors.text} border ${colors.border}`}>
                                                {isRTL ? CLUB_CATEGORIES.find(c => c.value === club.category)?.labelAr : club.category}
                                            </span>
                                        </div>
                                        <div className="absolute top-3 end-3">
                                            {isApproved ? (
                                                <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-brand-400/20 text-brand-400 font-medium border border-brand-400/30 backdrop-blur-sm">
                                                    <CheckCircle2 size={12} />{t('clubs.joined') || 'Joined'}
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-status-warning/20 text-status-warning font-medium border border-status-warning/30 backdrop-blur-sm">
                                                    <Clock size={12} />Pending
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="-mt-10 mb-3 relative z-10">
                                            <div className="w-14 h-14 rounded-2xl bg-surface-dark border-2 border-surface-card flex items-center justify-center text-2xl shadow-lg overflow-hidden">
                                                {club.logo_url ? <img src={club.logo_url} alt="" className="w-full h-full object-cover" /> : categoryIcons[club.category]}
                                            </div>
                                        </div>
                                        <h3 className="font-semibold text-lg text-text-primary group-hover:text-brand-400 transition-colors">
                                            {isRTL ? club.name_ar : club.name}
                                        </h3>
                                        <p className="text-sm text-text-secondary mt-1 flex-1 line-clamp-2 leading-relaxed">
                                            {isRTL ? club.description_ar : club.description}
                                        </p>
                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-border">
                                            <span className="flex items-center gap-1.5 text-sm text-text-muted">
                                                <Users size={14} />
                                                {t('clubs.members', { count: club.member_count }) || `${club.member_count} Members`}
                                            </span>
                                            <ArrowRight size={16} className="text-text-muted group-hover:text-brand-400 transition-colors icon-flip" />
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        )
                    })}
                </motion.div>
            ) : (
                <div className="bg-surface-card border border-surface-border rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-brand-400/10 flex items-center justify-center mx-auto mb-4">
                        <Users size={28} className="text-brand-400" />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">No Clubs Yet</h3>
                    <p className="text-text-secondary mb-6 max-w-md mx-auto">
                        You haven't joined any clubs or requested membership yet. Explore the available clubs to connect with like-minded students!
                    </p>
                    <Link to="/clubs" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-bg text-white font-medium hover:shadow-lg hover:shadow-brand-400/20 transition-all active:scale-[0.98]">
                        Browse Clubs
                        <ArrowRight size={16} className="icon-flip" />
                    </Link>
                </div>
            )}
        </div>
    )
}
