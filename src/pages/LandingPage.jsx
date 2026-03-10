import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'
import {
    Calendar, Users, QrCode, ArrowRight,
    Zap, Search, UserPlus, Star, ChevronRight, Sparkles
} from 'lucide-react'

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' }
    })
}

const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i = 0) => ({
        opacity: 1,
        scale: 1,
        transition: { delay: i * 0.12, duration: 0.5, ease: 'easeOut' }
    })
}

export default function LandingPage() {
    const { t } = useTranslation()
    const { user } = useAuth()

    const features = [
        {
            icon: Search,
            title: t('landing.features.discover.title'),
            description: t('landing.features.discover.description'),
            color: 'from-blue-500/20 to-blue-600/5',
            iconBg: 'bg-blue-500/15 text-blue-400',
        },
        {
            icon: Zap,
            title: t('landing.features.register.title'),
            description: t('landing.features.register.description'),
            color: 'from-amber-500/20 to-amber-600/5',
            iconBg: 'bg-amber-500/15 text-amber-400',
        },
        {
            icon: QrCode,
            title: t('landing.features.qr.title'),
            description: t('landing.features.qr.description'),
            color: 'from-brand-400/20 to-brand-500/5',
            iconBg: 'bg-brand-400/15 text-brand-400',
        },
        {
            icon: UserPlus,
            title: t('landing.features.clubs.title'),
            description: t('landing.features.clubs.description'),
            color: 'from-purple-500/20 to-purple-600/5',
            iconBg: 'bg-purple-500/15 text-purple-400',
        },
    ]

    const stats = [
        { value: '150+', label: t('landing.stats.events'), icon: Calendar },
        { value: '20+', label: t('landing.stats.clubs'), icon: Users },
        { value: '2,000+', label: t('landing.stats.students'), icon: Star },
    ]

    return (
        <div className="page-enter overflow-x-hidden">
            {/* ===== HERO SECTION ===== */}
            <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32">
                {/* Background effects */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-gradient-to-b from-brand-400/8 via-brand-400/3 to-transparent rounded-full blur-3xl" />
                    <div className="absolute top-40 left-0 w-60 h-60 bg-brand-400/5 rounded-full blur-3xl" />
                    <div className="absolute top-60 right-0 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl" />

                    {/* Grid pattern */}
                    <div className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)',
                            backgroundSize: '48px 48px',
                        }}
                    />
                </div>

                <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-8">
                    <div className="text-center">
                        {/* Badge */}
                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            custom={0}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-400/10 border border-brand-400/20 text-brand-400 text-sm font-medium mb-8"
                        >
                            <Sparkles size={14} />
                            <span>UTAS Salalah Campus Platform</span>
                        </motion.div>

                        {/* Title */}
                        <motion.h1
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            custom={1}
                            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-text-primary leading-[1.1] mb-6"
                        >
                            {t('landing.hero.title').split(' ').slice(0, 1).join(' ')}{' '}
                            <span className="gradient-text">
                                {t('landing.hero.title').split(' ').slice(1).join(' ')}
                            </span>
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            custom={2}
                            className="text-base sm:text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed px-2"
                        >
                            {t('landing.hero.subtitle')}
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            custom={3}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4"
                        >
                            <Link
                                to={user ? '/dashboard' : '/signup'}
                                className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl gradient-bg text-white font-semibold text-lg shadow-xl shadow-brand-400/25 hover:shadow-brand-400/40 transition-all duration-300 active:scale-[0.98]"
                            >
                                {t('landing.hero.cta')}
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform icon-flip" />
                            </Link>
                            <Link
                                to={user ? '/events' : '/login'}
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-text-primary font-medium text-lg hover:bg-white/10 transition-all duration-300"
                            >
                                {t('landing.hero.ctaSecondary')}
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ===== STATS SECTION ===== */}
            <section className="py-16 border-y border-surface-border bg-surface-dark/30">
                <div className="max-w-4xl mx-auto px-6 md:px-8">
                    <div className="grid grid-cols-3 gap-6 md:gap-12">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={i}
                                variants={scaleIn}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: '-50px' }}
                                custom={i}
                                className="text-center group"
                            >
                                <div className="flex justify-center mb-3">
                                    <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-brand-400/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <stat.icon size={22} className="text-brand-400" />
                                    </div>
                                </div>
                                <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold gradient-text mb-1">{stat.value}</p>
                                <p className="text-text-secondary text-sm md:text-base font-medium">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== FEATURES SECTION ===== */}
            <section className="py-20 md:py-24">
                <div className="max-w-6xl mx-auto px-6 md:px-8">
                    {/* Section Header */}
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-50px' }}
                        className="text-center mb-14"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                            {t('landing.features.title')}
                        </h2>
                        <p className="text-text-secondary text-base md:text-lg max-w-xl mx-auto">
                            {t('app.description')}
                        </p>
                    </motion.div>

                    {/* Feature Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                variants={scaleIn}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: '-30px' }}
                                custom={i}
                                className="group relative p-6 rounded-2xl bg-surface-dark border border-surface-border hover:border-brand-400/30 transition-all duration-300 hover-lift"
                            >
                                {/* Gradient overlay on hover */}
                                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                                <div className="relative z-10">
                                    <div className={`w-12 h-12 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                        <feature.icon size={24} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm text-text-secondary leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA SECTION ===== */}
            <section className="py-20 md:py-24">
                <div className="max-w-4xl mx-auto px-6 md:px-8">
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="relative rounded-3xl overflow-hidden"
                    >
                        {/* Background */}
                        <div className="absolute inset-0 gradient-bg opacity-90" />
                        <div className="absolute inset-0 opacity-10"
                            style={{
                                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)',
                                backgroundSize: '32px 32px',
                            }}
                        />

                        {/* Content */}
                        <div className="relative z-10 text-center px-8 py-14 md:px-16 md:py-20">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                                Ready to Get Involved?
                            </h2>
                            <p className="text-base md:text-lg text-white/80 max-w-lg mx-auto mb-8">
                                Create your free account and start exploring campus events and clubs today.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link
                                    to={user ? '/dashboard' : '/signup'}
                                    className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-brand-700 font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.98]"
                                >
                                    {user ? 'Go to Dashboard' : 'Create Free Account'}
                                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                {!user && (
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white/15 border border-white/25 text-white font-medium hover:bg-white/25 transition-all duration-300"
                                    >
                                        Sign In
                                    </Link>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}
