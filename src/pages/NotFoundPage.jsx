import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

export default function NotFoundPage() {
    const { t } = useTranslation()

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 page-enter">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center max-w-md"
            >
                {/* 404 Number */}
                <div className="relative mb-8">
                    <h1 className="text-[120px] md:text-[160px] font-extrabold gradient-text leading-none select-none">
                        404
                    </h1>
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-darker via-transparent to-transparent" />
                </div>

                <h2 className="text-2xl font-bold text-text-primary mb-3">
                    Page Not Found
                </h2>
                <p className="text-text-secondary mb-8">
                    The page you're looking for doesn't exist or has been moved.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-bg text-white font-semibold shadow-lg shadow-brand-400/20 hover:shadow-brand-400/40 transition-all duration-300"
                    >
                        <Home size={18} />
                        Go Home
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-card border border-surface-border text-text-primary font-medium hover:bg-surface-border/50 transition-all duration-300 cursor-pointer"
                    >
                        <ArrowLeft size={18} className="icon-flip" />
                        {t('common.back')}
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
