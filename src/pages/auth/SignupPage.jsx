import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { Mail, Lock, Eye, EyeOff, User, Hash, Globe, ArrowRight, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

// MUST be outside the component to avoid re-creating on every render (causes focus loss)
function InputWithIcon({ id, icon: Icon, error, type = 'text', showToggle, toggleShow, ...inputProps }) {
    return (
        <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none z-10">
                <Icon size={18} className="text-text-muted" />
            </div>
            <input
                id={id}
                type={type}
                className={`w-full rounded-xl bg-surface-card border ${error ? 'border-status-error' : 'border-surface-border'} ps-10 ${showToggle !== undefined ? 'pe-10' : 'pe-4'} py-3 text-text-primary placeholder:text-text-muted transition-all duration-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 outline-none`}
                {...inputProps}
            />
            {showToggle !== undefined && (
                <button
                    type="button"
                    onClick={toggleShow}
                    className="absolute inset-y-0 end-0 flex items-center pe-3.5 text-text-muted hover:text-text-secondary transition-colors z-10 cursor-pointer"
                >
                    {showToggle ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            )}
        </div>
    )
}

export default function SignupPage() {
    const { t, i18n } = useTranslation()
    const { signUp } = useAuth()
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        fullName: '',
        studentId: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const isRTL = i18n.language === 'ar'

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'ar' : 'en'
        i18n.changeLanguage(newLang)
        document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr'
        document.documentElement.lang = newLang
    }

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        setErrors(prev => ({ ...prev, [field]: '' }))
    }

    const validate = () => {
        const newErrors = {}
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
        if (!formData.studentId.trim()) newErrors.studentId = 'Student ID is required'
        if (!formData.email) newErrors.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format'
        if (!formData.password) newErrors.password = 'Password is required'
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return

        setLoading(true)
        console.log('[SIGNUP] Starting signup...')
        try {
            const result = await signUp(
                formData.email,
                formData.password,
                formData.fullName,
                formData.studentId,
                formData.role
            )

            console.log('[SIGNUP] Received result:', result)
            const { data, error } = result

            if (error) {
                console.error('[SIGNUP] Error from Supabase:', error)
                toast.error(error.message || 'Failed to create account')
            } else {
                console.log('[SIGNUP] Success! Routing to login...')
                toast.success('Account created! Please check your email to verify.')
                navigate('/login')
            }
        } catch (err) {
            console.error('[SIGNUP] Unexpected Exception:', err)
            toast.error('An unexpected error occurred')
        } finally {
            console.log('[SIGNUP] Finally block executed, unlocking UI')
            setLoading(false)
        }
    }

    // Password strength indicator
    const getPasswordStrength = (pwd) => {
        if (!pwd) return { level: 0, label: '', color: '' }
        let score = 0
        if (pwd.length >= 6) score++
        if (pwd.length >= 8) score++
        if (/[A-Z]/.test(pwd)) score++
        if (/[0-9]/.test(pwd)) score++
        if (/[^A-Za-z0-9]/.test(pwd)) score++

        if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-status-error' }
        if (score <= 2) return { level: 2, label: 'Fair', color: 'bg-status-warning' }
        if (score <= 3) return { level: 3, label: 'Good', color: 'bg-status-info' }
        return { level: 4, label: 'Strong', color: 'bg-status-success' }
    }

    const passwordStrength = getPasswordStrength(formData.password)

    const roles = [
        { value: 'student', label: t('auth.signup.roleStudent'), emoji: '🎓' },
        { value: 'club_admin', label: t('auth.signup.roleClubAdmin'), emoji: '🏢' },
    ]


    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding Panel */}
            <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-800 to-surface-darker" />

                {/* Decorative elements */}
                <div className="absolute top-10 end-10 w-60 h-60 bg-brand-400/10 rounded-full blur-3xl" />
                <div className="absolute bottom-40 start-10 w-72 h-72 bg-brand-300/8 rounded-full blur-3xl" />

                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
                        backgroundSize: '40px 40px',
                    }}
                />

                {/* Content */}
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
                            Join the Community
                        </h1>
                        <p className="text-base xl:text-lg text-brand-200/80 mb-10 leading-relaxed">
                            {t('app.description')}
                        </p>

                        {/* Benefits */}
                        <div className="space-y-4">
                            {[
                                'Discover and register for campus events',
                                'Join clubs & connect with peers',
                                'Track your attendance with QR codes',
                                'Stay updated with real-time notifications',
                            ].map((benefit, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + i * 0.12, duration: 0.5 }}
                                    className="flex items-center gap-3"
                                >
                                    <CheckCircle2 size={20} className="text-brand-400 shrink-0" />
                                    <span className="text-brand-100">{benefit}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="flex-1 flex items-center justify-center bg-surface-darker p-6 md:p-12 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md mx-auto"
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

                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-6">
                        <Link to="/" className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-400/20">
                                N
                            </div>
                            <span className="text-2xl font-bold text-text-primary">{t('app.name')}</span>
                        </Link>
                    </div>

                    {/* Form Header */}
                    <div className="mb-6">
                        <h2 className="text-3xl font-bold text-text-primary mb-2">
                            {t('auth.signup.title')}
                        </h2>
                        <p className="text-text-secondary">
                            {t('auth.signup.subtitle')}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Role Selection */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-text-secondary">
                                {t('auth.signup.role')}
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {roles.map((role) => (
                                    <button
                                        key={role.value}
                                        type="button"
                                        onClick={() => updateField('role', role.value)}
                                        className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${formData.role === role.value
                                            ? 'border-brand-400 bg-brand-400/10 text-brand-400'
                                            : 'border-surface-border bg-surface-card text-text-secondary hover:border-surface-border/80'
                                            }`}
                                    >
                                        <span className="text-xl">{role.emoji}</span>
                                        <span className="font-medium text-sm">{role.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Full Name */}
                        <div className="space-y-1.5">
                            <label htmlFor="signup-name" className="block text-sm font-medium text-text-secondary">
                                {t('auth.signup.fullName')}
                            </label>
                            <InputWithIcon
                                id="signup-name"
                                icon={User}
                                value={formData.fullName}
                                onChange={(e) => updateField('fullName', e.target.value)}
                                placeholder="Ahmed Mohammed"
                                error={errors.fullName}
                            />
                            {errors.fullName && <p className="text-sm text-status-error">{errors.fullName}</p>}
                        </div>

                        {/* Student ID */}
                        <div className="space-y-1.5">
                            <label htmlFor="signup-student-id" className="block text-sm font-medium text-text-secondary">
                                {t('auth.signup.studentId')}
                            </label>
                            <InputWithIcon
                                id="signup-student-id"
                                icon={Hash}
                                value={formData.studentId}
                                onChange={(e) => updateField('studentId', e.target.value)}
                                placeholder="22S12345"
                                error={errors.studentId}
                            />
                            {errors.studentId && <p className="text-sm text-status-error">{errors.studentId}</p>}
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label htmlFor="signup-email" className="block text-sm font-medium text-text-secondary">
                                {t('auth.signup.email')}
                            </label>
                            <InputWithIcon
                                id="signup-email"
                                icon={Mail}
                                type="email"
                                value={formData.email}
                                onChange={(e) => updateField('email', e.target.value)}
                                placeholder="student@utas.edu.om"
                                error={errors.email}
                                autoComplete="email"
                            />
                            {errors.email && <p className="text-sm text-status-error">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label htmlFor="signup-password" className="block text-sm font-medium text-text-secondary">
                                {t('auth.signup.password')}
                            </label>
                            <InputWithIcon
                                id="signup-password"
                                icon={Lock}
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={(e) => updateField('password', e.target.value)}
                                placeholder="••••••••"
                                error={errors.password}
                                autoComplete="new-password"
                                showToggle={showPassword}
                                toggleShow={() => setShowPassword(!showPassword)}
                            />
                            {/* Password Strength Bar */}
                            {formData.password && (
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 flex gap-1">
                                        {[1, 2, 3, 4].map((level) => (
                                            <div
                                                key={level}
                                                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${level <= passwordStrength.level
                                                    ? passwordStrength.color
                                                    : 'bg-surface-border'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs text-text-muted">{passwordStrength.label}</span>
                                </div>
                            )}
                            {errors.password && <p className="text-sm text-status-error">{errors.password}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1.5">
                            <label htmlFor="signup-confirm" className="block text-sm font-medium text-text-secondary">
                                {t('auth.signup.confirmPassword')}
                            </label>
                            <InputWithIcon
                                id="signup-confirm"
                                icon={Lock}
                                type={showConfirm ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={(e) => updateField('confirmPassword', e.target.value)}
                                placeholder="••••••••"
                                error={errors.confirmPassword}
                                autoComplete="new-password"
                                showToggle={showConfirm}
                                toggleShow={() => setShowConfirm(!showConfirm)}
                            />
                            {errors.confirmPassword && <p className="text-sm text-status-error">{errors.confirmPassword}</p>}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl gradient-bg text-white font-semibold text-base shadow-lg shadow-brand-400/20 hover:shadow-brand-400/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer mt-2"
                        >
                            {loading ? (
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            ) : (
                                <>
                                    {t('auth.signup.submit')}
                                    <ArrowRight size={18} className="icon-flip" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Sign in link */}
                    <p className="mt-6 text-center text-sm text-text-secondary">
                        {t('auth.signup.hasAccount')}{' '}
                        <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                            {t('auth.signup.signInLink')}
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    )
}
