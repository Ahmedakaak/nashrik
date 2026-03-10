import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { mockClubs, mockMemberships, categoryColors, categoryIcons } from '../../lib/mockData'
import { CLUB_CATEGORIES } from '../../lib/constants'
import { motion } from 'framer-motion'
import { Search, Users, ArrowRight, X, CheckCircle2 } from 'lucide-react'

export default function ClubsPage() {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'

    const [search, setSearch] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')

    const memberClubIds = mockMemberships.map(m => m.club_id)

    const filteredClubs = useMemo(() => {
        return mockClubs.filter(club => {
            const matchesSearch = search === '' ||
                club.name.toLowerCase().includes(search.toLowerCase()) ||
                club.name_ar.includes(search)
            const matchesCategory = selectedCategory === 'all' || club.category === selectedCategory
            return matchesSearch && matchesCategory
        })
    }, [search, selectedCategory])

    const categories = [
        { value: 'all', label: t('events.filters.all'), icon: '🌟' },
        ...CLUB_CATEGORIES.map(c => ({
            value: c.value,
            label: isRTL ? c.labelAr : c.label,
            icon: c.icon,
        })),
    ]

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary">{t('clubs.title')}</h1>
                <p className="text-text-secondary mt-1">{t('landing.features.clubs.description')}</p>
            </motion.div>

            {/* Search + Filters */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6 space-y-4"
            >
                <div className="relative">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                        <Search size={18} className="text-text-muted" />
                    </div>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('clubs.search')}
                        className="w-full rounded-xl bg-surface-card border border-surface-border ps-10 pe-4 py-3 text-text-primary placeholder:text-text-muted transition-all duration-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 outline-none"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute inset-y-0 end-0 flex items-center pe-3 text-text-muted hover:text-text-primary cursor-pointer"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Category pills */}
                <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                        <button
                            key={cat.value}
                            onClick={() => setSelectedCategory(cat.value)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer ${selectedCategory === cat.value
                                    ? 'bg-brand-400/15 border-brand-400/30 text-brand-400'
                                    : 'bg-surface-card border-surface-border text-text-secondary hover:text-text-primary hover:border-brand-400/20'
                                }`}
                        >
                            <span>{cat.icon}</span>
                            {cat.label}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Results */}
            <p className="text-sm text-text-muted mb-4">
                {filteredClubs.length} {filteredClubs.length === 1 ? 'club' : 'clubs'} found
            </p>

            {/* Clubs Grid */}
            {filteredClubs.length > 0 ? (
                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
                    className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                    {filteredClubs.map((club) => {
                        const colors = categoryColors[club.category] || categoryColors.academic
                        const isMember = memberClubIds.includes(club.id)

                        return (
                            <motion.div
                                key={club.id}
                                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                            >
                                <Link
                                    to={`/clubs/${club.id}`}
                                    className="block bg-surface-card border border-surface-border rounded-2xl overflow-hidden hover:border-brand-400/30 transition-all duration-200 group hover-lift h-full"
                                >
                                    {/* Cover area */}
                                    <div className={`h-32 relative ${colors.bg}`}>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-5xl opacity-50">{categoryIcons[club.category]}</span>
                                        </div>

                                        {/* Category badge */}
                                        <div className="absolute top-3 start-3">
                                            <span className={`text-xs px-2.5 py-1 rounded-lg font-medium backdrop-blur-sm ${colors.bg} ${colors.text} border ${colors.border}`}>
                                                {isRTL ? CLUB_CATEGORIES.find(c => c.value === club.category)?.labelAr : club.category}
                                            </span>
                                        </div>

                                        {/* Member badge */}
                                        {isMember && (
                                            <div className="absolute top-3 end-3">
                                                <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-brand-400/20 text-brand-400 font-medium border border-brand-400/30 backdrop-blur-sm">
                                                    <CheckCircle2 size={12} />
                                                    {t('clubs.joined')}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-5">
                                        {/* Logo placeholder */}
                                        <div className="-mt-10 mb-3 relative z-10">
                                            <div className="w-14 h-14 rounded-2xl bg-surface-dark border-2 border-surface-card flex items-center justify-center text-2xl shadow-lg">
                                                {categoryIcons[club.category]}
                                            </div>
                                        </div>

                                        <h3 className="font-semibold text-lg text-text-primary group-hover:text-brand-400 transition-colors">
                                            {isRTL ? club.name_ar : club.name}
                                        </h3>
                                        <p className="text-sm text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                                            {isRTL ? club.description_ar : club.description}
                                        </p>

                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-border">
                                            <span className="flex items-center gap-1.5 text-sm text-text-muted">
                                                <Users size={14} />
                                                {t('clubs.members', { count: club.member_count })}
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
                <div className="text-center py-16">
                    <Users size={48} className="mx-auto text-text-muted mb-4" />
                    <h3 className="text-lg font-semibold text-text-primary mb-1">{t('clubs.noClubs')}</h3>
                    <p className="text-text-secondary text-sm">Try adjusting your search or filters.</p>
                </div>
            )}
        </div>
    )
}
