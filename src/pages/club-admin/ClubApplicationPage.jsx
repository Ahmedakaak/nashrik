import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { createClub } from '../../lib/api/clubs'
import { CLUB_CATEGORIES } from '../../lib/constants'
import { BookOpen, Send, ArrowLeft } from 'lucide-react'

export default function ClubApplicationPage() {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'
    const navigate = useNavigate()
    const { user } = useAuth()

    const [form, setForm] = useState({
        name: '',
        name_ar: '',
        description: '',
        description_ar: '',
        category: 'academic'
    })
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!form.name || !form.name_ar || !form.description || !form.description_ar || !form.category) {
            toast.error(t('common.error') || 'Please fill in all fields')
            return
        }

        setSubmitting(true)
        try {
            await createClub({
                ...form,
                admin_id: user.id,
                status: 'pending'
            })
            
            toast.success(t('clubAdmin.apply.success'))
            navigate('/club-admin/dashboard')
        } catch (error) {
            console.error('Club application error:', error)
            toast.error(error.message || t('common.error'))
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
                <button 
                    onClick={() => navigate('/club-admin/dashboard')}
                    className="p-2 rounded-xl bg-surface-card border border-surface-border text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                >
                    <ArrowLeft size={20} className={isRTL ? "rotate-180" : ""} />
                </button>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-3">
                        <BookOpen className="text-brand-400" size={28} />
                        {t('clubAdmin.apply.title')}
                    </h1>
                    <p className="text-text-secondary mt-1">{t('clubAdmin.apply.subtitle')}</p>
                </div>
            </motion.div>

            <motion.form 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.1 }}
                onSubmit={handleSubmit}
                className="bg-surface-card border border-surface-border rounded-2xl p-6 md:p-8 space-y-6"
            >
                <div className="grid md:grid-cols-2 gap-6">
                    {/* English Name */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            {t('clubAdmin.apply.name')}
                        </label>
                        <input
                            type="text"
                            required
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full px-4 py-3 bg-surface-darker border border-surface-border rounded-xl text-text-primary placeholder:text-text-muted focus:border-brand-400/50 focus:ring-1 focus:ring-brand-400/50 transition-all text-sm outline-none text-left"
                            dir="ltr"
                            placeholder="e.g. Technology Club"
                        />
                    </div>

                    {/* Arabic Name */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            {t('clubAdmin.apply.nameAr')}
                        </label>
                        <input
                            type="text"
                            required
                            value={form.name_ar}
                            onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
                            className="w-full px-4 py-3 bg-surface-darker border border-surface-border rounded-xl text-text-primary placeholder:text-text-muted focus:border-brand-400/50 focus:ring-1 focus:ring-brand-400/50 transition-all text-sm outline-none text-right"
                            dir="rtl"
                            placeholder="مثال: نادي التكنولوجيا"
                        />
                    </div>
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                        {t('clubAdmin.apply.category')}
                    </label>
                    <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full px-4 py-3 bg-surface-darker border border-surface-border rounded-xl text-text-primary focus:border-brand-400/50 focus:ring-1 focus:ring-brand-400/50 transition-all text-sm outline-none cursor-pointer appearance-none"
                    >
                        {CLUB_CATEGORIES.map(cat => (
                            <option key={cat.value} value={cat.value}>
                                {isRTL ? cat.labelAr : cat.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* English Description */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            {t('clubAdmin.apply.description')}
                        </label>
                        <textarea
                            required
                            rows="5"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full px-4 py-3 bg-surface-darker border border-surface-border rounded-xl text-text-primary placeholder:text-text-muted focus:border-brand-400/50 focus:ring-1 focus:ring-brand-400/50 transition-all text-sm outline-none resize-none text-left"
                            dir="ltr"
                            placeholder="Describe your club's goals and activities..."
                        />
                    </div>

                    {/* Arabic Description */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            {t('clubAdmin.apply.descriptionAr')}
                        </label>
                        <textarea
                            required
                            rows="5"
                            value={form.description_ar}
                            onChange={(e) => setForm({ ...form, description_ar: e.target.value })}
                            className="w-full px-4 py-3 bg-surface-darker border border-surface-border rounded-xl text-text-primary placeholder:text-text-muted focus:border-brand-400/50 focus:ring-1 focus:ring-brand-400/50 transition-all text-sm outline-none resize-none text-right"
                            dir="rtl"
                            placeholder="صف أهداف النادي وأنشطته..."
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-surface-border flex justify-end">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-bg text-white font-medium hover:opacity-90 hover:shadow-lg hover:shadow-brand-400/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                    >
                        {submitting ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                {t('clubAdmin.apply.submit')}
                                <Send size={18} className={isRTL ? "rotate-180" : ""} />
                            </>
                        )}
                    </button>
                </div>
            </motion.form>
        </div>
    )
}
