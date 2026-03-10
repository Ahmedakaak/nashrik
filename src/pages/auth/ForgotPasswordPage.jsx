import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { Mail, ArrowLeft, Globe, CheckCircle2, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
    const { t, i18n } = useTranslation()
    const { resetPassword } = useAuth()

    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState('')

    const isRTL = i18n.language === 'ar'

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'ar' : 'en'
        i18n.changeLanguage(newLang)
        document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr'
        document.documentElement.lang = newLang
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!email) {
            setError('Email is required')
            return
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Invalid email format')
            return
        }

        setLoading(true)
        try {
            const { error: resetError } = await resetPassword(email)
            if (resetError) {
                toast.error(resetError.message || 'Failed to send reset link')
            } else {
                setSent(true)
                toast.success(t('auth.forgotPassword.success'))
            }
        } catch (err) {
            toast.error('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-darker px-6 py-12 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 start-1/4 w-80 h-80 bg-brand-400/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 end-1/4 w-64 h-64 bg-brand-300/5 rounded-full blur-3xl" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md mx-auto"
            >
                {/* Language toggle */}
                <div className="flex justify-end mb-6">
                    <button
                        onClick={toggleLanguage}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-white/5 text-text-secondary hover:text-text-primary transition-colors text-sm"
                    >
                        <Globe size={18} />
                        <span>{isRTL ? 'EN' : 'عربي'}</span>
                    </button>
                </div>

                {/* Card */}
                <div className="bg-surface-dark border border-surface-border rounded-2xl p-8 shadow-2xl">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 mb-8">
                        <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-400/20">
                            N
                        </div>
                        <span className="text-2xl font-bold text-text-primary">{t('app.name')}</span>
                    </Link>

                    <AnimatePresence mode="wait">
                        {!sent ? (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                {/* Header */}
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold text-text-primary mb-2">
                                        {t('auth.forgotPassword.title')}
                                    </h2>
                                    <p className="text-text-secondary text-sm">
                                        {t('auth.forgotPassword.subtitle')}
                                    </p>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="space-y-1.5">
                                        <label htmlFor="reset-email" className="block text-sm font-medium text-text-secondary">
                                            {t('auth.forgotPassword.email')}
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none z-10">
                                                <Mail size={18} className="text-text-muted" />
                                            </div>
                                            <input
                                                id="reset-email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => { setEmail(e.target.value); setError('') }}
                                                placeholder="student@utas.edu.om"
                                                className={`w-full rounded-xl bg-surface-card border ${error ? 'border-status-error' : 'border-surface-border'} ps-10 pe-4 py-3 text-text-primary placeholder:text-text-muted transition-all duration-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 outline-none`}
                                                autoComplete="email"
                                            />
                                        </div>
                                        {error && <p className="text-sm text-status-error">{error}</p>}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl gradient-bg text-white font-semibold shadow-lg shadow-brand-400/20 hover:shadow-brand-400/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer"
                                    >
                                        {loading ? (
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                {t('auth.forgotPassword.submit')}
                                            </>
                                        )}
                                    </button>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-4"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-brand-400/15 flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 size={32} className="text-brand-400" />
                                </div>
                                <h3 className="text-xl font-bold text-text-primary mb-2">
                                    Check Your Email
                                </h3>
                                <p className="text-text-secondary text-sm mb-1">
                                    {t('auth.forgotPassword.success')}
                                </p>
                                <p className="text-text-muted text-xs mb-6">
                                    Sent to: {email}
                                </p>
                                <button
                                    onClick={() => { setSent(false); setEmail('') }}
                                    className="text-sm text-brand-400 hover:text-brand-300 font-medium transition-colors cursor-pointer"
                                >
                                    Try a different email
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Back to login */}
                    <div className="mt-6 pt-6 border-t border-surface-border">
                        <Link
                            to="/login"
                            className="flex items-center justify-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
                        >
                            <ArrowLeft size={16} className="icon-flip" />
                            {t('auth.forgotPassword.backToLogin')}
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
