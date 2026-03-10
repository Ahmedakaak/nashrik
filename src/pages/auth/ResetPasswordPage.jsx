import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [errors, setErrors] = useState({})

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event) => {
                if (event === 'PASSWORD_RECOVERY') {
                    // User arrived via password reset link
                }
            }
        )
        return () => subscription.unsubscribe()
    }, [])

    const validate = () => {
        const newErrors = {}
        if (!password) newErrors.password = 'Password is required'
        else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters'
        if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return

        setLoading(true)
        try {
            const { error } = await supabase.auth.updateUser({ password })
            if (error) {
                toast.error(error.message || 'Failed to update password')
            } else {
                setSuccess(true)
                toast.success('Password updated successfully!')
                setTimeout(() => navigate('/login'), 3000)
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
            <div className="absolute top-0 end-1/4 w-80 h-80 bg-brand-400/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 start-1/4 w-64 h-64 bg-brand-300/5 rounded-full blur-3xl" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md mx-auto"
            >
                <div className="bg-surface-dark border border-surface-border rounded-2xl p-8 shadow-2xl">
                    {/* Logo */}
                    <div className="flex items-center gap-2.5 mb-8">
                        <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-400/20">
                            N
                        </div>
                        <span className="text-2xl font-bold text-text-primary">{t('app.name')}</span>
                    </div>

                    {!success ? (
                        <>
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-text-primary mb-2">
                                    Set New Password
                                </h2>
                                <p className="text-text-secondary text-sm">
                                    Enter your new password below
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* New Password */}
                                <div className="space-y-1.5">
                                    <label htmlFor="new-password" className="block text-sm font-medium text-text-secondary">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none z-10">
                                            <Lock size={18} className="text-text-muted" />
                                        </div>
                                        <input
                                            id="new-password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: '' })) }}
                                            placeholder="••••••••"
                                            className={`w-full rounded-xl bg-surface-card border ${errors.password ? 'border-status-error' : 'border-surface-border'} ps-10 pe-10 py-3 text-text-primary placeholder:text-text-muted transition-all duration-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 outline-none`}
                                            autoComplete="new-password"
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

                                {/* Confirm Password */}
                                <div className="space-y-1.5">
                                    <label htmlFor="confirm-new-password" className="block text-sm font-medium text-text-secondary">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none z-10">
                                            <Lock size={18} className="text-text-muted" />
                                        </div>
                                        <input
                                            id="confirm-new-password"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => { setConfirmPassword(e.target.value); setErrors(prev => ({ ...prev, confirmPassword: '' })) }}
                                            placeholder="••••••••"
                                            className={`w-full rounded-xl bg-surface-card border ${errors.confirmPassword ? 'border-status-error' : 'border-surface-border'} ps-10 pe-4 py-3 text-text-primary placeholder:text-text-muted transition-all duration-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 outline-none`}
                                            autoComplete="new-password"
                                        />
                                    </div>
                                    {errors.confirmPassword && <p className="text-sm text-status-error">{errors.confirmPassword}</p>}
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
                                        'Update Password'
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-6"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-brand-400/15 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 size={32} className="text-brand-400" />
                            </div>
                            <h3 className="text-xl font-bold text-text-primary mb-2">
                                Password Updated!
                            </h3>
                            <p className="text-text-secondary text-sm">
                                Redirecting you to login...
                            </p>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
