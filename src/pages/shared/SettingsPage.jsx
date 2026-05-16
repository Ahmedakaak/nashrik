import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { Settings, User, Palette, Save, Camera, Globe, Moon, Sun } from 'lucide-react'

const TABS = ['profile', 'appearance']
const TAB_ICONS = { profile: User, appearance: Palette }

export default function SettingsPage() {
    const { t, i18n } = useTranslation()
    const { profile, uploadAvatar } = useAuth()
    const { theme, setTheme } = useTheme()
    const [activeTab, setActiveTab] = useState('profile')
    const [isUploading, setIsUploading] = useState(false)
    const [form, setForm] = useState({
        fullName: profile?.full_name || '', email: profile?.email || '', studentId: profile?.student_id || '',
        language: i18n.language,
    })
    const [saved, setSaved] = useState(false)

    const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }
    const handleLangChange = (lang) => { setForm({ ...form, language: lang }); i18n.changeLanguage(lang); document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr' }

    const handleFileChange = async (e) => {
        if (isUploading) return;

        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            await uploadAvatar(file);
            toast.success(t('settings.profile.avatarUpdated', 'Profile picture updated successfully'));
        } catch (error) {
            const errMessage = error.message || '';
            const isTooLarge = errMessage.toLowerCase().includes('size') || errMessage.toLowerCase().includes('limit');
            const isInvalidType = errMessage.toLowerCase().includes('type');

            let messageToDisplay = t('settings.profile.uploadFailed', 'Failed to upload image. Please try again');
            if (isTooLarge) {
                messageToDisplay = t('settings.profile.fileTooLarge', 'File too large. Maximum size is 2MB');
            } else if (isInvalidType) {
                messageToDisplay = t('settings.profile.invalidFileType', 'Invalid file type. Use JPG, PNG, or WebP');
            }

            console.error('Upload Error:', error);
            toast.error(messageToDisplay);
        } finally {
            setIsUploading(false);
            e.target.value = ''; // Reset input for re-upload
        }
    }

    return (
        <div className="w-full max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-2">
                    <Settings size={28} className="text-brand-400" /> {t('settings.title')}
                </h1>
            </motion.div>

            <div className="flex flex-col md:flex-row gap-6 min-w-0">
                {/* Tabs */}
                <div className="w-full md:w-56 md:shrink-0 min-w-0">
                    <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                        {TABS.map(tab => {
                            const Icon = TAB_ICONS[tab]
                            return (
                                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab ? 'gradient-bg text-white' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}`}>
                                    <Icon size={16} />
                                    {t(`settings.${tab}.title`)}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Content */}
                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 min-w-0 bg-surface-card border border-surface-border rounded-2xl p-6">
                    {activeTab === 'profile' && (
                        <div className="space-y-5">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-400/20 to-brand-600/20 flex items-center justify-center text-brand-400 text-2xl font-bold border-2 border-brand-400/20 overflow-hidden shrink-0">
                                    {profile?.avatar_url ? (
                                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{form.fullName.charAt(0) || '?'}</span>
                                    )}
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-10 transition-all">
                                            <div className="w-5 h-5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label
                                        htmlFor="avatar-upload"
                                        className={`text-sm flex items-center gap-1 transition-colors cursor-pointer w-fit ${isUploading
                                            ? 'text-text-muted cursor-not-allowed'
                                            : 'text-brand-400 hover:text-brand-300'
                                            }`}
                                    >
                                        <Camera size={14} />
                                        {isUploading ? t('settings.profile.uploadingPhoto', 'Uploading...') : t('settings.profile.changePhoto', 'Change photo')}
                                    </label>
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        disabled={isUploading}
                                        aria-label={t('settings.profile.changePhoto', 'Upload profile picture')}
                                    />
                                    <span className="text-xs text-text-muted">JPG, PNG, WebP (Max 2MB)</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-text-secondary mb-1 block">{t('settings.profile.fullName')}</label>
                                <input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="w-full px-4 py-2.5 bg-surface-darker border border-surface-border rounded-xl text-text-primary text-sm" />
                            </div>
                            <div>
                                <label className="text-sm text-text-secondary mb-1 block">{t('settings.profile.email')}</label>
                                <input value={form.email} disabled className="w-full px-4 py-2.5 bg-surface-darker border border-surface-border rounded-xl text-text-muted text-sm cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="text-sm text-text-secondary mb-1 block">{t('settings.profile.studentId')}</label>
                                <input value={form.studentId} disabled className="w-full px-4 py-2.5 bg-surface-darker border border-surface-border rounded-xl text-text-muted text-sm cursor-not-allowed" />
                            </div>
                        </div>
                    )}

                    {activeTab === 'appearance' && (
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm text-text-secondary mb-3 block flex items-center gap-2"><Globe size={14} /> {t('settings.preferences.language')}</label>
                                <div className="flex gap-2">
                                    {[{ val: 'en', label: 'English' }, { val: 'ar', label: 'العربية' }].map(l => (
                                        <button key={l.val} onClick={() => handleLangChange(l.val)} className={`px-5 py-2.5 rounded-xl text-sm font-medium border transition-colors ${form.language === l.val ? 'border-brand-400 bg-brand-400/10 text-brand-400' : 'border-surface-border text-text-secondary hover:bg-white/5'}`}>
                                            {l.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-text-secondary mb-3 block flex items-center gap-2"><Palette size={14} /> {t('settings.appearance.theme')}</label>
                                <div className="flex gap-2">
                                    {[{ val: 'dark', label: t('settings.appearance.themeDark'), icon: Moon }, { val: 'light', label: t('settings.appearance.themeLight'), icon: Sun }].map(th => (
                                        <button key={th.val} onClick={() => setTheme(th.val)} className={`px-5 py-2.5 rounded-xl text-sm font-medium border flex items-center gap-2 transition-colors ${theme === th.val ? 'border-brand-400 bg-brand-400/10 text-brand-400' : 'border-surface-border text-text-secondary hover:bg-white/5'}`}>
                                            <th.icon size={14} /> {th.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Save Button */}
                    <div className="mt-6 pt-4 border-t border-surface-border flex justify-end">
                        <button onClick={handleSave} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg text-white font-medium hover:opacity-90 transition-opacity">
                            <Save size={16} /> {saved ? 'Saved ✓' : t('settings.profile.save')}
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
