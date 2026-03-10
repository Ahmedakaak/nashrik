import { useTranslation } from 'react-i18next'

export default function Footer() {
    const { t } = useTranslation()

    return (
        <footer className="border-t border-surface-border bg-surface-darker/50 py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white font-bold text-sm">
                            N
                        </div>
                        <span className="text-sm text-text-secondary">
                            © {new Date().getFullYear()} {t('app.name')}. UTAS Salalah.
                        </span>
                    </div>
                    <p className="text-xs text-text-muted">
                        Built by Ahmed, Aziza & Aya • Supervised by Mr. Hansel G Delos Santo
                    </p>
                </div>
            </div>
        </footer>
    )
}
