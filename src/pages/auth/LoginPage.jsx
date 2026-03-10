import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Globe } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function LoginPage() {
    const { t, i18n } = useTranslation()
    const { signIn } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const from = location.state?.from?.pathname || '/dashboard'
    const isRTL = i18n.language === 'ar'

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'ar' : 'en'
        i18n.changeLanguage(newLang)
        document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr'
        document.documentElement.lang = newLang
    }

    const validate = () => {
        const newErrors = {}
        if (!email) newErrors.email = t('auth.login.email') + ' is required'
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format'
        if (!password) newErrors.password = t('auth.login.password') + ' is required'
        else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const getDashboardForRole = (role) => {
        switch (role) {
            case 'club_admin': return '/club-admin/dashboard'
            case 'system_admin': return '/admin/dashboard'
            default: return '/dashboard'
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return

        setLoading(true)
        console.log('[LOGIN] Starting sign in...')
        try {
            const result = await signIn(email, password)
            console.log('[LOGIN] signIn result:', result)

            const { error, data } = result
            if (error) {
                console.error('[LOGIN] Sign In Error:', error)
                toast.error(error.message || 'Failed to sign in')
            } else {
                console.log('[LOGIN] Welcome back! Routing...')
                toast.success('Welcome back!')
                // Default to standard dashboard since profile might take a moment to load
                // The ProtectedRoute handles the rest based on AuthContext state update.
                let destination = '/dashboard'

                const fromPath = location.state?.from?.pathname
                if (fromPath && fromPath !== '/' && fromPath !== '/dashboard') {
                    destination = fromPath
                } else if (data?.user?.user_metadata?.role === 'system_admin') {
                    destination = '/admin/dashboard'
                } else if (data?.user?.user_metadata?.role === 'club_admin') {
                    destination = '/club-admin/dashboard'
                }

                console.log('[LOGIN] Redirecting to:', destination)
                navigate(destination, { replace: true })
            }
        } catch (err) {
            console.error('[LOGIN] Caught unexpected error:', err)
            toast.error('An unexpected error occurred')
        } finally {
            console.log('[LOGIN] Finally block executed, setting loading to false')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding Panel */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-800 to-surface-darker" />

                {/* Decorative circles */}
                <div className="absolute top-20 start-10 w-72 h-72 bg-brand-400/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 end-20 w-60 h-60 bg-brand-300/10 rounded-full blur-3xl" />

                {/* Grid pattern overlay */}
                <div className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
                        backgroundSize: '40px 40px',
                    }}
                />

                {/* Content — well padded and centered vertically */}
                <div className="relative z-10 flex flex-col justify-center p-12 xl:p-20 w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-lg"
                    >
                        <Link to="/" className="flex items-center gap-3 mb-12">
                            <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-brand-400/30">
                                N
                            </div>
                            <span className="text-3xl font-bold text-white">{t('app.name')}</span>
                        </Link>

                        <h1 className="text-3xl xl:text-4xl font-bold text-white mb-4 leading-tight">
                            {t('app.tagline')}
                        </h1>
                        <p className="text-base xl:text-lg text-brand-200/80 mb-10 leading-relaxed">
                            {t('app.description')}
                        </p>

                        {/* Feature highlights */}
                        <div className="space-y-4">
                            {[
                                { emoji: '📅', text: t('landing.features.discover.title') },
                                { emoji: '⚡', text: t('landing.features.register.title') },
                                { emoji: '📱', text: t('landing.features.qr.title') },
                            ].map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg shrink-0">
                                        {feature.emoji}
                                    </div>
                                    <span className="text-brand-100 font-medium">{feature.text}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center bg-surface-darker p-6 md:p-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md mx-auto"
                >
                    {/* Language toggle */}
                    <div className="flex justify-end mb-8">
                        <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-white/5 text-text-secondary hover:text-text-primary transition-colors text-sm"
                        >
                            <Globe size={18} />
                            <span>{isRTL ? 'EN' : 'عربي'}</span>
                        </button>
                    </div>

                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <Link to="/" className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-400/20">
                                N
                            </div>
                            <span className="text-2xl font-bold text-text-primary">{t('app.name')}</span>
                        </Link>
                    </div>

                    {/* Form Header */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-text-primary mb-2">
                            {t('auth.login.title')}
                        </h2>
                        <p className="text-text-secondary">
                            {t('auth.login.subtitle')}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div className="space-y-1.5">
                            <label htmlFor="login-email" className="block text-sm font-medium text-text-secondary">
                                {t('auth.login.email')}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none z-10">
                                    <Mail size={18} className="text-text-muted" />
                                </div>
                                <input
                                    id="login-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })) }}
                                    placeholder="student@utas.edu.om"
                                    className={`w-full rounded-xl bg-surface-card border ${errors.email ? 'border-status-error' : 'border-surface-border'} ps-10 pe-4 py-3 text-text-primary placeholder:text-text-muted transition-all duration-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 outline-none`}
                                    autoComplete="email"
                                />
                            </div>
                            {errors.email && <p className="text-sm text-status-error">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label htmlFor="login-password" className="block text-sm font-medium text-text-secondary">
                                {t('auth.login.password')}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none z-10">
                                    <Lock size={18} className="text-text-muted" />
                                </div>
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: '' })) }}
                                    placeholder="••••••••"
                                    className={`w-full rounded-xl bg-surface-card border ${errors.password ? 'border-status-error' : 'border-surface-border'} ps-10 pe-10 py-3 text-text-primary placeholder:text-text-muted transition-all duration-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 outline-none`}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 end-0 flex items-center pe-3.5 text-text-muted hover:text-text-secondary transition-colors z-10"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-sm text-status-error">{errors.password}</p>}
                        </div>

                        {/* Forgot Password */}
                        <div className="flex justify-end">
                            <Link
                                to="/forgot-password"
                                className="text-sm text-brand-400 hover:text-brand-300 transition-colors"
                            >
                                {t('auth.login.forgotPassword')}
                            </Link>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl gradient-bg text-white font-semibold text-base shadow-lg shadow-brand-400/20 hover:shadow-brand-400/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer"
                        >
                            {loading ? (
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            ) : (
                                <>
                                    {t('auth.login.submit')}
                                    <ArrowRight size={18} className="icon-flip" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Sign up link */}
                    <p className="mt-8 text-center text-sm text-text-secondary">
                        {t('auth.login.noAccount')}{' '}
                        <Link to="/signup" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                            {t('auth.login.signUpLink')}
                        </Link>
                    </p>

                </motion.div>
            </div>
        </div>
    )
}
